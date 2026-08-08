  LDA #$0C
  STA $D418
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
  STA $0523,X
  LDA #$01
  STA $D923,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $059E,X
  LDA #$01
  STA $D99E,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $05ED,X
  LDA #$01
  STA $D9ED,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDX #$00
printat_loop_6:
  LDA str_screen_3,X
  BEQ printat_done_7
  STA $063A,X
  LDA #$01
  STA $DA3A,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDX #$00
printat_loop_8:
  LDA str_screen_4,X
  BEQ printat_done_9
  STA $068C,X
  LDA #$01
  STA $DA8C,X
  INX
  BNE printat_loop_8
printat_done_9:
  LDA #$00
  STA $C763
  LDA #$00
  STA $C764
  LDA #$00
  STA $C771
  LDA #$0C
  STA $C772
  LDA #$00
  STA $C776
  LDA #$01
  STA $C765
  LDA #$40
  STA $D404
  LDA #$00
  STA $D402
  LDA #$08
  STA $D403
  LDA #$11
  STA $D405
  LDA #$98
  STA $D406
  LDA #$10
  STA $D40B
  LDA #$12
  STA $D40C
  LDA #$88
  STA $D40D
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
  BNE sid_irq_done_jump_5
  LDA $C771
  CLC
  ADC #$32
  STA $C771
  CMP $C76F
  BCS sid_irq_rate_continue_5
  JMP sid_irq_done_5
sid_irq_rate_continue_5:
  SBC $C76F
  STA $C771
  LDA $C776
  BEQ sid_irq_fade_done_5
  LDA $C775
  BEQ sid_irq_fade_step_5
  DEC $C775
  JMP sid_irq_fade_done_5
sid_irq_fade_step_5:
  LDA $C774
  STA $C775
  LDA $C772
  CMP $C773
  BEQ sid_irq_fade_complete_5
  BCC sid_irq_fade_increase_5
  DEC $C772
  JMP sid_irq_fade_write_5
sid_irq_fade_increase_5:
  INC $C772
sid_irq_fade_write_5:
  LDA $D418
  AND #$F0
  ORA $C772
  STA $D418
  LDA $C772
  CMP $C773
  BNE sid_irq_fade_done_5
sid_irq_fade_complete_5:
  LDA #$00
  STA $C776
sid_irq_fade_done_5:
  LDA $C764
  BEQ sid_irq_process_jump_5
  DEC $C764
  JMP sid_irq_done_5
sid_irq_done_jump_5:
  JMP sid_irq_done_5
sid_irq_process_jump_5:
  JMP sid_irq_process_5
sid_irq_process_5:
  LDX $C763
  CPX #$08
  BNE sid_irq_stop_continue_5
  LDX #$00
  STX $C763
  JMP sid_irq_loop_continue_5
sid_irq_stop_continue_5:
sid_irq_loop_continue_5:
  LDA sid_song_irq_5_v1_action,X
  BEQ sid_irq_voice1_rest_5
  CMP #$01
  BEQ sid_irq_voice1_hold_5
  LDA sid_song_irq_5_v1_lo,X
  STA $D400
  LDA sid_song_irq_5_v1_hi,X
  STA $D401
  LDA #$40
  STA $D404
  LDA #$41
  STA $D404
  JMP sid_irq_voice1_done_5
sid_irq_voice1_rest_5:
  LDA #$40
  STA $D404
  JMP sid_irq_voice1_done_5
sid_irq_voice1_hold_5:
; hold sid voice 1
sid_irq_voice1_done_5:
  LDA sid_song_irq_5_v2_action,X
  BEQ sid_irq_voice2_rest_5
  CMP #$01
  BEQ sid_irq_voice2_hold_5
  LDA sid_song_irq_5_v2_lo,X
  STA $D407
  LDA sid_song_irq_5_v2_hi,X
  STA $D408
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40B
  JMP sid_irq_voice2_done_5
sid_irq_voice2_rest_5:
  LDA #$10
  STA $D40B
  JMP sid_irq_voice2_done_5
sid_irq_voice2_hold_5:
; hold sid voice 2
sid_irq_voice2_done_5:
  INC $C763
  LDA #$04
  STA $C764
  JMP sid_irq_done_5
sid_irq_stop_5:
  LDA #$00
  STA $C765
  LDA #$40
  STA $D404
  LDA #$10
  STA $D40B
  JMP sid_irq_done_5
sid_irq_done_5:
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
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
  LDA #$FF
  STA $C767
  LDA #$FF
  STA $C769
  LDA #$3C
  STA $C76F
