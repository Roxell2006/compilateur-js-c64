  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  LDA #$00
  STA $C103
  LDA #$64
  STA $C500
  LDA #$00
  STA $C501
  LDA #$D2
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  JSR runtime_sprite_sync_0
  LDX #$00
copydata_2000_sprite_data_0_0_63_0:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_0
  LDA #$80
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$07
  STA $C405
  LDA #$07
  STA $D027
  JMP user_routine_move_player_left_after
user_routine_move_player_left:
  LDA #$FD
  STA $C503
  LDA #$00
  STA $C504
  RTS
user_routine_move_player_left_after:
  JMP user_routine_move_player_right_after
user_routine_move_player_right:
  LDA #$03
  STA $C503
  LDA #$00
  STA $C504
  RTS
user_routine_move_player_right_after:
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $0432,X
  LDA #$01
  STA $D832,X
  INX
  BNE printat_loop_1
printat_done_2:
  LDX #$00
printat_loop_3:
  LDA str_screen_1,X
  BEQ printat_done_4
  STA $0481,X
  LDA #$01
  STA $D881,X
  INX
  BNE printat_loop_3
printat_done_4:
  LDX #$00
printat_loop_5:
  LDA str_screen_2,X
  BEQ printat_done_6
  STA $04A6,X
  LDA #$01
  STA $D8A6,X
  INX
  BNE printat_loop_5
printat_done_6:
  LDA #$0C
  STA $D418
  LDA #$10
  STA $D404
  LDA #$11
  STA $D405
  LDA #$90
  STA $D406
  LDA #$00
  STA $C763
  LDA #$00
  STA $C764
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
  BEQ sid_irq_done_jump_3
  LDA $C764
  BEQ sid_irq_process_jump_3
  DEC $C764
  JMP sid_irq_done_3
sid_irq_done_jump_3:
  JMP sid_irq_done_3
sid_irq_process_jump_3:
  JMP sid_irq_process_3
sid_irq_process_3:
  LDX $C763
  CPX #$04
  BNE sid_irq_stop_continue_3
  JMP sid_irq_stop_3
sid_irq_stop_continue_3:
  LDA sid_song_irq_3_v1_action,X
  BEQ sid_irq_voice1_rest_3
  CMP #$01
  BEQ sid_irq_voice1_hold_3
  LDA sid_song_irq_3_v1_lo,X
  STA $D400
  LDA sid_song_irq_3_v1_hi,X
  STA $D401
  LDA #$10
  STA $D404
  LDA #$11
  STA $D404
  JMP sid_irq_voice1_done_3
sid_irq_voice1_rest_3:
  LDA #$10
  STA $D404
  JMP sid_irq_voice1_done_3
sid_irq_voice1_hold_3:
; hold sid voice 1
sid_irq_voice1_done_3:
  LDA sid_song_irq_3_v2_action,X
  BEQ sid_irq_voice2_rest_3
  CMP #$01
  BEQ sid_irq_voice2_hold_3
  LDA sid_song_irq_3_v2_lo,X
  STA $D407
  LDA sid_song_irq_3_v2_hi,X
  STA $D408
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40B
  JMP sid_irq_voice2_done_3
sid_irq_voice2_rest_3:
  LDA #$10
  STA $D40B
  JMP sid_irq_voice2_done_3
sid_irq_voice2_hold_3:
; hold sid voice 2
sid_irq_voice2_done_3:
  LDA sid_song_irq_3_v3_action,X
  BEQ sid_irq_voice3_rest_3
  CMP #$01
  BEQ sid_irq_voice3_hold_3
  LDA sid_song_irq_3_v3_lo,X
  STA $D40E
  LDA sid_song_irq_3_v3_hi,X
  STA $D40F
  LDA #$10
  STA $D412
  LDA #$11
  STA $D412
  JMP sid_irq_voice3_done_3
sid_irq_voice3_rest_3:
  LDA #$10
  STA $D412
  JMP sid_irq_voice3_done_3
sid_irq_voice3_hold_3:
; hold sid voice 3
sid_irq_voice3_done_3:
  INC $C763
  LDA #$06
  STA $C764
  JMP sid_irq_done_3
sid_irq_stop_3:
  LDA #$00
  STA $C765
  LDA #$10
  STA $D404
  LDA #$10
  STA $D40B
  LDA #$10
  STA $D412
  JMP sid_irq_done_3
sid_irq_done_3:
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
  LDA #$3C
  STA $C76F
  LDA #$00
  STA $C104
  LDA #$FF
  STA $C767
  LDA #$FF
  STA $C769
  LDA #$01
  STA $C780
  LDA #$01
  STA $C790
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
  CLC
  LDA $C770
  ADC #$32
  STA $C770
  CMP $C76F
  BCS game_frame_logical_tick
  JMP game_frame_loop
game_frame_logical_tick:
  SEC
  LDA $C770
  SBC $C76F
  STA $C770
  LDA $C767
  STA $C769
  LDA $DC00
  STA $C767
  LDA $DC00
  STA $C76C
  LDA $DC02
  STA $C76D
  LDA $DC03
  STA $C76E
  LDA #$FF
  STA $DC02
  LDA #$00
  STA $DC03
  LDA $C780
  STA $C790
  LDA #$7F
  STA $DC00
  LDA $DC01
  AND #$10
  BEQ keyboard_scan_pressed_60
  LDA #$01
  JMP keyboard_scan_stored_60
keyboard_scan_pressed_60:
  LDA #$00
keyboard_scan_stored_60:
  STA $C780
  LDA $C76C
  STA $DC00
  LDA $C76D
  STA $DC02
  LDA $C76E
  STA $DC03
  INC $C76A
  BNE game_frame_counter_done_7
  INC $C76B
