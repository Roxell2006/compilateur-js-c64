  LDA #$93
  JSR $FFD2
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
  JSR $FF9F
  JSR $FFCF
  STA $0428
  RTS
; String pool
str_screen_0:
  .byte $10, $12, $05, $13, $13, $20, $01, $0E, $19, $20, $0B, $05, $19, $00
