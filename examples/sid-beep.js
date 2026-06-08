import { c64 } from "./c64.js";

c64.clearScreen();
c64.poke(c64.SID_FILTER_MODE_VOL, 0x0f);
c64.poke(c64.SID_VOICE1_FREQ_LO, 0x22);
c64.poke(c64.SID_VOICE1_FREQ_HI, 0x11);
c64.poke(c64.SID_VOICE1_ATTACK_DECAY, 0x11);
c64.poke(c64.SID_VOICE1_SUSTAIN_RELEASE, 0xf0);
c64.poke(c64.SID_VOICE1_CONTROL, 0x21);
