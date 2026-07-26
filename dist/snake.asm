  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $8000,X
  INX
  BNE asset_map_initial_copy_2
  LDX #$00
asset_map_initial_copy_4:
  LDA asset_bytes_3,X
  STA $8100,X
  INX
  CPX #$2C
  BNE asset_map_initial_copy_4
  LDA #$0A
  STA $C100
  LDA #$07
  STA $C101
  LDA #$0A
  STA $C102
  LDA #$07
  STA $C103
  LDA #$00
  STA $C104
  LDA #$00
  STA $C105
  LDA #$0A
  STA $C106
  LDA #$07
  STA $C107
  LDA #$01
  STA $C108
  LDA #$00
  STA $C109
  LDA #$00
  STA $C10A
  LDA #$01
  STA $C10B
  LDA #$0E
  STA $C10C
  LDA #$06
  STA $C10D
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDX #$00
asset_charset_copy_6:
  LDA asset_bytes_5,X
  STA $3000,X
  INX
  BNE asset_charset_copy_6
  LDX #$00
asset_charset_copy_8:
  LDA asset_bytes_7,X
  STA $3100,X
  INX
  BNE asset_charset_copy_8
  LDX #$00
asset_charset_copy_9:
  LDA asset_bytes_7,X
  STA $3200,X
  INX
  BNE asset_charset_copy_9
  LDX #$00
asset_charset_copy_10:
  LDA asset_bytes_7,X
  STA $3300,X
  INX
  BNE asset_charset_copy_10
  LDX #$00
asset_charset_copy_11:
  LDA asset_bytes_7,X
  STA $3400,X
  INX
  BNE asset_charset_copy_11
  LDX #$00
asset_charset_copy_12:
  LDA asset_bytes_7,X
  STA $3500,X
  INX
  BNE asset_charset_copy_12
  LDX #$00
asset_charset_copy_13:
  LDA asset_bytes_7,X
  STA $3600,X
  INX
  BNE asset_charset_copy_13
  LDX #$00
asset_charset_copy_14:
  LDA asset_bytes_7,X
  STA $3700,X
  INX
  BNE asset_charset_copy_14
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
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $04B7,X
  LDA #$01
  STA $D8B7,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0507,X
  LDA #$01
  STA $D907,X
  INX
  BNE printat_loop_2
printat_done_3:
  JSR runtime_map_redraw_0
  LDA #$0A
  CMP #$14
  BCC map_x_ok_4
  JMP map_set_done_4
map_x_ok_4:
  STA $C7B2
  LDA #$07
  CMP #$0F
  BCC map_y_ok_4
  JMP map_set_done_4
map_y_ok_4:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_4
  JMP map_set_done_4
map_value_ok_4:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_4:
  LDA $C7B7
  BEQ map_index_done_4
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_4
map_index_done_4:
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_4:
  LDA #$0E
  CMP #$14
  BCC map_x_ok_5
  JMP map_set_done_5
map_x_ok_5:
  STA $C7B2
  LDA #$06
  CMP #$0F
  BCC map_y_ok_5
  JMP map_set_done_5
map_y_ok_5:
  STA $C7B3
  LDA #$02
  CMP #$04
  BCC map_value_ok_5
  JMP map_set_done_5
map_value_ok_5:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_5:
  LDA $C7B7
  BEQ map_index_done_5
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_5
map_index_done_5:
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_5:
  LDX #$00
  LDA $C100
  STA snake_body_x,X
  LDX #$00
  LDA $C101
  STA snake_body_y,X
  JMP user_routine_snake_spawn_food_after
user_routine_snake_spawn_food:
  LDA #$00
  STA $C10B
  LDA #$EA
  STA $C10E
control_while_6:
  LDA $C10E
  BNE control_while_body_6
  JMP control_while_done_6
control_while_body_6:
  LDA $C10B
  CMP #$00
  BEQ condition_pass_7
  JMP control_while_done_6
condition_pass_7:
  INC $C10C
  LDA $C10C
  CMP #$13
  BCS condition_pass_9
  JMP control_if_else_8
condition_pass_9:
  LDA #$01
  STA $C10C
  INC $C10D
  LDA $C10D
  CMP #$0E
  BCS condition_pass_11
  JMP control_if_else_10
