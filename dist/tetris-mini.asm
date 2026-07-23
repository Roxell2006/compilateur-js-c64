  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $C600,X
  INX
  CPX #$C8
  BNE asset_map_initial_copy_2
  LDA #$03
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
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
  LDA #$00
  STA $C10B
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10D
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$25
  STA $C111
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDX #$00
asset_charset_copy_4:
  LDA asset_bytes_3,X
  STA $3000,X
  INX
  BNE asset_charset_copy_4
  LDX #$00
asset_charset_copy_6:
  LDA asset_bytes_5,X
  STA $3100,X
  INX
  BNE asset_charset_copy_6
  LDX #$00
asset_charset_copy_7:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  BNE asset_charset_copy_7
  LDX #$00
asset_charset_copy_8:
  LDA asset_bytes_5,X
  STA $3300,X
  INX
  BNE asset_charset_copy_8
  LDX #$00
asset_charset_copy_9:
  LDA asset_bytes_5,X
  STA $3400,X
  INX
  BNE asset_charset_copy_9
  LDX #$00
asset_charset_copy_10:
  LDA asset_bytes_5,X
  STA $3500,X
  INX
  BNE asset_charset_copy_10
  LDX #$00
asset_charset_copy_11:
  LDA asset_bytes_5,X
  STA $3600,X
  INX
  BNE asset_charset_copy_11
  LDX #$00
asset_charset_copy_12:
  LDA asset_bytes_5,X
  STA $3700,X
  INX
  BNE asset_charset_copy_12
  LDA $DD00
  AND #$FC
  ORA #$03
  STA $DD00
  LDA $D018
  AND #$F1
  ORA #$0C
  STA $D018
  LDA #$03
  LDX #$00
memset_45e_3_12:
  STA $045E,X
  INX
  CPX #$0C
  BNE memset_45e_3_12
  LDA #$01
  LDX #$00
memset_d85e_1_12:
  STA $D85E,X
  INX
  CPX #$0C
  BNE memset_d85e_1_12
  LDA #$03
  LDX #$00
memset_7a6_3_12:
  STA $07A6,X
  INX
  CPX #$0C
  BNE memset_7a6_3_12
  LDA #$01
  LDX #$00
memset_dba6_1_12:
  STA $DBA6,X
  INX
  CPX #$0C
  BNE memset_dba6_1_12
  LDA #$03
  STA $0486
  LDA #$01
  STA $D886
  LDA #$03
  STA $0491
  LDA #$01
  STA $D891
  LDA #$03
  STA $04AE
  LDA #$01
  STA $D8AE
  LDA #$03
  STA $04B9
  LDA #$01
  STA $D8B9
  LDA #$03
  STA $04D6
  LDA #$01
  STA $D8D6
  LDA #$03
  STA $04E1
  LDA #$01
  STA $D8E1
  LDA #$03
  STA $04FE
  LDA #$01
  STA $D8FE
  LDA #$03
  STA $0509
  LDA #$01
  STA $D909
  LDA #$03
  STA $0526
  LDA #$01
  STA $D926
  LDA #$03
  STA $0531
  LDA #$01
  STA $D931
  LDA #$03
  STA $054E
  LDA #$01
  STA $D94E
  LDA #$03
  STA $0559
  LDA #$01
  STA $D959
  LDA #$03
  STA $0576
  LDA #$01
  STA $D976
  LDA #$03
  STA $0581
  LDA #$01
  STA $D981
  LDA #$03
  STA $059E
  LDA #$01
  STA $D99E
  LDA #$03
  STA $05A9
  LDA #$01
  STA $D9A9
  LDA #$03
  STA $05C6
  LDA #$01
  STA $D9C6
  LDA #$03
  STA $05D1
  LDA #$01
  STA $D9D1
  LDA #$03
  STA $05EE
  LDA #$01
  STA $D9EE
  LDA #$03
  STA $05F9
  LDA #$01
  STA $D9F9
  LDA #$03
  STA $0616
  LDA #$01
  STA $DA16
  LDA #$03
  STA $0621
  LDA #$01
  STA $DA21
  LDA #$03
  STA $063E
  LDA #$01
  STA $DA3E
  LDA #$03
  STA $0649
  LDA #$01
  STA $DA49
  LDA #$03
  STA $0666
  LDA #$01
  STA $DA66
  LDA #$03
  STA $0671
  LDA #$01
  STA $DA71
  LDA #$03
  STA $068E
  LDA #$01
  STA $DA8E
  LDA #$03
  STA $0699
  LDA #$01
  STA $DA99
  LDA #$03
  STA $06B6
  LDA #$01
  STA $DAB6
  LDA #$03
  STA $06C1
  LDA #$01
  STA $DAC1
  LDA #$03
  STA $06DE
  LDA #$01
  STA $DADE
  LDA #$03
  STA $06E9
  LDA #$01
  STA $DAE9
  LDA #$03
  STA $0706
  LDA #$01
  STA $DB06
  LDA #$03
  STA $0711
  LDA #$01
  STA $DB11
  LDA #$03
  STA $072E
  LDA #$01
  STA $DB2E
  LDA #$03
  STA $0739
  LDA #$01
  STA $DB39
  LDA #$03
  STA $0756
  LDA #$01
  STA $DB56
  LDA #$03
  STA $0761
  LDA #$01
  STA $DB61
  LDA #$03
  STA $077E
  LDA #$01
  STA $DB7E
  LDA #$03
  STA $0789
  LDA #$01
  STA $DB89
  JSR runtime_map_redraw_0
  JSR user_routine_spawn_piece
  JMP user_routine_prepare_cell_after
