  LDA #$FF
  STA $C778
  LDA #$FF
  STA $C779
  LDA #$00
  STA $C77C
  LDA #$FF
  STA $C77A
  LDA #$FF
  STA $C77B
  LDA #$07
  LDX #<disk_filename_7
  LDY #>disk_filename_7
  JSR runtime_disk_load_usr
  LDA #$48
  STA $C500
  LDA #$00
  STA $C501
  LDA #$AA
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  JSR runtime_sprite_sync_0
  LDA #$80
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$07
  STA $C405
  LDA #$07
  STA $D027
  LDA #$F8
  STA $C508
  LDA #$00
  STA $C509
  LDA #$AA
  STA $C50A
  LDA #$00
  STA $C50B
  LDA #$00
  STA $C50C
  LDA #$01
  STA $C50D
  JSR runtime_sprite_sync_1
  LDA #$88
  STA $C40C
  LDA $C40C
  STA $07F9
  LDA #$02
  STA $C40D
  LDA #$02
  STA $D028
  LDA $C779
  CMP #$FF
  BNE map_activation_requested_2
  JMP map_activation_done_0
map_activation_requested_2:
  CMP $C778
  BEQ map_activation_clear_1
  LDA $C779
  CMP #$00
  BNE map_activation_next_0_3
  JSR runtime_map_activate_0
  LDA $C77C
  BNE map_activation_clear_1
  LDA #$00
  STA $C778
  JMP map_activation_clear_1
map_activation_next_0_3:
  LDA $C779
  CMP #$01
  BNE map_activation_next_1_4
  JSR runtime_map_activate_1
  LDA $C77C
  BNE map_activation_clear_1
  LDA #$01
  STA $C778
  JMP map_activation_clear_1
map_activation_next_1_4:
  LDA $C779
  CMP #$02
  BNE map_activation_next_2_5
  JSR runtime_map_activate_2
  LDA $C77C
  BNE map_activation_clear_1
  LDA #$02
  STA $C778
  JMP map_activation_clear_1
map_activation_next_2_5:
map_activation_clear_1:
  LDA #$FF
  STA $C779
map_activation_done_0:
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
  LDA #$00
  STA $C77A
  LDA #$FF
  STA $C77B
  JSR game_scene_enter_dispatch
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
  BNE game_frame_counter_done_6
  INC $C76B
game_frame_counter_done_6:
  JSR game_scene_update_dispatch
  JSR game_scene_apply_transition
  LDA $C779
  CMP #$FF
  BNE map_activation_requested_9
  JMP map_activation_done_7
map_activation_requested_9:
  CMP $C778
  BEQ map_activation_clear_8
  LDA $C779
  CMP #$00
  BNE map_activation_next_0_10
  JSR runtime_map_activate_0
  LDA $C77C
  BNE map_activation_clear_8
  LDA #$00
  STA $C778
  JMP map_activation_clear_8
map_activation_next_0_10:
  LDA $C779
  CMP #$01
  BNE map_activation_next_1_11
  JSR runtime_map_activate_1
  LDA $C77C
  BNE map_activation_clear_8
  LDA #$01
  STA $C778
  JMP map_activation_clear_8
map_activation_next_1_11:
  LDA $C779
  CMP #$02
  BNE map_activation_next_2_12
  JSR runtime_map_activate_2
  LDA $C77C
  BNE map_activation_clear_8
  LDA #$02
  STA $C778
  JMP map_activation_clear_8
map_activation_next_2_12:
map_activation_clear_8:
  LDA #$FF
  STA $C779
map_activation_done_7:
  JMP game_frame_loop
; Apply at most one requested scene transition between frames
game_scene_apply_transition:
  LDA $C77B
  CMP #$FF
  BNE game_scene_transition_requested
  RTS
game_scene_transition_requested:
  CMP $C77A
  BNE game_scene_transition_changed
  LDA #$FF
  STA $C77B
  RTS
game_scene_transition_changed:
  PHA
  LDA #$FF
  STA $C77B
  JSR game_scene_exit_dispatch
  PLA
  STA $C77A
  JSR game_scene_enter_dispatch
  RTS
game_scene_enter_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_enter_dispatch_next_0
  JSR game_scene_title_enter
  RTS
game_scene_enter_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_enter_dispatch_next_1
  JSR game_scene_game_enter
  RTS
game_scene_enter_dispatch_next_1:
  LDA $C77A
  CMP #$03
  BNE game_scene_enter_dispatch_next_3
  JSR game_scene_gameOver_enter
  RTS
