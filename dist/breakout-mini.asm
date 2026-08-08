  LDX #$00
copydata_3000_sprite_frames_breakout_ball_0_63_0:
  LDA sprite_frames_breakout_ball_0,X
  STA $3000,X
  INX
  CPX #$3F
  BNE copydata_3000_sprite_frames_breakout_ball_0_63_0
  LDA #$00
  STA $303F
  LDX #$00
copydata_3040_sprite_frames_breakout_ball_1_63_1:
  LDA sprite_frames_breakout_ball_1,X
  STA $3040,X
  INX
  CPX #$3F
  BNE copydata_3040_sprite_frames_breakout_ball_1_63_1
  LDA #$00
  STA $307F
  LDA #$05
  STA $C100
  LDA #$35
  STA $C101
  LDA #$A0
  STA $C500
  LDA #$00
  STA $C501
  LDA #$E6
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  JSR runtime_sprite_sync_0
  LDX #$00
copydata_2000_sprite_data_0_0_63_2:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_2
  LDA #$80
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$07
  STA $C405
  LDA #$07
  STA $D027
  LDA #$A0
  STA $C508
  LDA #$00
  STA $C509
  LDA #$96
  STA $C50A
  LDA #$02
  STA $C50B
  LDA #$FE
  STA $C50C
  LDA #$01
  STA $C50D
  JSR runtime_sprite_sync_1
  LDA #$C0
  STA $C40C
  LDA $C40C
  STA $07F9
  LDA #$01
  STA $C40D
  LDA #$01
  STA $D028
  LDA #$00
  STA $C408
  STA $C409
  STA $C40A
  STA $C40B
  LDA $C408
  CMP #$00
  BNE sprite_play_start_1_0_3
  LDA $C40B
  BNE sprite_play_done_1_0_4
sprite_play_start_1_0_3:
  LDA #$00
  STA $C408
  LDA #$00
  STA $C409
  LDA #$00
  STA $C40A
  LDA #$01
  STA $C40B
  LDA sprite_sequence_1_spin
  STA $C40C
  LDA $C40C
  STA $07F9
sprite_play_done_1_0_4:
  LDA #$2D
  STA $C510
  LDA #$00
  STA $C511
  LDA #$55
  STA $C512
  LDA #$00
  STA $C513
  LDA #$00
  STA $C514
  LDA #$01
  STA $C515
  JSR runtime_sprite_sync_2
  LDX #$00
copydata_2080_sprite_data_2_1_63_5:
  LDA sprite_data_2_1,X
  STA $2080,X
  INX
  CPX #$3F
  BNE copydata_2080_sprite_data_2_1_63_5
  LDA #$82
  STA $C414
  LDA $C414
  STA $07FA
  LDA #$02
  STA $C415
  LDA #$02
  STA $D029
  LDA #$69
  STA $C518
  LDA #$00
  STA $C519
  LDA #$55
  STA $C51A
  LDA #$00
  STA $C51B
  LDA #$00
  STA $C51C
  LDA #$01
  STA $C51D
  JSR runtime_sprite_sync_3
  LDA #$82
  STA $C41C
  LDA $C41C
  STA $07FB
  LDA #$08
  STA $C41D
  LDA #$08
  STA $D02A
  LDA #$A5
  STA $C520
  LDA #$00
  STA $C521
  LDA #$55
  STA $C522
  LDA #$00
  STA $C523
  LDA #$00
  STA $C524
  LDA #$01
  STA $C525
  JSR runtime_sprite_sync_4
  LDA #$82
  STA $C424
  LDA $C424
  STA $07FC
  LDA #$05
  STA $C425
  LDA #$05
  STA $D02B
  LDA #$E1
  STA $C528
  LDA #$00
  STA $C529
  LDA #$55
  STA $C52A
  LDA #$00
  STA $C52B
  LDA #$00
  STA $C52C
  LDA #$01
  STA $C52D
  JSR runtime_sprite_sync_5
  LDA #$82
  STA $C42C
  LDA $C42C
  STA $07FD
  LDA #$03
  STA $C42D
  LDA #$03
  STA $D02C
  LDA #$1D
  STA $C530
  LDA #$01
  STA $C531
  LDA #$55
  STA $C532
  LDA #$00
  STA $C533
  LDA #$00
  STA $C534
  LDA #$01
  STA $C535
  JSR runtime_sprite_sync_6
  LDA #$82
  STA $C434
  LDA $C434
  STA $07FE
  LDA #$04
  STA $C435
  LDA #$04
  STA $D02D
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_6:
  LDA str_screen_0,X
  BEQ printat_done_7
  STA $0400,X
  LDA #$01
  STA $D800,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDX #$00
