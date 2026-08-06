  LDX #$00
copydata_2e00_sprite_frames_hero_0_63_0:
  LDA sprite_frames_hero_0,X
  STA $2E00,X
  INX
  CPX #$3F
  BNE copydata_2e00_sprite_frames_hero_0_63_0
  LDA #$00
  STA $2E3F
  LDX #$00
copydata_2e40_sprite_frames_hero_1_63_1:
  LDA sprite_frames_hero_1,X
  STA $2E40,X
  INX
  CPX #$3F
  BNE copydata_2e40_sprite_frames_hero_1_63_1
  LDA #$00
  STA $2E7F
  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $8000,X
  INX
  BNE asset_map_initial_copy_2
  LDX #$00
asset_map_initial_copy_3:
  LDA asset_bytes_1,X
  STA $8100,X
  INX
  BNE asset_map_initial_copy_3
  LDX #$00
asset_map_initial_copy_4:
  LDA asset_bytes_1,X
  STA $8200,X
  INX
  BNE asset_map_initial_copy_4
  LDX #$00
asset_map_initial_copy_5:
  LDA asset_bytes_1,X
  STA $8300,X
  INX
  BNE asset_map_initial_copy_5
  LDX #$00
asset_map_initial_copy_7:
  LDA asset_bytes_6,X
  STA $8400,X
  INX
  BNE asset_map_initial_copy_7
  LDX #$00
asset_map_initial_copy_9:
  LDA asset_bytes_8,X
  STA $8500,X
  INX
  BNE asset_map_initial_copy_9
  LDX #$00
asset_map_initial_copy_11:
  LDA asset_bytes_10,X
  STA $8600,X
  INX
  CPX #$40
  BNE asset_map_initial_copy_11
  LDA #$00
  STA $C500
  LDA #$00
  STA $C501
  LDA #$00
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$00
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
  LDA #$B8
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
  LDA #$00
  STA $C400
  STA $C401
  STA $C402
  STA $C403
  LDA $C400
  CMP #$00
  BNE sprite_play_start_0_0_6
  LDA $C403
  BNE sprite_play_done_0_0_7
sprite_play_start_0_0_6:
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_idle-right
  STA $C404
  LDA $C404
  STA $07F8
sprite_play_done_0_0_7:
  LDA #$18
  STA $C100
  LDA #$00
  STA $C101
  LDA #$80
  STA $C102
  LDA #$00
  STA $C103
  LDA #$00
  STA $C104
  LDA #$00
  STA $C105
  LDA #$00
  STA $C106
  LDA #$00
  STA $C107
  LDA #$00
  STA $C108
  LDA #$00
  STA $C109
  LDA #$00
  STA $C10A
  LDA #$07
  STA $C10B
  LDA #$00
  STA $C10C
  LDA #$07
  STA $C10D
  LDA #$00
  STA $C110
  LDA #$00
  STA $C111
  LDA #$00
  STA $C112
  LDA #$00
  STA $C113
  LDA $D011
  AND #$7F
  STA $C10E
  LDA $D016
  STA $C10F
  LDX #$00
asset_charset_copy_13:
  LDA asset_bytes_12,X
  STA $3000,X
  INX
  BNE asset_charset_copy_13
  LDX #$00
asset_charset_copy_14:
  LDA asset_bytes_1,X
  STA $3100,X
  INX
  BNE asset_charset_copy_14
  LDX #$00
asset_charset_copy_15:
  LDA asset_bytes_1,X
  STA $3200,X
  INX
  BNE asset_charset_copy_15
  LDX #$00
asset_charset_copy_16:
  LDA asset_bytes_1,X
  STA $3300,X
  INX
  BNE asset_charset_copy_16
  LDX #$00
asset_charset_copy_17:
  LDA asset_bytes_1,X
  STA $3400,X
  INX
  BNE asset_charset_copy_17
  LDX #$00
asset_charset_copy_18:
  LDA asset_bytes_1,X
  STA $3500,X
  INX
  BNE asset_charset_copy_18
  LDX #$00
asset_charset_copy_19:
  LDA asset_bytes_1,X
  STA $3600,X
  INX
  BNE asset_charset_copy_19
  LDX #$00
asset_charset_copy_20:
  LDA asset_bytes_1,X
  STA $3700,X
  INX
  BNE asset_charset_copy_20
  LDA $DD00
  AND #$FC
  ORA #$03
  STA $DD00
  LDA $D018
  AND #$F1
  ORA #$0C
  STA $D018
  LDA $D016
  AND #$EF
  STA $D016
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA $C10A
  STA $C7C0
  LDA $C10C
  STA $C7C1
  LDA $D011
  AND #$7F
  STA $C10E
  LDA $D016
  STA $C10F
  JSR runtime_map_viewport_0
  JSR runtime_map_scroll_restore_0
  SEI
  LDA #$7F
  STA $DC0D
  STA $DD0D
  LDA $DC0D
  LDA $DD0D
  LDA #$00
  STA $C0FE
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$1E
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<irq_dispatch
  STA $0314
  LDA #>irq_dispatch
  STA $0315
  CLI
  JMP program_end
; Raster IRQ dispatcher
irq_dispatch:
  PHA
  TXA
  PHA
  TYA
  PHA
  LDA $D019
  AND #$01
  BNE irq_dispatch_vic_raster
  LDA $DC0D
  LDA $DD0D
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
irq_dispatch_vic_raster:
  LDA #$01
  STA $D019
  LDA $C0FE
  CMP #$00
  BEQ irq_dispatch_match_0
  JMP irq_dispatch_next_0
irq_dispatch_match_0:
  JMP irq_handler_0
irq_dispatch_next_0:
  CMP #$01
  BEQ irq_dispatch_match_1
  JMP irq_dispatch_next_1
irq_dispatch_match_1:
  JMP irq_handler_1
irq_dispatch_next_1:
  JMP irq_handler_0
irq_handler_0:
  JSR runtime_map_scroll_apply_0
  LDA #$01
  STA $C0FE
  LDA #$D2
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
irq_handler_1:
  JSR runtime_map_scroll_leave_0
  LDA #$00
  STA $C0FE
  LDA #$1E
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
program_end:
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
  CMP #$D6
  BEQ game_frame_wait_leave
game_frame_wait_target:
  LDA $D012
  CMP #$D6
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
  STA $C104
  LDA $C767
  AND #$04
  BEQ condition_pass_10
  JMP control_if_else_9
condition_pass_10:
  LDA #$FE
  STA $C104
  JMP control_if_end_9
control_if_else_9:
control_if_end_9:
  LDA $C767
  AND #$08
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA #$02
  STA $C104
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C104
  CMP #$00
  BEQ condition_pass_14
  JMP control_if_else_13
condition_pass_14:
  LDA $C400
  CMP #$00
  BNE sprite_play_start_0_0_15
  LDA $C403
  BNE sprite_play_done_0_0_16
sprite_play_start_0_0_15:
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_idle-right
  STA $C404
  LDA $C404
  STA $07F8
sprite_play_done_0_0_16:
  JMP control_if_end_13
control_if_else_13:
  LDA $C400
  CMP #$01
  BNE sprite_play_start_0_1_17
  LDA $C403
  BNE sprite_play_done_0_1_18
sprite_play_start_0_1_17:
  LDA #$01
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_run-right
  STA $C404
  LDA $C404
  STA $07F8
sprite_play_done_0_1_18:
control_if_end_13:
  LDA $C106
  CMP #$01
  BEQ condition_pass_20
  JMP control_if_else_19
condition_pass_20:
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
  LDA #$FA
  STA $C105
  LDA #$00
  STA $C106
  JMP control_if_end_21
control_if_else_21:
control_if_end_21:
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  LDA $C105
  CLC
  ADC #$01
  STA $C105
  JSR runtime_map_entity_move_0
  LDA $C403
  BNE sprite_anim_active_0_24
  JMP sprite_anim_done_0_23
