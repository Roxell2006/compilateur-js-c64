import { parse, tokenizer } from "acorn";
import { c64 } from "./c64.js";
import { captureBlock, getProgramState, pushInstruction, setTextColor } from "./runtime.js";

// This frontend evaluates configuration on the host and lowers gameplay to the
// same IR as the original DSL. It never executes a user's runtime branch/loop.
export function hasNaturalDirective(source) {
  // Only inspect the directive prologue. Legacy files need not parse as this
  // frontend's deliberately smaller language (and can import arbitrary ESM).
  if (typeof source !== "string") return false;
  const tokens = tokenizer(source, { ecmaVersion: "latest", locations: true });
  try {
    let token = tokens.getToken();
    while (token.type.label === "string") {
      const next = tokens.getToken();
      const continuesExpression = next.type.binop != null || next.type.isAssign
        || ["(", "[", ".", "?.", "?", "`", ","].includes(next.type.label);
      const terminated = next.type.label === ";" || next.type.label === "eof"
        || (next.loc.start.line > token.loc.end.line && !continuesExpression);
      if (!terminated) return false;
      if (token.value === "use c64") return true;
      token = next.type.label === ";" ? tokens.getToken() : next;
    }
  } catch {
    // Let the legacy loader diagnose files that are not a natural program.
  }
  return false;
}

const isRef = value => value?.type === "varRef";
const isCondition = value => value?.type === "runtimeCondition";
const width = value => isRef(value) ? value.valueType : typeof value === "boolean" ? "bool" : value > 255 || value < -128 ? "word" : "byte";
const comparison = { "===": "eq", "!==": "ne", "==": "eq", "!=": "ne", "<": "lt", "<=": "lte", ">": "gt", ">=": "gte" };
const arithmetic = { "+": "add", "-": "sub", "&": "and", "|": "or", "^": "xor" };

class Scope {
  constructor(parent = null) { this.parent = parent; this.bindings = new Map(); }
  get(name) { return this.bindings.get(name) ?? this.parent?.get(name); }
}

