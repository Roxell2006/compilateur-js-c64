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
  LDA #$0F
  STA $D418
  LDA #$40
  STA $D404
  LDA #$00
  STA $D402
  LDA #$08
  STA $D403
  LDA #$11
  STA $D405
  LDA #$F0
  STA $D406
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40C
  LDA #$D0
  STA $D40D
  LDA #$20
  STA $D412
  LDA #$11
  STA $D413
  LDA #$A0
  STA $D414
  LDA #$3C
  STA $C76F
sid_video_detect_low:
  LDA $D011
  BMI sid_video_detect_low
sid_video_detect_high:
  LDA $D011
  BPL sid_video_detect_high
sid_video_detect_scan:
  LDA $D011
  BPL sid_video_detect_done
  LDA $D012
  CMP #$20
  BCS sid_video_detect_pal
  JMP sid_video_detect_scan
sid_video_detect_pal:
  LDA #$32
  STA $C76F
sid_video_detect_done:
  LDA #$00
  STA $C763
  LDA #$00
  STA $C764
  LDA #$00
  STA $C771
  LDA #$0F
  STA $C772
  LDA #$00
  STA $C776
  LDA #$01
  STA $C765
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$FA
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<sid_player_irq
  STA $0314
  LDA #>sid_player_irq
  STA $0315
  CLI
  JMP program_end_after_sid_player
; SID player IRQ
sid_player_irq:
  PHA
  TXA
  PHA
  TYA
  PHA
  LDA $D019
  AND #$01
  BNE sid_player_vic_raster
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA31
sid_player_vic_raster:
  LDA #$01
  STA $D019
  LDA $C765
  CMP #$01
  BNE sid_irq_done_jump_2
  LDA $C771
  CLC
  ADC #$32
  STA $C771
  CMP $C76F
  BCS sid_irq_rate_continue_2
  JMP sid_irq_done_2
sid_irq_rate_continue_2:
  SBC $C76F
  STA $C771
  LDA $C764
  BEQ sid_irq_process_jump_2
  DEC $C764
  JMP sid_irq_done_2
sid_irq_done_jump_2:
  JMP sid_irq_done_2
sid_irq_process_jump_2:
  JMP sid_irq_process_2
sid_irq_process_2:
  LDX $C763
  CPX #$08
  BNE sid_irq_stop_continue_2
  JMP sid_irq_stop_2
sid_irq_stop_continue_2:
sid_irq_loop_continue_2:
  LDA sid_song_irq_2_v1_action,X
  BEQ sid_irq_voice1_rest_2
  CMP #$01
  BEQ sid_irq_voice1_hold_2
  LDA sid_song_irq_2_v1_lo,X
  STA $D400
  LDA sid_song_irq_2_v1_hi,X
  STA $D401
  LDA #$40
  STA $D404
  LDA #$41
  STA $D404
  JMP sid_irq_voice1_done_2
sid_irq_voice1_rest_2:
  LDA #$40
  STA $D404
  JMP sid_irq_voice1_done_2
sid_irq_voice1_hold_2:
; hold sid voice 1
sid_irq_voice1_done_2:
  LDA sid_song_irq_2_v2_action,X
  BEQ sid_irq_voice2_rest_2
  CMP #$01
  BEQ sid_irq_voice2_hold_2
  LDA sid_song_irq_2_v2_lo,X
  STA $D407
  LDA sid_song_irq_2_v2_hi,X
  STA $D408
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40B
  JMP sid_irq_voice2_done_2
sid_irq_voice2_rest_2:
  LDA #$10
  STA $D40B
  JMP sid_irq_voice2_done_2
sid_irq_voice2_hold_2:
; hold sid voice 2
sid_irq_voice2_done_2:
  LDA sid_song_irq_2_v3_action,X
  BEQ sid_irq_voice3_rest_2
  CMP #$01
  BEQ sid_irq_voice3_hold_2
  LDA sid_song_irq_2_v3_lo,X
  STA $D40E
  LDA sid_song_irq_2_v3_hi,X
  STA $D40F
  LDA #$20
  STA $D412
  LDA #$21
  STA $D412
  JMP sid_irq_voice3_done_2
sid_irq_voice3_rest_2:
  LDA #$20
  STA $D412
  JMP sid_irq_voice3_done_2
sid_irq_voice3_hold_2:
; hold sid voice 3
sid_irq_voice3_done_2:
  INC $C763
  LDA #$17
  STA $C764
  JMP sid_irq_done_2
sid_irq_stop_2:
  LDA #$00
  STA $C765
  LDA #$40
  STA $D404
  LDA #$10
  STA $D40B
  LDA #$20
  STA $D412
  JMP sid_irq_done_2
sid_irq_done_2:
  LDA #$FA
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
program_end_after_sid_player:
  RTS
; String pool
str_screen_0:
  .byte $13, $09, $04, $20, $16, $30, $2E, $36, $2E, $30, $00
str_screen_1:
  .byte $33, $20, $16, $0F, $09, $18, $00
; User data
sid_song_irq_2_v1_action:
  .byte $02, $02, $02, $02, $02, $02, $02, $00
sid_song_irq_2_v1_lo:
  .byte $67, $ED, $13, $CE, $13, $ED, $67, $00
sid_song_irq_2_v1_hi:
  .byte $11, $15, $1A, $22, $1A, $15, $11, $00
sid_song_irq_2_v2_action:
  .byte $02, $01, $02, $01, $02, $01, $02, $01
sid_song_irq_2_v2_lo:
  .byte $B4, $B4, $85, $85, $7B, $7B, $5A, $5A
sid_song_irq_2_v2_hi:
  .byte $08, $08, $06, $06, $05, $05, $04, $04
sid_song_irq_2_v3_action:
  .byte $02, $00, $02, $00, $02, $00, $02, $00
sid_song_irq_2_v3_lo:
  .byte $CE, $00, $DA, $00, $26, $00, $DA, $00
sid_song_irq_2_v3_hi:
  .byte $22, $00, $2B, $00, $34, $00, $2B, $00
