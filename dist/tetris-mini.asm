  LDX #$00
  LDY #$00
asset_map_initial_rle_2:
  LDA asset_rle_1,X
  STA $C777
  INX
  LDA asset_rle_1,X
  INX
asset_map_initial_rle_2_repeat:
  STA $8000,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_2_repeat
  CPX #$02
  BNE asset_map_initial_rle_2
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
  LDA #$00
  STA $C112
  LDA #$13
  STA $C113
  LDA #$00
  STA $C114
  LDA #$00
  STA $C115
  LDA #$00
  STA $C116
  LDA #$00
  STA $C117
  LDA #$00
  STA $C118
  LDA #$00
  STA $C119
  LDA #$00
  STA $C11A
  LDA #$00
  STA $C11B
  LDA #$00
  STA $C11C
  PHP
  SEI
  LDA $01
  PHA
  AND #$FB
  STA $01
  LDX #$00
charset_rom_copy_0:
  LDA $D000,X
  STA $3000,X
  LDA $D100,X
  STA $3100,X
  INX
  BNE charset_rom_copy_0
  PLA
  STA $01
  PLP
  LDX #$00
asset_charset_copy_4:
  LDA asset_bytes_3,X
  STA $3200,X
  INX
  CPX #$20
  BNE asset_charset_copy_4
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
  JSR user_routine_new_game
  JMP user_routine_clear_board_after
user_routine_clear_board:
  LDA #$00
  STA $C113
  LDA #$14
  STA $C11D
control_repeat_1:
  LDA $C11D
  BNE control_repeat_body_1
  JMP control_repeat_done_1
control_repeat_body_1:
  LDA #$00
  STA $C112
  LDA #$0A
  STA $C11E
control_repeat_2:
  LDA $C11E
  BNE control_repeat_body_2
  JMP control_repeat_done_2
control_repeat_body_2:
  LDA $C112
  CMP #$0A
  BCC map_x_ok_3
  JMP map_set_done_3
map_x_ok_3:
  STA $C7B2
  LDA $C113
  CMP #$14
  BCC map_y_ok_3
  JMP map_set_done_3
map_y_ok_3:
  STA $C7B3
  LDA #$00
  CMP #$03
  BCC map_value_ok_3
  JMP map_set_done_3
map_value_ok_3:
  STA $C7B8
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
  LDA $C7B8
  STA ($FB),Y
map_set_done_3:
  INC $C112
  DEC $C11E
  JMP control_repeat_2
control_repeat_done_2:
  INC $C113
  DEC $C11D
  JMP control_repeat_1
control_repeat_done_1:
  RTS
user_routine_clear_board_after:
  JMP user_routine_new_game_after
user_routine_new_game:
  JSR user_routine_clear_board
  LDA #$00
  STA $C110
  LDA #$25
  STA $C111
  LDA #$00
  STA $C118
  LDA #$00
  STA $C119
  LDA #$00
  STA $C11A
  LDA #$00
  STA $C11B
  LDA #$00
  STA $C11C
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDX #$00
printat_loop_4:
  LDA str_screen_0,X
  BEQ printat_done_5
  STA $0479,X
  LDA #$01
  STA $D879,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDX #$00
printat_loop_6:
  LDA str_screen_1,X
  BEQ printat_done_7
  STA $04F1,X
  LDA #$01
  STA $D8F1,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDA $C118
  CLC
  ADC #$30
  STA $0541
  LDA #$07
  STA $D941
  LDA $C119
  CLC
  ADC #$30
  STA $0542
  LDA #$07
  STA $D942
  LDA $C11A
  CLC
  ADC #$30
  STA $0543
  LDA #$07
  STA $D943
  LDA $C11B
  CLC
  ADC #$30
  STA $0544
  LDA #$07
  STA $D944
  LDA $C11C
  CLC
  ADC #$30
  STA $0545
  LDA #$07
  STA $D945
  LDX #$00
printat_loop_8:
  LDA str_screen_2,X
  BEQ printat_done_9
  STA $05E1,X
  LDA #$01
  STA $D9E1,X
  INX
  BNE printat_loop_8