game_scene_enter_dispatch_next_3:
  RTS
game_scene_update_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_update_dispatch_next_0
  JSR game_scene_title_update
  RTS
game_scene_update_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_update_dispatch_next_1
  JSR game_scene_game_update
  RTS
game_scene_update_dispatch_next_1:
  LDA $C77A
  CMP #$03
  BNE game_scene_update_dispatch_next_3
  RTS
game_scene_update_dispatch_next_3:
  RTS
game_scene_exit_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_exit_dispatch_next_0
  RTS
game_scene_exit_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_exit_dispatch_next_1
  RTS
game_scene_exit_dispatch_next_1:
  LDA $C77A
  CMP #$03
  BNE game_scene_exit_dispatch_next_3
  RTS
game_scene_exit_dispatch_next_3:
  RTS
; Scene title: enter
game_scene_title_enter:
  LDA #$93
  JSR $FFD2
  LDA #$06
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_13:
  LDA str_screen_0,X
  BEQ printat_done_14
  STA $059D,X
  LDA #$01
  STA $D99D,X
  INX
  BNE printat_loop_13
printat_done_14:
  LDX #$00
printat_loop_15:
  LDA str_screen_1,X
  BEQ printat_done_16
  STA $0613,X
  LDA #$01
  STA $DA13,X
  INX
  BNE printat_loop_15
printat_done_16:
  RTS
; Scene title: update
game_scene_title_update:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_18
  JMP control_if_else_17
joystick_current_pressed_18:
  LDA $C769
  AND #$10
  BNE condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA #$01
  STA $C77B
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
  RTS
; Scene game: enter
game_scene_game_enter:
  LDA #$00
  STA $C779
  RTS
; Scene game: update
game_scene_game_update:
  LDA $C505
  BNE sprite_update_active_0_20
  JMP sprite_update_inactive_0_19
sprite_update_active_0_20:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_21
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_21
sprite_vx_positive_21:
  LDA $C501
  ADC #$00
sprite_vx_done_21:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_22
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_22
  JMP sprite_vy_store_22
sprite_vy_positive_22:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_22
sprite_vy_store_22:
  STA $C502
  JMP sprite_vy_done_22
sprite_vy_clamp_min_22:
  LDA #$00
  STA $C502
  JMP sprite_vy_done_22
sprite_vy_clamp_max_22:
  LDA #$FF
  STA $C502
sprite_vy_done_22:
  LDA $C501
  BMI sprite_x_clamp_min_23
  CMP #$00
  BCC sprite_x_clamp_min_23
  BNE sprite_x_min_ok_23
  LDA $C500
  CMP #$00
  BCS sprite_x_min_ok_23
sprite_x_clamp_min_23:
  LDA #$00
  STA $C500
  LDA #$00
  STA $C501
sprite_x_min_ok_23:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_23
  BNE sprite_x_clamp_max_23
  LDA $C500
  CMP #$FF
  BCC sprite_x_max_ok_23
  BEQ sprite_x_max_ok_23
sprite_x_clamp_max_23:
  LDA #$FF
  STA $C500
  LDA #$01
  STA $C501
sprite_x_max_ok_23:
  LDA $C502
  CMP #$00
  BCS sprite_y_min_ok_23
  LDA #$00
  STA $C502
sprite_y_min_ok_23:
  LDA $C502
  CMP #$FF
  BCC sprite_y_max_ok_23
  BEQ sprite_y_max_ok_23
  LDA #$FF
  STA $C502
sprite_y_max_ok_23:
sprite_update_inactive_0_19:
  JSR runtime_sprite_sync_0
  LDA $C50D
  BNE sprite_update_active_1_25
  JMP sprite_update_inactive_1_24
sprite_update_active_1_25:
  CLC
  LDA $C508
  ADC $C50B
  STA $C508
  LDA $C50B
  BPL sprite_vx_positive_26
  LDA $C509
  ADC #$FF
  JMP sprite_vx_done_26
sprite_vx_positive_26:
  LDA $C509
  ADC #$00
sprite_vx_done_26:
  STA $C509
  LDA $C50C
  BPL sprite_vy_positive_27
  CLC
  LDA $C50A
  ADC $C50C
  BCC sprite_vy_clamp_min_27
  JMP sprite_vy_store_27
sprite_vy_positive_27:
  CLC
  LDA $C50A
  ADC $C50C
  BCS sprite_vy_clamp_max_27
sprite_vy_store_27:
  STA $C50A
  JMP sprite_vy_done_27