sprite_anim_active_0_24:
  LDA $C400
  CMP #$00
  BNE sprite_anim_next_seq_0_0_25
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_0_26
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_0_26:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$01
  BCC sprite_anim_pos_ok_0_0_27
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_0_27:
  LDX $C401
  LDA sprite_sequence_0_idle-right,X
  STA $C404
  LDA $C404
  STA $07F8
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_0_25:
  LDA $C400
  CMP #$01
  BNE sprite_anim_next_seq_0_1_28
  INC $C402
  LDA $C402
  CMP #$05
  BCS sprite_anim_advance_0_1_29
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_1_29:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$02
  BCC sprite_anim_pos_ok_0_1_30
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_1_30:
  LDX $C401
  LDA sprite_sequence_0_run-right,X
  STA $C404
  LDA $C404
  STA $07F8
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_1_28:
sprite_anim_done_0_23:
  CLC
  LDA $C100
  ADC #$0C
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  CLC
  LDA $C110
  ADC #$C7
  STA $C7BD
  LDA $C111
  ADC #$00
  STA $C7BE
  LDA $C7C5
  CMP $C7BE
  BEQ map_camera_follow_x_0_0_31_0_positive_compare_high_equal
  BCC map_camera_follow_x_0_0_31_0_positive_compare_false
  JMP map_camera_follow_x_0_0_31_0_move_positive
map_camera_follow_x_0_0_31_0_positive_compare_high_equal:
  LDA $C7C4
  CMP $C7BD
  BEQ map_camera_follow_x_0_0_31_0_positive_compare_false
  BCC map_camera_follow_x_0_0_31_0_positive_compare_false
  JMP map_camera_follow_x_0_0_31_0_move_positive
map_camera_follow_x_0_0_31_0_positive_compare_false:
  JMP map_camera_follow_x_0_0_31_0_check_negative
map_camera_follow_x_0_0_31_0_check_negative:
  CLC
  LDA $C110
  ADC #$68
  STA $C7BD
  LDA $C111
  ADC #$00
  STA $C7BE
  LDA $C7BE
  CMP $C7C5
  BEQ map_camera_follow_x_0_0_31_0_negative_compare_high_equal
  BCC map_camera_follow_x_0_0_31_0_negative_compare_false
  JMP map_camera_follow_x_0_0_31_0_move_negative
map_camera_follow_x_0_0_31_0_negative_compare_high_equal:
  LDA $C7BD
  CMP $C7C4
  BEQ map_camera_follow_x_0_0_31_0_negative_compare_false
  BCC map_camera_follow_x_0_0_31_0_negative_compare_false
  JMP map_camera_follow_x_0_0_31_0_move_negative
map_camera_follow_x_0_0_31_0_negative_compare_false:
  JMP map_camera_follow_x_0_0_31_0_done
map_camera_follow_x_0_0_31_0_move_positive:
  LDA $C10A
  CMP #$2A
  BEQ map_scroll_done_32
map_scroll_can_move_32:
  LDA $C10B
  BEQ map_scroll_wrap_32
  DEC $C10B
  JMP map_scroll_moved_32
map_scroll_wrap_32:
  INC $C10A
  JSR runtime_map_scroll_shift_left_0
  LDA #$07
  STA $C10B
map_scroll_moved_32:
  INC $C110
  BNE map_scroll_pixel_x_inc_32_done
  INC $C111
map_scroll_pixel_x_inc_32_done:
map_scroll_done_32:
  JMP map_camera_follow_x_0_0_31_0_done
map_camera_follow_x_0_0_31_0_move_negative:
  LDA $C10A
  BNE map_scroll_can_move_33
  LDA $C10B
  CMP #$07
  BEQ map_scroll_done_33
map_scroll_can_move_33:
  LDA $C10B
  CMP #$07
  BEQ map_scroll_wrap_33
  INC $C10B
  JMP map_scroll_moved_33
map_scroll_wrap_33:
  DEC $C10A
  JSR runtime_map_scroll_shift_right_0
  LDA #$00
  STA $C10B
map_scroll_moved_33:
  LDA $C110
  BNE map_scroll_pixel_x_dec_33_low
  DEC $C111
map_scroll_pixel_x_dec_33_low:
  DEC $C110
map_scroll_done_33:
map_camera_follow_x_0_0_31_0_done:
  CLC
  LDA $C100
  ADC #$0C
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  CLC
  LDA $C110
  ADC #$C7
  STA $C7BD
  LDA $C111
  ADC #$00
  STA $C7BE
  LDA $C7C5
  CMP $C7BE
  BEQ map_camera_follow_x_0_0_34_1_positive_compare_high_equal
  BCC map_camera_follow_x_0_0_34_1_positive_compare_false
  JMP map_camera_follow_x_0_0_34_1_move_positive
map_camera_follow_x_0_0_34_1_positive_compare_high_equal:
  LDA $C7C4
  CMP $C7BD
  BEQ map_camera_follow_x_0_0_34_1_positive_compare_false
  BCC map_camera_follow_x_0_0_34_1_positive_compare_false
  JMP map_camera_follow_x_0_0_34_1_move_positive
map_camera_follow_x_0_0_34_1_positive_compare_false:
  JMP map_camera_follow_x_0_0_34_1_check_negative
map_camera_follow_x_0_0_34_1_check_negative:
  CLC
  LDA $C110
  ADC #$68
  STA $C7BD
  LDA $C111
  ADC #$00
  STA $C7BE
  LDA $C7BE
  CMP $C7C5
  BEQ map_camera_follow_x_0_0_34_1_negative_compare_high_equal
  BCC map_camera_follow_x_0_0_34_1_negative_compare_false
  JMP map_camera_follow_x_0_0_34_1_move_negative
map_camera_follow_x_0_0_34_1_negative_compare_high_equal:
  LDA $C7BD
  CMP $C7C4
  BEQ map_camera_follow_x_0_0_34_1_negative_compare_false
  BCC map_camera_follow_x_0_0_34_1_negative_compare_false
  JMP map_camera_follow_x_0_0_34_1_move_negative
map_camera_follow_x_0_0_34_1_negative_compare_false:
  JMP map_camera_follow_x_0_0_34_1_done
map_camera_follow_x_0_0_34_1_move_positive:
  LDA $C10A
  CMP #$2A
  BEQ map_scroll_done_35
map_scroll_can_move_35:
  LDA $C10B
  BEQ map_scroll_wrap_35
  DEC $C10B
  JMP map_scroll_moved_35
map_scroll_wrap_35:
  INC $C10A
  JSR runtime_map_scroll_shift_left_0
  LDA #$07
  STA $C10B
map_scroll_moved_35:
  INC $C110
  BNE map_scroll_pixel_x_inc_35_done
  INC $C111
map_scroll_pixel_x_inc_35_done:
map_scroll_done_35:
  JMP map_camera_follow_x_0_0_34_1_done
map_camera_follow_x_0_0_34_1_move_negative:
  LDA $C10A
  BNE map_scroll_can_move_36
  LDA $C10B
  CMP #$07
  BEQ map_scroll_done_36
map_scroll_can_move_36:
  LDA $C10B
  CMP #$07
  BEQ map_scroll_wrap_36
  INC $C10B
  JMP map_scroll_moved_36
map_scroll_wrap_36:
  DEC $C10A
  JSR runtime_map_scroll_shift_right_0
  LDA #$00
  STA $C10B
map_scroll_moved_36:
  LDA $C110
  BNE map_scroll_pixel_x_dec_36_low
  DEC $C111
map_scroll_pixel_x_dec_36_low:
  DEC $C110
map_scroll_done_36:
map_camera_follow_x_0_0_34_1_done:
  SEC
  LDA $C100
  SBC $C110
  STA $C7BD
  LDA $C101
  SBC $C111
  STA $C7BE
  BCS map_entity_x_37_not_before_38
  JMP map_entity_hidden_0_37
map_entity_x_37_not_before_38:
  LDA $C7BE
  CMP #$01
  BCC map_entity_x_visible_37
  BNE map_entity_x_visible_37_hidden
  LDA $C7BD
  CMP #$30
  BCC map_entity_x_visible_37
map_entity_x_visible_37_hidden:
  JMP map_entity_hidden_0_37
map_entity_x_visible_37:
  SEC
  LDA $C102
  SBC $C112
  STA $C7BB
  LDA $C103
  SBC $C113
  STA $C7BC
  BCS map_entity_y_37_not_before_39
  JMP map_entity_hidden_0_37
