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
  STA $C102
  LDA #$00
  STA $C103
  LDA #$E6
  STA $C104
  LDA #$00
  STA $C105
  LDA #$00
  STA $C106
  LDA #$01
  STA $C107
  JSR runtime_sprite_sync_0
  LDX #$00
copydata_2000_sprite_data_0_0_63_2:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_2
  LDA #$80
  STA $07F8
  LDA #$07
  STA $D027
  LDA #$A0
  STA $C108
  LDA #$00
  STA $C109
  LDA #$96
  STA $C10A
  LDA #$02
  STA $C10B
  LDA #$FE
  STA $C10C
  LDA #$01
  STA $C10D
  JSR runtime_sprite_sync_1
  LDA #$C0
  STA $07F9
  LDA #$01
  STA $D028
  LDA #$00
  STA $C408
  LDA #$00
  STA $C409
  LDA #$00
  STA $C40A
  LDA #$01
  STA $C40B
  LDA sprite_sequence_1_spin
  STA $07F9
  LDA #$2D
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$55
  STA $C110
  LDA #$00
  STA $C111
  LDA #$00
  STA $C112
  LDA #$01
  STA $C113
  JSR runtime_sprite_sync_2
  LDX #$00
copydata_2080_sprite_data_2_1_63_3:
  LDA sprite_data_2_1,X
  STA $2080,X
  INX
  CPX #$3F
  BNE copydata_2080_sprite_data_2_1_63_3
  LDA #$82
  STA $07FA
  LDA #$02
  STA $D029
  LDA #$69
  STA $C114
  LDA #$00
  STA $C115
  LDA #$55
  STA $C116
  LDA #$00
  STA $C117
  LDA #$00
  STA $C118
  LDA #$01
  STA $C119
  JSR runtime_sprite_sync_3
  LDA #$82
  STA $07FB
  LDA #$08
  STA $D02A
  LDA #$A5
  STA $C11A
  LDA #$00
  STA $C11B
  LDA #$55
  STA $C11C
  LDA #$00
  STA $C11D
  LDA #$00
  STA $C11E
  LDA #$01
  STA $C11F
  JSR runtime_sprite_sync_4
  LDA #$82
  STA $07FC
  LDA #$05
  STA $D02B
  LDA #$E1
  STA $C120
  LDA #$00
  STA $C121
  LDA #$55
  STA $C122
  LDA #$00
  STA $C123
  LDA #$00
  STA $C124
  LDA #$01
  STA $C125
  JSR runtime_sprite_sync_5
  LDA #$82
  STA $07FD
  LDA #$03
  STA $D02C
  LDA #$1D
  STA $C126
  LDA #$01
  STA $C127
  LDA #$55
  STA $C128
  LDA #$00
  STA $C129
  LDA #$00
  STA $C12A
  LDA #$01
  STA $C12B
  JSR runtime_sprite_sync_6
  LDA #$82
  STA $07FE
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
printat_loop_4:
  LDA str_screen_0,X
  BEQ printat_done_5
  STA $0400,X
  LDA #$01
  STA $D800,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDX #$00
printat_loop_6:
  LDA str_screen_1,X
  BEQ printat_done_7
  STA $0428,X
  LDA #$01
  STA $D828,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDA #$0C
  STA $D418
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
  LDA #$3C
  STA $C76F
  LDA #$FF
  STA $C767
  LDA #$FF
  STA $C769
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
  BNE game_frame_counter_done_8
  INC $C76B
game_frame_counter_done_8:
  LDA #$00
  STA $C105
  LDA #$00
  STA $C106
  LDA $C767
  AND #$04
  BEQ condition_pass_10
  JMP control_if_else_9
condition_pass_10:
  LDA #$FC
  STA $C105
  LDA #$00
  STA $C106
  JMP control_if_end_9
control_if_else_9:
control_if_end_9:
  LDA $C767
  AND #$08
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA #$04
  STA $C105
  LDA #$00
  STA $C106
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C107
  BNE sprite_update_active_0_14
  JMP sprite_update_inactive_0_13
sprite_update_active_0_14:
  CLC
  LDA $C102
  ADC $C105
  STA $C102
  LDA $C105
  BPL sprite_vx_positive_15
  LDA $C103
  ADC #$FF
  JMP sprite_vx_done_15