printat_loop_8:
  LDA str_screen_1,X
  BEQ printat_done_9
  STA $0428,X
  LDA #$01
  STA $D828,X
  INX
  BNE printat_loop_8
printat_done_9:
  LDA #$0C
  STA $D418
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
  INC $C76A
  BNE game_frame_counter_done_10
  INC $C76B
game_frame_counter_done_10:
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA $C767
  AND #$04
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA #$FC
  STA $C503
  LDA #$00
  STA $C504
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C767
  AND #$08
  BEQ condition_pass_14
  JMP control_if_else_13
condition_pass_14:
  LDA #$04
  STA $C503
  LDA #$00
  STA $C504
  JMP control_if_end_13
control_if_else_13:
control_if_end_13:
  LDA $C505
  BNE sprite_update_active_0_16
  JMP sprite_update_inactive_0_15
sprite_update_active_0_16:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_17
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_17
sprite_vx_positive_17:
  LDA $C501
  ADC #$00
sprite_vx_done_17:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_18
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_18
  JMP sprite_vy_store_18
sprite_vy_positive_18:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_18
sprite_vy_store_18:
  STA $C502
  JMP sprite_vy_done_18
sprite_vy_clamp_min_18:
  LDA #$E6
  STA $C502
  JMP sprite_vy_done_18
sprite_vy_clamp_max_18:
  LDA #$E6
  STA $C502
sprite_vy_done_18:
  LDA $C501
  BMI sprite_x_clamp_min_19
  CMP #$00
  BCC sprite_x_clamp_min_19
  BNE sprite_x_min_ok_19
  LDA $C500
  CMP #$18
  BCS sprite_x_min_ok_19
sprite_x_clamp_min_19:
  LDA #$18
  STA $C500
  LDA #$00
  STA $C501
sprite_x_min_ok_19:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_19
  BNE sprite_x_clamp_max_19
  LDA $C500
  CMP #$40
  BCC sprite_x_max_ok_19
  BEQ sprite_x_max_ok_19
sprite_x_clamp_max_19:
  LDA #$40
  STA $C500
  LDA #$01
  STA $C501
sprite_x_max_ok_19:
  LDA $C502
  CMP #$E6
  BCS sprite_y_min_ok_19
  LDA #$E6
  STA $C502
sprite_y_min_ok_19:
  LDA $C502
  CMP #$E6
  BCC sprite_y_max_ok_19
  BEQ sprite_y_max_ok_19
  LDA #$E6
  STA $C502
sprite_y_max_ok_19:
sprite_update_inactive_0_15:
  JSR runtime_sprite_sync_0
  LDA $C50D
  BNE sprite_update_active_1_21
  JMP sprite_update_inactive_1_20
sprite_update_active_1_21:
  CLC
  LDA $C508
  ADC $C50B
  STA $C508
  LDA $C50B
  BPL sprite_vx_positive_22
  LDA $C509
  ADC #$FF
  JMP sprite_vx_done_22
sprite_vx_positive_22:
  LDA $C509
  ADC #$00
sprite_vx_done_22:
  STA $C509
  LDA $C50C
  BPL sprite_vy_positive_23
  CLC
  LDA $C50A
  ADC $C50C
  BCC sprite_vy_clamp_min_23
  JMP sprite_vy_store_23
sprite_vy_positive_23:
  CLC
  LDA $C50A
  ADC $C50C
  BCS sprite_vy_clamp_max_23
sprite_vy_store_23:
  STA $C50A
  JMP sprite_vy_done_23
sprite_vy_clamp_min_23:
  LDA #$37
  STA $C50A
  JMP sprite_vy_done_23
sprite_vy_clamp_max_23:
  LDA #$FA
  STA $C50A