map_entity_y_37_not_before_39:
  LDA $C7BC
  CMP #$00
  BCC map_entity_y_visible_37
  BNE map_entity_y_visible_37_hidden
  LDA $C7BB
  CMP #$A0
  BCC map_entity_y_visible_37
map_entity_y_visible_37_hidden:
  JMP map_entity_hidden_0_37
map_entity_y_visible_37:
  CLC
  LDA $C7BD
  ADC #$27
  STA $C500
  LDA $C7BE
  ADC #$00
  STA $C501
  CLC
  LDA $C7BB
  ADC #$32
  STA $C502
  LDA #$01
  STA $C505
  JMP map_entity_shown_0_37
map_entity_hidden_0_37:
  LDA #$00
  STA $C505
map_entity_shown_0_37:
  LDA $C505
  BNE sprite_runtime_active_0_40
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_43
sprite_runtime_active_0_40:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_41
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_42
sprite_runtime_xhigh_0_41:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_42:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_43:
map_entity_project_done_0_37:
  JMP game_frame_loop
; Map entity 0: pixel-stepped X/Y tile collision
runtime_map_entity_move_0:
  LDA #$00
  STA $C106
  LDA #$00
  STA $C107
  LDA #$00
  STA $C108
  LDA #$00
  STA $C109
  LDA $C104
  BNE runtime_map_entity_0_x_has_velocity
  JMP runtime_map_entity_0_x_done
runtime_map_entity_0_x_has_velocity:
  BPL runtime_map_entity_0_x_positive
  JMP runtime_map_entity_0_x_negative
runtime_map_entity_0_x_positive:
  LDA $C104
  CMP #$09
  BCC runtime_map_entity_0_x_positive_count_store
  LDA #$08
runtime_map_entity_0_x_positive_count_store:
  STA $C7C8
runtime_map_entity_0_x_positive_loop:
  INC $C100
  BNE runtime_map_entity_0_x_positive_step_done
  INC $C101
runtime_map_entity_0_x_positive_step_done:
  CLC
  LDA $C100
  ADC #$13
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  CLC
  LDA $C102
  ADC #$01
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_positive_sample_0_clear
  JMP runtime_map_entity_0_x_positive_hit
runtime_map_entity_0_x_positive_sample_0_clear:
  CLC
  LDA $C102
  ADC #$09
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_positive_sample_1_clear
  JMP runtime_map_entity_0_x_positive_hit
runtime_map_entity_0_x_positive_sample_1_clear:
  CLC
  LDA $C102
  ADC #$11
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_positive_sample_2_clear
  JMP runtime_map_entity_0_x_positive_hit
runtime_map_entity_0_x_positive_sample_2_clear:
  CLC
  LDA $C102
  ADC #$14
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_positive_sample_3_clear
  JMP runtime_map_entity_0_x_positive_hit
runtime_map_entity_0_x_positive_sample_3_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_0_x_positive_done
  JMP runtime_map_entity_0_x_positive_loop
runtime_map_entity_0_x_positive_done:
  JMP runtime_map_entity_0_x_done
runtime_map_entity_0_x_positive_hit:
  LDA $C100
  BNE runtime_map_entity_0_x_positive_undo_low
  DEC $C101
runtime_map_entity_0_x_positive_undo_low:
  DEC $C100
  LDA #$01
  STA $C109
  LDA #$00
  STA $C104
  JMP runtime_map_entity_0_x_done
runtime_map_entity_0_x_negative:
  LDA $C104
  EOR #$FF
  CLC
  ADC #$01
  CMP #$09
  BCC runtime_map_entity_0_x_negative_count_store
  LDA #$08
runtime_map_entity_0_x_negative_count_store:
  STA $C7C8
runtime_map_entity_0_x_negative_loop:
  LDA $C100
  BNE runtime_map_entity_0_x_negative_step_low
  DEC $C101
runtime_map_entity_0_x_negative_step_low:
  DEC $C100
  CLC
  LDA $C100
  ADC #$04
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  CLC
  LDA $C102
  ADC #$01
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_negative_sample_0_clear
  JMP runtime_map_entity_0_x_negative_hit
runtime_map_entity_0_x_negative_sample_0_clear:
  CLC
  LDA $C102
  ADC #$09
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_negative_sample_1_clear
  JMP runtime_map_entity_0_x_negative_hit
runtime_map_entity_0_x_negative_sample_1_clear:
  CLC
  LDA $C102
  ADC #$11
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_negative_sample_2_clear
  JMP runtime_map_entity_0_x_negative_hit
runtime_map_entity_0_x_negative_sample_2_clear:
  CLC
  LDA $C102
  ADC #$14
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_x_negative_sample_3_clear
  JMP runtime_map_entity_0_x_negative_hit
runtime_map_entity_0_x_negative_sample_3_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_0_x_negative_done
  JMP runtime_map_entity_0_x_negative_loop
runtime_map_entity_0_x_negative_done:
  JMP runtime_map_entity_0_x_done
runtime_map_entity_0_x_negative_hit:
  INC $C100
  BNE runtime_map_entity_0_x_negative_undo_done
  INC $C101
runtime_map_entity_0_x_negative_undo_done:
  LDA #$01
  STA $C108
  LDA #$00
  STA $C104
runtime_map_entity_0_x_done:
  LDA $C105
  BNE runtime_map_entity_0_y_has_velocity
  JMP runtime_map_entity_0_y_done
runtime_map_entity_0_y_has_velocity:
  BPL runtime_map_entity_0_y_positive
  JMP runtime_map_entity_0_y_negative
runtime_map_entity_0_y_positive:
  LDA $C105
  CMP #$09
  BCC runtime_map_entity_0_y_positive_count_store
  LDA #$08
runtime_map_entity_0_y_positive_count_store:
  STA $C7C8
runtime_map_entity_0_y_positive_loop:
  INC $C102
  BNE runtime_map_entity_0_y_positive_step_done
  INC $C103
runtime_map_entity_0_y_positive_step_done:
  CLC
  LDA $C102
  ADC #$14
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  CLC
  LDA $C100
  ADC #$04
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_positive_sample_0_clear
  JMP runtime_map_entity_0_y_positive_hit
runtime_map_entity_0_y_positive_sample_0_clear:
  CLC
  LDA $C100
  ADC #$0C
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_positive_sample_1_clear
  JMP runtime_map_entity_0_y_positive_hit
runtime_map_entity_0_y_positive_sample_1_clear:
  CLC
  LDA $C100
  ADC #$13
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_positive_sample_2_clear
  JMP runtime_map_entity_0_y_positive_hit
runtime_map_entity_0_y_positive_sample_2_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_0_y_positive_done
  JMP runtime_map_entity_0_y_positive_loop
runtime_map_entity_0_y_positive_done:
  JMP runtime_map_entity_0_y_done
runtime_map_entity_0_y_positive_hit:
  LDA $C102
  BNE runtime_map_entity_0_y_positive_undo_low
  DEC $C103
runtime_map_entity_0_y_positive_undo_low:
  DEC $C102
  LDA #$01
  STA $C106
  LDA #$00
  STA $C105
  JMP runtime_map_entity_0_y_done
runtime_map_entity_0_y_negative:
  LDA $C105
  EOR #$FF
  CLC
  ADC #$01
  CMP #$09
  BCC runtime_map_entity_0_y_negative_count_store
  LDA #$08
runtime_map_entity_0_y_negative_count_store:
  STA $C7C8
runtime_map_entity_0_y_negative_loop:
  LDA $C102
  BNE runtime_map_entity_0_y_negative_step_low
  DEC $C103
runtime_map_entity_0_y_negative_step_low:
  DEC $C102
  CLC
  LDA $C102
  ADC #$01
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  CLC
  LDA $C100
  ADC #$04
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_negative_sample_0_clear
  JMP runtime_map_entity_0_y_negative_hit
runtime_map_entity_0_y_negative_sample_0_clear:
  CLC
  LDA $C100
  ADC #$0C
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_negative_sample_1_clear
  JMP runtime_map_entity_0_y_negative_hit