sprite_vy_clamp_min_27:
  LDA #$00
  STA $C50A
  JMP sprite_vy_done_27
sprite_vy_clamp_max_27:
  LDA #$FF
  STA $C50A
sprite_vy_done_27:
  LDA $C509
  BMI sprite_x_clamp_min_28
  CMP #$00
  BCC sprite_x_clamp_min_28
  BNE sprite_x_min_ok_28
  LDA $C508
  CMP #$00
  BCS sprite_x_min_ok_28
sprite_x_clamp_min_28:
  LDA #$00
  STA $C508
  LDA #$00
  STA $C509
sprite_x_min_ok_28:
  LDA $C509
  CMP #$01
  BCC sprite_x_max_ok_28
  BNE sprite_x_clamp_max_28
  LDA $C508
  CMP #$FF
  BCC sprite_x_max_ok_28
  BEQ sprite_x_max_ok_28
sprite_x_clamp_max_28:
  LDA #$FF
  STA $C508
  LDA #$01
  STA $C509
sprite_x_max_ok_28:
  LDA $C50A
  CMP #$00
  BCS sprite_y_min_ok_28
  LDA #$00
  STA $C50A
sprite_y_min_ok_28:
  LDA $C50A
  CMP #$FF
  BCC sprite_y_max_ok_28
  BEQ sprite_y_max_ok_28
  LDA #$FF
  STA $C50A
sprite_y_max_ok_28:
sprite_update_inactive_1_24:
  JSR runtime_sprite_sync_1
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_30
  JMP control_if_else_29
joystick_current_pressed_30:
  LDA $C769
  AND #$10
  BNE condition_pass_30
  JMP control_if_else_29
condition_pass_30:
  LDA $C778
  CMP #$00
  BEQ condition_pass_32
  JMP control_if_else_31
condition_pass_32:
  LDA #$01
  STA $C779
  LDA #$07
  STA $D028
  JMP control_if_end_31
control_if_else_31:
control_if_end_31:
  LDA $C778
  CMP #$01
  BEQ condition_pass_34
  JMP control_if_else_33
condition_pass_34:
  LDA #$02
  STA $C779
  LDA #$03
  STA $D028
  JMP control_if_end_33
control_if_else_33:
control_if_end_33:
  LDA $C778
  CMP #$02
  BEQ condition_pass_36
  JMP control_if_else_35
condition_pass_36:
  LDA #$03
  STA $C77B
  JMP control_if_end_35
control_if_else_35:
control_if_end_35:
  JMP control_if_end_29
control_if_else_29:
control_if_end_29:
  RTS
; Scene gameOver: enter
game_scene_gameOver_enter:
  LDA #$00
  STA $C505
  JSR runtime_sprite_sync_0
  LDA #$00
  STA $C50D
  JSR runtime_sprite_sync_1
  RTS
; Shared VIC-II synchronization for sprite 0
runtime_sprite_sync_0:
  LDA $C505
  BNE sprite_runtime_active_0_37
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_40
sprite_runtime_active_0_37:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_38
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_39
sprite_runtime_xhigh_0_38:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_39:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_40:
  RTS
; Shared VIC-II synchronization for sprite 1
runtime_sprite_sync_1:
  LDA $C50D
  BNE sprite_runtime_active_1_41
  LDA $D015
  AND #$FD
  STA $D015
  JMP sprite_runtime_sync_done_1_44
sprite_runtime_active_1_41:
  LDA $D015
  ORA #$02
  STA $D015
  LDA $C508
  STA $D002
  LDA $C509
  AND #$01
  BNE sprite_runtime_xhigh_1_42
  LDA $D010
  AND #$FD
  STA $D010
  JMP sprite_runtime_xdone_1_43
sprite_runtime_xhigh_1_42:
  LDA $D010
  ORA #$02
  STA $D010
sprite_runtime_xdone_1_43:
  LDA $C50A
  STA $D003
sprite_runtime_sync_done_1_44:
  RTS
; Map 0: restore its embedded cells into runtime RAM
runtime_map_activate_0:
  LDA #$06
  LDX #<disk_filename_0
  LDY #>disk_filename_0
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_0_done
  LDA #$07
  LDX #<disk_filename_2
  LDY #>disk_filename_2
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_0_done
  LDA #$08
  LDX #<disk_filename_1
  LDY #>disk_filename_1
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_0_done
  LDA #$07
  LDX #<disk_filename_8
  LDY #>disk_filename_8
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_0_done
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
  JSR runtime_map_redraw_0