sprite_vy_done_23:
  LDA $C509
  BMI sprite_x_clamp_min_24
  CMP #$00
  BCC sprite_x_clamp_min_24
  BNE sprite_x_min_ok_24
  LDA $C508
  CMP #$18
  BCS sprite_x_min_ok_24
sprite_x_clamp_min_24:
  LDA #$18
  STA $C508
  LDA #$00
  STA $C509
  LDA #$00
  SEC
  SBC $C50B
  STA $C50B
sprite_x_min_ok_24:
  LDA $C509
  CMP #$01
  BCC sprite_x_max_ok_24
  BNE sprite_x_clamp_max_24
  LDA $C508
  CMP #$50
  BCC sprite_x_max_ok_24
  BEQ sprite_x_max_ok_24
sprite_x_clamp_max_24:
  LDA #$50
  STA $C508
  LDA #$01
  STA $C509
  LDA #$00
  SEC
  SBC $C50B
  STA $C50B
sprite_x_max_ok_24:
  LDA $C50A
  CMP #$37
  BCS sprite_y_min_ok_24
  LDA #$37
  STA $C50A
sprite_y_min_ok_24:
  LDA $C50A
  CMP #$FA
  BCC sprite_y_max_ok_24
  BEQ sprite_y_max_ok_24
  LDA #$FA
  STA $C50A
sprite_y_max_ok_24:
sprite_update_inactive_1_20:
  LDA $C40B
  BNE sprite_anim_active_1_26
  JMP sprite_anim_done_1_25
sprite_anim_active_1_26:
  LDA $C408
  CMP #$00
  BNE sprite_anim_next_seq_1_0_27
  INC $C40A
  LDA $C40A
  CMP #$04
  BCS sprite_anim_advance_1_0_28
  JMP sprite_anim_done_1_25
sprite_anim_advance_1_0_28:
  LDA #$00
  STA $C40A
  INC $C409
  LDA $C409
  CMP #$02
  BCC sprite_anim_pos_ok_1_0_29
  LDA #$00
  STA $C409
sprite_anim_pos_ok_1_0_29:
  LDX $C409
  LDA sprite_sequence_1_spin,X
  STA $C40C
  LDA $C40C
  STA $07F9
  JMP sprite_anim_done_1_25
sprite_anim_next_seq_1_0_27:
sprite_anim_done_1_25:
  JSR runtime_sprite_sync_1
  LDA $C50A
  CMP #$37
  BCC condition_pass_31
  BEQ condition_pass_31
  JMP control_if_else_30
condition_pass_31:
  LDA #$02
  STA $C50C
  JMP control_if_end_30
control_if_else_30:
control_if_end_30:
  LDA $C50D
  BNE aabb_a_active_34
  JMP control_if_else_32
aabb_a_active_34:
  LDA $C505
  BNE aabb_b_active_35
  JMP control_if_else_32
aabb_b_active_35:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C500
  ADC #$00
  STA $C7A4
  LDA $C501
  ADC #$00
  STA $C7A5
  CLC
  LDA $C500
  ADC #$18
  STA $C7A6
  LDA $C501
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C502
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C502
  ADC #$05
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_36
  JMP control_if_else_32
sprite_aabb_pass_36:
  LDA #$FE
  STA $C50C
  JMP control_if_end_32
control_if_else_32:
control_if_end_32:
  LDA $C50A
  CMP #$FA
  BCS condition_pass_38
  JMP control_if_else_37
condition_pass_38:
  LDA #$A0
  STA $C508
  LDA #$00
  STA $C509
  LDA #$96
  STA $C50A
  JSR runtime_sprite_sync_1
  LDA #$02
  STA $C50B
  LDA #$FE
  STA $C50C
  JMP control_if_end_37
control_if_else_37:
control_if_end_37:
  LDA $C50D
  BNE aabb_a_active_41
  JMP control_if_else_39
aabb_a_active_41:
  LDA $C515
  BNE aabb_b_active_42
  JMP control_if_else_39
aabb_b_active_42:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C510
  ADC #$00
  STA $C7A4
  LDA $C511
  ADC #$00
  STA $C7A5
  CLC
  LDA $C510
  ADC #$18
  STA $C7A6
  LDA $C511
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C512
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C512
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_43
  JMP control_if_else_39