runtime_map_entity_0_y_negative_sample_1_clear:
  CLC
  LDA $C100
  ADC #$13
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_y_negative_sample_2_clear
  JMP runtime_map_entity_0_y_negative_hit
runtime_map_entity_0_y_negative_sample_2_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_0_y_negative_done
  JMP runtime_map_entity_0_y_negative_loop
runtime_map_entity_0_y_negative_done:
  JMP runtime_map_entity_0_y_done
runtime_map_entity_0_y_negative_hit:
  INC $C102
  BNE runtime_map_entity_0_y_negative_undo_done
  INC $C103
runtime_map_entity_0_y_negative_undo_done:
  LDA #$01
  STA $C107
  LDA #$00
  STA $C105
runtime_map_entity_0_y_done:
  CLC
  LDA $C102
  ADC #$15
  STA $C7C6
  LDA $C103
  ADC #$00
  STA $C7C7
  CLC
  LDA $C100
  ADC #$04
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_ground_probe_sample_0_clear
  JMP runtime_map_entity_0_grounded
runtime_map_entity_0_ground_probe_sample_0_clear:
  CLC
  LDA $C100
  ADC #$0C
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_ground_probe_sample_1_clear
  JMP runtime_map_entity_0_grounded
runtime_map_entity_0_ground_probe_sample_1_clear:
  CLC
  LDA $C100
  ADC #$13
  STA $C7C4
  LDA $C101
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_0_ground_probe_sample_2_clear
  JMP runtime_map_entity_0_grounded
runtime_map_entity_0_ground_probe_sample_2_clear:
  JMP runtime_map_entity_0_done
runtime_map_entity_0_grounded:
  LDA #$01
  STA $C106
runtime_map_entity_0_done:
  RTS
; Map 0: logical collision lookup from 16-bit world pixels
runtime_map_entity_point_solid_0:
  LDA $C7C5
  CMP #$02
  BCC runtime_map_entity_point_0_x_inside
  BNE runtime_map_entity_point_0_x_outside
  LDA $C7C4
  CMP #$80
  BCC runtime_map_entity_point_0_x_inside
runtime_map_entity_point_0_x_outside:
  JMP runtime_map_entity_point_0_solid
runtime_map_entity_point_0_x_inside:
  LDA $C7C7
  CMP #$00
  BCC runtime_map_entity_point_0_y_inside
  BNE runtime_map_entity_point_0_y_outside
  LDA $C7C6
  CMP #$A0
  BCC runtime_map_entity_point_0_y_inside
runtime_map_entity_point_0_y_outside:
  JMP runtime_map_entity_point_0_solid
runtime_map_entity_point_0_y_inside:
  LDA $C7C4
  STA $C7BB
  LDA $C7C5
  STA $C7BC
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LDA $C7BB
  STA $C7B2
  LDA $C7C6
  STA $C7BB
  LDA $C7C7
  STA $C7BC
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LDA $C7BB
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_collisions_0,X
  BEQ runtime_map_entity_point_0_clear
runtime_map_entity_point_0_solid:
  LDA #$01
  RTS
runtime_map_entity_point_0_clear:
  LDA #$00
  RTS
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA $C7B2
  STA $C7C2
  LDA $C7B3
  STA $C7C3
runtime_map_draw_tile_body_0:
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA ($FB),Y
  STA $C7B4
  LDA $C7B4
  STA $C7B5
  LDA #$01
  STA $FB
  LDA #$04
  STA $FC
  LDA $C7C3
  STA $C7B7
runtime_map_screen_y_loop_0:
  LDA $C7B7
  BEQ runtime_map_screen_y_done_0
  CLC
  LDA $FB
  ADC #$28
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  DEC $C7B7
  JMP runtime_map_screen_y_loop_0
runtime_map_screen_y_done_0:
  LDA $C7C2
  STA $C7B9
  CLC
  LDA $FB
  ADC $C7B9
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  CLC
  LDA $FB
  ADC #$00
  STA $FD
  LDA $FC
  ADC #$D4
  STA $FE
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA asset_map_chars_0,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA asset_map_colors_0,Y
  LDY #$00
  STA ($FD),Y
  RTS
; Map 0: bounded coarse viewport 38x20
runtime_map_viewport_0:
  LDA #$00
  STA $C7C3
runtime_map_viewport_row_0:
  CLC
  LDA $C7C1
  ADC $C7C3
  STA $C7B3
  LDA #$00
  STA $C7C2
runtime_map_viewport_column_0:
  CLC
  LDA $C7C0
  ADC $C7C2
  STA $C7B2
  JSR runtime_map_draw_tile_body_0
  INC $C7C2
  LDA $C7C2
  CMP #$26
  BNE runtime_map_viewport_column_0
  INC $C7C3
  LDA $C7C3
  CMP #$14
  BNE runtime_map_viewport_row_0
  RTS
; Map 0: enter raster-banded fine X/Y viewport
runtime_map_scroll_apply_0:
  LDA $D016
  AND #$F0
  ORA $C10B
  STA $D016
  RTS
; Map 0: cycle-stable VCBASE transition into the fixed panel
runtime_map_scroll_prepare_panel_0:
  RTS
; Map 0: leave the scroll area with the fixed horizontal phase
runtime_map_scroll_leave_0:
  LDA $C10F
  STA $D016
  RTS
; Map 0: restore both fixed-panel VIC-II phases after a full redraw
runtime_map_scroll_restore_0:
  LDA $C10F
  STA $D016
  RTS
; Map 0: shift Screen RAM and Color RAM one character left
runtime_map_scroll_shift_left_0:
  LDA $C10A
  CLC
  ADC #$25
  STA $C7B2
  LDA $C10C
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA $0402
  STA $0401
  LDA $D802
  STA $D801
  LDX #$DC
runtime_map_scroll_left_row_0_0:
  LDA $0327,X
  STA $0326,X
  LDA $D727,X
  STA $D726,X
  INX
  LDA $0327,X
  STA $0326,X
  LDA $D727,X
  STA $D726,X
  INX
  BNE runtime_map_scroll_left_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0426
  LDA asset_map_colors_0,X
  STA $D826
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $042A
  STA $0429
  LDA $D82A
  STA $D829
  LDX #$DC
runtime_map_scroll_left_row_0_1:
  LDA $034F,X
  STA $034E,X
  LDA $D74F,X
  STA $D74E,X
  INX
  LDA $034F,X
  STA $034E,X
  LDA $D74F,X
  STA $D74E,X
  INX
  BNE runtime_map_scroll_left_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $044E
  LDA asset_map_colors_0,X
  STA $D84E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0452
  STA $0451
  LDA $D852
  STA $D851
  LDX #$DC
runtime_map_scroll_left_row_0_2:
  LDA $0377,X
  STA $0376,X
  LDA $D777,X
  STA $D776,X
  INX
  LDA $0377,X
  STA $0376,X
  LDA $D777,X
  STA $D776,X
  INX
  BNE runtime_map_scroll_left_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0476
  LDA asset_map_colors_0,X
  STA $D876
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $047A
  STA $0479
  LDA $D87A
  STA $D879
  LDX #$DC
runtime_map_scroll_left_row_0_3:
  LDA $039F,X
  STA $039E,X
  LDA $D79F,X
  STA $D79E,X
  INX
  LDA $039F,X
  STA $039E,X
  LDA $D79F,X
  STA $D79E,X
  INX
  BNE runtime_map_scroll_left_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $049E
  LDA asset_map_colors_0,X
  STA $D89E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04A2
  STA $04A1
  LDA $D8A2
  STA $D8A1
  LDX #$DC
runtime_map_scroll_left_row_0_4:
  LDA $03C7,X
  STA $03C6,X
  LDA $D7C7,X
  STA $D7C6,X
  INX
  LDA $03C7,X
  STA $03C6,X
  LDA $D7C7,X
  STA $D7C6,X
  INX
  BNE runtime_map_scroll_left_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04C6
  LDA asset_map_colors_0,X
  STA $D8C6
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04CA
  STA $04C9
  LDA $D8CA
  STA $D8C9
  LDX #$DC