sprite_vx_positive_15:
  LDA $C103
  ADC #$00
sprite_vx_done_15:
  STA $C103
  LDA $C106
  BPL sprite_vy_positive_16
  CLC
  LDA $C104
  ADC $C106
  BCC sprite_vy_clamp_min_16
  JMP sprite_vy_store_16
sprite_vy_positive_16:
  CLC
  LDA $C104
  ADC $C106
  BCS sprite_vy_clamp_max_16
sprite_vy_store_16:
  STA $C104
  JMP sprite_vy_done_16
sprite_vy_clamp_min_16:
  LDA #$E6
  STA $C104
  JMP sprite_vy_done_16
sprite_vy_clamp_max_16:
  LDA #$E6
  STA $C104
sprite_vy_done_16:
  LDA $C103
  BMI sprite_x_clamp_min_17
  CMP #$00
  BCC sprite_x_clamp_min_17
  BNE sprite_x_min_ok_17
  LDA $C102
  CMP #$18
  BCS sprite_x_min_ok_17
sprite_x_clamp_min_17:
  LDA #$18
  STA $C102
  LDA #$00
  STA $C103
sprite_x_min_ok_17:
  LDA $C103
  CMP #$01
  BCC sprite_x_max_ok_17
  BNE sprite_x_clamp_max_17
  LDA $C102
  CMP #$40
  BCC sprite_x_max_ok_17
  BEQ sprite_x_max_ok_17
sprite_x_clamp_max_17:
  LDA #$40
  STA $C102
  LDA #$01
  STA $C103
sprite_x_max_ok_17:
  LDA $C104
  CMP #$E6
  BCS sprite_y_min_ok_17
  LDA #$E6
  STA $C104
sprite_y_min_ok_17:
  LDA $C104
  CMP #$E6
  BCC sprite_y_max_ok_17
  BEQ sprite_y_max_ok_17
  LDA #$E6
  STA $C104
sprite_y_max_ok_17:
sprite_update_inactive_0_13:
  JSR runtime_sprite_sync_0
  LDA $C10D
  BNE sprite_update_active_1_19
  JMP sprite_update_inactive_1_18
sprite_update_active_1_19:
  CLC
  LDA $C108
  ADC $C10B
  STA $C108
  LDA $C10B
  BPL sprite_vx_positive_20
  LDA $C109
  ADC #$FF
  JMP sprite_vx_done_20
sprite_vx_positive_20:
  LDA $C109
  ADC #$00
sprite_vx_done_20:
  STA $C109
  LDA $C10C
  BPL sprite_vy_positive_21
  CLC
  LDA $C10A
  ADC $C10C
  BCC sprite_vy_clamp_min_21
  JMP sprite_vy_store_21
sprite_vy_positive_21:
  CLC
  LDA $C10A
  ADC $C10C
  BCS sprite_vy_clamp_max_21
sprite_vy_store_21:
  STA $C10A
  JMP sprite_vy_done_21
sprite_vy_clamp_min_21:
  LDA #$37
  STA $C10A
  JMP sprite_vy_done_21
sprite_vy_clamp_max_21:
  LDA #$FA
  STA $C10A
sprite_vy_done_21:
  LDA $C109
  BMI sprite_x_clamp_min_22
  CMP #$00
  BCC sprite_x_clamp_min_22
  BNE sprite_x_min_ok_22
  LDA $C108
  CMP #$18
  BCS sprite_x_min_ok_22
sprite_x_clamp_min_22:
  LDA #$18
  STA $C108
  LDA #$00
  STA $C109
  LDA #$00
  SEC
  SBC $C10B
  STA $C10B
sprite_x_min_ok_22:
  LDA $C109
  CMP #$01
  BCC sprite_x_max_ok_22
  BNE sprite_x_clamp_max_22
  LDA $C108
  CMP #$50
  BCC sprite_x_max_ok_22
  BEQ sprite_x_max_ok_22
sprite_x_clamp_max_22:
  LDA #$50
  STA $C108
  LDA #$01
  STA $C109
  LDA #$00
  SEC
  SBC $C10B
  STA $C10B
sprite_x_max_ok_22:
  LDA $C10A
  CMP #$37
  BCS sprite_y_min_ok_22
  LDA #$37
  STA $C10A
