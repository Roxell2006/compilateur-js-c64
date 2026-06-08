  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0400,X
  LDA #$01
  STA $D800,X
  INX
  JMP printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0450,X
  LDA #$01
  STA $D850,X
  INX
  JMP printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $0478,X
  LDA #$01
  STA $D878,X
  INX
  JMP printat_loop_4
printat_done_5:
  SEI
  LDA #$00
  STA $C0FE
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$32
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<irq_dispatch
  STA $0314
  LDA #>irq_dispatch
  STA $0315
  CLI
  JMP program_end
; Raster IRQ dispatcher
irq_dispatch:
  PHA
  TXA
  PHA
  TYA
  PHA
  LDA $C0FE
  CMP #$00
  BEQ irq_handler_0
  CMP #$01
  BEQ irq_handler_1
  JMP irq_handler_0
irq_handler_0:
  LDA #$02
  STA $D020
  LDA #$01
  STA $C0FE
  LDA #$96
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #$01
  STA $D019
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA31
irq_handler_1:
  LDA #$06
  STA $D020
  LDA #$00
  STA $C0FE
  LDA #$32
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #$01
  STA $D019
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA31
program_end:
  RTS
; String pool
str_screen_0:
  .byte $13, $01, $06, $05, $20, $12, $01, $13, $14, $05, $12, $20, $02, $01, $12, $13, $00
str_screen_1:
  .byte $12, $05, $04, $20, $01, $14, $20, $0C, $09, $0E, $05, $20, $35, $30, $00
str_screen_2:
  .byte $02, $0C, $15, $05, $20, $01, $14, $20, $0C, $09, $0E, $05, $20, $31, $35, $30, $00