runtime_map_scroll_left_row_0_5:
  LDA $03EF,X
  STA $03EE,X
  LDA $D7EF,X
  STA $D7EE,X
  INX
  LDA $03EF,X
  STA $03EE,X
  LDA $D7EF,X
  STA $D7EE,X
  INX
  BNE runtime_map_scroll_left_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04EE
  LDA asset_map_colors_0,X
  STA $D8EE
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04F2
  STA $04F1
  LDA $D8F2
  STA $D8F1
  LDX #$DC
runtime_map_scroll_left_row_0_6:
  LDA $0417,X
  STA $0416,X
  LDA $D817,X
  STA $D816,X
  INX
  LDA $0417,X
  STA $0416,X
  LDA $D817,X
  STA $D816,X
  INX
  BNE runtime_map_scroll_left_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0516
  LDA asset_map_colors_0,X
  STA $D916
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $051A
  STA $0519
  LDA $D91A
  STA $D919
  LDX #$DC
runtime_map_scroll_left_row_0_7:
  LDA $043F,X
  STA $043E,X
  LDA $D83F,X
  STA $D83E,X
  INX
  LDA $043F,X
  STA $043E,X
  LDA $D83F,X
  STA $D83E,X
  INX
  BNE runtime_map_scroll_left_row_0_7
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $053E
  LDA asset_map_colors_0,X
  STA $D93E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0542
  STA $0541
  LDA $D942
  STA $D941
  LDX #$DC
runtime_map_scroll_left_row_0_8:
  LDA $0467,X
  STA $0466,X
  LDA $D867,X
  STA $D866,X
  INX
  LDA $0467,X
  STA $0466,X
  LDA $D867,X
  STA $D866,X
  INX
  BNE runtime_map_scroll_left_row_0_8
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0566
  LDA asset_map_colors_0,X
  STA $D966
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $056A
  STA $0569
  LDA $D96A
  STA $D969
  LDX #$DC
runtime_map_scroll_left_row_0_9:
  LDA $048F,X
  STA $048E,X
  LDA $D88F,X
  STA $D88E,X
  INX
  LDA $048F,X
  STA $048E,X
  LDA $D88F,X
  STA $D88E,X
  INX
  BNE runtime_map_scroll_left_row_0_9
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $058E
  LDA asset_map_colors_0,X
  STA $D98E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0592
  STA $0591
  LDA $D992
  STA $D991
  LDX #$DC
runtime_map_scroll_left_row_0_10:
  LDA $04B7,X
  STA $04B6,X
  LDA $D8B7,X
  STA $D8B6,X
  INX
  LDA $04B7,X
  STA $04B6,X
  LDA $D8B7,X
  STA $D8B6,X
  INX
  BNE runtime_map_scroll_left_row_0_10
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05B6
  LDA asset_map_colors_0,X
  STA $D9B6
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05BA
  STA $05B9
  LDA $D9BA
  STA $D9B9
  LDX #$DC
runtime_map_scroll_left_row_0_11:
  LDA $04DF,X
  STA $04DE,X
  LDA $D8DF,X
  STA $D8DE,X
  INX
  LDA $04DF,X
  STA $04DE,X
  LDA $D8DF,X
  STA $D8DE,X
  INX
  BNE runtime_map_scroll_left_row_0_11
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05DE
  LDA asset_map_colors_0,X
  STA $D9DE
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05E2
  STA $05E1
  LDA $D9E2
  STA $D9E1
  LDX #$DC
runtime_map_scroll_left_row_0_12:
  LDA $0507,X
  STA $0506,X
  LDA $D907,X
  STA $D906,X
  INX
  LDA $0507,X
  STA $0506,X
  LDA $D907,X
  STA $D906,X
  INX
  BNE runtime_map_scroll_left_row_0_12
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0606
  LDA asset_map_colors_0,X
  STA $DA06
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $060A
  STA $0609
  LDA $DA0A
  STA $DA09
  LDX #$DC
runtime_map_scroll_left_row_0_13:
  LDA $052F,X
  STA $052E,X
  LDA $D92F,X
  STA $D92E,X
  INX
  LDA $052F,X
  STA $052E,X
  LDA $D92F,X
  STA $D92E,X
  INX
  BNE runtime_map_scroll_left_row_0_13
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $062E
  LDA asset_map_colors_0,X
  STA $DA2E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0632
  STA $0631
  LDA $DA32
  STA $DA31
  LDX #$DC
runtime_map_scroll_left_row_0_14:
  LDA $0557,X
  STA $0556,X
  LDA $D957,X
  STA $D956,X
  INX
  LDA $0557,X
  STA $0556,X
  LDA $D957,X
  STA $D956,X
  INX
  BNE runtime_map_scroll_left_row_0_14
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0656
  LDA asset_map_colors_0,X
  STA $DA56
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $065A
  STA $0659
  LDA $DA5A
  STA $DA59
  LDX #$DC
runtime_map_scroll_left_row_0_15:
  LDA $057F,X
  STA $057E,X
  LDA $D97F,X
  STA $D97E,X
  INX
  LDA $057F,X
  STA $057E,X
  LDA $D97F,X
  STA $D97E,X
  INX
  BNE runtime_map_scroll_left_row_0_15
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $067E
  LDA asset_map_colors_0,X
  STA $DA7E
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0682
  STA $0681
  LDA $DA82
  STA $DA81
  LDX #$DC
runtime_map_scroll_left_row_0_16:
  LDA $05A7,X
  STA $05A6,X
  LDA $D9A7,X
  STA $D9A6,X
  INX
  LDA $05A7,X
  STA $05A6,X
  LDA $D9A7,X
  STA $D9A6,X
  INX
  BNE runtime_map_scroll_left_row_0_16
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06A6
  LDA asset_map_colors_0,X
  STA $DAA6
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06AA
  STA $06A9
  LDA $DAAA
  STA $DAA9
  LDX #$DC
runtime_map_scroll_left_row_0_17:
  LDA $05CF,X
  STA $05CE,X
  LDA $D9CF,X
  STA $D9CE,X
  INX
  LDA $05CF,X
  STA $05CE,X
  LDA $D9CF,X
  STA $D9CE,X
  INX
  BNE runtime_map_scroll_left_row_0_17
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06CE
  LDA asset_map_colors_0,X
  STA $DACE
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06D2
  STA $06D1
  LDA $DAD2
  STA $DAD1
  LDX #$DC
runtime_map_scroll_left_row_0_18:
  LDA $05F7,X
  STA $05F6,X
  LDA $D9F7,X
  STA $D9F6,X
  INX
  LDA $05F7,X
  STA $05F6,X
  LDA $D9F7,X
  STA $D9F6,X
  INX
  BNE runtime_map_scroll_left_row_0_18
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06F6
  LDA asset_map_colors_0,X
  STA $DAF6
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06FA
  STA $06F9
  LDA $DAFA
  STA $DAF9
  LDX #$DC
runtime_map_scroll_left_row_0_19:
  LDA $061F,X
  STA $061E,X
  LDA $DA1F,X
  STA $DA1E,X
  INX
  LDA $061F,X
  STA $061E,X
  LDA $DA1F,X
  STA $DA1E,X
  INX
  BNE runtime_map_scroll_left_row_0_19
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $071E
  LDA asset_map_colors_0,X
  STA $DB1E
  RTS
; Map 0: shift Screen RAM and Color RAM one character right
runtime_map_scroll_shift_right_0:
  LDA $C10A
  STA $C7B2
  LDA $C10C
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA $0425
  STA $0426
  LDA $D825
  STA $D826
  LDX #$23
runtime_map_scroll_right_row_0_0:
  LDA $0401,X
  STA $0402,X
  LDA $D801,X
  STA $D802,X
  DEX
  LDA $0401,X
  STA $0402,X
  LDA $D801,X
  STA $D802,X
  DEX
  BPL runtime_map_scroll_right_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0401
  LDA asset_map_colors_0,X
  STA $D801
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $044D
  STA $044E
  LDA $D84D
  STA $D84E
  LDX #$23
