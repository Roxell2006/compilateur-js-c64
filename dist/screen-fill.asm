  LDA #$93
  JSR $FFD2
  LDA #$06
  STA $D020
  LDA #$06
  STA $D021
  LDX #$00
memset_400_81_255:
  LDA #$51
  STA $0400,X
  INX
  CPX #$FF
  BNE memset_400_81_255
  LDX #$00
memset_d800_14_255:
  LDA #$0E
  STA $D800,X
  INX
  CPX #$FF
  BNE memset_d800_14_255
  RTS
