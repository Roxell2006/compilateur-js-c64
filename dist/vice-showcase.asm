  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$06
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
  LDX #$00
printat_loop_6:
  LDA str_screen_3,X
  BEQ printat_done_7
  STA $04F0,X
  LDA #$01
  STA $D8F0,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDA #$00
  STA $C0FE
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$F5
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<irq_dispatch
  STA $0314
  LDA #>irq_dispatch
  STA $0315
  CLI
  LDA #$05
  STA $C001
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
  LDA $C001
  CLC
  ADC #$01
  AND #$0F
  STA $C001
  STA $D020
  EOR #$0F
  STA $D021
  LDA #$00
  STA $C0FE
  LDA #$F5
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
  .byte $0A, $13, $2D, $03, $36, $34, $20, $16, $09, $03, $05, $20, $13, $08, $0F, $17, $03, $01, $13, $05, $00
str_screen_1:
  .byte $09, $12, $11, $20, $04, $05, $0D, $0F, $20, $12, $15, $0E, $0E, $09, $0E, $07, $20, $09, $0E, $20, $02, $01, $03, $0B, $07, $12, $0F, $15, $0E, $04, $00
str_screen_2:
  .byte $12, $05, $01, $04, $19, $20, $13, $08, $0F, $15, $0C, $04, $20, $12, $05, $0D, $01, $09, $0E, $20, $12, $05, $13, $10, $0F, $0E, $13, $09, $16, $05, $00
str_screen_3:
  .byte $02, $0F, $12, $04, $05, $12, $20, $01, $0E, $04, $20, $02, $07, $20, $0B, $05, $05, $10, $20, $03, $19, $03, $0C, $09, $0E, $07, $00