runtime_map_scroll_right_row_0_1:
  LDA $0429,X
  STA $042A,X
  LDA $D829,X
  STA $D82A,X
  DEX
  LDA $0429,X
  STA $042A,X
  LDA $D829,X
  STA $D82A,X
  DEX
  BPL runtime_map_scroll_right_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0429
  LDA asset_map_colors_0,X
  STA $D829
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0475
  STA $0476
  LDA $D875
  STA $D876
  LDX #$23
runtime_map_scroll_right_row_0_2:
  LDA $0451,X
  STA $0452,X
  LDA $D851,X
  STA $D852,X
  DEX
  LDA $0451,X
  STA $0452,X
  LDA $D851,X
  STA $D852,X
  DEX
  BPL runtime_map_scroll_right_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0451
  LDA asset_map_colors_0,X
  STA $D851
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $049D
  STA $049E
  LDA $D89D
  STA $D89E
  LDX #$23
runtime_map_scroll_right_row_0_3:
  LDA $0479,X
  STA $047A,X
  LDA $D879,X
  STA $D87A,X
  DEX
  LDA $0479,X
  STA $047A,X
  LDA $D879,X
  STA $D87A,X
  DEX
  BPL runtime_map_scroll_right_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0479
  LDA asset_map_colors_0,X
  STA $D879
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04C5
  STA $04C6
  LDA $D8C5
  STA $D8C6
  LDX #$23
runtime_map_scroll_right_row_0_4:
  LDA $04A1,X
  STA $04A2,X
  LDA $D8A1,X
  STA $D8A2,X
  DEX
  LDA $04A1,X
  STA $04A2,X
  LDA $D8A1,X
  STA $D8A2,X
  DEX
  BPL runtime_map_scroll_right_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04A1
  LDA asset_map_colors_0,X
  STA $D8A1
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04ED
  STA $04EE
  LDA $D8ED
  STA $D8EE
  LDX #$23
runtime_map_scroll_right_row_0_5:
  LDA $04C9,X
  STA $04CA,X
  LDA $D8C9,X
  STA $D8CA,X
  DEX
  LDA $04C9,X
  STA $04CA,X
  LDA $D8C9,X
  STA $D8CA,X
  DEX
  BPL runtime_map_scroll_right_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04C9
  LDA asset_map_colors_0,X
  STA $D8C9
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0515
  STA $0516
  LDA $D915
  STA $D916
  LDX #$23
runtime_map_scroll_right_row_0_6:
  LDA $04F1,X
  STA $04F2,X
  LDA $D8F1,X
  STA $D8F2,X
  DEX
  LDA $04F1,X
  STA $04F2,X
  LDA $D8F1,X
  STA $D8F2,X
  DEX
  BPL runtime_map_scroll_right_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04F1
  LDA asset_map_colors_0,X
  STA $D8F1
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $053D
  STA $053E
  LDA $D93D
  STA $D93E
  LDX #$23
runtime_map_scroll_right_row_0_7:
  LDA $0519,X
  STA $051A,X
  LDA $D919,X
  STA $D91A,X
  DEX
  LDA $0519,X
  STA $051A,X
  LDA $D919,X
  STA $D91A,X
  DEX
  BPL runtime_map_scroll_right_row_0_7
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0519
  LDA asset_map_colors_0,X
  STA $D919
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0565
  STA $0566
  LDA $D965
  STA $D966
  LDX #$23
runtime_map_scroll_right_row_0_8:
  LDA $0541,X
  STA $0542,X
  LDA $D941,X
  STA $D942,X
  DEX
  LDA $0541,X
  STA $0542,X
  LDA $D941,X
  STA $D942,X
  DEX
  BPL runtime_map_scroll_right_row_0_8
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0541
  LDA asset_map_colors_0,X
  STA $D941
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $058D
  STA $058E
  LDA $D98D
  STA $D98E
  LDX #$23
runtime_map_scroll_right_row_0_9:
  LDA $0569,X
  STA $056A,X
  LDA $D969,X
  STA $D96A,X
  DEX
  LDA $0569,X
  STA $056A,X
  LDA $D969,X
  STA $D96A,X
  DEX
  BPL runtime_map_scroll_right_row_0_9
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0569
  LDA asset_map_colors_0,X
  STA $D969
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05B5
  STA $05B6
  LDA $D9B5
  STA $D9B6
  LDX #$23
runtime_map_scroll_right_row_0_10:
  LDA $0591,X
  STA $0592,X
  LDA $D991,X
  STA $D992,X
  DEX
  LDA $0591,X
  STA $0592,X
  LDA $D991,X
  STA $D992,X
  DEX
  BPL runtime_map_scroll_right_row_0_10
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0591
  LDA asset_map_colors_0,X
  STA $D991
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05DD
  STA $05DE
  LDA $D9DD
  STA $D9DE
  LDX #$23
runtime_map_scroll_right_row_0_11:
  LDA $05B9,X
  STA $05BA,X
  LDA $D9B9,X
  STA $D9BA,X
  DEX
  LDA $05B9,X
  STA $05BA,X
  LDA $D9B9,X
  STA $D9BA,X
  DEX
  BPL runtime_map_scroll_right_row_0_11
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05B9
  LDA asset_map_colors_0,X
  STA $D9B9
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0605
  STA $0606
  LDA $DA05
  STA $DA06
  LDX #$23
runtime_map_scroll_right_row_0_12:
  LDA $05E1,X
  STA $05E2,X
  LDA $D9E1,X
  STA $D9E2,X
  DEX
  LDA $05E1,X
  STA $05E2,X
  LDA $D9E1,X
  STA $D9E2,X
  DEX
  BPL runtime_map_scroll_right_row_0_12
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05E1
  LDA asset_map_colors_0,X
  STA $D9E1
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $062D
  STA $062E
  LDA $DA2D
  STA $DA2E
  LDX #$23
runtime_map_scroll_right_row_0_13:
  LDA $0609,X
  STA $060A,X
  LDA $DA09,X
  STA $DA0A,X
  DEX
  LDA $0609,X
  STA $060A,X
  LDA $DA09,X
  STA $DA0A,X
  DEX
  BPL runtime_map_scroll_right_row_0_13
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0609
  LDA asset_map_colors_0,X
  STA $DA09
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0655
  STA $0656
  LDA $DA55
  STA $DA56
  LDX #$23
runtime_map_scroll_right_row_0_14:
  LDA $0631,X
  STA $0632,X
  LDA $DA31,X
  STA $DA32,X
  DEX
  LDA $0631,X
  STA $0632,X
  LDA $DA31,X
  STA $DA32,X
  DEX
  BPL runtime_map_scroll_right_row_0_14
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0631
  LDA asset_map_colors_0,X
  STA $DA31
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $067D
  STA $067E
  LDA $DA7D
  STA $DA7E
  LDX #$23
runtime_map_scroll_right_row_0_15:
  LDA $0659,X
  STA $065A,X
  LDA $DA59,X
  STA $DA5A,X
  DEX
  LDA $0659,X
  STA $065A,X
  LDA $DA59,X
  STA $DA5A,X
  DEX
  BPL runtime_map_scroll_right_row_0_15
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0659
  LDA asset_map_colors_0,X
  STA $DA59
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06A5
  STA $06A6
  LDA $DAA5
  STA $DAA6
  LDX #$23
runtime_map_scroll_right_row_0_16:
  LDA $0681,X
  STA $0682,X
  LDA $DA81,X
  STA $DA82,X
  DEX
  LDA $0681,X
  STA $0682,X
  LDA $DA81,X
  STA $DA82,X
  DEX
  BPL runtime_map_scroll_right_row_0_16
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0681
  LDA asset_map_colors_0,X
  STA $DA81
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06CD
  STA $06CE
  LDA $DACD
  STA $DACE
  LDX #$23
runtime_map_scroll_right_row_0_17:
  LDA $06A9,X
  STA $06AA,X
  LDA $DAA9,X
  STA $DAAA,X
  DEX
  LDA $06A9,X
  STA $06AA,X
  LDA $DAA9,X
  STA $DAAA,X
  DEX
  BPL runtime_map_scroll_right_row_0_17
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06A9
  LDA asset_map_colors_0,X
  STA $DAA9
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06F5
  STA $06F6
  LDA $DAF5
  STA $DAF6
  LDX #$23
