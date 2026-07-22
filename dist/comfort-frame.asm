  LDA #$93
  JSR $FFD2
  LDA #$06
  STA $D020
  LDA #$06
  STA $D021
  LDA #$0E
  STA $0286
  LDA #$93
  JSR $FFD2
  LDA #$01
  STA $0286
  LDA #$51
  LDX #$00
memset_47a_81_36:
  STA $047A,X
  INX
  CPX #$24
  BNE memset_47a_81_36
  LDA #$01
  LDX #$00
memset_d87a_1_36:
  STA $D87A,X
  INX
  CPX #$24
  BNE memset_d87a_1_36
  LDA #$51
  LDX #$00
memset_5e2_81_36:
  STA $05E2,X
  INX
  CPX #$24
  BNE memset_5e2_81_36
  LDA #$01
  LDX #$00
memset_d9e2_1_36:
  STA $D9E2,X
  INX
  CPX #$24
  BNE memset_d9e2_1_36
  LDA #$51
  STA $04A2
  LDA #$01
  STA $D8A2
  LDA #$51
  STA $04C5
  LDA #$01
  STA $D8C5
  LDA #$51
  STA $04CA
  LDA #$01
  STA $D8CA
  LDA #$51
  STA $04ED
  LDA #$01
  STA $D8ED
  LDA #$51
  STA $04F2
  LDA #$01
  STA $D8F2
  LDA #$51
  STA $0515
  LDA #$01
  STA $D915
  LDA #$51
  STA $051A
  LDA #$01
  STA $D91A
  LDA #$51
  STA $053D
  LDA #$01
  STA $D93D
  LDA #$51
  STA $0542
  LDA #$01
  STA $D942
  LDA #$51
  STA $0565
  LDA #$01
  STA $D965
  LDA #$51
  STA $056A
  LDA #$01
  STA $D96A
  LDA #$51
  STA $058D
  LDA #$01
  STA $D98D
  LDA #$51
  STA $0592
  LDA #$01
  STA $D992
  LDA #$51
  STA $05B5
  LDA #$01
  STA $D9B5
  LDA #$51
  STA $05BA
  LDA #$01
  STA $D9BA
  LDA #$51
  STA $05DD
  LDA #$01
  STA $D9DD
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $04D5,X
  LDA #$01
  STA $D8D5,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $051F,X
  LDA #$01
  STA $D91F,X
  INX
  BNE printat_loop_2
printat_done_3:
  RTS
; String pool
str_screen_0:
  .byte $0A, $13, $2D, $03, $36, $34, $20, $16, $30, $2E, $32, $2E, $30, $00
str_screen_1:
  .byte $06, $12, $01, $0D, $05, $20, $2B, $20, $06, $09, $0C, $0C, $12, $05, $03, $14, $20, $2B, $20, $03, $05, $0E, $14, $05, $12, $00