printat_done_9:
  LDX #$00
printat_loop_10:
  LDA str_screen_3,X
  BEQ printat_done_11
  STA $0631,X
  LDA #$01
  STA $DA31,X
  INX
  BNE printat_loop_10
printat_done_11:
  LDX #$00
printat_loop_12:
  LDA str_screen_4,X
  BEQ printat_done_13
  STA $0681,X
  LDA #$01
  STA $DA81,X
  INX
  BNE printat_loop_12
printat_done_13:
  LDA #$43
  LDX #$00
memset_45e_67_12:
  STA $045E,X
  INX
  CPX #$0C
  BNE memset_45e_67_12
  LDA #$01
  LDX #$00
memset_d85e_1_12:
  STA $D85E,X
  INX
  CPX #$0C
  BNE memset_d85e_1_12
  LDA #$43
  LDX #$00
memset_7a6_67_12:
  STA $07A6,X
  INX
  CPX #$0C
  BNE memset_7a6_67_12
  LDA #$01
  LDX #$00
memset_dba6_1_12:
  STA $DBA6,X
  INX
  CPX #$0C
  BNE memset_dba6_1_12
  LDA #$43
  STA $0486
  LDA #$01
  STA $D886
  LDA #$43
  STA $0491
  LDA #$01
  STA $D891
  LDA #$43
  STA $04AE
  LDA #$01
  STA $D8AE
  LDA #$43
  STA $04B9
  LDA #$01
  STA $D8B9
  LDA #$43
  STA $04D6
  LDA #$01
  STA $D8D6
  LDA #$43
  STA $04E1
  LDA #$01
  STA $D8E1
  LDA #$43
  STA $04FE
  LDA #$01
  STA $D8FE
  LDA #$43
  STA $0509
  LDA #$01
  STA $D909
  LDA #$43
  STA $0526
  LDA #$01
  STA $D926
  LDA #$43
  STA $0531
  LDA #$01
  STA $D931
  LDA #$43
  STA $054E
  LDA #$01
  STA $D94E
  LDA #$43
  STA $0559
  LDA #$01
  STA $D959
  LDA #$43
  STA $0576
  LDA #$01
  STA $D976
  LDA #$43
  STA $0581
  LDA #$01
  STA $D981
  LDA #$43
  STA $059E
  LDA #$01
  STA $D99E
  LDA #$43
  STA $05A9
  LDA #$01
  STA $D9A9
  LDA #$43
  STA $05C6
  LDA #$01
  STA $D9C6
  LDA #$43
  STA $05D1
  LDA #$01
  STA $D9D1
  LDA #$43
  STA $05EE
  LDA #$01
  STA $D9EE
  LDA #$43
  STA $05F9
  LDA #$01
  STA $D9F9
  LDA #$43
  STA $0616
  LDA #$01
  STA $DA16
  LDA #$43
  STA $0621
  LDA #$01
  STA $DA21
  LDA #$43
  STA $063E
  LDA #$01
  STA $DA3E
  LDA #$43
  STA $0649
  LDA #$01
  STA $DA49
  LDA #$43
  STA $0666
  LDA #$01
  STA $DA66
  LDA #$43
  STA $0671
  LDA #$01
  STA $DA71
  LDA #$43
  STA $068E
  LDA #$01
  STA $DA8E
  LDA #$43
  STA $0699
  LDA #$01
  STA $DA99
  LDA #$43
  STA $06B6
  LDA #$01
  STA $DAB6
  LDA #$43
  STA $06C1
  LDA #$01
  STA $DAC1
  LDA #$43
  STA $06DE
  LDA #$01
  STA $DADE
  LDA #$43
  STA $06E9
  LDA #$01
  STA $DAE9
  LDA #$43
  STA $0706
  LDA #$01
  STA $DB06
  LDA #$43
  STA $0711
  LDA #$01
  STA $DB11
  LDA #$43
  STA $072E
  LDA #$01
  STA $DB2E
  LDA #$43
  STA $0739
  LDA #$01
  STA $DB39
  LDA #$43
  STA $0756
  LDA #$01
  STA $DB56
  LDA #$43
  STA $0761
  LDA #$01
  STA $DB61
  LDA #$43
  STA $077E
  LDA #$01
  STA $DB7E
  LDA #$43
  STA $0789
  LDA #$01
  STA $DB89
  JSR runtime_map_redraw_0
  JSR user_routine_spawn_piece
  RTS