runtime_map_scroll_right_row_0_18:
  LDA $06D1,X
  STA $06D2,X
  LDA $DAD1,X
  STA $DAD2,X
  DEX
  LDA $06D1,X
  STA $06D2,X
  LDA $DAD1,X
  STA $DAD2,X
  DEX
  BPL runtime_map_scroll_right_row_0_18
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06D1
  LDA asset_map_colors_0,X
  STA $DAD1
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $071D
  STA $071E
  LDA $DB1D
  STA $DB1E
  LDX #$23
runtime_map_scroll_right_row_0_19:
  LDA $06F9,X
  STA $06FA,X
  LDA $DAF9,X
  STA $DAFA,X
  DEX
  LDA $06F9,X
  STA $06FA,X
  LDA $DAF9,X
  STA $DAFA,X
  DEX
  BPL runtime_map_scroll_right_row_0_19
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06F9
  LDA asset_map_colors_0,X
  STA $DAF9
  RTS
; Map 0: shift Screen RAM and Color RAM one character up
runtime_map_scroll_shift_up_0:
  LDX #$DA
runtime_map_scroll_up_row_0_0:
  LDA $034F,X
  STA $0327,X
  LDA $D74F,X
  STA $D727,X
  INX
  LDA $034F,X
  STA $0327,X
  LDA $D74F,X
  STA $D727,X
  INX
  BNE runtime_map_scroll_up_row_0_0
  LDX #$DA
runtime_map_scroll_up_row_0_1:
  LDA $0377,X
  STA $034F,X
  LDA $D777,X
  STA $D74F,X
  INX
  LDA $0377,X
  STA $034F,X
  LDA $D777,X
  STA $D74F,X
  INX
  BNE runtime_map_scroll_up_row_0_1
  LDX #$DA
runtime_map_scroll_up_row_0_2:
  LDA $039F,X
  STA $0377,X
  LDA $D79F,X
  STA $D777,X
  INX
  LDA $039F,X
  STA $0377,X
  LDA $D79F,X
  STA $D777,X
  INX
  BNE runtime_map_scroll_up_row_0_2
  LDX #$DA
runtime_map_scroll_up_row_0_3:
  LDA $03C7,X
  STA $039F,X
  LDA $D7C7,X
  STA $D79F,X
  INX
  LDA $03C7,X
  STA $039F,X
  LDA $D7C7,X
  STA $D79F,X
  INX
  BNE runtime_map_scroll_up_row_0_3
  LDX #$DA
runtime_map_scroll_up_row_0_4:
  LDA $03EF,X
  STA $03C7,X
  LDA $D7EF,X
  STA $D7C7,X
  INX
  LDA $03EF,X
  STA $03C7,X
  LDA $D7EF,X
  STA $D7C7,X
  INX
  BNE runtime_map_scroll_up_row_0_4
  LDX #$DA
runtime_map_scroll_up_row_0_5:
  LDA $0417,X
  STA $03EF,X
  LDA $D817,X
  STA $D7EF,X
  INX
  LDA $0417,X
  STA $03EF,X
  LDA $D817,X
  STA $D7EF,X
  INX
  BNE runtime_map_scroll_up_row_0_5
  LDX #$DA
runtime_map_scroll_up_row_0_6:
  LDA $043F,X
  STA $0417,X
  LDA $D83F,X
  STA $D817,X
  INX
  LDA $043F,X
  STA $0417,X
  LDA $D83F,X
  STA $D817,X
  INX
  BNE runtime_map_scroll_up_row_0_6
  LDX #$DA
runtime_map_scroll_up_row_0_7:
  LDA $0467,X
  STA $043F,X
  LDA $D867,X
  STA $D83F,X
  INX
  LDA $0467,X
  STA $043F,X
  LDA $D867,X
  STA $D83F,X
  INX
  BNE runtime_map_scroll_up_row_0_7
  LDX #$DA
runtime_map_scroll_up_row_0_8:
  LDA $048F,X
  STA $0467,X
  LDA $D88F,X
  STA $D867,X
  INX
  LDA $048F,X
  STA $0467,X
  LDA $D88F,X
  STA $D867,X
  INX
  BNE runtime_map_scroll_up_row_0_8
  LDX #$DA
runtime_map_scroll_up_row_0_9:
  LDA $04B7,X
  STA $048F,X
  LDA $D8B7,X
  STA $D88F,X
  INX
  LDA $04B7,X
  STA $048F,X
  LDA $D8B7,X
  STA $D88F,X
  INX
  BNE runtime_map_scroll_up_row_0_9
  LDX #$DA
runtime_map_scroll_up_row_0_10:
  LDA $04DF,X
  STA $04B7,X
  LDA $D8DF,X
  STA $D8B7,X
  INX
  LDA $04DF,X
  STA $04B7,X
  LDA $D8DF,X
  STA $D8B7,X
  INX
  BNE runtime_map_scroll_up_row_0_10
  LDX #$DA
runtime_map_scroll_up_row_0_11:
  LDA $0507,X
  STA $04DF,X
  LDA $D907,X
  STA $D8DF,X
  INX
  LDA $0507,X
  STA $04DF,X
  LDA $D907,X
  STA $D8DF,X
  INX
  BNE runtime_map_scroll_up_row_0_11
  LDX #$DA
runtime_map_scroll_up_row_0_12:
  LDA $052F,X
  STA $0507,X
  LDA $D92F,X
  STA $D907,X
  INX
  LDA $052F,X
  STA $0507,X
  LDA $D92F,X
  STA $D907,X
  INX
  BNE runtime_map_scroll_up_row_0_12
  LDX #$DA
runtime_map_scroll_up_row_0_13:
  LDA $0557,X
  STA $052F,X
  LDA $D957,X
  STA $D92F,X
  INX
  LDA $0557,X
  STA $052F,X
  LDA $D957,X
  STA $D92F,X
  INX
  BNE runtime_map_scroll_up_row_0_13
  LDX #$DA
runtime_map_scroll_up_row_0_14:
  LDA $057F,X
  STA $0557,X
  LDA $D97F,X
  STA $D957,X
  INX
  LDA $057F,X
  STA $0557,X
  LDA $D97F,X
  STA $D957,X
  INX
  BNE runtime_map_scroll_up_row_0_14
  LDX #$DA
runtime_map_scroll_up_row_0_15:
  LDA $05A7,X
  STA $057F,X
  LDA $D9A7,X
  STA $D97F,X
  INX
  LDA $05A7,X
  STA $057F,X
  LDA $D9A7,X
  STA $D97F,X
  INX
  BNE runtime_map_scroll_up_row_0_15
  LDX #$DA
runtime_map_scroll_up_row_0_16:
  LDA $05CF,X
  STA $05A7,X
  LDA $D9CF,X
  STA $D9A7,X
  INX
  LDA $05CF,X
  STA $05A7,X
  LDA $D9CF,X
  STA $D9A7,X
  INX
  BNE runtime_map_scroll_up_row_0_16
  LDX #$DA
runtime_map_scroll_up_row_0_17:
  LDA $05F7,X
  STA $05CF,X
  LDA $D9F7,X
  STA $D9CF,X
  INX
  LDA $05F7,X
  STA $05CF,X
  LDA $D9F7,X
  STA $D9CF,X
  INX
  BNE runtime_map_scroll_up_row_0_17
  LDX #$DA
runtime_map_scroll_up_row_0_18:
  LDA $061F,X
  STA $05F7,X
  LDA $DA1F,X
  STA $D9F7,X
  INX
  LDA $061F,X
  STA $05F7,X
  LDA $DA1F,X
  STA $D9F7,X
  INX
  BNE runtime_map_scroll_up_row_0_18
  LDA $C10C
  CLC
  ADC #$13
  STA $C7B3
  LDA $C10A
  STA $C7B2
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDY #$00
runtime_map_scroll_up_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06F9,Y
  LDA asset_map_colors_0,X
  STA $DAF9,Y
  INY
  CPY #$26
  BNE runtime_map_scroll_up_line_0
  RTS