runtime_map_activate_0_done:
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
  ASL A
  ASL A
  ASL A
  STA $C7B5
  LDA #$00
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
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  DEC $C7B7
  JMP runtime_map_screen_y_loop_0
runtime_map_screen_y_done_0:
  LDA #$00
  STA $C7B9
  LDA $C7C2
  STA $C7B7
runtime_map_screen_x_loop_0:
  LDA $C7B7
  BEQ runtime_map_screen_x_done_0
  CLC
  LDA $C7B9
  ADC #$04
  STA $C7B9
  DEC $C7B7
  JMP runtime_map_screen_x_loop_0
runtime_map_screen_x_done_0:
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
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  CLC
  LDA $FB
  ADC #$28
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  CLC
  LDA $FD
  ADC #$28
  STA $FD
  LDA $FE
  ADC #$00
  STA $FE
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  RTS
; Dynamic map 0: redraw visible cells from runtime RAM
runtime_map_redraw_0:
  LDA #$00
  STA $C7B3
runtime_map_redraw_row_0:
  LDA #$00
  STA $C7B2
runtime_map_redraw_column_0:
  JSR runtime_map_draw_tile_0
  INC $C7B2
  LDA $C7B2
  CMP #$0A
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$0A
  BNE runtime_map_redraw_row_0
  RTS
; Map 1: restore its embedded cells into runtime RAM
runtime_map_activate_1:
  LDA #$06
  LDX #<disk_filename_3
  LDY #>disk_filename_3
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_1_done
  LDA #$07
  LDX #<disk_filename_4
  LDY #>disk_filename_4
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_1_done
  LDA #$08
  LDX #<disk_filename_1
  LDY #>disk_filename_1
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_1_done
  LDA #$07
  LDX #<disk_filename_9
  LDY #>disk_filename_9
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_1_done
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
  JSR runtime_map_redraw_1
runtime_map_activate_1_done:
  RTS
; Dynamic map 1: draw one changed metatile
runtime_map_draw_tile_1:
  LDA $C7B2
  STA $C7C2
  LDA $C7B3
  STA $C7C3
runtime_map_draw_tile_body_1:
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
  ASL A
  ASL A
  ASL A
  STA $C7B5
  LDA #$00
  STA $FB
  LDA #$04
  STA $FC
  LDA $C7C3
  STA $C7B7
runtime_map_screen_y_loop_1:
  LDA $C7B7
  BEQ runtime_map_screen_y_done_1
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  DEC $C7B7
  JMP runtime_map_screen_y_loop_1
runtime_map_screen_y_done_1:
  LDA #$00
  STA $C7B9
  LDA $C7C2
  STA $C7B7
runtime_map_screen_x_loop_1:
  LDA $C7B7
  BEQ runtime_map_screen_x_done_1
  CLC
  LDA $C7B9
  ADC #$04
  STA $C7B9
  DEC $C7B7
  JMP runtime_map_screen_x_loop_1
runtime_map_screen_x_done_1:
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
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  CLC
  LDA $FB
  ADC #$28
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  CLC
  LDA $FD
  ADC #$28
  STA $FD
  LDA $FE
  ADC #$00
  STA $FE
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  RTS
; Dynamic map 1: redraw visible cells from runtime RAM
runtime_map_redraw_1:
  LDA #$00
  STA $C7B3
runtime_map_redraw_row_1:
  LDA #$00
  STA $C7B2
runtime_map_redraw_column_1:
  JSR runtime_map_draw_tile_1
  INC $C7B2
  LDA $C7B2
  CMP #$0A
  BNE runtime_map_redraw_column_1
  INC $C7B3
  LDA $C7B3
  CMP #$0A
  BNE runtime_map_redraw_row_1
  RTS
; Map 2: restore its embedded cells into runtime RAM
runtime_map_activate_2:
  LDA #$06
  LDX #<disk_filename_5
  LDY #>disk_filename_5
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_2_done
  LDA #$07
  LDX #<disk_filename_6
  LDY #>disk_filename_6
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_2_done
  LDA #$08
  LDX #<disk_filename_1
  LDY #>disk_filename_1
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_2_done
  LDA #$07
  LDX #<disk_filename_10
  LDY #>disk_filename_10
  JSR runtime_disk_load_usr
  LDA $C77C
  BNE runtime_map_activate_2_done
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
  JSR runtime_map_redraw_2
runtime_map_activate_2_done:
  RTS
; Dynamic map 2: draw one changed metatile
runtime_map_draw_tile_2:
  LDA $C7B2
  STA $C7C2
  LDA $C7B3
  STA $C7C3