user_routine_new_game_after:
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
  STA $C11F
control_repeat_14:
  LDA $C11F
  BNE control_repeat_body_14
  JMP control_repeat_done_14
control_repeat_body_14:
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_15
  JMP map_set_done_15
map_x_ok_15:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_15
  JMP map_set_done_15
map_y_ok_15:
  STA $C7B3
  LDA #$00
  CMP #$03
  BCC map_value_ok_15
  JMP map_set_done_15
map_value_ok_15:
  STA $C7B8
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_15:
  INC $C109
  DEC $C11F
  JMP control_repeat_14
control_repeat_done_14:
  RTS
user_routine_clear_piece_after:
  JMP user_routine_draw_piece_after
user_routine_draw_piece:
  JSR user_routine_use_current_piece
  LDA #$00
  STA $C109
  LDA #$04
  STA $C120
control_repeat_16:
  LDA $C120
  BNE control_repeat_body_16
  JMP control_repeat_done_16
control_repeat_body_16:
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_17
  JMP map_set_done_17
map_x_ok_17:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_17
  JMP map_set_done_17
map_y_ok_17:
  STA $C7B3
  LDA #$02
  CMP #$03
  BCC map_value_ok_17
  JMP map_set_done_17
map_value_ok_17:
  STA $C7B8
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_17:
  INC $C109
  DEC $C120
  JMP control_repeat_16
control_repeat_done_16:
  RTS
user_routine_draw_piece_after:
  JMP user_routine_lock_piece_after
user_routine_lock_piece:
  JSR user_routine_use_current_piece
  LDA #$00
  STA $C109
  LDA #$04
  STA $C121
control_repeat_18:
  LDA $C121
  BNE control_repeat_body_18
  JMP control_repeat_done_18
control_repeat_body_18:
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_19
  JMP map_set_done_19
map_x_ok_19:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_19
  JMP map_set_done_19
map_y_ok_19:
  STA $C7B3
  LDA #$01
  CMP #$03
  BCC map_value_ok_19
  JMP map_set_done_19
map_value_ok_19:
  STA $C7B8
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_19:
  INC $C109
  DEC $C121
  JMP control_repeat_18
control_repeat_done_18:
  CLC
  LDA $C11C
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_20_4
  STA $C11C
  CLC
  JMP game_counter_next_20_4
game_counter_carry_20_4:
  SBC #$0A
  STA $C11C
  SEC
game_counter_next_20_4:
  LDA $C11B
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_20_3
  STA $C11B
  CLC
  JMP game_counter_next_20_3
game_counter_carry_20_3:
  SBC #$0A
  STA $C11B
  SEC
game_counter_next_20_3:
  LDA $C11A
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_20_2
  STA $C11A
  CLC
  JMP game_counter_next_20_2
game_counter_carry_20_2:
  SBC #$0A
  STA $C11A
  SEC
game_counter_next_20_2:
  LDA $C119
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_20_1
  STA $C119
  CLC
  JMP game_counter_next_20_1
game_counter_carry_20_1:
  SBC #$0A
  STA $C119
  SEC
game_counter_next_20_1:
  LDA $C118
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_20_0
  STA $C118
  CLC
  JMP game_counter_next_20_0
game_counter_carry_20_0:
  SBC #$0A
  STA $C118
  SEC
game_counter_next_20_0:
  LDA $C118
  CLC
  ADC #$30
  STA $0541
  LDA #$07
  STA $D941
  LDA $C119
  CLC
  ADC #$30
  STA $0542
  LDA #$07
  STA $D942
  LDA $C11A
  CLC
  ADC #$30
  STA $0543
  LDA #$07
  STA $D943
  LDA $C11B
  CLC
  ADC #$30
  STA $0544
  LDA #$07
  STA $D944
  LDA $C11C
  CLC
  ADC #$30
  STA $0545
  LDA #$07
  STA $D945
  JSR user_routine_clear_full_lines
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
  JMP user_routine_clear_full_lines_after