game_frame_counter_done_7:
  INC $C102
  BNE runtime_word_inc_done_8
  INC $C103
runtime_word_inc_done_8:
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA $C100
  CMP #$00
  BEQ condition_pass_10
  JMP control_if_else_9
condition_pass_10:
  LDA $C767
  AND #$04
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  JSR user_routine_move_player_left
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C767
  AND #$08
  BEQ condition_pass_14
  JMP control_if_else_13
condition_pass_14:
  JSR user_routine_move_player_right
  JMP control_if_end_13
control_if_else_13:
control_if_end_13:
  JMP control_if_end_9
control_if_else_9:
control_if_end_9:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_16
  JMP control_if_else_15
joystick_current_pressed_16:
  LDA $C769
  AND #$10
  BNE condition_pass_16
  JMP control_if_else_15
condition_pass_16:
  LDA #$02
  STA $D020
  JMP control_if_end_15
control_if_else_15:
control_if_end_15:
  LDA $C767
  AND #$10
  BNE joystick_current_released_18
  JMP control_if_else_17
joystick_current_released_18:
  LDA $C769
  AND #$10
  BEQ condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA #$00
  STA $D020
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
  LDA $C780
  BEQ keyboard_pressed_20
  JMP control_if_else_19
keyboard_pressed_20:
  LDA $C790
  BNE condition_pass_20
  JMP control_if_else_19
condition_pass_20:
  LDA $C100
  EOR #$01
  STA $C100
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  INC $C104
  LDA $C104
  CMP #$19
  BCS game_every_run_21
  JMP game_every_done_22
game_every_run_21:
  LDA #$00
  STA $C104
  LDA $C101
  EOR #$01
  STA $C101
  LDA $C101
  CMP #$01
  BEQ condition_pass_24
  JMP control_if_else_23
condition_pass_24:
  LDA #$06
  STA $D021
  JMP control_if_end_23
control_if_else_23:
  LDA #$04
  STA $D021
control_if_end_23:
game_every_done_22:
  LDA $C505
  BNE sprite_update_active_0_26
  JMP sprite_update_inactive_0_25
sprite_update_active_0_26:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_27
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_27
sprite_vx_positive_27:
  LDA $C501
  ADC #$00
sprite_vx_done_27:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_28
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_28
  JMP sprite_vy_store_28
sprite_vy_positive_28:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_28
sprite_vy_store_28:
  STA $C502
  JMP sprite_vy_done_28
sprite_vy_clamp_min_28:
  LDA #$D2
  STA $C502
  JMP sprite_vy_done_28
sprite_vy_clamp_max_28:
  LDA #$D2
  STA $C502
sprite_vy_done_28:
  LDA $C501
  BMI sprite_x_clamp_min_29
  CMP #$00
  BCC sprite_x_clamp_min_29
  BNE sprite_x_min_ok_29
  LDA $C500
  CMP #$18
  BCS sprite_x_min_ok_29
sprite_x_clamp_min_29:
  LDA #$18
  STA $C500
  LDA #$00
  STA $C501
sprite_x_min_ok_29:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_29
  BNE sprite_x_clamp_max_29
  LDA $C500
  CMP #$40
  BCC sprite_x_max_ok_29
  BEQ sprite_x_max_ok_29
sprite_x_clamp_max_29:
  LDA #$40
  STA $C500
  LDA #$01
  STA $C501
sprite_x_max_ok_29:
  LDA $C502
  CMP #$D2
  BCS sprite_y_min_ok_29
  LDA #$D2
  STA $C502
sprite_y_min_ok_29:
  LDA $C502
  CMP #$D2
  BCC sprite_y_max_ok_29
  BEQ sprite_y_max_ok_29
  LDA #$D2
  STA $C502
sprite_y_max_ok_29:
sprite_update_inactive_0_25:
  JSR runtime_sprite_sync_0
  JMP game_frame_loop
; Shared VIC-II synchronization for sprite 0
runtime_sprite_sync_0:
  LDA $C505
  BNE sprite_runtime_active_0_30
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_33
sprite_runtime_active_0_30:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_31
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_32
sprite_runtime_xhigh_0_31:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_32:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_33:
  RTS
; String pool
str_screen_0:
  .byte $16, $30, $2E, $38, $20, $07, $01, $0D, $05, $10, $0C, $01, $19, $20, $13, $10, $12, $09, $14, $05, $00
str_screen_1:
  .byte $0D, $0F, $16, $05, $3A, $20, $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $10, $0F, $12, $14, $20, $32, $00
str_screen_2:
  .byte $06, $09, $12, $05, $3A, $20, $02, $0F, $12, $04, $05, $12, $20, $2F, $20, $13, $10, $01, $03, $05, $3A, $20, $10, $01, $15, $13, $05, $00
; User data
sprite_data_0_0:
  .byte $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sid_song_irq_3_v1_action:
  .byte $02, $02, $02, $02
sid_song_irq_3_v1_lo:
  .byte $67, $ED, $13, $ED
sid_song_irq_3_v1_hi:
  .byte $11, $15, $1A, $15
sid_song_irq_3_v2_action:
  .byte $02, $00, $02, $00
sid_song_irq_3_v2_lo:
  .byte $B4, $00, $85, $00
sid_song_irq_3_v2_hi:
  .byte $08, $00, $06, $00
sid_song_irq_3_v3_action:
  .byte $00, $02, $00, $02
sid_song_irq_3_v3_lo:
  .byte $00, $CE, $00, $13
sid_song_irq_3_v3_hi:
  .byte $00, $22, $00, $1A