sprite_y_min_ok_22:
  LDA $C10A
  CMP #$FA
  BCC sprite_y_max_ok_22
  BEQ sprite_y_max_ok_22
  LDA #$FA
  STA $C10A
sprite_y_max_ok_22:
sprite_update_inactive_1_18:
  LDA $C40B
  BNE sprite_anim_active_1_24
  JMP sprite_anim_done_1_23
sprite_anim_active_1_24:
  LDA $C408
  CMP #$00
  BNE sprite_anim_next_seq_1_0_25
  INC $C40A
  LDA $C40A
  CMP #$04
  BCS sprite_anim_advance_1_0_26
  JMP sprite_anim_done_1_23
sprite_anim_advance_1_0_26:
  LDA #$00
  STA $C40A
  INC $C409
  LDA $C409
  CMP #$02
  BCC sprite_anim_pos_ok_1_0_27
  LDA #$00
  STA $C409
sprite_anim_pos_ok_1_0_27:
  LDX $C409
  LDA sprite_sequence_1_spin,X
  STA $07F9
  JMP sprite_anim_done_1_23
sprite_anim_next_seq_1_0_25:
sprite_anim_done_1_23:
  JSR runtime_sprite_sync_1
  LDA $C10A
  CMP #$37
  BCC condition_pass_29
  BEQ condition_pass_29
  JMP control_if_else_28
condition_pass_29:
  LDA #$02
  STA $C10C
  JMP control_if_end_28
control_if_else_28:
control_if_end_28:
  LDA $C10D
  BNE aabb_a_active_32
  JMP control_if_else_30
aabb_a_active_32:
  LDA $C107
  BNE aabb_b_active_33
  JMP control_if_else_30
aabb_b_active_33:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C102
  ADC #$00
  STA $C7A4
  LDA $C103
  ADC #$00
  STA $C7A5
  CLC
  LDA $C102
  ADC #$18
  STA $C7A6
  LDA $C103
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C104
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C104
  ADC #$05
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_34
  JMP control_if_else_30
sprite_aabb_pass_34:
  LDA #$FE
  STA $C10C
  JMP control_if_end_30
control_if_else_30:
control_if_end_30:
  LDA $C10A
  CMP #$FA
  BCS condition_pass_36
  JMP control_if_else_35
condition_pass_36:
  LDA #$A0
  STA $C108
  LDA #$00
  STA $C109
  LDA #$96
  STA $C10A
  JSR runtime_sprite_sync_1
  LDA #$02
  STA $C10B
  LDA #$FE
  STA $C10C
  JMP control_if_end_35
control_if_else_35:
control_if_end_35:
  LDA $C10D
  BNE aabb_a_active_39
  JMP control_if_else_37
aabb_a_active_39:
  LDA $C113
  BNE aabb_b_active_40
  JMP control_if_else_37
aabb_b_active_40:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C10E
  ADC #$00
  STA $C7A4
  LDA $C10F
  ADC #$00
  STA $C7A5
  CLC
  LDA $C10E
  ADC #$18
  STA $C7A6
  LDA $C10F
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C110
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C110
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_41
  JMP control_if_else_37
sprite_aabb_pass_41:
  LDA #$00
  STA $C113
  JSR runtime_sprite_sync_2
  LDA #$00
  SEC
  SBC $C10C
  STA $C10C
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
  JMP control_if_end_37
control_if_else_37:
control_if_end_37:
  LDA $C10D
  BNE aabb_a_active_44
  JMP control_if_else_42
aabb_a_active_44:
  LDA $C119
  BNE aabb_b_active_45
  JMP control_if_else_42
aabb_b_active_45:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C114
  ADC #$00
  STA $C7A4
  LDA $C115
  ADC #$00
  STA $C7A5
  CLC
  LDA $C114
  ADC #$18
  STA $C7A6
  LDA $C115
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C116
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C116
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_46
  JMP control_if_else_42
sprite_aabb_pass_46:
  LDA #$00
  STA $C119
  JSR runtime_sprite_sync_3
  LDA #$00
  SEC
  SBC $C10C
  STA $C10C
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
  JMP control_if_end_42
