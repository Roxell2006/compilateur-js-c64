  LDA #$A5
  STA $C77D
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
  CPX #$30
  BNE asset_map_initial_rle_2
  LDX #$00
  LDY #$00
asset_map_initial_rle_4:
  LDA asset_rle_3,X
  STA $C777
  INX
  LDA asset_rle_3,X
  INX
asset_map_initial_rle_4_repeat:
  STA $8100,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_4_repeat
  CPX #$08
  BNE asset_map_initial_rle_4
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
  LDA #$00
  STA $C10B
  LDA #$00
  STA $C10C
  LDA #$01
  STA $C10D
  LDA #$0E
  STA $C10E
  LDA #$06
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$00
  STA $C111
  LDA #$00
  STA $C112
  LDA #$01
  STA $C113
  LDA #$01
  STA $C114
  LDA #$49
  STA $C77D
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
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
asset_charset_copy_6:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  CPX #$18
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
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $04B7,X
  LDA #$01
  STA $D8B7,X
  INX
  BNE printat_loop_1
printat_done_2:
  LDX #$00
printat_loop_3:
  LDA str_screen_1,X
  BEQ printat_done_4
  STA $0507,X
  LDA #$01
  STA $D907,X
  INX
  BNE printat_loop_3
printat_done_4:
  LDX #$00
printat_loop_5:
  LDA str_screen_2,X
  BEQ printat_done_6
  STA $0557,X
  LDA #$01
  STA $D957,X
  INX
  BNE printat_loop_5
printat_done_6:
  LDA $C110
  CLC
  ADC #$30
  STA $055D
  LDA #$07
  STA $D95D
  LDA $C111
  CLC
  ADC #$30
  STA $055E
  LDA #$07
  STA $D95E
  LDA $C112
  CLC
  ADC #$30
  STA $055F
  LDA #$07
  STA $D95F
  LDX #$00
printat_loop_7:
  LDA str_screen_3,X
  BEQ printat_done_8
  STA $05A7,X
  LDA #$01
  STA $D9A7,X
  INX
  BNE printat_loop_7
printat_done_8:
  JSR runtime_map_redraw_0
  LDA #$0A
  CMP #$14
  BCC map_x_ok_9
  JMP map_set_done_9
map_x_ok_9:
  STA $C7B2
  LDA #$07
  CMP #$0F
  BCC map_y_ok_9
  JMP map_set_done_9
map_y_ok_9:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_9
  JMP map_set_done_9
map_value_ok_9:
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
map_set_done_9:
  LDA #$0E
  CMP #$14
  BCC map_x_ok_10
  JMP map_set_done_10
map_x_ok_10:
  STA $C7B2
  LDA #$06
  CMP #$0F
  BCC map_y_ok_10
  JMP map_set_done_10
map_y_ok_10:
  STA $C7B3
  LDA #$02
  CMP #$04
  BCC map_value_ok_10
  JMP map_set_done_10
map_value_ok_10:
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
map_set_done_10:
  LDX #$00
  LDA $C100
  STA snake_body_x,X
  LDX #$00
  LDA $C101
  STA snake_body_y,X
  JMP user_routine_snake_reset_after
user_routine_snake_reset:
  LDA #$01
  STA $C113
  LDA #$01
  STA $C114
  LDA #$EA
  STA $C115
control_while_11:
  LDA $C115
  BNE control_while_body_11
  JMP control_while_done_11
control_while_body_11:
  LDA $C114
  CMP #$0E
  BCC condition_pass_12
  JMP control_while_done_11
condition_pass_12:
  LDA $C113
  CMP #$14
  BCC map_x_ok_13
  JMP map_set_done_13
map_x_ok_13:
  STA $C7B2
  LDA $C114
  CMP #$0F
  BCC map_y_ok_13
  JMP map_set_done_13
map_y_ok_13:
  STA $C7B3
  LDA #$00
  CMP #$04
  BCC map_value_ok_13
  JMP map_set_done_13