user_routine_prepare_cell:
  LDA $C108
  STA $C10A
  LDA $C10A
  CLC
  ADC $C109
  STA $C10A
  LDX $C10A
  LDA tetris_shape_x,X
  STA $C10B
  LDX $C10A
  LDA tetris_shape_y,X
  STA $C10C
  LDA $C106
  STA $C10D
  LDA $C10D
  CLC
  ADC $C10B
  STA $C10D
  LDA $C107
  STA $C10E
  LDA $C10E
  CLC
  ADC $C10C
  STA $C10E
  RTS
user_routine_prepare_cell_after:
  JMP user_routine_use_current_piece_after
user_routine_use_current_piece:
  LDA $C100
  STA $C106
  LDA $C101
  STA $C107
  LDA $C102
  STA $C108
  RTS
user_routine_use_current_piece_after:
  JMP user_routine_clear_piece_after
user_routine_clear_piece:
  JSR user_routine_use_current_piece
  LDA #$00
  STA $C109
  LDA #$04
  STA $C112
control_repeat_0:
  LDA $C112
  BEQ control_repeat_done_0
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_1
  JMP map_set_done_1
map_x_ok_1:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_1
  JMP map_set_done_1
map_y_ok_1:
  STA $C7B3
  LDA #$00
  CMP #$03
  BCC map_value_ok_1
  JMP map_set_done_1
map_value_ok_1:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_1:
  LDA $C7B7
  BEQ map_index_done_1
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_1
map_index_done_1:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C7B8
  STA $C600,X
  JSR runtime_map_draw_tile_0
map_set_done_1:
  INC $C109
  DEC $C112
  JMP control_repeat_0
control_repeat_done_0:
  RTS
user_routine_clear_piece_after:
  JMP user_routine_draw_piece_after
user_routine_draw_piece:
  JSR user_routine_use_current_piece
  LDA #$00
  STA $C109
  LDA #$04
  STA $C113
control_repeat_2:
  LDA $C113
  BEQ control_repeat_done_2
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_3
  JMP map_set_done_3
map_x_ok_3:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_3
  JMP map_set_done_3
map_y_ok_3:
  STA $C7B3
  LDA #$02
  CMP #$03
  BCC map_value_ok_3
  JMP map_set_done_3
map_value_ok_3:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_3:
  LDA $C7B7
  BEQ map_index_done_3
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_3
map_index_done_3:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C7B8
  STA $C600,X
  JSR runtime_map_draw_tile_0
map_set_done_3:
  INC $C109
  DEC $C113
  JMP control_repeat_2