control_if_else_42:
control_if_end_42:
  LDA $C10D
  BNE aabb_a_active_49
  JMP control_if_else_47
aabb_a_active_49:
  LDA $C11F
  BNE aabb_b_active_50
  JMP control_if_else_47
aabb_b_active_50:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C11A
  ADC #$00
  STA $C7A4
  LDA $C11B
  ADC #$00
  STA $C7A5
  CLC
  LDA $C11A
  ADC #$18
  STA $C7A6
  LDA $C11B
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C11C
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C11C
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_51
  JMP control_if_else_47
sprite_aabb_pass_51:
  LDA #$00
  STA $C11F
  JSR runtime_sprite_sync_4
  LDA #$00
  SEC
  SBC $C10C
  STA $C10C
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
  JMP control_if_end_47
control_if_else_47:
control_if_end_47:
  LDA $C10D
  BNE aabb_a_active_54
  JMP control_if_else_52
aabb_a_active_54:
  LDA $C125
  BNE aabb_b_active_55
  JMP control_if_else_52
aabb_b_active_55:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C120
  ADC #$00
  STA $C7A4
  LDA $C121
  ADC #$00
  STA $C7A5
  CLC
  LDA $C120
  ADC #$18
  STA $C7A6
  LDA $C121
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C122
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C122
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_56
  JMP control_if_else_52
sprite_aabb_pass_56:
  LDA #$00
  STA $C125
  JSR runtime_sprite_sync_5
  LDA #$00
  SEC
  SBC $C10C
  STA $C10C
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
  JMP control_if_end_52
control_if_else_52:
control_if_end_52:
  LDA $C10D
  BNE aabb_a_active_59
  JMP control_if_else_57
aabb_a_active_59:
  LDA $C12B
  BNE aabb_b_active_60
  JMP control_if_else_57
aabb_b_active_60:
  CLC
  LDA $C108
  ADC #$00
  STA $C7A0
  LDA $C109
  ADC #$00
  STA $C7A1
  CLC
  LDA $C108
  ADC #$08
  STA $C7A2
  LDA $C109
  ADC #$00
  STA $C7A3
  CLC
  LDA $C126
  ADC #$00
  STA $C7A4
  LDA $C127
  ADC #$00
  STA $C7A5
  CLC
  LDA $C126
  ADC #$18
  STA $C7A6
  LDA $C127
  ADC #$00
  STA $C7A7
  CLC
  LDA $C10A
  ADC #$00
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C10A
  ADC #$08
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C128
  ADC #$00
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C128
  ADC #$07
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_61
  JMP control_if_else_57
sprite_aabb_pass_61:
  LDA #$00
  STA $C12B
  JSR runtime_sprite_sync_6
  LDA #$00
  SEC
  SBC $C10C
  STA $C10C
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
  JMP control_if_end_57
control_if_else_57:
control_if_end_57:
  LDA $C100
  CMP #$00
  BEQ condition_pass_63
  JMP control_if_else_62
condition_pass_63:
  LDA #$05
  STA $D020
  JMP control_if_end_62
control_if_else_62:
control_if_end_62:
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
  LDA $C107
  BNE sprite_runtime_active_0_64
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_67
sprite_runtime_active_0_64:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C102
  STA $D000
  LDA $C103
  AND #$01
  BNE sprite_runtime_xhigh_0_65
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_66
sprite_runtime_xhigh_0_65:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_66:
  LDA $C104
  STA $D001
sprite_runtime_sync_done_0_67:
  RTS
; Shared VIC-II synchronization for sprite 1
runtime_sprite_sync_1:
  LDA $C10D
  BNE sprite_runtime_active_1_68
  LDA $D015
  AND #$FD
  STA $D015
  JMP sprite_runtime_sync_done_1_71
sprite_runtime_active_1_68:
  LDA $D015
  ORA #$02
  STA $D015
  LDA $C108
  STA $D002
  LDA $C109
  AND #$01
  BNE sprite_runtime_xhigh_1_69
  LDA $D010
  AND #$FD
  STA $D010
  JMP sprite_runtime_xdone_1_70
sprite_runtime_xhigh_1_69:
  LDA $D010
  ORA #$02
  STA $D010
sprite_runtime_xdone_1_70:
  LDA $C10A
  STA $D003
