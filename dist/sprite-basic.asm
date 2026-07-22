  LDA #$93
  JSR $FFD2
  LDA #$03
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $040A,X
  LDA #$01
  STA $D80A,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0455,X
  LDA #$01
  STA $D855,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDA #$78
  STA $C500
  LDA #$00
  STA $C501
  LDA #$5A
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  LDA $C505
  BNE sprite_runtime_active_0_4
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_7
sprite_runtime_active_0_4:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_5
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_6
sprite_runtime_xhigh_0_5:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_6:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_7:
  LDX #$00
copydata_2000_sprite_data_0_0_63_8:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_8
  LDA #$80
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$02
  STA $C405
  LDA #$02
  STA $D027
  RTS
; String pool
str_screen_0:
  .byte $03, $36, $34, $20, $08, $0F, $14, $20, $01, $09, $12, $20, $02, $01, $0C, $0C, $0F, $0F, $0E, $00
str_screen_1:
  .byte $13, $10, $12, $09, $14, $05, $20, $30, $20, $06, $12, $0F, $0D, $20, $14, $08, $05, $20, $15, $13, $05, $12, $20, $0D, $01, $0E, $15, $01, $0C, $00
; User data
sprite_data_0_0:
  .byte $00, $7F, $00, $01, $FF, $C0, $03, $FF, $E0, $03, $FF, $E0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $03, $FF, $E0, $03, $FF, $E0, $01, $FF, $C0, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $3C, $00, $00, $18, $00, $00, $24, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00