map_value_ok_13:
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
map_set_done_13:
  INC $C113
  LDA $C113
  CMP #$13
  BCS condition_pass_15
  JMP control_if_else_14
condition_pass_15:
  LDA #$01
  STA $C113
  INC $C114
  JMP control_if_end_14
control_if_else_14:
control_if_end_14:
  DEC $C115
  JMP control_while_11
control_while_done_11:
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
  LDA #$00
  STA $C10B
  LDA #$01
  STA $C10D
  LDA #$0E
  STA $C10E
  LDA #$06
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$00
  STA $C111
  LDA #$00
  STA $C112
  LDA $C110
  CLC
  ADC #$30
  STA $055D
  LDA #$07
  STA $D95D
  LDA $C111
  CLC
  ADC #$30
  STA $055E
  LDA #$07
  STA $D95E
  LDA $C112
  CLC
  ADC #$30
  STA $055F
  LDA #$07
  STA $D95F
  LDA #$49
  STA $C77D
  LDA #$0A
  CMP #$14
  BCC map_x_ok_16
  JMP map_set_done_16
map_x_ok_16:
  STA $C7B2
  LDA #$07
  CMP #$0F
  BCC map_y_ok_16
  JMP map_set_done_16
map_y_ok_16:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_16
  JMP map_set_done_16
map_value_ok_16:
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
map_set_done_16:
  LDA #$0E
  CMP #$14
  BCC map_x_ok_17
  JMP map_set_done_17
map_x_ok_17:
  STA $C7B2
  LDA #$06
  CMP #$0F
  BCC map_y_ok_17
  JMP map_set_done_17
map_y_ok_17:
  STA $C7B3
  LDA #$02
  CMP #$04
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
  LDX #$00
  LDA $C100
  STA snake_body_x,X
  LDX #$00
  LDA $C101
  STA snake_body_y,X
  LDA #$00
  STA $D020
  LDX #$00
printat_loop_18:
  LDA str_screen_4,X
  BEQ printat_done_19
  STA $05A7,X
  LDA #$01
  STA $D9A7,X
  INX
  BNE printat_loop_18
printat_done_19:
  LDX #$00
printat_loop_20:
  LDA str_screen_5,X
  BEQ printat_done_21
  STA $05CF,X
  LDA #$01
  STA $D9CF,X
  INX
  BNE printat_loop_20
printat_done_21:
  RTS
user_routine_snake_reset_after:
  JMP user_routine_snake_spawn_food_after
user_routine_snake_spawn_food:
  LDA #$00
  STA $C10D
  LDA $C77D
  LSR A
  BCC game_random_no_feedback_22
  EOR #$B8
game_random_no_feedback_22:
  STA $C77D
game_random_reduce_23:
  CMP #$12
  BCC game_random_done_24
  SBC #$12
  JMP game_random_reduce_23
game_random_done_24:
  STA $C10E
  LDA $C77D
  LSR A
  BCC game_random_no_feedback_25
  EOR #$B8
game_random_no_feedback_25:
  STA $C77D
game_random_reduce_26:
  CMP #$0D
  BCC game_random_done_27
  SBC #$0D
  JMP game_random_reduce_26
game_random_done_27:
  STA $C10F
  INC $C10E
  INC $C10F
  LDA #$EA
  STA $C116
control_while_28:
  LDA $C116
  BNE control_while_body_28
  JMP control_while_done_28
control_while_body_28:
  LDA $C10D
  CMP #$00
  BEQ condition_pass_29
  JMP control_while_done_28
condition_pass_29:
  INC $C10E
  LDA $C10E
  CMP #$13
  BCS condition_pass_31
  JMP control_if_else_30
condition_pass_31:
  LDA #$01
  STA $C10E
  INC $C10F
  LDA $C10F
  CMP #$0E
  BCS condition_pass_33
  JMP control_if_else_32
condition_pass_33:
  LDA #$01
  STA $C10F
  JMP control_if_end_32
