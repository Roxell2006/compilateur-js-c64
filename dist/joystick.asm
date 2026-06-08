  LDA #$93
  JSR $FFD2
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
  LDA $DC00
  STA $0428
  RTS
; String pool
str_screen_0:
  .byte $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $10, $0F, $12, $14, $20, $32, $00
