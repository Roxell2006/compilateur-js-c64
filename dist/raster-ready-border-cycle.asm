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
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0450,X
  LDA #$01
  STA $D850,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $04A0,X
  LDA #$01
  STA $D8A0,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDA #$FF
  STA $C000
  LDA #$00
  STA $C0FE
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$FA
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
  LDA $D019
  AND #$01
  BNE irq_dispatch_vic_raster
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA31
irq_dispatch_vic_raster:
  LDA #$01
  STA $D019
  LDA $C0FE
  CMP #$00
  BEQ irq_dispatch_match_0
  JMP irq_dispatch_next_0
irq_dispatch_match_0:
  JMP irq_handler_0
irq_dispatch_next_0:
  JMP irq_handler_0
irq_handler_0:
  LDA $C000
  CLC
  ADC #$01
  AND #$0F
  STA $C000
  STA $D020
  LDA #$00
  STA $C0FE
  LDA #$FA
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
program_end:
  RTS
; String pool
str_screen_0:
  .byte $12, $05, $01, $04, $19, $2D, $13, $01, $06, $05, $20, $12, $01, $13, $14, $05, $12, $20, $02, $0F, $12, $04, $05, $12, $00
str_screen_1:
  .byte $02, $0F, $12, $04, $05, $12, $20, $03, $19, $03, $0C, $05, $13, $20, $30, $2E, $2E, $31, $35, $00
str_screen_2:
  .byte $02, $01, $13, $09, $03, $20, $12, $05, $01, $04, $19, $20, $13, $08, $0F, $15, $0C, $04, $20, $13, $14, $01, $19, $20, $01, $0C, $09, $16, $05, $00