condition_pass_11:
  LDA #$01
  STA $C10D
  JMP control_if_end_10
control_if_else_10:
control_if_end_10:
  JMP control_if_end_8
control_if_else_8:
control_if_end_8:
  LDA $C10C
  CMP #$14
  BCC map_x_ok_13
  JMP control_if_else_12
map_x_ok_13:
  STA $C7B2
  LDA $C10D
  CMP #$0F
  BCC map_y_ok_13
  JMP control_if_else_12
map_y_ok_13:
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_13:
  LDA $C7B7
  BEQ map_index_done_13
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_13
map_index_done_13:
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
  CMP #$00
  BEQ condition_pass_13
  JMP control_if_else_12
condition_pass_13:
  LDA $C10C
  CMP #$14
  BCC map_x_ok_14
  JMP map_set_done_14
map_x_ok_14:
  STA $C7B2
  LDA $C10D
  CMP #$0F
  BCC map_y_ok_14
  JMP map_set_done_14
map_y_ok_14:
  STA $C7B3
  LDA #$02
  CMP #$04
  BCC map_value_ok_14
  JMP map_set_done_14
map_value_ok_14:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_14:
  LDA $C7B7
  BEQ map_index_done_14
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_14
map_index_done_14:
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_14:
  LDA #$01
  STA $C10B
  JMP control_if_end_12
control_if_else_12:
control_if_end_12:
  DEC $C10E
  JMP control_while_6
control_while_done_6:
  RTS
user_routine_snake_spawn_food_after:
  JMP user_routine_snake_step_after
user_routine_snake_step:
  LDA $C100
  STA $C102
  LDA $C101
  STA $C103
  LDA $C108
  CMP #$00
  BEQ condition_pass_16
  JMP control_if_else_15
condition_pass_16:
  DEC $C103
  JMP control_if_end_15
control_if_else_15:
control_if_end_15:
  LDA $C108
  CMP #$01
  BEQ condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  INC $C102
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
  LDA $C108
  CMP #$02
  BEQ condition_pass_20
  JMP control_if_else_19
condition_pass_20:
  INC $C103
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  LDA $C108
  CMP #$03
  BEQ condition_pass_22
  JMP control_if_else_21
condition_pass_22:
  DEC $C102
  JMP control_if_end_21
control_if_else_21:
control_if_end_21:
  LDA $C102
  CMP #$14
  BCC map_x_ok_24
  JMP control_if_else_23
map_x_ok_24:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_24
  JMP control_if_else_23
map_y_ok_24:
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_24:
  LDA $C7B7
  BEQ map_index_done_24
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_24
map_index_done_24:
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
  CMP #$00
  BEQ condition_pass_24
  JMP control_if_else_23
condition_pass_24:
  LDA #$00
  STA $C109
  JMP control_if_end_23
control_if_else_23:
  LDA $C102
  CMP #$14
  BCC map_x_ok_26
  JMP control_if_else_25
map_x_ok_26:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_26
  JMP control_if_else_25
map_y_ok_26:
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_26:
  LDA $C7B7
  BEQ map_index_done_26
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_26
map_index_done_26:
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
  CMP #$02
  BEQ condition_pass_26
  JMP control_if_else_25
condition_pass_26:
  LDA #$01
  STA $C109
  JMP control_if_end_25
control_if_else_25:
  LDA #$01
  STA $C10A
control_if_end_25:
control_if_end_23:
  LDA $C10A
  CMP #$00
  BEQ condition_pass_28
  JMP control_if_else_27
condition_pass_28:
  LDA $C109
  CMP #$00
  BEQ condition_pass_30
  JMP control_if_else_29
condition_pass_30:
  LDX $C105
  LDA snake_body_x,X
  STA $C106
  LDX $C105
  LDA snake_body_y,X
  STA $C107
  LDA $C106
  CMP #$14
  BCC map_x_ok_31
  JMP map_set_done_31
map_x_ok_31:
  STA $C7B2
  LDA $C107
  CMP #$0F
  BCC map_y_ok_31
  JMP map_set_done_31
map_y_ok_31:
  STA $C7B3
  LDA #$00
  CMP #$04
  BCC map_value_ok_31
  JMP map_set_done_31