sprite_aabb_pass_43:
  LDA #$00
  STA $C515
  JSR runtime_sprite_sync_2
  LDA #$00
  SEC
  SBC $C50C
  STA $C50C
  DEC $C100
  LDA $C100
  STA $C101
  LDA $C101
  CLC
  ADC #$30
  STA $C101
  LDA $C101
  STA $0430
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_39
control_if_else_39:
control_if_end_39:
  LDA $C50D
  BNE aabb_a_active_46
  JMP control_if_else_44
aabb_a_active_46:
  LDA $C51D
  BNE aabb_b_active_47
  JMP control_if_else_44
aabb_b_active_47:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C518
  ADC #$00
  STA $C7A4
  LDA $C519
  ADC #$00
  STA $C7A5
  CLC
  LDA $C518
  ADC #$18
  STA $C7A6
  LDA $C519
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C51A
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C51A
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_48
  JMP control_if_else_44
sprite_aabb_pass_48:
  LDA #$00
  STA $C51D
  JSR runtime_sprite_sync_3
  LDA #$00
  SEC
  SBC $C50C
  STA $C50C
  DEC $C100
  LDA $C100
  STA $C101
  LDA $C101
  CLC
  ADC #$30
  STA $C101
  LDA $C101
  STA $0430
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_44
control_if_else_44:
control_if_end_44:
  LDA $C50D
  BNE aabb_a_active_51
  JMP control_if_else_49
aabb_a_active_51:
  LDA $C525
  BNE aabb_b_active_52
  JMP control_if_else_49
aabb_b_active_52:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C520
  ADC #$00
  STA $C7A4
  LDA $C521
  ADC #$00
  STA $C7A5
  CLC
  LDA $C520
  ADC #$18
  STA $C7A6
  LDA $C521
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C522
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C522
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_53
  JMP control_if_else_49
sprite_aabb_pass_53:
  LDA #$00
  STA $C525
  JSR runtime_sprite_sync_4
  LDA #$00
  SEC
  SBC $C50C
  STA $C50C
  DEC $C100
  LDA $C100
  STA $C101
  LDA $C101
  CLC
  ADC #$30
  STA $C101
  LDA $C101
  STA $0430
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_49
control_if_else_49:
control_if_end_49:
  LDA $C50D
  BNE aabb_a_active_56
  JMP control_if_else_54
aabb_a_active_56:
  LDA $C52D
  BNE aabb_b_active_57
  JMP control_if_else_54
aabb_b_active_57:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C528
  ADC #$00
  STA $C7A4
  LDA $C529
  ADC #$00
  STA $C7A5
  CLC
  LDA $C528
  ADC #$18
  STA $C7A6
  LDA $C529
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C52A
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C52A
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_58
  JMP control_if_else_54
sprite_aabb_pass_58:
  LDA #$00
  STA $C52D
  JSR runtime_sprite_sync_5
  LDA #$00
  SEC
  SBC $C50C
  STA $C50C
  DEC $C100
  LDA $C100
  STA $C101
  LDA $C101
  CLC
  ADC #$30
  STA $C101
  LDA $C101
  STA $0430
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_54
control_if_else_54:
control_if_end_54:
  LDA $C50D
  BNE aabb_a_active_61
  JMP control_if_else_59
aabb_a_active_61:
  LDA $C535
  BNE aabb_b_active_62
  JMP control_if_else_59
aabb_b_active_62:
  CLC
  LDA $C508
  ADC #$00
  STA $C7A0
  LDA $C509
  ADC #$00
  STA $C7A1
  CLC
  LDA $C508
  ADC #$08
  STA $C7A2
  LDA $C509
  ADC #$00
  STA $C7A3
  CLC
  LDA $C530
  ADC #$00
  STA $C7A4
  LDA $C531
  ADC #$00
  STA $C7A5
  CLC
  LDA $C530
  ADC #$18
  STA $C7A6
  LDA $C531
  ADC #$00
  STA $C7A7
  CLC
  LDA $C50A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C50A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C532
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C532
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_63
  JMP control_if_else_59