user_routine_clear_full_lines:
  LDA #$13
  STA $C113
  LDA #$00
  STA $C116
  LDA #$18
  STA $C122
control_while_21:
  LDA $C122
  BNE control_while_body_21
  JMP control_while_done_21
control_while_body_21:
  LDA $C116
  CMP #$14
  BCC condition_pass_22
  JMP control_while_done_21
condition_pass_22:
  LDA #$00
  STA $C112
  LDA #$00
  STA $C115
  LDA #$0A
  STA $C123
control_repeat_23:
  LDA $C123
  BNE control_repeat_body_23
  JMP control_repeat_done_23
control_repeat_body_23:
  LDA $C112
  CMP #$0A
  BCC map_x_ok_25
  JMP control_if_else_24
map_x_ok_25:
  STA $C7B2
  LDA $C113
  CMP #$14
  BCC map_y_ok_25
  JMP control_if_else_24
map_y_ok_25:
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
  CMP #$00
  BNE condition_pass_25
  JMP control_if_else_24
condition_pass_25:
  INC $C115
  JMP control_if_end_24
control_if_else_24:
control_if_end_24:
  INC $C112
  DEC $C123
  JMP control_repeat_23
control_repeat_done_23:
  LDA $C115
  CMP #$0A
  BEQ condition_pass_27
  JMP control_if_else_26
condition_pass_27:
  LDA $C113
  STA $C114
  LDA #$13
  STA $C124
control_while_28:
  LDA $C124
  BNE control_while_body_28
  JMP control_while_done_28
control_while_body_28:
  LDA $C114
  CMP #$00
  BNE condition_not_equal_29
  JMP control_while_done_28
condition_not_equal_29:
  BCS condition_pass_29
  JMP control_while_done_28
condition_pass_29:
  LDA #$00
  STA $C112
  LDA #$0A
  STA $C125
control_repeat_30:
  LDA $C125
  BNE control_repeat_body_30
  JMP control_repeat_done_30
control_repeat_body_30:
  DEC $C114
  LDA $C112
  CMP #$0A
  BCC map_x_ok_31
  JMP map_get_done_31
map_x_ok_31:
  STA $C7B2
  LDA $C114
  CMP #$14
  BCC map_y_ok_31
  JMP map_get_done_31
map_y_ok_31:
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
  STA $C117
map_get_done_31:
  INC $C114
  LDA $C112
  CMP #$0A
  BCC map_x_ok_32
  JMP map_set_done_32
map_x_ok_32:
  STA $C7B2
  LDA $C114
  CMP #$14
  BCC map_y_ok_32
  JMP map_set_done_32
map_y_ok_32:
  STA $C7B3
  LDA $C117
  CMP #$03
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_32:
  INC $C112
  DEC $C125
  JMP control_repeat_30
control_repeat_done_30:
  DEC $C114
  DEC $C124
  JMP control_while_28
control_while_done_28:
  LDA #$00
  STA $C112
  LDA #$0A
  STA $C126
control_repeat_33:
  LDA $C126
  BNE control_repeat_body_33
  JMP control_repeat_done_33
control_repeat_body_33:
  LDA $C112
  CMP #$0A
  BCC map_x_ok_34
  JMP map_set_done_34
map_x_ok_34:
  STA $C7B2
  LDA #$00
  CMP #$14
  BCC map_y_ok_34
  JMP map_set_done_34
map_y_ok_34:
  STA $C7B3
  LDA #$00
  CMP #$03
  BCC map_value_ok_34
  JMP map_set_done_34
map_value_ok_34:
  STA $C7B8
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_34:
  INC $C112
  DEC $C126
  JMP control_repeat_33
control_repeat_done_33:
  CLC
  LDA $C11C
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_35_4
  STA $C11C
  CLC
  JMP game_counter_next_35_4
game_counter_carry_35_4:
  SBC #$0A
  STA $C11C
  SEC