game_video_detect_low:
  LDA $D011
  BMI game_video_detect_low
game_video_detect_high:
  LDA $D011
  BPL game_video_detect_high
game_video_detect_scan:
  LDA $D011
  BPL game_video_detect_done
  LDA $D012
  CMP #$20
  BCS game_video_detect_pal
  JMP game_video_detect_scan
game_video_detect_pal:
  LDA #$32
  STA $C76F
game_video_detect_done:
game_frame_loop:
game_frame_wait_leave:
  LDA $D012
  CMP #$F0
  BEQ game_frame_wait_leave
game_frame_wait_target:
  LDA $D012
  CMP #$F0
  BNE game_frame_wait_target
  LDA $C767
  STA $C769
  LDA $DC00
  STA $C767
  INC $C76A
  BNE game_frame_counter_done_10
  INC $C76B
game_frame_counter_done_10:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_12
  JMP control_if_else_11
joystick_current_pressed_12:
  LDA $C769
  AND #$01
  BNE condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA $C765
  CMP #$01
  BNE sid_pause_done_13
  LDA #$02
  STA $C765
  LDA #$40
  STA $D404
  LDA #$10
  STA $D40B
sid_pause_done_13:
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_15
  JMP control_if_else_14
joystick_current_pressed_15:
  LDA $C769
  AND #$02
  BNE condition_pass_15
  JMP control_if_else_14
condition_pass_15:
  LDA $C765
  CMP #$02
  BNE sid_resume_done_16
  LDA #$00
  STA $C764
  LDA #$01
  STA $C765
sid_resume_done_16:
  JMP control_if_end_14
control_if_else_14:
control_if_end_14:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_18
  JMP control_if_else_17
joystick_current_pressed_18:
  LDA $C769
  AND #$04
  BNE condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA #$00
  STA $C773
  LDA #$02
  STA $C774
  LDA #$00
  STA $C775
  LDA #$01
  STA $C776
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_20
  JMP control_if_else_19
joystick_current_pressed_20:
  LDA $C769
  AND #$08
  BNE condition_pass_20
  JMP control_if_else_19
condition_pass_20:
  LDA #$0C
  STA $C773
  LDA #$02
  STA $C774
  LDA #$00
  STA $C775
  LDA #$01
  STA $C776
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_22
  JMP control_if_else_21
joystick_current_pressed_22:
  LDA $C769
  AND #$10
  BNE condition_pass_22
  JMP control_if_else_21
condition_pass_22:
  LDA #$0F
  STA $D418
  LDA #$00
  STA $D412
  LDA #$10
  STA $D412
  LDA #$00
  STA $D413
  LDA #$00
  STA $D414
  LDA #$39
  STA $D40E
  LDA #$8B
  STA $D40F
  LDA #$11
  STA $D412
  JMP control_if_end_21
control_if_else_21:
control_if_end_21:
  JMP game_frame_loop
; String pool
str_screen_0:
  .byte $01, $15, $04, $09, $0F, $20, $04, $05, $20, $0A, $05, $15, $20, $16, $30, $2E, $31, $31, $00
str_screen_1:
  .byte $08, $01, $15, $14, $20, $3A, $20, $10, $01, $15, $13, $05, $00
str_screen_2:
  .byte $02, $01, $13, $20, $20, $3A, $20, $12, $05, $10, $12, $09, $13, $05, $00
str_screen_3:
  .byte $07, $01, $15, $03, $08, $05, $2F, $04, $12, $0F, $09, $14, $05, $20, $3A, $20, $06, $01, $04, $05, $00
str_screen_4:
  .byte $06, $05, $15, $20, $20, $3A, $20, $02, $12, $15, $09, $14, $01, $07, $05, $00
; User data
sid_song_irq_5_v1_action:
  .byte $02, $02, $02, $02, $02, $02, $02, $02
sid_song_irq_5_v1_lo:
  .byte $67, $ED, $13, $ED, $89, $3B, $45, $3B
sid_song_irq_5_v1_hi:
  .byte $11, $15, $1A, $15, $13, $17, $1D, $17
sid_song_irq_5_v2_action:
  .byte $02, $01, $02, $01, $02, $01, $02, $01
sid_song_irq_5_v2_lo:
  .byte $B4, $B4, $85, $85, $C4, $C4, $51, $51
sid_song_irq_5_v2_hi:
  .byte $08, $08, $06, $06, $09, $09, $07, $07