control_if_else_32:
control_if_end_32:
  JMP control_if_end_30
control_if_else_30:
control_if_end_30:
  LDA $C10E
  CMP #$14
  BCC map_x_ok_35
  JMP control_if_else_34
map_x_ok_35:
  STA $C7B2
  LDA $C10F
  CMP #$0F
  BCC map_y_ok_35
  JMP control_if_else_34
map_y_ok_35:
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
  BEQ condition_pass_35
  JMP control_if_else_34
condition_pass_35:
  LDA $C10E
  CMP #$14
  BCC map_x_ok_36
  JMP map_set_done_36
map_x_ok_36:
  STA $C7B2
  LDA $C10F
  CMP #$0F
  BCC map_y_ok_36
  JMP map_set_done_36
map_y_ok_36:
  STA $C7B3
  LDA #$02
  CMP #$04
  BCC map_value_ok_36
  JMP map_set_done_36
map_value_ok_36:
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
map_set_done_36:
  LDA #$01
  STA $C10D
  JMP control_if_end_34
control_if_else_34:
control_if_end_34:
  DEC $C116
  JMP control_while_28
control_while_done_28:
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
  BEQ condition_pass_38
  JMP control_if_else_37
condition_pass_38:
  DEC $C103
  JMP control_if_end_37
control_if_else_37:
control_if_end_37:
  LDA $C108
  CMP #$01
  BEQ condition_pass_40
  JMP control_if_else_39
condition_pass_40:
  INC $C102
  JMP control_if_end_39
control_if_else_39:
control_if_end_39:
  LDA $C108
  CMP #$02
  BEQ condition_pass_42
  JMP control_if_else_41
condition_pass_42:
  INC $C103
  JMP control_if_end_41
control_if_else_41:
control_if_end_41:
  LDA $C108
  CMP #$03
  BEQ condition_pass_44
  JMP control_if_else_43
condition_pass_44:
  DEC $C102
  JMP control_if_end_43
control_if_else_43:
control_if_end_43:
  LDA $C102
  CMP #$14
  BCC map_x_ok_46
  JMP control_if_else_45
map_x_ok_46:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_46
  JMP control_if_else_45
map_y_ok_46:
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
  BEQ condition_pass_46
  JMP control_if_else_45
condition_pass_46:
  LDA #$00
  STA $C109
  JMP control_if_end_45
control_if_else_45:
  LDA $C102
  CMP #$14
  BCC map_x_ok_48
  JMP control_if_else_47
map_x_ok_48:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_48
  JMP control_if_else_47
map_y_ok_48:
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
  CMP #$02
  BEQ condition_pass_48
  JMP control_if_else_47
condition_pass_48:
  LDA #$01
  STA $C109
  JMP control_if_end_47
control_if_else_47:
  LDA #$01
  STA $C10A
control_if_end_47:
control_if_end_45:
  LDA $C10A
  CMP #$00
  BEQ condition_pass_50
  JMP control_if_else_49
condition_pass_50:
  LDA $C109
  CMP #$00
  BEQ condition_pass_52
  JMP control_if_else_51
condition_pass_52:
  LDX $C105
  LDA snake_body_x,X
  STA $C106
  LDX $C105
  LDA snake_body_y,X
  STA $C107
  LDA $C106
  CMP #$14
  BCC map_x_ok_53
  JMP map_set_done_53
map_x_ok_53:
  STA $C7B2
  LDA $C107
  CMP #$0F
  BCC map_y_ok_53
  JMP map_set_done_53
map_y_ok_53:
  STA $C7B3
  LDA #$00
  CMP #$04
  BCC map_value_ok_53
  JMP map_set_done_53
map_value_ok_53:
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
map_set_done_53:
  INC $C105
  LDA $C105
  AND #$3F
  STA $C105
  JMP control_if_end_51
control_if_else_51:
  CLC
  LDA $C112
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_54_2
  STA $C112
  CLC
  JMP game_counter_next_54_2
game_counter_carry_54_2:
  SBC #$0A
  STA $C112
  SEC
