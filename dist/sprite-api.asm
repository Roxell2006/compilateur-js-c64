  LDA #$93
  JSR $FFD2
  LDA #$00
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
memset_429_81_38:
  STA $0429,X
  INX
  CPX #$26
  BNE memset_429_81_38
  LDA #$01
  LDX #$00
memset_d829_1_38:
  STA $D829,X
  INX
  CPX #$26
  BNE memset_d829_1_38
  LDA #$51
  LDX #$00
memset_541_81_38:
  STA $0541,X
  INX
  CPX #$26
  BNE memset_541_81_38
  LDA #$01
  LDX #$00
memset_d941_1_38:
  STA $D941,X
  INX
  CPX #$26
  BNE memset_d941_1_38
  LDA #$51
  STA $0451
  LDA #$01
  STA $D851
  LDA #$51
  STA $0476
  LDA #$01
  STA $D876
  LDA #$51
  STA $0479
  LDA #$01
  STA $D879
  LDA #$51
  STA $049E
  LDA #$01
  STA $D89E
  LDA #$51
  STA $04A1
  LDA #$01
  STA $D8A1
  LDA #$51
  STA $04C6
  LDA #$01
  STA $D8C6
  LDA #$51
  STA $04C9
  LDA #$01
  STA $D8C9
  LDA #$51
  STA $04EE
  LDA #$01
  STA $D8EE
  LDA #$51
  STA $04F1
  LDA #$01
  STA $D8F1
  LDA #$51
  STA $0516
  LDA #$01
  STA $D916
  LDA #$51
  STA $0519
  LDA #$01
  STA $D919
  LDA #$51
  STA $053E
  LDA #$01
  STA $D93E
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0484,X
  LDA #$01
  STA $D884,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDA #$8C
  STA $C500
  LDA #$00
  STA $C501
  LDA #$64
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  LDA $C505
  BNE sprite_runtime_active_0_2
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_5
sprite_runtime_active_0_2:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_3
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_4
sprite_runtime_xhigh_0_3:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_4:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_5:
  LDX #$00
copydata_2000_sprite_data_0_0_63_6:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_6
  LDA #$80
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$07
  STA $C405
  LDA #$07
  STA $D027
  LDA $C406
  AND #$FE
  STA $C406
  LDA $D01C
  AND #$FE
  STA $D01C
  LDA $C406
  ORA #$02
  STA $C406
  LDA $D01D
  ORA #$01
  STA $D01D
  LDA $C406
  ORA #$04
  STA $C406
  LDA $D017
  ORA #$01
  STA $D017
  RTS
; String pool
str_screen_0:
  .byte $13, $10, $12, $09, $14, $05, $20, $01, $10, $09, $20, $04, $05, $0D, $0F, $00
; User data
sprite_data_0_0:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $FF, $00, $01, $FF, $80, $03, $FF, $C0, $07, $FF, $E0, $0F, $FF, $F0, $1F, $FF, $F8, $3F, $FF, $FC, $1F, $FF, $F8, $0F, $FF, $F0, $07, $FF, $E0, $03, $FF, $C0, $01, $FF, $80, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00
