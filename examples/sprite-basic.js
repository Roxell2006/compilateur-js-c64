import { c64 } from "./c64.js";

const SPRITE_DATA_ADDRESS = 0x2000;
const SPRITE_POINTER_0 = 0x07f8;
const SPRITE_BLOCK_INDEX = SPRITE_DATA_ADDRESS / 64;
const BALLOON_SPRITE_BYTES = [
  0, 127, 0, 1, 255, 192, 3, 255, 224, 3, 255, 224,
  7, 255, 240, 7, 255, 240, 7, 255, 240, 7, 255, 240,
  7, 255, 240, 3, 255, 224, 3, 255, 224, 1, 255, 192,
  0, 255, 0, 0, 126, 0, 0, 60, 0, 0, 60, 0,
  0, 24, 0, 0, 36, 0, 0, 126, 0, 0, 126, 0,
  0, 60, 0
];

c64.clearScreen();
c64.borderColor(c64.COLOR_CYAN);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "C64 HOT AIR BALLOON");
c64.printAt(0, 2, "SPRITE 0 FROM THE USER MANUAL");

c64.asm.jmp(c64.abs("sprite_setup"));
c64.asm.label("balloon_sprite_data");
c64.asm.byte(BALLOON_SPRITE_BYTES);
c64.asm.label("sprite_setup");
c64.asm.ldx(c64.imm(0));
c64.asm.label("copy_balloon_sprite");
c64.asm.lda(c64.absx("balloon_sprite_data"));
c64.asm.sta(c64.absx(SPRITE_DATA_ADDRESS));
c64.asm.inx();
c64.asm.cpx(c64.imm(BALLOON_SPRITE_BYTES.length));
c64.asm.bne(c64.rel("copy_balloon_sprite"));

c64.poke(SPRITE_POINTER_0, SPRITE_BLOCK_INDEX);
c64.poke(c64.VIC_SPRITE0_X, 120);
c64.poke(c64.VIC_SPRITE0_Y, 90);
c64.poke(0xd027, c64.COLOR_RED);
c64.poke(c64.VIC_SPRITE_ENABLE, 0x01);