game_counter_next_54_2:
  LDA $C111
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_54_1
  STA $C111
  CLC
  JMP game_counter_next_54_1
game_counter_carry_54_1:
  SBC #$0A
  STA $C111
  SEC
game_counter_next_54_1:
  LDA $C110
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_54_0
  STA $C110
  CLC
  JMP game_counter_next_54_0
game_counter_carry_54_0:
  SBC #$0A
  STA $C110
  SEC
game_counter_next_54_0:
  LDA $C110
  CLC
  ADC #$30
  STA $055D
  LDA #$07
  STA $D95D
  LDA $C111
  CLC
  ADC #$30
  STA $055E
  LDA #$07
  STA $D95E
  LDA $C112
  CLC
  ADC #$30
  STA $055F
  LDA #$07
  STA $D95F
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
control_if_end_51:
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
  BCC map_x_ok_55
  JMP map_set_done_55
map_x_ok_55:
  STA $C7B2
  LDA $C101
  CMP #$0F
  BCC map_y_ok_55
  JMP map_set_done_55
map_y_ok_55:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_55
  JMP map_set_done_55
map_value_ok_55:
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
map_set_done_55:
  JMP control_if_end_49
control_if_else_49:
  LDA #$02
  STA $D020
control_if_end_49:
  RTS
user_routine_snake_step_after:
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
  LDA #$00
  STA $C117
  LDA #$FF
  STA $C767
  LDA #$FF
  STA $C769
  LDA #$01
  STA $C780
  LDA #$01
  STA $C790
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
  BNE game_frame_counter_done_56
  INC $C76B
game_frame_counter_done_56:
  LDA #$00
  STA $C10C
  LDA $C10A
  CMP #$01
  BEQ condition_pass_58
  JMP control_if_else_57
condition_pass_58:
  LDA #$02
  STA $D020
  LDX #$00
printat_loop_59:
  LDA str_screen_6,X
  BEQ printat_done_60
  STA $05A7,X
  LDA #$01
  STA $D9A7,X
  INX
  BNE printat_loop_59
printat_done_60:
  LDX #$00
printat_loop_61:
  LDA str_screen_7,X
  BEQ printat_done_62
  STA $05CF,X
  LDA #$01
  STA $D9CF,X
  INX
  BNE printat_loop_61
printat_done_62:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_64
  JMP control_if_else_63
joystick_current_pressed_64:
  LDA $C769
  AND #$10
  BNE condition_pass_64
  JMP control_if_else_63
condition_pass_64:
  LDA #$01
  STA $C10C
  JMP control_if_end_63
control_if_else_63:
control_if_end_63:
  LDA $C780
  BEQ keyboard_pressed_66
  JMP control_if_else_65
keyboard_pressed_66:
  LDA $C790
  BNE condition_pass_66
  JMP control_if_else_65
condition_pass_66:
  LDA #$01
  STA $C10C
  JMP control_if_end_65
control_if_else_65:
control_if_end_65:
  LDA $C10C
  CMP #$01
  BEQ condition_pass_68
  JMP control_if_else_67
condition_pass_68:
  JSR user_routine_snake_reset
  JMP control_if_end_67
control_if_else_67:
control_if_end_67:
  JMP control_if_end_57
control_if_else_57:
control_if_end_57:
  LDA $C10A
  CMP #$00
  BEQ condition_pass_70
  JMP control_if_else_69
condition_pass_70:
  LDA $C10B
  CMP #$00
  BEQ condition_pass_72
  JMP control_if_else_71
condition_pass_72:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_74
  JMP control_if_else_73
joystick_current_pressed_74:
  LDA $C769
  AND #$10
  BNE condition_pass_74
  JMP control_if_else_73
condition_pass_74:
  LDA #$01
  STA $C10B
  LDX #$00
printat_loop_75:
  LDA str_screen_5,X
  BEQ printat_done_76
  STA $05A7,X
  LDA #$01
  STA $D9A7,X
  INX
  BNE printat_loop_75