game_counter_next_35_4:
  LDA $C11B
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_35_3
  STA $C11B
  CLC
  JMP game_counter_next_35_3
game_counter_carry_35_3:
  SBC #$0A
  STA $C11B
  SEC
game_counter_next_35_3:
  LDA $C11A
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_35_2
  STA $C11A
  CLC
  JMP game_counter_next_35_2
game_counter_carry_35_2:
  SBC #$0A
  STA $C11A
  SEC
game_counter_next_35_2:
  LDA $C119
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_35_1
  STA $C119
  CLC
  JMP game_counter_next_35_1
game_counter_carry_35_1:
  SBC #$0A
  STA $C119
  SEC
game_counter_next_35_1:
  LDA $C118
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_35_0
  STA $C118
  CLC
  JMP game_counter_next_35_0
game_counter_carry_35_0:
  SBC #$0A
  STA $C118
  SEC
game_counter_next_35_0:
  LDA $C118
  CLC
  ADC #$30
  STA $0541
  LDA #$07
  STA $D941
  LDA $C119
  CLC
  ADC #$30
  STA $0542
  LDA #$07
  STA $D942
  LDA $C11A
  CLC
  ADC #$30
  STA $0543
  LDA #$07
  STA $D943
  LDA $C11B
  CLC
  ADC #$30
  STA $0544
  LDA #$07
  STA $D944
  LDA $C11C
  CLC
  ADC #$30
  STA $0545
  LDA #$07
  STA $D945
  JMP control_if_end_26
control_if_else_26:
  DEC $C113
  INC $C116
control_if_end_26:
  DEC $C122
  JMP control_while_21
control_while_done_21:
  RTS
user_routine_clear_full_lines_after:
  JMP user_routine_test_work_piece_after
user_routine_test_work_piece:
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C109
  LDA #$04
  STA $C127
control_repeat_36:
  LDA $C127
  BNE control_repeat_body_36
  JMP control_repeat_done_36
control_repeat_body_36:
  JSR user_routine_prepare_cell
  LDA $C10D
  CMP #$0A
  BCC map_x_ok_38
  JMP control_if_else_37
map_x_ok_38:
  STA $C7B2
  LDA $C10E
  CMP #$14
  BCC map_y_ok_38
  JMP control_if_else_37
map_y_ok_38:
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
  CMP #$00
  BEQ condition_pass_38
  JMP control_if_else_37
condition_pass_38:
  JMP control_if_end_37
control_if_else_37:
  LDA #$01
  STA $C10F
control_if_end_37:
  INC $C109
  DEC $C127
  JMP control_repeat_36
control_repeat_done_36:
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
  BEQ condition_pass_40
  JMP control_if_else_39
condition_pass_40:
  JSR user_routine_draw_piece
  JMP control_if_end_39
control_if_else_39:
  LDA #$01
  STA $C110
  LDA #$02
  STA $D020
  LDX #$00
printat_loop_41:
  LDA str_screen_5,X
  BEQ printat_done_42
  STA $06F9,X
  LDA #$01
  STA $DAF9,X
  INX
  BNE printat_loop_41
printat_done_42:
control_if_end_39:
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
  BEQ condition_pass_44
  JMP control_if_else_43
condition_pass_44:
  LDA $C106
  STA $C100
  JMP control_if_end_43
control_if_else_43:
control_if_end_43:
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
  BEQ condition_pass_46
  JMP control_if_else_45
condition_pass_46:
  LDA $C106
  STA $C100
  JMP control_if_end_45
control_if_else_45:
control_if_end_45:
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
  BEQ condition_pass_48
  JMP control_if_else_47
condition_pass_48:
  LDA $C105
  STA $C104
  LDA $C108
  STA $C102
  JMP control_if_end_47
control_if_else_47:
control_if_end_47:
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
  BEQ condition_pass_50
  JMP control_if_else_49
condition_pass_50:
  LDA $C107
  STA $C101
  JSR user_routine_draw_piece
  JMP control_if_end_49
control_if_else_49:
  JSR user_routine_lock_piece
  JSR user_routine_spawn_piece