runtime_map_draw_tile_body_2:
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
  ASL A
  ASL A
  ASL A
  STA $C7B5
  LDA #$00
  STA $FB
  LDA #$04
  STA $FC
  LDA $C7C3
  STA $C7B7
runtime_map_screen_y_loop_2:
  LDA $C7B7
  BEQ runtime_map_screen_y_done_2
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  DEC $C7B7
  JMP runtime_map_screen_y_loop_2
runtime_map_screen_y_done_2:
  LDA #$00
  STA $C7B9
  LDA $C7C2
  STA $C7B7
runtime_map_screen_x_loop_2:
  LDA $C7B7
  BEQ runtime_map_screen_x_done_2
  CLC
  LDA $C7B9
  ADC #$04
  STA $C7B9
  DEC $C7B7
  JMP runtime_map_screen_x_loop_2
runtime_map_screen_x_done_2:
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
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  CLC
  LDA $FB
  ADC #$28
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  CLC
  LDA $FD
  ADC #$28
  STA $FD
  LDA $FE
  ADC #$00
  STA $FE
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3804,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA $3824,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3804,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA $3824,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3804,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA $3824,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3804,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA $3824,Y
  LDY #$03
  STA ($FD),Y
  RTS
; Dynamic map 2: redraw visible cells from runtime RAM
runtime_map_redraw_2:
  LDA #$00
  STA $C7B3
runtime_map_redraw_row_2:
  LDA #$00
  STA $C7B2
runtime_map_redraw_column_2:
  JSR runtime_map_draw_tile_2
  INC $C7B2
  LDA $C7B2
  CMP #$0A
  BNE runtime_map_redraw_column_2
  INC $C7B3
  LDA $C7B3
  CMP #$0A
  BNE runtime_map_redraw_row_2
  RTS
; Load one load-address PRG data module through the C64 KERNAL
runtime_disk_load_usr:
  JSR $FFBD
  LDA #$01
  LDX #$08
  LDY #$01
  JSR $FFBA
  PHP
  SEI
  LDA #$00
  LDX #$00
  LDY #$00
  JSR $FFD5
  BCS runtime_disk_load_error
  LDA #$00
  STA $C77C
  PLP
  RTS
runtime_disk_load_error:
  STA $C77C
  LDA #$02
  STA $D020
  LDA #$00
  STA $D021
  LDA $D018
  AND #$F1
  ORA #$04
  STA $D018
  LDA $D016
  AND #$EF
  STA $D016
  LDA #$04
  STA $0400
  LDA #$01
  STA $D800
  LDA #$09
  STA $0401
  LDA #$01
  STA $D801
  LDA #$13
  STA $0402
  LDA #$01
  STA $D802
  LDA #$0B
  STA $0403
  LDA #$01
  STA $D803
  LDA #$20
  STA $0404
  LDA #$01
  STA $D804
  LDA #$05
  STA $0405
  LDA #$01
  STA $D805
  LDA #$12
  STA $0406
  LDA #$01
  STA $D806
  LDA #$12
  STA $0407
  LDA #$01
  STA $D807
  LDA #$0F
  STA $0408
  LDA #$01
  STA $D808
  LDA #$12
  STA $0409
  LDA #$01
  STA $D809
  PLP
  RTS
; String pool
str_screen_0:
  .byte $0D, $15, $0C, $14, $09, $0C, $05, $16, $05, $0C, $20, $04, $36, $34, $00
str_screen_1:
  .byte $06, $09, $12, $05, $20, $10, $0F, $15, $12, $20, $03, $08, $01, $12, $07, $05, $12, $00
; User data
disk_filename_0:
  .byte $4C, $45, $56, $45, $4C, $30
disk_filename_1:
  .byte $43, $48, $41, $52, $53, $45, $54, $30
disk_filename_2:
  .byte $54, $41, $42, $4C, $45, $53, $30
disk_filename_3:
  .byte $4C, $45, $56, $45, $4C, $31
disk_filename_4:
  .byte $54, $41, $42, $4C, $45, $53, $31
disk_filename_5:
  .byte $4C, $45, $56, $45, $4C, $32
disk_filename_6:
  .byte $54, $41, $42, $4C, $45, $53, $32
disk_filename_7:
  .byte $53, $50, $52, $49, $54, $45, $30
disk_filename_8:
  .byte $53, $50, $52, $49, $54, $45, $31
disk_filename_9:
  .byte $53, $50, $52, $49, $54, $45, $32
disk_filename_10:
  .byte $53, $50, $52, $49, $54, $45, $33