printat_done_76:
  LDX #$00
printat_loop_77:
  LDA str_screen_5,X
  BEQ printat_done_78
  STA $05CF,X
  LDA #$01
  STA $D9CF,X
  INX
  BNE printat_loop_77
printat_done_78:
  JMP control_if_end_73
control_if_else_73:
control_if_end_73:
  JMP control_if_end_71
control_if_else_71:
control_if_end_71:
  LDA $C10B
  CMP #$01
  BEQ condition_pass_80
  JMP control_if_else_79
condition_pass_80:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_82
  JMP control_if_else_81
joystick_current_pressed_82:
  LDA $C769
  AND #$01
  BNE condition_pass_82
  JMP control_if_else_81
condition_pass_82:
  LDA #$00
  STA $C108
  JMP control_if_end_81
control_if_else_81:
control_if_end_81:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_84
  JMP control_if_else_83
joystick_current_pressed_84:
  LDA $C769
  AND #$08
  BNE condition_pass_84
  JMP control_if_else_83
condition_pass_84:
  LDA #$01
  STA $C108
  JMP control_if_end_83
control_if_else_83:
control_if_end_83:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_86
  JMP control_if_else_85
joystick_current_pressed_86:
  LDA $C769
  AND #$02
  BNE condition_pass_86
  JMP control_if_else_85
condition_pass_86:
  LDA #$02
  STA $C108
  JMP control_if_end_85
control_if_else_85:
control_if_end_85:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_88
  JMP control_if_else_87
joystick_current_pressed_88:
  LDA $C769
  AND #$04
  BNE condition_pass_88
  JMP control_if_else_87
condition_pass_88:
  LDA #$03
  STA $C108
  JMP control_if_end_87
control_if_else_87:
control_if_end_87:
  INC $C117
  LDA $C117
  CMP #$06
  BCS game_every_run_89
  JMP game_every_done_90
game_every_run_89:
  LDA #$00
  STA $C117
  JSR user_routine_snake_step
game_every_done_90:
  JMP control_if_end_79
control_if_else_79:
control_if_end_79:
  JMP control_if_end_69
control_if_else_69:
control_if_end_69:
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
  LDA #$A1
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
  CMP #$14
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$0F
  BNE runtime_map_redraw_row_0
  RTS
; String pool
str_screen_0:
  .byte $13, $0E, $01, $0B, $05, $20, $16, $31, $2E, $30, $00
str_screen_1:
  .byte $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $32, $00
str_screen_2:
  .byte $13, $03, $0F, $12, $05, $00
str_screen_3:
  .byte $06, $09, $12, $05, $20, $14, $0F, $20, $13, $14, $01, $12, $14, $00
str_screen_4:
  .byte $06, $09, $12, $05, $20, $14, $0F, $20, $13, $14, $01, $12, $14, $20, $20, $20, $20, $00
str_screen_5:
  .byte $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $00
str_screen_6:
  .byte $07, $01, $0D, $05, $20, $0F, $16, $05, $12, $20, $20, $20, $20, $20, $20, $20, $20, $00
str_screen_7:
  .byte $06, $09, $12, $05, $2F, $13, $10, $01, $03, $05, $3A, $20, $12, $05, $13, $05, $14, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $00, $02
asset_map_chars_0:
  .byte $20, $40, $41, $42
asset_map_colors_0:
  .byte $00, $0E, $07, $05
asset_rle_1:
  .byte $15, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $12, $00, $02, $01, $0F, $00
asset_rle_3:
  .byte $03, $00, $02, $01, $12, $00, $15, $01
snake_body_x:
  .byte $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A, $0A
snake_body_y:
  .byte $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07, $07
asset_bytes_5:
  .byte $FF, $81, $BD, $A5, $A5, $BD, $81, $FF, $18, $3C, $7E, $FF, $FF, $7E, $3C, $18, $3C, $7E, $FF, $FF, $FF, $FF, $7E, $3C
