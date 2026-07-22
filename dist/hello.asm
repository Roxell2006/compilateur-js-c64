  LDA #$93
  JSR $FFD2
  LDA #$06
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
  RTS
; String pool
str_screen_0:
  .byte $08, $05, $0C, $0C, $0F, $2C, $20, $03, $36, $34, $21, $00
