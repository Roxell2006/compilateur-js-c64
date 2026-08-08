  LDA #$FF
  STA $C778
  LDA #$FF
  STA $C779
  LDA #$FF
  STA $C77A
  LDA #$FF
  STA $C77B
  JSR runtime_map_activate_0
  JSR runtime_map_activate_1
  JSR runtime_map_activate_2
  LDX #$00
copydata_2000_sprite_frames_platformerActors_0_63_0:
  LDA sprite_frames_platformerActors_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_frames_platformerActors_0_63_0
  LDA #$00
  STA $203F
  LDX #$00
copydata_2040_sprite_frames_platformerActors_1_63_1:
  LDA sprite_frames_platformerActors_1,X
  STA $2040,X
  INX
  CPX #$3F
  BNE copydata_2040_sprite_frames_platformerActors_1_63_1
  LDA #$00
  STA $207F
  LDX #$00
copydata_2200_sprite_frames_platformerEnemy_0_63_2:
  LDA sprite_frames_platformerEnemy_0,X
  STA $2200,X
  INX
  CPX #$3F
  BNE copydata_2200_sprite_frames_platformerEnemy_0_63_2
  LDA #$00
  STA $223F
  LDX #$00
copydata_2200_sprite_frames_platformerCoin_0_63_3:
  LDA sprite_frames_platformerCoin_0,X
  STA $2200,X
  INX
  CPX #$3F
  BNE copydata_2200_sprite_frames_platformerCoin_0_63_3
  LDA #$00
  STA $223F
  LDX #$00
copydata_2200_sprite_frames_levelPortal_0_63_4:
  LDA sprite_frames_levelPortal_0,X
  STA $2200,X
  INX
  CPX #$3F
  BNE copydata_2200_sprite_frames_levelPortal_0_63_4
  LDA #$00
  STA $223F
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
  BNE map_activation_requested_7
  JMP map_activation_done_5
map_activation_requested_7:
  CMP $C778
  BEQ map_activation_clear_6
  LDA $C779
  CMP #$00
  BNE map_activation_next_0_8
  JSR runtime_map_activate_0
  LDA #$00
  STA $C778
  JMP map_activation_clear_6
map_activation_next_0_8:
  LDA $C779
  CMP #$01
  BNE map_activation_next_1_9
  JSR runtime_map_activate_1
  LDA #$01
  STA $C778
  JMP map_activation_clear_6
map_activation_next_1_9:
  LDA $C779
  CMP #$02
  BNE map_activation_next_2_10
  JSR runtime_map_activate_2
  LDA #$02
  STA $C778
  JMP map_activation_clear_6
map_activation_next_2_10:
map_activation_clear_6:
  LDA #$FF
  STA $C779
map_activation_done_5:
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
  BNE game_frame_counter_done_11
  INC $C76B
game_frame_counter_done_11:
  JSR game_scene_update_dispatch
  JSR game_scene_apply_transition
  LDA $C779
  CMP #$FF
  BNE map_activation_requested_14
  JMP map_activation_done_12
map_activation_requested_14:
  CMP $C778
  BEQ map_activation_clear_13
  LDA $C779
  CMP #$00
  BNE map_activation_next_0_15
  JSR runtime_map_activate_0
  LDA #$00
  STA $C778
  JMP map_activation_clear_13
map_activation_next_0_15:
  LDA $C779
  CMP #$01
  BNE map_activation_next_1_16
  JSR runtime_map_activate_1
  LDA #$01
  STA $C778
  JMP map_activation_clear_13
map_activation_next_1_16:
  LDA $C779
  CMP #$02
  BNE map_activation_next_2_17
  JSR runtime_map_activate_2
  LDA #$02
  STA $C778
  JMP map_activation_clear_13
map_activation_next_2_17:
map_activation_clear_13:
  LDA #$FF
  STA $C779
map_activation_done_12:
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
printat_loop_18:
  LDA str_screen_0,X
  BEQ printat_done_19
  STA $059D,X
  LDA #$01
  STA $D99D,X
  INX
  BNE printat_loop_18
printat_done_19:
  LDX #$00
printat_loop_20:
  LDA str_screen_1,X
  BEQ printat_done_21
  STA $0613,X
  LDA #$01
  STA $DA13,X
  INX
  BNE printat_loop_20
printat_done_21:
  RTS
; Scene title: update
game_scene_title_update:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_23
  JMP control_if_else_22
joystick_current_pressed_23:
  LDA $C769
  AND #$10
  BNE condition_pass_23
  JMP control_if_else_22
condition_pass_23:
  LDA #$01
  STA $C77B
  JMP control_if_end_22
control_if_else_22:
control_if_end_22:
  RTS
; Scene game: enter
game_scene_game_enter:
  LDA #$00
  STA $C779
  RTS