sprite_aabb_pass_63:
  LDA #$00
  STA $C535
  JSR runtime_sprite_sync_6
  LDA #$00
  SEC
  SBC $C50C
  STA $C50C
  DEC $C100
  LDA $C100
  STA $C101
  LDA $C101
  CLC
  ADC #$30
  STA $C101
  LDA $C101
  STA $0430
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_59
control_if_else_59:
control_if_end_59:
  LDA $C100
  CMP #$00
  BEQ condition_pass_65
  JMP control_if_else_64
condition_pass_65:
  LDA #$05
  STA $D020
  JMP control_if_end_64
control_if_else_64:
control_if_end_64:
  JMP game_frame_loop
; Shared non-blocking SID click
runtime_sid_click:
  LDA #$00
  STA $D404
  LDA #$10
  STA $D404
  LDA #$00
  STA $D405
  LDA #$00
  STA $D406
  LDA #$39
  STA $D400
  LDA #$8B
  STA $D401
  LDA #$11
  STA $D404
  RTS
; Shared VIC-II synchronization for sprite 0
runtime_sprite_sync_0:
  LDA $C505
  BNE sprite_runtime_active_0_66
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_69
sprite_runtime_active_0_66:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_67
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_68
sprite_runtime_xhigh_0_67:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_68:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_69:
  RTS
; Shared VIC-II synchronization for sprite 1
runtime_sprite_sync_1:
  LDA $C50D
  BNE sprite_runtime_active_1_70
  LDA $D015
  AND #$FD
  STA $D015
  JMP sprite_runtime_sync_done_1_73
sprite_runtime_active_1_70:
  LDA $D015
  ORA #$02
  STA $D015
  LDA $C508
  STA $D002
  LDA $C509
  AND #$01
  BNE sprite_runtime_xhigh_1_71
  LDA $D010
  AND #$FD
  STA $D010
  JMP sprite_runtime_xdone_1_72
sprite_runtime_xhigh_1_71:
  LDA $D010
  ORA #$02
  STA $D010
sprite_runtime_xdone_1_72:
  LDA $C50A
  STA $D003
sprite_runtime_sync_done_1_73:
  RTS
; Shared VIC-II synchronization for sprite 2
runtime_sprite_sync_2:
  LDA $C515
  BNE sprite_runtime_active_2_74
  LDA $D015
  AND #$FB
  STA $D015
  JMP sprite_runtime_sync_done_2_77
sprite_runtime_active_2_74:
  LDA $D015
  ORA #$04
  STA $D015
  LDA $C510
  STA $D004
  LDA $C511
  AND #$01
  BNE sprite_runtime_xhigh_2_75
  LDA $D010
  AND #$FB
  STA $D010
  JMP sprite_runtime_xdone_2_76
sprite_runtime_xhigh_2_75:
  LDA $D010
  ORA #$04
  STA $D010
sprite_runtime_xdone_2_76:
  LDA $C512
  STA $D005
sprite_runtime_sync_done_2_77:
  RTS
; Shared VIC-II synchronization for sprite 3
runtime_sprite_sync_3:
  LDA $C51D
  BNE sprite_runtime_active_3_78
  LDA $D015
  AND #$F7
  STA $D015
  JMP sprite_runtime_sync_done_3_81
sprite_runtime_active_3_78:
  LDA $D015
  ORA #$08
  STA $D015
  LDA $C518
  STA $D006
  LDA $C519
  AND #$01
  BNE sprite_runtime_xhigh_3_79
  LDA $D010
  AND #$F7
  STA $D010
  JMP sprite_runtime_xdone_3_80
sprite_runtime_xhigh_3_79:
  LDA $D010
  ORA #$08
  STA $D010
sprite_runtime_xdone_3_80:
  LDA $C51A
  STA $D007
sprite_runtime_sync_done_3_81:
  RTS
; Shared VIC-II synchronization for sprite 4
runtime_sprite_sync_4:
  LDA $C525
  BNE sprite_runtime_active_4_82
  LDA $D015
  AND #$EF
  STA $D015
  JMP sprite_runtime_sync_done_4_85
sprite_runtime_active_4_82:
  LDA $D015
  ORA #$10
  STA $D015
  LDA $C520
  STA $D008
  LDA $C521
  AND #$01
  BNE sprite_runtime_xhigh_4_83
  LDA $D010
  AND #$EF
  STA $D010
  JMP sprite_runtime_xdone_4_84