control_repeat_done_2:
  RTS
user_routine_draw_piece_after:
  JMP user_routine_lock_piece_after
user_routine_lock_piece:
  JSR user_routine_use_current_piece
  LDA #$00
  STA $C109
  LDA #$04
  STA $C114
control_repeat_4:
  LDA $C114
  BEQ control_repeat_done_4
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_5
  JMP map_set_done_5
map_x_ok_5:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_5
  JMP map_set_done_5
map_y_ok_5:
  STA $C7B3
  LDA #$01
  CMP #$03
  BCC map_value_ok_5
  JMP map_set_done_5
map_value_ok_5:
  STA $C7B8
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_5:
  LDA $C7B7
  BEQ map_index_done_5
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_5
map_index_done_5:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C7B8
  STA $C600,X
  JSR runtime_map_draw_tile_0
map_set_done_5:
  INC $C109
  DEC $C114
  JMP control_repeat_4
control_repeat_done_4:
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
  RTS
user_routine_lock_piece_after:
  JMP user_routine_test_work_piece_after
user_routine_test_work_piece:
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C109
  LDA #$04
  STA $C115
control_repeat_6:
  LDA $C115
  BEQ control_repeat_done_6
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_8
  JMP control_if_else_7
map_x_ok_8:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_8
  JMP control_if_else_7
map_y_ok_8:
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_8:
  LDA $C7B7
  BEQ map_index_done_8
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_8
map_index_done_8:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C600,X
  CMP #$00
  BEQ condition_pass_8
  JMP control_if_else_7
condition_pass_8:
  JMP control_if_end_7
control_if_else_7:
  LDA #$01
  STA $C10F
control_if_end_7:
  INC $C109
  DEC $C115
  JMP control_repeat_6
control_repeat_done_6:
  RTS
user_routine_test_work_piece_after:
  JMP user_routine_spawn_piece_after
user_routine_spawn_piece:
  LDA $C111
  CLC
  ADC #$49
  STA $C111
  LDA $C111
  EOR #$A7
  STA $C111
  LDA $C111
  STA $C100
  LDA $C100
  AND #$03
  STA $C100
  LDA $C100
  CLC
  ADC #$02
  STA $C100
  LDA #$00
  STA $C101
  LDA $C111
  STA $C103
  LDA $C103
  AND #$30
  STA $C103
  LDA $C111
  STA $C104
  LDA $C104
  AND #$0C
  STA $C104
  LDA $C103
  STA $C102
  LDA $C102
  CLC
  ADC $C104
  STA $C102
  JSR user_routine_use_current_piece
  JSR user_routine_test_work_piece
  LDA $C10F
  CMP #$00
  BEQ condition_pass_10
  JMP control_if_else_9
condition_pass_10:
  JSR user_routine_draw_piece
  JMP control_if_end_9
control_if_else_9:
  LDA #$01
  STA $C110
  LDA #$02
  STA $D020
control_if_end_9:
  RTS
user_routine_spawn_piece_after:
  JMP user_routine_move_left_after
user_routine_move_left:
  JSR user_routine_clear_piece
  JSR user_routine_use_current_piece
  LDA $C106
  SEC
  SBC #$01
  STA $C106
  JSR user_routine_test_work_piece
  LDA $C10F
  CMP #$00
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA $C106
  STA $C100
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  JSR user_routine_draw_piece
  RTS
user_routine_move_left_after:
  JMP user_routine_move_right_after
user_routine_move_right:
  JSR user_routine_clear_piece
  JSR user_routine_use_current_piece
  LDA $C106
  CLC
  ADC #$01
  STA $C106
  JSR user_routine_test_work_piece
  LDA $C10F
  CMP #$00
  BEQ condition_pass_14
  JMP control_if_else_13
condition_pass_14:
  LDA $C106
  STA $C100
  JMP control_if_end_13
control_if_else_13:
control_if_end_13:
  JSR user_routine_draw_piece
  RTS
user_routine_move_right_after:
  JMP user_routine_rotate_piece_after