; Scene game: update
game_scene_game_update:
  LDA $C505
  BNE sprite_update_active_0_25
  JMP sprite_update_inactive_0_24
sprite_update_active_0_25:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_26
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_26
sprite_vx_positive_26:
  LDA $C501
  ADC #$00
sprite_vx_done_26:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_27
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_27
  JMP sprite_vy_store_27
sprite_vy_positive_27:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_27
sprite_vy_store_27:
  STA $C502
  JMP sprite_vy_done_27
sprite_vy_clamp_min_27:
  LDA #$00
  STA $C502
  JMP sprite_vy_done_27
sprite_vy_clamp_max_27:
  LDA #$FF
  STA $C502
sprite_vy_done_27:
  LDA $C501
  BMI sprite_x_clamp_min_28
  CMP #$00
  BCC sprite_x_clamp_min_28
  BNE sprite_x_min_ok_28
  LDA $C500
  CMP #$00
  BCS sprite_x_min_ok_28
sprite_x_clamp_min_28:
  LDA #$00
  STA $C500
  LDA #$00
  STA $C501
sprite_x_min_ok_28:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_28
  BNE sprite_x_clamp_max_28
  LDA $C500
  CMP #$FF
  BCC sprite_x_max_ok_28
  BEQ sprite_x_max_ok_28
sprite_x_clamp_max_28:
  LDA #$FF
  STA $C500
  LDA #$01
  STA $C501
sprite_x_max_ok_28:
  LDA $C502
  CMP #$00
  BCS sprite_y_min_ok_28
  LDA #$00
  STA $C502
sprite_y_min_ok_28:
  LDA $C502
  CMP #$FF
  BCC sprite_y_max_ok_28
  BEQ sprite_y_max_ok_28
  LDA #$FF
  STA $C502
sprite_y_max_ok_28:
sprite_update_inactive_0_24:
  JSR runtime_sprite_sync_0
  LDA $C50D
  BNE sprite_update_active_1_30
  JMP sprite_update_inactive_1_29
sprite_update_active_1_30:
  CLC
  LDA $C508
  ADC $C50B
  STA $C508
  LDA $C50B
  BPL sprite_vx_positive_31
  LDA $C509
  ADC #$FF
  JMP sprite_vx_done_31
sprite_vx_positive_31:
  LDA $C509
  ADC #$00
sprite_vx_done_31:
  STA $C509
  LDA $C50C
  BPL sprite_vy_positive_32
  CLC
  LDA $C50A
  ADC $C50C
  BCC sprite_vy_clamp_min_32
  JMP sprite_vy_store_32
sprite_vy_positive_32:
  CLC
  LDA $C50A
  ADC $C50C
  BCS sprite_vy_clamp_max_32
sprite_vy_store_32:
  STA $C50A
  JMP sprite_vy_done_32
sprite_vy_clamp_min_32:
  LDA #$00
  STA $C50A
  JMP sprite_vy_done_32
sprite_vy_clamp_max_32:
  LDA #$FF
  STA $C50A
sprite_vy_done_32:
  LDA $C509
  BMI sprite_x_clamp_min_33
  CMP #$00
  BCC sprite_x_clamp_min_33
  BNE sprite_x_min_ok_33
  LDA $C508
  CMP #$00
  BCS sprite_x_min_ok_33
sprite_x_clamp_min_33:
  LDA #$00
  STA $C508
  LDA #$00
  STA $C509
sprite_x_min_ok_33:
  LDA $C509
  CMP #$01
  BCC sprite_x_max_ok_33
  BNE sprite_x_clamp_max_33
  LDA $C508
  CMP #$FF
  BCC sprite_x_max_ok_33
  BEQ sprite_x_max_ok_33
sprite_x_clamp_max_33:
  LDA #$FF
  STA $C508
  LDA #$01
  STA $C509
sprite_x_max_ok_33:
  LDA $C50A
  CMP #$00
  BCS sprite_y_min_ok_33
  LDA #$00
  STA $C50A
sprite_y_min_ok_33:
  LDA $C50A
  CMP #$FF
  BCC sprite_y_max_ok_33
  BEQ sprite_y_max_ok_33
  LDA #$FF
  STA $C50A
sprite_y_max_ok_33:
sprite_update_inactive_1_29:
  JSR runtime_sprite_sync_1
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_35
  JMP control_if_else_34
joystick_current_pressed_35:
  LDA $C769
  AND #$10
  BNE condition_pass_35
  JMP control_if_else_34
condition_pass_35:
  LDA $C778
  CMP #$00
  BEQ condition_pass_37
  JMP control_if_else_36
condition_pass_37:
  LDA #$01
  STA $C779
  LDA #$07
  STA $D028
  JMP control_if_end_36
control_if_else_36:
control_if_end_36:
  LDA $C778
  CMP #$01
  BEQ condition_pass_39
  JMP control_if_else_38