control_if_end_49:
  RTS
user_routine_drop_piece_after:
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
  LDA #$00
  STA $C128
  LDA #$00
  STA $C129
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
  BNE game_frame_counter_done_51
  INC $C76B
game_frame_counter_done_51:
  LDA $C110
  CMP #$00
  BEQ condition_pass_53
  JMP control_if_else_52
condition_pass_53:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_55
  JMP control_if_else_54
joystick_current_pressed_55:
  LDA $C769
  AND #$04
  BNE condition_pass_55
  JMP control_if_else_54
condition_pass_55:
  JSR user_routine_move_left
  JMP control_if_end_54
control_if_else_54:
control_if_end_54:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_57
  JMP control_if_else_56
joystick_current_pressed_57:
  LDA $C769
  AND #$08
  BNE condition_pass_57
  JMP control_if_else_56
condition_pass_57:
  JSR user_routine_move_right
  JMP control_if_end_56
control_if_else_56:
control_if_end_56:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_59
  JMP control_if_else_58
joystick_current_pressed_59:
  LDA $C769
  AND #$10
  BNE condition_pass_59
  JMP control_if_else_58
condition_pass_59:
  JSR user_routine_rotate_piece
  JMP control_if_end_58
control_if_else_58:
control_if_end_58:
  LDA $C767
  AND #$02
  BEQ condition_pass_61
  JMP control_if_else_60
condition_pass_61:
  INC $C128
  LDA $C128
  CMP #$02
  BCS game_every_run_62
  JMP game_every_done_63
game_every_run_62:
  LDA #$00
  STA $C128
  JSR user_routine_drop_piece
game_every_done_63:
  JMP control_if_end_60
control_if_else_60:
  INC $C129
  LDA $C129
  CMP #$0C
  BCS game_every_run_64
  JMP game_every_done_65
game_every_run_64:
  LDA #$00
  STA $C129
  JSR user_routine_drop_piece
game_every_done_65:
control_if_end_60:
  JMP control_if_end_52
control_if_else_52:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_67
  JMP control_if_else_66
joystick_current_pressed_67:
  LDA $C769
  AND #$10
  BNE condition_pass_67
  JMP control_if_else_66
condition_pass_67:
  JSR user_routine_new_game
  JMP control_if_end_66
control_if_else_66:
control_if_end_66:
control_if_end_52:
  JMP game_frame_loop
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
  STA $C7B5
  LDA #$87
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
  CMP #$14
  BNE runtime_map_redraw_row_0
  RTS
; String pool
str_screen_0:
  .byte $14, $05, $14, $12, $09, $13, $20, $0D, $09, $0E, $09, $00
str_screen_1:
  .byte $13, $03, $0F, $12, $05, $00
str_screen_2:
  .byte $0A, $0F, $19, $20, $32, $00
str_screen_3:
  .byte $02, $01, $13, $3A, $20, $12, $01, $10, $09, $04, $05, $00
str_screen_4:
  .byte $06, $09, $12, $05, $3A, $20, $14, $0F, $15, $12, $0E, $05, $00
str_screen_5:
  .byte $07, $01, $0D, $05, $20, $0F, $16, $05, $12, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $00
asset_map_chars_0:
  .byte $40, $41, $42
asset_map_colors_0:
  .byte $00, $0E, $07
asset_rle_1:
  .byte $C8, $00
tetris_shape_x:
  .byte $00, $01, $02, $01, $01, $00, $01, $01, $01, $00, $01, $02, $00, $00, $01, $00, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $00, $00, $01, $00, $00, $01, $02, $00, $01, $01, $01, $00, $01, $02, $02
tetris_shape_y:
  .byte $00, $00, $00, $01, $00, $01, $01, $02, $00, $01, $01, $01, $00, $01, $01, $02, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $01, $02, $02, $00, $01, $00, $00, $00, $00, $01, $02, $01, $01, $01, $00
asset_bytes_3:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $BD, $81, $FF, $00, $3C, $7E, $FF, $FF, $FF, $FF, $7E, $3C, $FF, $FF, $C3, $C3, $C3, $C3, $FF, $FF