; Map 0: shift Screen RAM and Color RAM one character down
runtime_map_scroll_shift_down_0:
  LDX #$DA
runtime_map_scroll_down_row_0_18:
  LDA $05F7,X
  STA $061F,X
  LDA $D9F7,X
  STA $DA1F,X
  INX
  LDA $05F7,X
  STA $061F,X
  LDA $D9F7,X
  STA $DA1F,X
  INX
  BNE runtime_map_scroll_down_row_0_18
  LDX #$DA
runtime_map_scroll_down_row_0_17:
  LDA $05CF,X
  STA $05F7,X
  LDA $D9CF,X
  STA $D9F7,X
  INX
  LDA $05CF,X
  STA $05F7,X
  LDA $D9CF,X
  STA $D9F7,X
  INX
  BNE runtime_map_scroll_down_row_0_17
  LDX #$DA
runtime_map_scroll_down_row_0_16:
  LDA $05A7,X
  STA $05CF,X
  LDA $D9A7,X
  STA $D9CF,X
  INX
  LDA $05A7,X
  STA $05CF,X
  LDA $D9A7,X
  STA $D9CF,X
  INX
  BNE runtime_map_scroll_down_row_0_16
  LDX #$DA
runtime_map_scroll_down_row_0_15:
  LDA $057F,X
  STA $05A7,X
  LDA $D97F,X
  STA $D9A7,X
  INX
  LDA $057F,X
  STA $05A7,X
  LDA $D97F,X
  STA $D9A7,X
  INX
  BNE runtime_map_scroll_down_row_0_15
  LDX #$DA
runtime_map_scroll_down_row_0_14:
  LDA $0557,X
  STA $057F,X
  LDA $D957,X
  STA $D97F,X
  INX
  LDA $0557,X
  STA $057F,X
  LDA $D957,X
  STA $D97F,X
  INX
  BNE runtime_map_scroll_down_row_0_14
  LDX #$DA
runtime_map_scroll_down_row_0_13:
  LDA $052F,X
  STA $0557,X
  LDA $D92F,X
  STA $D957,X
  INX
  LDA $052F,X
  STA $0557,X
  LDA $D92F,X
  STA $D957,X
  INX
  BNE runtime_map_scroll_down_row_0_13
  LDX #$DA
runtime_map_scroll_down_row_0_12:
  LDA $0507,X
  STA $052F,X
  LDA $D907,X
  STA $D92F,X
  INX
  LDA $0507,X
  STA $052F,X
  LDA $D907,X
  STA $D92F,X
  INX
  BNE runtime_map_scroll_down_row_0_12
  LDX #$DA
runtime_map_scroll_down_row_0_11:
  LDA $04DF,X
  STA $0507,X
  LDA $D8DF,X
  STA $D907,X
  INX
  LDA $04DF,X
  STA $0507,X
  LDA $D8DF,X
  STA $D907,X
  INX
  BNE runtime_map_scroll_down_row_0_11
  LDX #$DA
runtime_map_scroll_down_row_0_10:
  LDA $04B7,X
  STA $04DF,X
  LDA $D8B7,X
  STA $D8DF,X
  INX
  LDA $04B7,X
  STA $04DF,X
  LDA $D8B7,X
  STA $D8DF,X
  INX
  BNE runtime_map_scroll_down_row_0_10
  LDX #$DA
runtime_map_scroll_down_row_0_9:
  LDA $048F,X
  STA $04B7,X
  LDA $D88F,X
  STA $D8B7,X
  INX
  LDA $048F,X
  STA $04B7,X
  LDA $D88F,X
  STA $D8B7,X
  INX
  BNE runtime_map_scroll_down_row_0_9
  LDX #$DA
runtime_map_scroll_down_row_0_8:
  LDA $0467,X
  STA $048F,X
  LDA $D867,X
  STA $D88F,X
  INX
  LDA $0467,X
  STA $048F,X
  LDA $D867,X
  STA $D88F,X
  INX
  BNE runtime_map_scroll_down_row_0_8
  LDX #$DA
runtime_map_scroll_down_row_0_7:
  LDA $043F,X
  STA $0467,X
  LDA $D83F,X
  STA $D867,X
  INX
  LDA $043F,X
  STA $0467,X
  LDA $D83F,X
  STA $D867,X
  INX
  BNE runtime_map_scroll_down_row_0_7
  LDX #$DA
runtime_map_scroll_down_row_0_6:
  LDA $0417,X
  STA $043F,X
  LDA $D817,X
  STA $D83F,X
  INX
  LDA $0417,X
  STA $043F,X
  LDA $D817,X
  STA $D83F,X
  INX
  BNE runtime_map_scroll_down_row_0_6
  LDX #$DA
runtime_map_scroll_down_row_0_5:
  LDA $03EF,X
  STA $0417,X
  LDA $D7EF,X
  STA $D817,X
  INX
  LDA $03EF,X
  STA $0417,X
  LDA $D7EF,X
  STA $D817,X
  INX
  BNE runtime_map_scroll_down_row_0_5
  LDX #$DA
runtime_map_scroll_down_row_0_4:
  LDA $03C7,X
  STA $03EF,X
  LDA $D7C7,X
  STA $D7EF,X
  INX
  LDA $03C7,X
  STA $03EF,X
  LDA $D7C7,X
  STA $D7EF,X
  INX
  BNE runtime_map_scroll_down_row_0_4
  LDX #$DA
runtime_map_scroll_down_row_0_3:
  LDA $039F,X
  STA $03C7,X
  LDA $D79F,X
  STA $D7C7,X
  INX
  LDA $039F,X
  STA $03C7,X
  LDA $D79F,X
  STA $D7C7,X
  INX
  BNE runtime_map_scroll_down_row_0_3
  LDX #$DA
runtime_map_scroll_down_row_0_2:
  LDA $0377,X
  STA $039F,X
  LDA $D777,X
  STA $D79F,X
  INX
  LDA $0377,X
  STA $039F,X
  LDA $D777,X
  STA $D79F,X
  INX
  BNE runtime_map_scroll_down_row_0_2
  LDX #$DA
runtime_map_scroll_down_row_0_1:
  LDA $034F,X
  STA $0377,X
  LDA $D74F,X
  STA $D777,X
  INX
  LDA $034F,X
  STA $0377,X
  LDA $D74F,X
  STA $D777,X
  INX
  BNE runtime_map_scroll_down_row_0_1
  LDX #$DA
runtime_map_scroll_down_row_0_0:
  LDA $0327,X
  STA $034F,X
  LDA $D727,X
  STA $D74F,X
  INX
  LDA $0327,X
  STA $034F,X
  LDA $D727,X
  STA $D74F,X
  INX
  BNE runtime_map_scroll_down_row_0_0
  LDA $C10C
  STA $C7B3
  LDA $C10A
  STA $C7B2
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDY #$00
runtime_map_scroll_down_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0401,Y
  LDA asset_map_colors_0,X
  STA $D801,Y
  INY
  CPY #$26
  BNE runtime_map_scroll_down_line_0
  RTS
; Dynamic map 0: redraw visible cells from runtime RAM
runtime_map_redraw_0:
  JMP runtime_map_viewport_0
; User data
sprite_frames_hero_0:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $0C, $00, $30, $18, $00, $18, $30, $00, $0C, $60, $00, $06
sprite_frames_hero_1:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $18, $00, $18, $30, $00, $0C, $60, $00, $06, $30, $00, $0C
asset_map_collisions_0:
  .byte $00, $01, $00, $01
asset_map_chars_0:
  .byte $00, $01, $02, $03
asset_map_colors_0:
  .byte $00, $0E, $07, $05
asset_bytes_1:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_6:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $03, $03, $03, $03, $03, $03, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $03, $03, $03, $03, $03, $03, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_8:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $03, $03, $03, $03, $03, $03, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $02, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $02, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
asset_bytes_10:
  .byte $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
sprite_sequence_0_idle-right:
  .byte $B8
sprite_sequence_0_run-right:
  .byte $B8, $B9
asset_bytes_12:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $A5, $BD, $81, $FF, $00, $00, $00, $00, $00, $00, $FF, $FF, $FF, $FF, $18, $18, $18, $18, $18, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
