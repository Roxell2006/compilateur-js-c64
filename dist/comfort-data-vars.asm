  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDA #$03
  STA $C200
  LDX #$00
copydata_428_titleText_18_0:
  LDA titleText,X
  STA $0428,X
  INX
  CPX #$12
  BNE copydata_428_titleText_18_0
  LDA #$07
  LDX #$00
memset_d828_7_18:
  STA $D828,X
  INX
  CPX #$12
  BNE memset_d828_7_18
  LDA #$09
  STA $C200
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $04A0,X
  LDA #$01
  STA $D8A0,X
  INX
  BNE printat_loop_1
printat_done_2:
  RTS
; String pool
str_screen_0:
  .byte $03, $0F, $15, $0E, $14, $05, $12, $20, $13, $14, $0F, $12, $05, $04, $20, $01, $14, $20, $24, $03, $32, $30, $30, $00
; User data
titleText:
  .byte $04, $01, $14, $01, $20, $2B, $20, $16, $01, $12, $20, $2B, $20, $03, $0F, $10, $19, $00
