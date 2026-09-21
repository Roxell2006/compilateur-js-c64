// Conservative IR optimization: only compiler-created temporaries, never named
// user variables, parameters or return slots. No lifetime assumptions across a
// branch, call or callback; interrupt handlers have distinct storage domains.
function refs(value, found = new Map(), seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return found;
  seen.add(value);
  if (value.type === "varRef") found.set(value.name, value);
  else for (const child of Object.values(value)) refs(child, found, seen);
  return found;
}

function blocks(instructions, irq) {
  const result = [];
  function visit(list, domain) {
    let block = [];
    const flush = () => { if (block.length) result.push({ list, instructions: block, domain }); block = []; };
    for (const instruction of list) {
      const { op, args } = instruction;
      const children = op === "controlIf" ? [args[1], args[2]]
        : ["gameInit", "gameFrame"].includes(op) ? [args[0]]
        : ["controlRoutine", "controlWhile", "controlRepeat", "gameEvery"].includes(op) ? [args[1]]
        : op === "gameScene" ? Object.values(args[1]) : [];
      if (children.length || ["naturalLabel", "naturalJump", "controlCall"].includes(op)) {
        flush();
        // Keep the header separate: its reads must not disappear from lifetime
        // accounting, including condition variables read on subsequent loops.
        const header = children.length ? { ...instruction, args: args.filter(value => !children.includes(value)
          && !(op === "gameScene" && value === args[1])) } : instruction;
        result.push({ list, instructions: [header], domain, barrier: true });
        for (const child of children) if (Array.isArray(child)) visit(child, op === "controlRoutine" ? `routine:${args[0]}` : domain);
      } else block.push(instruction);
    }
    flush();
  }
  visit(instructions, "main");
  irq.forEach((handler, i) => visit(handler.instructions, `irq${i}`));
  return result;
}

function analyze(groups, candidates) {
  const uses = new Map();
  groups.forEach((group, block) => group.instructions.forEach((instruction, index) => {
    for (const [name, ref] of refs(instruction.args)) {
      if (!candidates.has(name)) continue;
      let use = uses.get(name);
      if (!use) uses.set(name, use = { name, type: ref.valueType, block, first: index, last: index, eligible: !group.barrier });
      use.last = index;
      if (use.block !== block || group.barrier) use.eligible = false;
    }
  }));
  return uses;
}

function destination(instruction) {
  if (["runtimeSet", "naturalCast", "runtimeAdd", "runtimeSub", "runtimeInc", "runtimeDec", "naturalShift"].includes(instruction.op)) return instruction.args[0];
  if (instruction.op === "runtimeBit") return instruction.args[1];
  if (instruction.op === "naturalArrayLoad") return instruction.args[2];
}
function initializes(instruction, name) {
  return ["runtimeSet", "naturalCast", "naturalArrayLoad"].includes(instruction.op) && destination(instruction)?.name === name;
}

function rename(instructions, irq, names) {
  for (const root of [instructions, ...irq.map(h => h.instructions)]) {
    const seen = new Set();
    function visit(value) {
      if (!value || typeof value !== "object" || seen.has(value)) return;
      seen.add(value);
      if (value.type === "varRef") {
        if (names.has(value.name)) value.name = names.get(value.name);
      } else for (const child of Object.values(value)) visit(child);
    }
    visit(root);
  }
}

export function optimizeNaturalIR(declarations, instructions, irq) {
  const candidates = new Map(declarations.filter(d => d.op === "naturalVariable" && d.args[2]?.temporary).map(d => [d.args[0], d]));
  const naturalNames = new Set(declarations.filter(d => d.op === "naturalVariable").map(d => d.args[0]));
  const routines = new Map();
  function collectRoutines(value, seen = new Set()) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (value.op === "controlRoutine") routines.set(value.args[0], value.args[1]);
    for (const child of Object.values(value)) collectRoutines(child, seen);
  }
  collectRoutines(instructions);
  const irqVisible = new Set(), visited = new Set();
  function inspectIrq(value, seen = new Set()) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (value.type === "varRef") irqVisible.add(value.name);
    if (value.op === "controlCall" && !visited.has(value.args[0])) {
      visited.add(value.args[0]); inspectIrq(routines.get(value.args[0]));
    }
    for (const child of Object.values(value)) inspectIrq(child, seen);
  }
  for (const handler of irq) inspectIrq(handler.instructions);
  const report = { type: "natural-optimization", copiesRemoved: 0, temporaryBytesSaved: 0 };
  const removed = new Set();

  // Retarget a private expression chain into its final destination. Reject any
  // intervening observation of the old destination (a = b + a, aliasing loads).
  for (;;) {
    const groups = blocks(instructions, irq), uses = analyze(groups, candidates);
    let changed = false;
    for (const use of uses.values()) {
      if (!use.eligible) continue;
      const group = groups[use.block], chain = group.instructions.slice(use.first, use.last + 1);
      const last = chain.at(-1), target = last.args[0];
      if (chain.length < 2 || last.op !== "runtimeSet" || last.args[1]?.name !== use.name
        || !target || !naturalNames.has(target.name) || irqVisible.has(target.name)
        || target.valueType !== use.type || target.name === use.name || !initializes(chain[0], use.name)) continue;
      if (chain.slice(0, -1).some(item => !destination(item) || refs(item.args).has(target.name)
        || (refs(item.args).has(use.name) && destination(item)?.name !== use.name))) continue;
      rename(instructions, irq, new Map([[use.name, target.name]]));
      group.list.splice(group.list.indexOf(last), 1);
      candidates.delete(use.name); removed.add(use.name);
      report.copiesRemoved++;
      report.temporaryBytesSaved += use.type === "word" ? 2 : 1;
      changed = true;
      break;
    }
    if (!changed) break;
  }

  // Only reuse intervals wholly contained in one straight-line block and
  // starting with a complete definition. Cross-call snapshots stay private.
  const groups = blocks(instructions, irq), uses = analyze(groups, candidates);
  const slots = new Map(), names = new Map();
  for (let block = 0; block < groups.length; block++) {
    const group = groups[block];
    const intervals = [...uses.values()].filter(u => u.eligible && u.block === block
      && initializes(group.instructions[u.first], u.name)).sort((a, b) => a.first - b.first);
    for (const use of intervals) {
      const key = `${group.domain}:${use.type}`;
      const pool = slots.get(key) ?? [];
      slots.set(key, pool);
      let slot = pool.find(s => s.block !== block || s.end < use.first);
      if (!slot) { slot = { name: use.name }; pool.push(slot); }
      else {
        names.set(use.name, slot.name); removed.add(use.name);
        report.temporaryBytesSaved += use.type === "word" ? 2 : 1;
      }
      slot.block = block; slot.end = use.last;
    }
  }
  rename(instructions, irq, names);
  return { declarations: declarations.filter(d => !removed.has(d.args[0])), report };
}