condition_pass_39:
  LDA #$02
  STA $C779
  LDA #$03
  STA $D028
  JMP control_if_end_38
control_if_else_38:
control_if_end_38:
  LDA $C778
  CMP #$02
  BEQ condition_pass_41
  JMP control_if_else_40
condition_pass_41:
  LDA #$03
  STA $C77B
  JMP control_if_end_40
control_if_else_40:
control_if_end_40:
  JMP control_if_end_34
control_if_else_34:
control_if_end_34:
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
  BNE sprite_runtime_active_0_42
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_45
sprite_runtime_active_0_42:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_43
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_44
sprite_runtime_xhigh_0_43:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_44:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_45:
  RTS
; Shared VIC-II synchronization for sprite 1
runtime_sprite_sync_1:
  LDA $C50D
  BNE sprite_runtime_active_1_46
  LDA $D015
  AND #$FD
  STA $D015
  JMP sprite_runtime_sync_done_1_49
sprite_runtime_active_1_46:
  LDA $D015
  ORA #$02
  STA $D015
  LDA $C508
  STA $D002
  LDA $C509
  AND #$01
  BNE sprite_runtime_xhigh_1_47
  LDA $D010
  AND #$FD
  STA $D010
  JMP sprite_runtime_xdone_1_48
sprite_runtime_xhigh_1_47:
  LDA $D010
  ORA #$02
  STA $D010
sprite_runtime_xdone_1_48:
  LDA $C50A
  STA $D003
sprite_runtime_sync_done_1_49:
  RTS
; Map 0: restore its embedded cells into runtime RAM
runtime_map_activate_0:
  LDX #$00
  LDY #$00
asset_map_initial_rle_4:
  LDA asset_rle_3,X
  STA $C777
  INX
  LDA asset_rle_3,X
  INX
asset_map_initial_rle_4_repeat:
  STA $8000,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_4_repeat
  CPX #$18
  BNE asset_map_initial_rle_4
  PHP
  SEI
  LDA $01
  PHA
  AND #$FB
  STA $01
  LDX #$00
charset_rom_copy_50:
  LDA $D000,X
  STA $3000,X
  LDA $D100,X
  STA $3100,X
  INX
  BNE charset_rom_copy_50
  PLA
  STA $01
  PLP
  LDX #$00
asset_charset_copy_6:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  CPX #$20
  BNE asset_charset_copy_6
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
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_chars_0,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_colors_0,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_chars_0,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_colors_0,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_chars_0,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_colors_0,Y
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
  LDA asset_map_chars_0,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA asset_map_colors_0,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_chars_0,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_colors_0,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_chars_0,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_colors_0,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_chars_0,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_colors_0,Y
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
  LDX #$00
  LDY #$00
asset_map_initial_rle_8:
  LDA asset_rle_7,X
  STA $C777
  INX
  LDA asset_rle_7,X
  INX
asset_map_initial_rle_8_repeat:
  STA $8064,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_8_repeat
  CPX #$24
  BNE asset_map_initial_rle_8
  PHP
  SEI
  LDA $01
  PHA
  AND #$FB
  STA $01
  LDX #$00
charset_rom_copy_51:
  LDA $D000,X
  STA $3000,X
  LDA $D100,X
  STA $3100,X
  INX
  BNE charset_rom_copy_51
  PLA
  STA $01
  PLP
  LDX #$00
asset_charset_copy_9:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  CPX #$20
  BNE asset_charset_copy_9
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
  ADC #$64
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
  LDA asset_map_chars_1,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA asset_map_colors_1,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_chars_1,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_colors_1,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_chars_1,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_colors_1,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_chars_1,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_colors_1,Y
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
  LDA asset_map_chars_1,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA asset_map_colors_1,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_chars_1,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_colors_1,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_chars_1,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_colors_1,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_chars_1,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_colors_1,Y
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
  LDX #$00
  LDY #$00
asset_map_initial_rle_11:
  LDA asset_rle_10,X
  STA $C777
  INX
  LDA asset_rle_10,X
  INX
asset_map_initial_rle_11_repeat:
  STA $80C8,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_11_repeat
  CPX #$34
  BNE asset_map_initial_rle_11
  PHP
  SEI
  LDA $01
  PHA
  AND #$FB
  STA $01
  LDX #$00
charset_rom_copy_52:
  LDA $D000,X
  STA $3000,X
  LDA $D100,X
  STA $3100,X
  INX
  BNE charset_rom_copy_52
  PLA
  STA $01
  PLP
  LDX #$00