sprite_runtime_xhigh_4_83:
  LDA $D010
  ORA #$10
  STA $D010
sprite_runtime_xdone_4_84:
  LDA $C522
  STA $D009
sprite_runtime_sync_done_4_85:
  RTS
; Shared VIC-II synchronization for sprite 5
runtime_sprite_sync_5:
  LDA $C52D
  BNE sprite_runtime_active_5_86
  LDA $D015
  AND #$DF
  STA $D015
  JMP sprite_runtime_sync_done_5_89
sprite_runtime_active_5_86:
  LDA $D015
  ORA #$20
  STA $D015
  LDA $C528
  STA $D00A
  LDA $C529
  AND #$01
  BNE sprite_runtime_xhigh_5_87
  LDA $D010
  AND #$DF
  STA $D010
  JMP sprite_runtime_xdone_5_88
sprite_runtime_xhigh_5_87:
  LDA $D010
  ORA #$20
  STA $D010
sprite_runtime_xdone_5_88:
  LDA $C52A
  STA $D00B
sprite_runtime_sync_done_5_89:
  RTS
; Shared VIC-II synchronization for sprite 6
runtime_sprite_sync_6:
  LDA $C535
  BNE sprite_runtime_active_6_90
  LDA $D015
  AND #$BF
  STA $D015
  JMP sprite_runtime_sync_done_6_93
sprite_runtime_active_6_90:
  LDA $D015
  ORA #$40
  STA $D015
  LDA $C530
  STA $D00C
  LDA $C531
  AND #$01
  BNE sprite_runtime_xhigh_6_91
  LDA $D010
  AND #$BF
  STA $D010
  JMP sprite_runtime_xdone_6_92
sprite_runtime_xhigh_6_91:
  LDA $D010
  ORA #$40
  STA $D010
sprite_runtime_xdone_6_92:
  LDA $C532
  STA $D00D
sprite_runtime_sync_done_6_93:
  RTS
; Shared strict AABB bounds comparison
runtime_sprite_aabb_compare:
  LDA $C7A3
  CMP $C7A5
  BEQ aabb_high_equal_runtime_0
  BCS aabb_greater_runtime_0
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_0:
  LDA $C7A2
  CMP $C7A4
  BNE aabb_low_not_equal_runtime_0
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_0:
  BCS aabb_greater_runtime_0
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_0:
  LDA $C7A7
  CMP $C7A1
  BEQ aabb_high_equal_runtime_1
  BCS aabb_greater_runtime_1
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_1:
  LDA $C7A6
  CMP $C7A0
  BNE aabb_low_not_equal_runtime_1
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_1:
  BCS aabb_greater_runtime_1
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_1:
  LDA $C7AB
  CMP $C7AD
  BEQ aabb_high_equal_runtime_2
  BCS aabb_greater_runtime_2
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_2:
  LDA $C7AA
  CMP $C7AC
  BNE aabb_low_not_equal_runtime_2
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_2:
  BCS aabb_greater_runtime_2
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_2:
  LDA $C7AF
  CMP $C7A9
  BEQ aabb_high_equal_runtime_3
  BCS aabb_greater_runtime_3
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_3:
  LDA $C7AE
  CMP $C7A8
  BNE aabb_low_not_equal_runtime_3
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_3:
  BCS aabb_greater_runtime_3
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_3:
  LDA #$01
  RTS
runtime_sprite_aabb_false:
  LDA #$00
  RTS
; String pool
str_screen_0:
  .byte $02, $12, $05, $01, $0B, $0F, $15, $14, $20, $0D, $09, $0E, $09, $20, $2D, $20, $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $32, $00
str_screen_1:
  .byte $02, $0C, $0F, $03, $0B, $13, $3A, $20, $35, $00
; User data
sprite_frames_breakout_ball_0:
  .byte $3C, $00, $00, $7E, $00, $00, $FF, $00, $00, $FF, $00, $00, $FF, $00, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_frames_breakout_ball_1:
  .byte $1E, $00, $00, $3F, $00, $00, $FF, $00, $00, $FF, $00, $00, $FF, $00, $00, $FF, $00, $00, $3F, $00, $00, $1E, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_data_0_0:
  .byte $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_sequence_1_spin:
  .byte $C0, $C1
sprite_data_2_1:
  .byte $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