map_value_ok_31:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_31:
  LDA $C7B7
  BEQ map_index_done_31
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_31
map_index_done_31:
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_31:
  INC $C105
  LDA $C105
  AND #$3F
  STA $C105
  JMP control_if_end_29
control_if_else_29:
  LDA #$0F
  STA $D418
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
  JSR user_routine_snake_spawn_food
control_if_end_29:
  INC $C104
  LDA $C104
  AND #$3F
  STA $C104
  LDA $C102
  STA $C100
  LDA $C103
  STA $C101
  LDX $C104
  LDA $C100
  STA snake_body_x,X
  LDX $C104
  LDA $C101
  STA snake_body_y,X
  LDA $C100
  CMP #$14
  BCC map_x_ok_32
  JMP map_set_done_32
map_x_ok_32:
  STA $C7B2
  LDA $C101
  CMP #$0F
  BCC map_y_ok_32
  JMP map_set_done_32
map_y_ok_32:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_32
  JMP map_set_done_32
map_value_ok_32:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_32:
  LDA $C7B7
  BEQ map_index_done_32
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_32
map_index_done_32:
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_32:
  JMP control_if_end_27
control_if_else_27:
  LDA #$02
  STA $D020
control_if_end_27:
  RTS
user_routine_snake_step_after:
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
  STA $C10F
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
  BNE game_frame_counter_done_33
  INC $C76B
game_frame_counter_done_33:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_35
  JMP control_if_else_34
joystick_current_pressed_35:
  LDA $C769
  AND #$01
  BNE condition_pass_35
  JMP control_if_else_34
condition_pass_35:
  LDA #$00
  STA $C108
  JMP control_if_end_34
control_if_else_34:
control_if_end_34:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_37
  JMP control_if_else_36
joystick_current_pressed_37:
  LDA $C769
  AND #$08
  BNE condition_pass_37
  JMP control_if_else_36
condition_pass_37:
  LDA #$01
  STA $C108
  JMP control_if_end_36
control_if_else_36:
control_if_end_36:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_39
  JMP control_if_else_38
joystick_current_pressed_39:
  LDA $C769
  AND #$02
  BNE condition_pass_39
  JMP control_if_else_38
condition_pass_39:
  LDA #$02
  STA $C108
  JMP control_if_end_38
control_if_else_38:
control_if_end_38:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_41
  JMP control_if_else_40
joystick_current_pressed_41:
  LDA $C769
  AND #$04
  BNE condition_pass_41
  JMP control_if_else_40
condition_pass_41:
  LDA #$03
  STA $C108
  JMP control_if_end_40
control_if_else_40:
control_if_end_40:
  LDA $C10A
  CMP #$00
  BEQ condition_pass_43
  JMP control_if_else_42
condition_pass_43:
  INC $C10F
  LDA $C10F
  CMP #$06
  BCS game_every_run_44
  JMP game_every_done_45
game_every_run_44:
  LDA #$00
  STA $C10F
  JSR user_routine_snake_step
game_every_done_45:
  JMP control_if_end_42
control_if_else_42:
control_if_end_42:
  JMP game_frame_loop
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
map_index_rows_renderer_0:
  LDA $C7B7
  BEQ map_index_done_renderer_0
  CLC
  LDA $C7B6
  ADC #$14
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  DEC $C7B7
  JMP map_index_rows_renderer_0
map_index_done_renderer_0:
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
  LDA #$A1
  STA $FB
  LDA #$04
  STA $FC
  LDA $C7B3
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
  LDA $C7B2
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
; Dynamic map 0: redraw every cell from runtime RAM
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
  CMP #$14
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$0F
  BNE runtime_map_redraw_row_0
  RTS
; String pool
str_screen_0:
  .byte $13, $0E, $01, $0B, $05, $20, $16, $30, $2E, $39, $00
str_screen_1:
  .byte $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $32, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $00, $02
asset_map_chars_0:
  .byte $00, $01, $02, $03
asset_map_colors_0:
  .byte $00, $0E, $07, $05
asset_bytes_1:
  .byte $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_3:
  .byte $00, $00, $00, $01, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
snake_body_x:
  .byte $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A
snake_body_y:
  .byte $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $A5, $BD, $81, $FF, $18, $3C, $7E, $FF, $FF, $7E, $3C, $18, $3C, $7E, $FF, $FF, $FF, $FF, $7E, $3C, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_7:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