sprite_runtime_sync_done_1_71:
  RTS
; Shared VIC-II synchronization for sprite 2
runtime_sprite_sync_2:
  LDA $C113
  BNE sprite_runtime_active_2_72
  LDA $D015
  AND #$FB
  STA $D015
  JMP sprite_runtime_sync_done_2_75
sprite_runtime_active_2_72:
  LDA $D015
  ORA #$04
  STA $D015
  LDA $C10E
  STA $D004
  LDA $C10F
  AND #$01
  BNE sprite_runtime_xhigh_2_73
  LDA $D010
  AND #$FB
  STA $D010
  JMP sprite_runtime_xdone_2_74
sprite_runtime_xhigh_2_73:
  LDA $D010
  ORA #$04
  STA $D010
sprite_runtime_xdone_2_74:
  LDA $C110
  STA $D005
sprite_runtime_sync_done_2_75:
  RTS
; Shared VIC-II synchronization for sprite 3
runtime_sprite_sync_3:
  LDA $C119
  BNE sprite_runtime_active_3_76
  LDA $D015
  AND #$F7
  STA $D015
  JMP sprite_runtime_sync_done_3_79
sprite_runtime_active_3_76:
  LDA $D015
  ORA #$08
  STA $D015
  LDA $C114
  STA $D006
  LDA $C115
  AND #$01
  BNE sprite_runtime_xhigh_3_77
  LDA $D010
  AND #$F7
  STA $D010
  JMP sprite_runtime_xdone_3_78
sprite_runtime_xhigh_3_77:
  LDA $D010
  ORA #$08
  STA $D010
sprite_runtime_xdone_3_78:
  LDA $C116
  STA $D007
sprite_runtime_sync_done_3_79:
  RTS
; Shared VIC-II synchronization for sprite 4
runtime_sprite_sync_4:
  LDA $C11F
  BNE sprite_runtime_active_4_80
  LDA $D015
  AND #$EF
  STA $D015
  JMP sprite_runtime_sync_done_4_83
sprite_runtime_active_4_80:
  LDA $D015
  ORA #$10
  STA $D015
  LDA $C11A
  STA $D008
  LDA $C11B
  AND #$01
  BNE sprite_runtime_xhigh_4_81
  LDA $D010
  AND #$EF
  STA $D010
  JMP sprite_runtime_xdone_4_82
sprite_runtime_xhigh_4_81:
  LDA $D010
  ORA #$10
  STA $D010
sprite_runtime_xdone_4_82:
  LDA $C11C
  STA $D009
sprite_runtime_sync_done_4_83:
  RTS
; Shared VIC-II synchronization for sprite 5
runtime_sprite_sync_5:
  LDA $C125
  BNE sprite_runtime_active_5_84
  LDA $D015
  AND #$DF
  STA $D015
  JMP sprite_runtime_sync_done_5_87
sprite_runtime_active_5_84:
  LDA $D015
  ORA #$20
  STA $D015
  LDA $C120
  STA $D00A
  LDA $C121
  AND #$01
  BNE sprite_runtime_xhigh_5_85
  LDA $D010
  AND #$DF
  STA $D010
  JMP sprite_runtime_xdone_5_86
sprite_runtime_xhigh_5_85:
  LDA $D010
  ORA #$20
  STA $D010
sprite_runtime_xdone_5_86:
  LDA $C122
  STA $D00B
sprite_runtime_sync_done_5_87:
  RTS
; Shared VIC-II synchronization for sprite 6
runtime_sprite_sync_6:
  LDA $C12B
  BNE sprite_runtime_active_6_88
  LDA $D015
  AND #$BF
  STA $D015
  JMP sprite_runtime_sync_done_6_91
sprite_runtime_active_6_88:
  LDA $D015
  ORA #$40
  STA $D015
  LDA $C126
  STA $D00C
  LDA $C127
  AND #$01
  BNE sprite_runtime_xhigh_6_89
  LDA $D010
  AND #$BF
  STA $D010
  JMP sprite_runtime_xdone_6_90
sprite_runtime_xhigh_6_89:
  LDA $D010
  ORA #$40
  STA $D010
sprite_runtime_xdone_6_90:
  LDA $C128
  STA $D00D
sprite_runtime_sync_done_6_91:
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