user_routine_rotate_piece:
  JSR user_routine_clear_piece
  JSR user_routine_use_current_piece
  LDA $C104
  STA $C105
  LDA $C105
  CLC
  ADC #$04
  STA $C105
  LDA $C105
  AND #$0F
  STA $C105
  LDA $C103
  STA $C108
  LDA $C108
  CLC
  ADC $C105
  STA $C108
  JSR user_routine_test_work_piece
  LDA $C10F
  CMP #$00
  BEQ condition_pass_16
  JMP control_if_else_15
condition_pass_16:
  LDA $C105
  STA $C104
  LDA $C108
  STA $C102
  JMP control_if_end_15
control_if_else_15:
control_if_end_15:
  JSR user_routine_draw_piece
  RTS
user_routine_rotate_piece_after:
  JMP user_routine_drop_piece_after
user_routine_drop_piece:
  JSR user_routine_clear_piece
  JSR user_routine_use_current_piece
  LDA $C107
  CLC
  ADC #$01
  STA $C107
  JSR user_routine_test_work_piece
  LDA $C10F
  CMP #$00
  BEQ condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA $C107
  STA $C101
  JSR user_routine_draw_piece
  JMP control_if_end_17
control_if_else_17:
  JSR user_routine_lock_piece
  JSR user_routine_spawn_piece
control_if_end_17:
  RTS
user_routine_drop_piece_after:
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
  STA $C116
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
  BNE game_frame_counter_done_19
  INC $C76B
game_frame_counter_done_19:
  LDA $C110
  CMP #$00
  BEQ condition_pass_21
  JMP control_if_else_20
condition_pass_21:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_23
  JMP control_if_else_22
joystick_current_pressed_23:
  LDA $C769
  AND #$04
  BNE condition_pass_23
  JMP control_if_else_22
condition_pass_23:
  JSR user_routine_move_left
  JMP control_if_end_22
control_if_else_22:
control_if_end_22:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_25
  JMP control_if_else_24
joystick_current_pressed_25:
  LDA $C769
  AND #$08
  BNE condition_pass_25
  JMP control_if_else_24
condition_pass_25:
  JSR user_routine_move_right
  JMP control_if_end_24
control_if_else_24:
control_if_end_24:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_27
  JMP control_if_else_26
joystick_current_pressed_27:
  LDA $C769
  AND #$10
  BNE condition_pass_27
  JMP control_if_else_26
condition_pass_27:
  JSR user_routine_rotate_piece
  JMP control_if_end_26
control_if_else_26:
control_if_end_26:
  INC $C116
  LDA $C116
  CMP #$0A
  BCS game_every_run_28
  JMP game_every_done_29
game_every_run_28:
  LDA #$00
  STA $C116
  JSR user_routine_drop_piece
game_every_done_29:
  JMP control_if_end_20
control_if_else_20:
control_if_end_20:
  JMP game_frame_loop
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_renderer_0:
  LDA $C7B7
  BEQ map_index_done_renderer_0
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_renderer_0
map_index_done_renderer_0:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C600,X
  STA $C7B4
  LDA $C7B4
  STA $C7B5
  LDA #$87
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
  CMP #$0A
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$14
  BNE runtime_map_redraw_row_0
  RTS
; User data
asset_map_collisions_0:
  .byte $00, $01, $00
asset_map_chars_0:
  .byte $00, $01, $02
asset_map_colors_0:
  .byte $00, $0E, $07
asset_bytes_1:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
tetris_shape_x:
  .byte $00, $01, $02, $01, $01, $00, $01, $01, $01, $00, $01, $02, $00, $00, $01, $00, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $00, $00, $01, $00, $00, $01, $02, $00, $01, $01, $01, $00, $01, $02, $02
tetris_shape_y:
  .byte $00, $00, $00, $01, $00, $01, $01, $02, $00, $01, $01, $01, $00, $01, $01, $02, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $01, $02, $02, $00, $01, $00, $00, $00, $00, $01, $02, $01, $01, $01, $00
asset_bytes_3:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $BD, $81, $FF, $00, $3C, $7E, $FF, $FF, $FF, $FF, $7E, $3C, $FF, $FF, $C3, $C3, $C3, $C3, $FF, $FF, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
