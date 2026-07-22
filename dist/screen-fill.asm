  LDA #$93
  JSR $FFD2
  LDA #$06
  STA $D020
  LDA #$06
  STA $D021
  LDA #$51
  LDX #$00
memset_400_81_255:
  STA $0400,X
  INX
  CPX #$FF
  BNE memset_400_81_255
  LDA #$51
  LDX #$00
memset_4ff_81_255:
  STA $04FF,X
  INX
  CPX #$FF
  BNE memset_4ff_81_255
  LDA #$51
  LDX #$00
memset_5fe_81_255:
  STA $05FE,X
  INX
  CPX #$FF
  BNE memset_5fe_81_255
  LDA #$51
  LDX #$00
memset_6fd_81_235:
  STA $06FD,X
  INX
  CPX #$EB
  BNE memset_6fd_81_235
  LDA #$0E
  LDX #$00
memset_d800_14_255:
  STA $D800,X
  INX
  CPX #$FF
  BNE memset_d800_14_255
  LDA #$0E
  LDX #$00
memset_d8ff_14_255:
  STA $D8FF,X
  INX
  CPX #$FF
  BNE memset_d8ff_14_255
  LDA #$0E
  LDX #$00
memset_d9fe_14_255:
  STA $D9FE,X
  INX
  CPX #$FF
  BNE memset_d9fe_14_255
  LDA #$0E
  LDX #$00
memset_dafd_14_235:
  STA $DAFD,X
  INX
  CPX #$EB
  BNE memset_dafd_14_235
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $05ED,X
  LDA #$01
  STA $D9ED,X
  INX
  BNE printat_loop_0
printat_done_1:
  RTS
; String pool
str_screen_0:
  .byte $13, $03, $12, $05, $05, $0E, $20, $06, $09, $0C, $0C, $05, $04, $00