asset_charset_copy_12:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  CPX #$20
  BNE asset_charset_copy_12
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
  ADC #$C8
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
  LDA asset_map_chars_2,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$00
  TAY
  LDA asset_map_colors_2,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_chars_2,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_colors_2,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_chars_2,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_colors_2,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_chars_2,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_colors_2,Y
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
  LDA asset_map_chars_2,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$04
  TAY
  LDA asset_map_colors_2,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_chars_2,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$05
  TAY
  LDA asset_map_colors_2,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_chars_2,Y
  LDY #$02
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$06
  TAY
  LDA asset_map_colors_2,Y
  LDY #$02
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_chars_2,Y
  LDY #$03
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$07
  TAY
  LDA asset_map_colors_2,Y
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
; String pool
str_screen_0:
  .byte $0D, $15, $0C, $14, $09, $0C, $05, $16, $05, $0C, $20, $04, $36, $34, $00
str_screen_1:
  .byte $06, $09, $12, $05, $20, $10, $0F, $15, $12, $20, $03, $08, $01, $12, $07, $05, $12, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $01, $00
asset_map_chars_0:
  .byte $40, $40, $40, $40, $40, $40, $40, $40, $41, $41, $41, $41, $41, $41, $41, $41, $42, $42, $42, $42, $42, $42, $42, $42, $40, $43, $43, $40, $40, $43, $43, $40
asset_map_colors_0:
  .byte $06, $06, $06, $06, $06, $06, $06, $06, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $07, $07, $07, $07, $07, $07, $07, $07, $06, $01, $01, $06, $06, $01, $01, $06
asset_map_collisions_1:
  .byte $00, $01, $01, $00
asset_map_chars_1:
  .byte $40, $40, $40, $40, $40, $40, $40, $40, $41, $41, $41, $41, $41, $41, $41, $41, $42, $42, $42, $42, $42, $42, $42, $42, $40, $43, $43, $40, $40, $43, $43, $40
asset_map_colors_1:
  .byte $06, $06, $06, $06, $06, $06, $06, $06, $05, $05, $05, $05, $05, $05, $05, $05, $0D, $0D, $0D, $0D, $0D, $0D, $0D, $0D, $06, $07, $07, $06, $06, $07, $07, $06
asset_map_collisions_2:
  .byte $00, $01, $01, $00
asset_map_chars_2:
  .byte $40, $40, $40, $40, $40, $40, $40, $40, $41, $41, $41, $41, $41, $41, $41, $41, $42, $42, $42, $42, $42, $42, $42, $42, $40, $43, $43, $40, $40, $43, $43, $40
asset_map_colors_2:
  .byte $06, $06, $06, $06, $06, $06, $06, $06, $02, $02, $02, $02, $02, $02, $02, $02, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $06, $03, $03, $06, $06, $03, $03, $06
sprite_frames_platformerActors_0:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $0C, $00, $30, $18, $00, $18, $30, $00, $0C, $60, $00, $06
sprite_frames_platformerActors_1:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $18, $00, $18, $30, $00, $0C, $60, $00, $06, $30, $00, $0C
sprite_frames_platformerEnemy_0:
  .byte $00, $00, $00, $00, $7E, $00, $01, $FF, $80, $03, $FF, $C0, $07, $E7, $E0, $07, $E7, $E0, $07, $FF, $E0, $07, $7E, $E0, $07, $FF, $E0, $03, $FF, $C0, $01, $FF, $80, $00, $FF, $00, $01, $BD, $80, $03, $18, $C0, $06, $18, $60, $0C, $18, $30, $18, $18, $18, $30, $18, $0C, $60, $18, $06, $60, $00, $06, $00, $00, $00
sprite_frames_platformerCoin_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $66, $00, $00, $66, $00, $00, $66, $00, $00, $66, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_frames_levelPortal_0:
  .byte $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00, $00, $7E, $00
asset_rle_3:
  .byte $0E, $00, $01, $03, $11, $00, $02, $02, $0C, $00, $02, $02, $0D, $00, $02, $02, $04, $00, $02, $02, $0B, $00, $14, $01
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $BD, $81, $FF, $00, $FF, $FF, $81, $81, $81, $81, $FF, $FF, $00, $18, $3C, $7E, $7E, $3C, $18, $00
asset_rle_7:
  .byte $0C, $00, $01, $03, $04, $00, $01, $03, $10, $00, $02, $02, $05, $00, $02, $02, $04, $00, $02, $02, $0B, $00, $02, $02, $02, $00, $02, $02, $02, $00, $02, $02, $0A, $00, $14, $01
asset_rle_10:
  .byte $0B, $00, $01, $03, $02, $00, $01, $03, $02, $00, $01, $03, $0D, $00, $01, $02, $01, $00, $01, $02, $01, $00, $01, $02, $01, $00, $01, $02, $0E, $00, $02, $02, $02, $00, $02, $02, $02, $00, $01, $02, $03, $00, $02, $02, $03, $00, $01, $02, $0A, $00, $14, $01