export function recordNaturalSource(source, filename = "<source>") {
  let tree;
  try { tree = parse(source, { ecmaVersion: "latest", sourceType: "module", locations: true }); }
  catch (error) { throw new Error(`${filename}:${error.loc?.line ?? 1}:${(error.loc?.column ?? 0) + 1}: ${error.message}`); }
  const declarations = [];
  const routines = [];
  const routineNodes = new Map();
  let serial = 0;
  const objectIds = new WeakMap();
  function signature(value) {
    if (isRef(value) || typeof value === "number" || typeof value === "boolean") return width(value);
    if (typeof value === "string") return `text:${JSON.stringify(value)}`;
    if (value && typeof value === "object") {
      if (!objectIds.has(value)) objectIds.set(value, serial++);
      return `object:${objectIds.get(value)}`;
    }
    return null;
  }
  function mentionsTextColor(node) {
    if (!node || typeof node !== "object") return false;
    if (node.type === "MemberExpression" && node.object.type === "MemberExpression"
      && node.object.object.name === "c64" && (node.object.property.name ?? node.object.property.value) === "screen"
      && (node.property.name ?? node.property.value) === "setup") return true;
    if (node.type === "MemberExpression" && node.object.name === "c64"
      && (node.property.name === "textColor" || node.property.value === "textColor")) return true;
    return Object.values(node).some(value => Array.isArray(value) ? value.some(mentionsTextColor) : value?.type && mentionsTextColor(value));
  }
  // A function may be recorded before a later call changes the current color.
  // Resolve implicit colors on the C64 for the whole source in that case.
  let usesRuntimeTextColor = mentionsTextColor(tree);
  if (usesRuntimeTextColor) setTextColor({ type: "currentTextColor" });
  const global = new Scope();
  global.bindings.set("c64", { value: c64, constant: true });

  function fail(node, message) {
    throw new Error(`${filename}:${node.loc.start.line}:${node.loc.start.column + 1}: ${message}`);
  }
  function define(env, name, binding, node) {
    if (name === "c64") fail(node, "The c64 API name cannot be shadowed");
    if (env.bindings.has(name) && !env.bindings.get(name).uninitialized) fail(node, `Duplicate declaration: ${name}`);
    env.bindings.set(name, binding);
  }
  function allocate(type = "byte", hint = "temp") {
    let ref;
    captureBlock(() => { ref = c64.var[type](`__js_${hint.replace(/[^a-zA-Z0-9_]/g, "_")}_${serial++}`, { initial: 0 }); });
    // All assignments stay at their source execution point. Reserving storage
    // must not add startup stores for every compiler temporary and parameter.
    declarations.push({ op: "naturalVariable", args: [ref.name, type] });
    ref[Symbol.toPrimitive] = () => { throw new Error("This API argument must be a compile-time constant, not a runtime variable"); };
    return ref;
  }
  function resize(ref, type) {
    ref.valueType = type;
    declarations.find(item => item.args[0] === ref.name).args[1] = type;
  }
  function scalar(value, node) {
    if (!isRef(value) && typeof value !== "boolean" && !Number.isInteger(value)) {
      fail(node, "Expected an integer or boolean runtime value");
    }
    return value;
  }
  function assign(target, value, node) {
    scalar(value, node);
    if (target.valueType === "bool" && !(typeof value === "boolean" || width(value) === "bool")) {
      fail(node, "A boolean needs a boolean value or comparison");
    }
    if (target.valueType !== "word" && width(value) === "word") {
      fail(node, "A 16-bit value needs c64.word(...), or explicit c64.byte(...) truncation");
    }
    if (!isRef(value) && typeof value === "number") {
      if (value < -32768 || value > 65535) fail(node, "Integer outside the supported 16-bit range");
      value &= target.valueType === "word" ? 65535 : 255;
    }
    if (target !== value) target.set(value);
  }
  function copy(value, node, type = width(value)) {
    const ref = allocate(type);
    assign(ref, value, node);
    return ref;
  }
  function lookup(node, env) {
    const binding = env.get(node.name);
    if (!binding) fail(node, `Unknown name: ${node.name}`);
    if (binding.uninitialized) fail(node, `Cannot access ${node.name} before its declaration`);
    return binding;
  }
  function member(node, env, writing = false, load = true) {
    const object = expression(node.object, env);
    const key = node.computed ? expression(node.property, env) : node.property.name;
    if (object?.type === "naturalArray") {
      if (key === "length") return { object, key, value: object.length };
      if (key === "fill") return { object, key, value: (...args) => {
        if (args.length !== 1) fail(node, "Typed-array fill currently needs exactly one value (whole array)");
        const value = scalar(args[0], node);
        if (object.valueType === "byte" && width(value) === "word") fail(node, "Use c64.byte(...) to truncate a word before filling a byte array");
        if (typeof value === "number" && (value < 0 || value > 65535)) fail(node, "Array fill needs an unsigned value of the declared width");
        pushInstruction("naturalArrayFill", object, value);
        return object;
      } };
      if ((!isRef(key) && !Number.isInteger(key)) || isCondition(key)) fail(node, "Array index must be an unsigned integer");
      if (!isRef(key) && (key < 0 || key >= object.length)) fail(node, "Array index outside its fixed length");
      const index = writing && isRef(key) ? copy(key, node) : key;
      const value = allocate(object.valueType, "element");
      if (load) pushInstruction("naturalArrayLoad", object, index, value);
      return { object, key: index, value, commit: () => pushInstruction("naturalArrayStore", object, index, value) };
    }
    if (isRef(key) || isCondition(key)) fail(node, "Dynamic property access is not supported yet");
    if (object == null || !(key in Object(object))) fail(node, `Unknown property: ${String(key)}`);
    return { object, key, value: object[key] };
  }
  function target(node, env, load = true) {
    let value;
    if (node.type === "Identifier") {
      const binding = lookup(node, env);
      if (binding.constant) fail(node, `Cannot assign to const ${node.name}; use let`);
      value = binding.value;
    } else if (node.type === "MemberExpression") {
      const field = member(node, env, true, load);
      value = field.value;
      if (field.commit) value.arrayCommit = field.commit;
    }
    if (!isRef(value)) fail(node, "Assignment needs a runtime variable or runtime object field");
    return value;
  }
  function emitMath(ref, operator, value, node) {
    scalar(value, node);
    if (ref.valueType === "bool") fail(node, "Arithmetic on booleans is not supported");
    if (ref.valueType !== "word" && width(value) === "word") fail(node, "Use c64.word(...) for 16-bit arithmetic");
    if ((operator === "+" || operator === "-") && value === 1) {
      ref[operator === "+" ? "inc" : "dec"]();
    } else if (arithmetic[operator]) {
      if (typeof value === "number" && value < 0 && ref.valueType === "word") value &= 65535;
      ref[arithmetic[operator]](value);
    } else if (["<<", ">>", ">>>"].includes(operator) && Number.isInteger(value) && value >= 0 && value < 16) {
      pushInstruction("naturalShift", ref, operator === "<<" ? "left" : "right", value);
    } else if (operator === "*" && Number.isInteger(value) && value >= 0 && value <= 255) {
      if (value === 0) ref.set(0);
      else if (value !== 1) {
        const original = copy(ref, node);
        const bits = value.toString(2);
        for (const bit of bits.slice(1)) {
          pushInstruction("naturalShift", ref, "left", 1);
          if (bit === "1") ref.add(original);
        }
      }
    } else fail(node, `Unsupported runtime operator ${operator}; multiplication needs a constant 0..255, shifts a constant 0..15`);
  }
  function staticBinary(operator, a, b, node) {
    switch (operator) {
      case "+": return a + b; case "-": return a - b; case "*": return a * b;
      case "/": return a / b; case "%": return a % b;
      case "&": return a & b; case "|": return a | b; case "^": return a ^ b;
      case "<<": return a << b; case ">>": return a >> b; case ">>>": return a >>> b;
      case "===": return a === b; case "!==": return a !== b;
      case "==": return a == b; case "!=": return a != b;
      case "<": return a < b; case "<=": return a <= b; case ">": return a > b; case ">=": return a >= b;
      default: fail(node, `Unsupported operator ${operator}`);
    }
  }
  function booleanValue(node, env) {
    const result = allocate("bool");
    branch(node, env, () => result.set(true), () => result.set(false));
    return result;
  }
  function materialize(value) {
    if (!isCondition(value)) return value;
    const result = allocate("bool");
    c64.control.if(value, () => result.set(true), () => result.set(false));
    return result;
  }
  const unknown = Symbol("not a compile-time value");
  function constant(node, env) {
    if (node.type === "Literal") return node.value;
    if (node.type === "Identifier") {
      const binding = env.get(node.name);
      return binding?.constant && !isRef(binding.value) && !isCondition(binding.value) && !binding.fn ? binding.value : unknown;
    }
    if (node.type === "MemberExpression") {
      const object = constant(node.object, env);
      const key = node.computed ? constant(node.property, env) : node.property.name;
      if (object === unknown || key === unknown || object == null) return unknown;
      if (object.type === "naturalArray") return key === "length" ? object.length : unknown;
      const value = object[key];
      return value === undefined || isRef(value) || isCondition(value) ? unknown : value;
    }
    if (node.type === "BinaryExpression") {
      const a = constant(node.left, env), b = constant(node.right, env);
      return a === unknown || b === unknown ? unknown : staticBinary(node.operator, a, b, node);
    }
    if (node.type === "UnaryExpression") {
      const value = constant(node.argument, env);
      if (value === unknown) return unknown;
      if (node.operator === "!") return !value;
      if (node.operator === "-") return -value;
      if (node.operator === "+") return +value;
      if (node.operator === "~") return ~value;
    }
    return unknown;
  }
  function references(value, found = new Set(), seen = new Set(), argumentsOnly = false) {
    if (!value || typeof value !== "object" || seen.has(value)) return found;
    seen.add(value);
    // API handles select resources by identity. A collision query may consume
    // only an entity's sprite, not every world/velocity field on that handle.
    if (argumentsOnly && ["mapEntityRef", "spriteRef"].includes(value.type)) return found;
    if (isRef(value)) found.add(value.name);
    else for (const child of Object.values(value)) references(child, found, seen, argumentsOnly);
    return found;
  }
  function branch(node, env, yes, no = () => {}) {
    if (node.type === "UnaryExpression" && node.operator === "!") return branch(node.argument, env, no, yes);
    if (node.type === "LogicalExpression") {
      if (!["&&", "||"].includes(node.operator)) fail(node, "Only && and || are supported");
      const pass = `__js_logic_yes_${serial++}`;
      const failLabel = `__js_logic_no_${serial++}`;
      const end = `__js_logic_end_${serial++}`;
      const onTrue = () => pushInstruction("naturalJump", pass);
      const onFalse = () => pushInstruction("naturalJump", failLabel);
      const right = () => branch(node.right, env, onTrue, onFalse);
      branch(node.left, env, node.operator === "&&" ? right : onTrue, node.operator === "&&" ? onFalse : right);
      pushInstruction("naturalLabel", pass); yes(); pushInstruction("naturalJump", end);
      pushInstruction("naturalLabel", failLabel); no(); pushInstruction("naturalLabel", end);
      return;
    }
    let condition;
    if (node.type === "BinaryExpression" && comparison[node.operator]) {
      let left = materialize(expression(node.left, env));
      // Freeze the left value before a right-hand function can change it.
      if (isRef(left) && hasEffects(node.right)) left = copy(left, node);
      let right = materialize(expression(node.right, env));
      scalar(left, node); scalar(right, node);
      if (!isRef(left) && !isRef(right)) return staticBinary(node.operator, left, right, node) ? yes() : no();
      if (["===", "!=="].includes(node.operator) && (width(left) === "bool") !== (width(right) === "bool")) {
        return node.operator === "!==" ? yes() : no();
      }
      if (!isRef(left) || (width(left) !== "word" && width(right) === "word")) left = copy(left, node, width(right));
      if (width(left) === "word" && isRef(right) && width(right) !== "word") right = copy(right, node, "word");
      condition = { type: "runtimeCondition", operator: comparison[node.operator], left, right };
    } else {
      const value = expression(node, env);
      if (isCondition(value)) condition = value;
      else if (isRef(value)) condition = value.ne(0);
      else { scalar(value, node); return value ? yes() : no(); }
    }
    c64.control.if(condition, yes, no);
  }
  function hasEffects(node) {
    if (!node || typeof node !== "object") return false;
    if (["CallExpression", "AssignmentExpression", "UpdateExpression"].includes(node.type)) return true;
    return Object.values(node).some(value => Array.isArray(value) ? value.some(hasEffects) : value?.type && hasEffects(value));
  }

  function expression(node, env) {
    if (["BinaryExpression", "UnaryExpression"].includes(node.type)) {
      const folded = constant(node, env);
      if (folded !== unknown) return folded;
    }
    switch (node.type) {
      case "Literal": return node.value;
      case "Identifier": {
        const binding = lookup(node, env);
        if (binding.fn) {
          const callback = () => callFunction(binding, { ...node, arguments: [] }, env);
          callback.naturalFunction = binding;
          return callback;
        }
        return binding.value;
      }
      case "MemberExpression": return member(node, env).value;
      case "ArrayExpression": return node.elements.map(item => {
        if (!item || item.type === "SpreadElement") fail(node, "Array holes/spreads are not supported");
        return expression(item, env);
      });
      case "ObjectExpression": {
        const object = {};
        for (const item of node.properties) {
          if (item.type !== "Property" || item.computed || item.kind !== "init" || item.method) fail(item, "Use plain configuration properties");
          object[item.key.name ?? item.key.value] = expression(item.value, env);
        }
        return object;
      }
      case "ArrowFunctionExpression": case "FunctionExpression":
        if (node.async || node.generator || node.params.length) fail(node, "API callbacks must be synchronous and have no parameters");
        return () => {
          const end = `__js_callback_end_${serial++}`;
          const context = { end, callback: true };
          if (node.body.type === "BlockStatement") block(node.body.body, new Scope(env), context);
          else expression(node.body, env);
          pushInstruction("naturalLabel", end);
        };
      case "CallExpression": {
        if (node.optional || node.arguments.some(arg => arg.type === "SpreadElement")) fail(node, "Optional calls/spreads are not supported");
        if (node.callee.type === "MemberExpression" && node.callee.object.name === "c64" && ["byte", "word"].includes(node.callee.property.name)) {
          if (node.arguments.length !== 1) fail(node, "c64.byte/word needs one value");
          const type = node.callee.property.name;
          const value = scalar(expression(node.arguments[0], env), node);
          const ref = allocate(type);
          pushInstruction("naturalCast", ref, value);
          return ref;
        }
        if (node.callee.type === "Identifier" && lookup(node.callee, env).fn) {
          return callFunction(lookup(node.callee, env), node, env);
        }
        const callee = node.callee.type === "MemberExpression" ? member(node.callee, env) : { value: expression(node.callee, env) };
        if (typeof callee.value !== "function") fail(node, "Expected an API method or a declared function");
        if (callee.value.naturalFunction) return callFunction(callee.value.naturalFunction, node, env);
        const args = node.arguments.map((arg, i) => {
          const raw = expression(arg, env);
          const expectsCondition = callee.object === c64.control && ["if", "while"].includes(callee.key) && i === 0;
          const value = expectsCondition ? raw : materialize(raw);
          return isRef(value) && node.arguments.slice(i + 1).some(hasEffects) ? copy(value, arg) : value;
        });
        try {
          let value;
          const instructions = captureBlock(() => { value = callee.value.apply(callee.object, args); });
          if ((callee.object === c64 && callee.key === "textColor") || (callee.object === c64.screen && callee.key === "setup")) {
            // Source branches/functions choose the color on the C64, not in
            // the order in which callbacks happen to be recorded on the host.
            setTextColor({ type: "currentTextColor" });
            usesRuntimeTextColor = true;
          }
          const retained = references([value, instructions]);
          for (const name of references(args, new Set(), new Set(), true)) {
            if (!retained.has(name)) fail(node, "This API argument must be a compile-time constant; its runtime value would be lost");
          }
          for (const instruction of instructions) {
            pushInstruction(instruction.op, ...instruction.args);
          }
          return value;
        } catch (error) { fail(node, error.message); }
      }
      case "BinaryExpression": {
        if (comparison[node.operator]) return booleanValue(node, env);
        let left = scalar(expression(node.left, env), node);
        if (isRef(left) && hasEffects(node.right)) left = copy(left, node);
        let right = scalar(expression(node.right, env), node);
        if (!isRef(left) && !isRef(right)) return staticBinary(node.operator, left, right, node);
        if (node.operator === "*" && !isRef(left)) [left, right] = [right, left];
        const type = width(left) === "word" || width(right) === "word" ? "word" : "byte";
        const result = copy(left, node, type);
        emitMath(result, node.operator, right, node);
        return result;
      }
      case "ConditionalExpression": {
        const result = allocate("word");
        const values = [];
        const arm = child => {
          const value = scalar(materialize(expression(child, env)), child);
          values.push(value);
          pushInstruction("runtimeSet", result, value);
        };
        branch(node.test, env, () => arm(node.consequent), () => arm(node.alternate));
        resize(result, values.some(value => width(value) === "word") ? "word" : values.every(value => width(value) === "bool") ? "bool" : "byte");
        return result;
      }
      case "LogicalExpression": {
        if (!["&&", "||"].includes(node.operator)) fail(node, "Only && and || are supported");
        const left = scalar(materialize(expression(node.left, env)), node.left);
        const result = allocate("word");
        const values = [left];
        pushInstruction("runtimeSet", result, left);
        const right = () => {
          const value = scalar(materialize(expression(node.right, env)), node.right);
          values.push(value);
          pushInstruction("runtimeSet", result, value);
        };
        if (isRef(left)) c64.control.if(left.ne(0), node.operator === "&&" ? right : () => {}, node.operator === "||" ? right : () => {});
        else if (node.operator === "&&" ? left : !left) right();
        resize(result, values.some(value => width(value) === "word") ? "word" : values.every(value => width(value) === "bool") ? "bool" : "byte");
        return result;
      }
      case "UnaryExpression": {
        if (node.operator === "!") return booleanValue(node, env);
        const value = scalar(expression(node.argument, env), node);
        if (!isRef(value)) {
          if (node.operator === "-") return -value;
          if (node.operator === "+") return +value;
          if (node.operator === "~") return ~value;
        } else {
          if (node.operator === "+") return value;
          if (node.operator === "-") { const result = copy(0, node, width(value)); result.sub(value); return result; }
          if (node.operator === "~") { const result = copy(value, node); result.xor(width(value) === "word" ? 65535 : 255); return result; }
        }
        fail(node, `Unsupported unary operator ${node.operator}`);
        break;
      }
      case "AssignmentExpression": {
        const ref = target(node.left, env, node.operator !== "=");
        if (node.operator !== "=" && hasEffects(node.right)) fail(node, "Keep compound-assignment right sides free of function calls and assignments");
        if (node.operator === "=" && node.right.type === "BinaryExpression" && node.left.type === "Identifier" && node.right.left.type === "Identifier" && node.left.name === node.right.left.name && !hasEffects(node.right.right) && !comparison[node.right.operator]) {
          emitMath(ref, node.right.operator, expression(node.right.right, env), node);
        } else {
          const value = materialize(expression(node.right, env));
          if (node.operator === "=") assign(ref, value, node);
          else emitMath(ref, node.operator.slice(0, -1), value, node);
        }
        ref.arrayCommit?.();
        return ref;
      }
      case "UpdateExpression": {
        const ref = target(node.argument, env);
        const result = node.prefix ? ref : copy(ref, node);
        emitMath(ref, node.operator === "++" ? "+" : "-", 1, node);
        ref.arrayCommit?.();
        return result;
      }
      default: fail(node, `Unsupported JavaScript expression: ${node.type}`);
    }
  }

  function callFunction(binding, node, caller) {
    if (binding.compiling) fail(node, "Recursive functions are not supported (static C64 storage)");
    const fn = binding.fn;
    if (fn.params.length !== node.arguments.length) fail(node, `${fn.id.name} expects ${fn.params.length} arguments`);
    const args = node.arguments.map((arg, i) => {
      const value = materialize(expression(arg, caller));
      if (signature(value) === null) fail(arg, "Function arguments need numbers, booleans, constant text or API/configuration objects");
      return isRef(value) && node.arguments.slice(i + 1).some(hasEffects) ? copy(value, arg) : value;
    });
    // One static call frame per argument-width signature, never per call site.
    const key = JSON.stringify(args.map(signature));
    let compiled = binding.variants.get(key);
    if (!compiled) {
      const local = new Scope(binding.env);
      compiled = { name: `__js_${fn.id.name.replace(/[^a-zA-Z0-9_]/g, "_")}_${serial++}`, params: [], end: `__js_return_${serial++}`, returns: [], node: fn };
      args.forEach((value, index) => {
        if (!isRef(value) && typeof value !== "number" && typeof value !== "boolean") {
          compiled.params.push(null);
          define(local, fn.params[index].name, { value, constant: true }, fn.params[index]);
          return;
        }
        const ref = allocate(width(value), fn.params[index].name);
        compiled.params.push(ref);
        define(local, fn.params[index].name, { value: ref, constant: false }, fn.params[index]);
      });
      binding.compiling = true;
      let body;
      try { body = captureBlock(() => block(fn.body.body, local, compiled)); }
      finally { binding.compiling = false; }
      if (compiled.returns.length) {
        if (compiled.bareReturn) fail(fn, "A function cannot mix bare return and return with a value");
        if (!alwaysReturns(fn.body)) fail(fn, "A function returning a value must return on every path");
        const type = compiled.returns.some(item => width(item.value) === "word") ? "word" : compiled.returns.every(item => width(item.value) === "bool") ? "bool" : "byte";
        resize(compiled.result, type);
      }
      body.push({ op: "naturalLabel", args: [compiled.end] });
      routines.push({ op: "controlRoutine", args: [compiled.name, body] });
      routineNodes.set(compiled.name, fn);
      binding.variants.set(key, compiled);
    }
    compiled.params.forEach((ref, i) => { if (ref) assign(ref, args[i], node); });
    pushInstruction("controlCall", compiled.name);
    return compiled.result;
  }
  function alwaysReturns(node) {
    if (node.type === "ReturnStatement") return Boolean(node.argument);
    if (node.type === "BlockStatement") return node.body.some(alwaysReturns);
    if (node.type === "IfStatement") return Boolean(node.alternate && alwaysReturns(node.consequent) && alwaysReturns(node.alternate));
    return false;
  }
  function block(nodes, env, context = null) {
    for (const node of nodes) {
      if (node.type === "VariableDeclaration") {
        for (const item of node.declarations) {
          if (item.id.type === "Identifier") define(env, item.id.name, { uninitialized: true }, item);
        }
      }
      if (node.type === "FunctionDeclaration") {
        if (env !== global || node.async || node.generator || node.params.some(param => param.type !== "Identifier")) fail(node, "Use top-level synchronous functions with named parameters");
        define(env, node.id.name, { fn: node, env, variants: new Map(), constant: true }, node);
      }
    }
    for (const node of nodes) {
      statement(node, env, context);
      if (["ReturnStatement", "BreakStatement", "ContinueStatement"].includes(node.type)) break;
    }
  }
  function statement(node, env, context) {
    switch (node.type) {
      case "ImportDeclaration":
        if (env !== global || node.specifiers.length !== 1 || node.specifiers[0].type !== "ImportSpecifier" || node.specifiers[0].imported.name !== "c64" || node.specifiers[0].local.name !== "c64") fail(node, "Natural mode currently supports only import { c64 } from ...");
        return;
      case "FunctionDeclaration": case "EmptyStatement": return;
      case "BlockStatement": return block(node.body, new Scope(env), context);
      case "VariableDeclaration":
        if (node.kind === "var") fail(node, "Use let or const");
        for (const item of node.declarations) {
          if (item.id.type !== "Identifier" || !item.init) fail(item, "Variables need a name and an initializer");
          const init = item.init;
          if (init.type === "NewExpression" && ["Uint8Array", "Uint16Array"].includes(init.callee.name)) {
            if (env.get(init.callee.name)) fail(init, "Typed-array constructor names cannot be shadowed");
            if (env !== global || node.kind !== "const") fail(init, "Fixed typed arrays must be declared with const at top level");
            if (init.arguments.length !== 1) fail(init, "Typed arrays need a fixed length or a literal list");
            const input = expression(init.arguments[0], env);
            const values = Number.isInteger(input) && input >= 1 && input <= 256 ? Array(input).fill(0) : input;
            const word = init.callee.name === "Uint16Array";
            if (!Array.isArray(values) || values.length < 1 || values.length > 256 || values.some(v => !Number.isInteger(v) || v < 0 || v > (word ? 65535 : 255))) fail(init, "Typed arrays need 1..256 constant unsigned elements of the declared width");
            const name = `__js_array_${serial++}`;
            declarations.push(...captureBlock(() => {
              c64.data.byte(name, values.map(v => v & 255));
              if (word) c64.data.byte(`${name}_hi`, values.map(v => v >> 8));
            }));
            define(env, item.id.name, { value: { type: "naturalArray", name, length: values.length, valueType: word ? "word" : "byte" }, constant: true }, item);
            continue;
          }
          if (init.type === "CallExpression" && init.callee.type === "MemberExpression" && init.callee.object.name === "c64" && ["byte", "word"].includes(init.callee.property.name)) {
            if (init.arguments.length !== 1) fail(init, "c64.byte/word needs one value");
            const value = scalar(expression(init.arguments[0], env), init);
            const ref = allocate(init.callee.property.name, item.id.name);
            pushInstruction("naturalCast", ref, value);
            define(env, item.id.name, { value: ref, constant: node.kind === "const" }, item);
            continue;
          }
          const value = materialize(expression(item.init, env));
          const legacyHandle = init.type === "CallExpression" && isRef(value) && !value[Symbol.toPrimitive];
          if (node.kind === "const" && ((!isRef(value) && !isCondition(value)) || legacyHandle)) {
            define(env, item.id.name, { value, constant: true }, item);
          } else {
            const actual = value;
            scalar(actual, item);
            // Plain numeric let uses bytes; c64.word explicitly selects words.
            const type = isRef(actual) ? width(actual) : typeof actual === "boolean" ? "bool" : "byte";
            const ref = allocate(type, item.id.name);
            assign(ref, actual, item);
            define(env, item.id.name, { value: ref, constant: node.kind === "const" }, item);
          }
        }
        return;
      case "ExpressionStatement":
        if (node.expression.type === "Literal" && typeof node.expression.value === "string") return;
        // Avoid preserving the unused old value of x++.
        if (node.expression.type === "UpdateExpression") {
          const ref = target(node.expression.argument, env);
          emitMath(ref, node.expression.operator === "++" ? "+" : "-", 1, node);
          ref.arrayCommit?.();
        } else expression(node.expression, env);
        return;
      case "IfStatement":
        return branch(node.test, env, () => statement(node.consequent, env, context), () => node.alternate && statement(node.alternate, env, context));
      case "WhileStatement": case "ForStatement": {
        const local = new Scope(env);
        if (node.init) node.init.type === "VariableDeclaration" ? statement(node.init, local, context) : expression(node.init, local);
        const start = `__js_loop_${serial++}`;
        const end = `__js_loop_end_${serial++}`;
        const next = `__js_loop_next_${serial++}`;
        pushInstruction("naturalLabel", start);
        const body = () => {
          statement(node.body, local, { ...context, returnContext: context?.returnContext ?? context, loopEnd: end, loopNext: next });
          pushInstruction("naturalLabel", next);
          if (node.update) statement({ type: "ExpressionStatement", expression: node.update, loc: node.loc }, local, context);
          pushInstruction("naturalJump", start);
        };
        if (node.test) branch(node.test, local, body); else body();
        pushInstruction("naturalLabel", end);
        return;
      }
      case "BreakStatement": case "ContinueStatement":
        if (node.label || !context?.loopEnd) fail(node, "break/continue needs an enclosing loop (labels are not supported)");
        pushInstruction("naturalJump", node.type === "BreakStatement" ? context.loopEnd : context.loopNext);
        return;
      case "ReturnStatement": {
        context = context?.returnContext ?? context;
        if (!context?.end) fail(node, "return needs a function or callback");
        if (context.callback && node.argument) fail(node, "API callbacks only support bare return");
        if (node.argument) {
          const value = scalar(materialize(expression(node.argument, env)), node);
          context.result ??= allocate("word", "return");
          context.returns.push({ value });
          pushInstruction("runtimeSet", context.result, value);
        } else context.bareReturn = true;
        pushInstruction("naturalJump", context.end);
        return;
      }
      default: fail(node, `Unsupported JavaScript statement: ${node.type}`);
    }
  }

  block(tree.body, global);
  const state = getProgramState();
  const routineBodies = new Map(routines.map(item => [item.args[0], item.args[1]]));
  function calledRoutines(instructions, found = new Set()) {
    for (const instruction of instructions) {
      const [first, second, third] = instruction.args;
      if (instruction.op === "controlCall" && routineBodies.has(first) && !found.has(first)) {
        found.add(first);
        calledRoutines(routineBodies.get(first), found);
      }
      if (["gameFrame", "gameInit"].includes(instruction.op)) calledRoutines(first, found);
      if (["gameEvery", "controlRepeat", "controlWhile", "controlRoutine"].includes(instruction.op)) calledRoutines(second, found);
      if (instruction.op === "controlIf") { calledRoutines(second, found); calledRoutines(third, found); }
      if (instruction.op === "gameScene") for (const list of Object.values(second)) calledRoutines(list, found);
    }
    return found;
  }
  const mainCalls = calledRoutines(state.instructions);
  const irqCalls = calledRoutines(state.irq.handlers.flatMap(handler => handler.instructions));
  for (const name of irqCalls) {
    if (mainCalls.has(name)) fail(routineNodes.get(name), "A function cannot be shared between raster IRQ and main/frame code: its parameters and locals use static storage");
  }
  const defaults = usesRuntimeTextColor ? [{ op: "textColor", args: [1] }] : [];
  return { ...state, instructions: [...declarations, ...defaults, ...state.instructions, ...routines] };
}
