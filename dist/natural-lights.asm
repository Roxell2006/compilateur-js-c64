  LDA #$01
  STA $0286
  LDA #$00
  STA $C11A
  LDA #$00
  STA $C11B
  LDA #$00
  STA $C11C
  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  JSR user_routine___js_init_4
  JMP user_routine___js_flip_17_after
user_routine___js_flip_17:
  LDA $C108
  STA $C109
  LDA #$00
  STA $C10A
  LDA #$00
  CMP #$00
  BCC api_range_valid_1_upper
  BNE api_range_invalid_2
  LDA $C109
  CMP #$10
  BCS api_range_invalid_2
api_range_valid_1_upper:
  JMP api_range_valid_1
api_range_invalid_2:
  JMP natural_array_done_0
api_range_valid_1:
  LDX $C109
  LDA __js_array_0,X
  STA $C10A
natural_array_done_0:
  LDA $C10A
  EOR #$01
  STA $C10A
  LDA #$00
  CMP #$00
  BCC api_range_valid_4_upper
  BNE api_range_invalid_5
  LDA $C109
  CMP #$10
  BCS api_range_invalid_5
api_range_valid_4_upper:
  JMP api_range_valid_4
api_range_invalid_5:
  JMP natural_array_done_3
api_range_valid_4:
  LDX $C109
  LDA $C10A
  STA __js_array_0,X
natural_array_done_3:
__js_return_18:
  RTS
user_routine___js_flip_17_after:
  JMP user_routine___js_press_9_after
user_routine___js_press_9:
  LDA $C104
  STA $C105
  LDA $C105
  STA $C106
  ASL $C105
  ASL $C105
  LDA $C105
  STA $C107
  LDA $C107
  CLC
  ADC $C103
  STA $C107
  LDA $C107
  STA $C108
  JSR user_routine___js_flip_17
  LDA $C103
  CMP #$00
  BNE condition_not_equal_7
  JMP control_if_else_6
condition_not_equal_7:
  BCS condition_pass_7
  JMP control_if_else_6
condition_pass_7:
  LDA $C107
  STA $C108
  DEC $C108
  JSR user_routine___js_flip_17
  JMP control_if_end_6
control_if_else_6:
control_if_end_6:
  LDA $C103
  CMP #$03
  BCC condition_pass_9
  JMP control_if_else_8
condition_pass_9:
  LDA $C107
  STA $C108
  INC $C108
  JSR user_routine___js_flip_17
  JMP control_if_end_8
control_if_else_8:
control_if_end_8:
  LDA $C104
  CMP #$00
  BNE condition_not_equal_11
  JMP control_if_else_10
condition_not_equal_11:
  BCS condition_pass_11
  JMP control_if_else_10
condition_pass_11:
  LDA $C107
  STA $C108
  LDA $C108
  SEC
  SBC #$04
  STA $C108
  JSR user_routine___js_flip_17
  JMP control_if_end_10
control_if_else_10:
control_if_end_10:
  LDA $C104
  CMP #$03
  BCC condition_pass_13
  JMP control_if_else_12
condition_pass_13:
  LDA $C107
  STA $C108
  LDA $C108
  CLC
  ADC #$04
  STA $C108
  JSR user_routine___js_flip_17
  JMP control_if_end_12
control_if_else_12:
control_if_end_12:
__js_return_10:
  RTS
user_routine___js_press_9_after:
  JMP user_routine___js_message_26_after
user_routine___js_message_26:
  LDA #$28
  BEQ api_text_rect_nonempty_15
  LDA #$01
  BNE api_text_rect_nonempty_15_ok
api_text_rect_nonempty_15:
  JMP api_text_rect_done_14
api_text_rect_nonempty_15_ok:
  CLC
  LDA #$00
  ADC #$28
  STA $C11D
  LDA #$00
  ADC #$00
  STA $C11E
  LDA $C11E
  CMP #$00
  BCC api_range_valid_16_upper
  BNE api_range_invalid_17
  LDA $C11D
  CMP #$29
  BCS api_range_invalid_17
api_range_valid_16_upper:
  LDA $C11E
  CMP #$00
  BCC api_range_invalid_17
  BNE api_range_valid_16
  LDA $C11D
  CMP #$01
  BCC api_range_invalid_17
  JMP api_range_valid_16
api_range_invalid_17:
  JMP api_text_rect_done_14
api_range_valid_16:
  CLC
  LDA #$14
  ADC #$01
  STA $C11F
  LDA #$00
  ADC #$00
  STA $C120
  LDA $C120
  CMP #$00
  BCC api_range_valid_18_upper
  BNE api_range_invalid_19
  LDA $C11F
  CMP #$1A
  BCS api_range_invalid_19
api_range_valid_18_upper:
  LDA $C120
  CMP #$00
  BCC api_range_invalid_19
  BNE api_range_valid_18
  LDA $C11F
  CMP #$01
  BCC api_range_invalid_19
  JMP api_range_valid_18
api_range_invalid_19:
  JMP api_text_rect_done_14
api_range_valid_18:
  LDA $C11F
  BNE runtime_word_dec_done_20
  DEC $C120
runtime_word_dec_done_20:
  DEC $C11F
  LDA #$14
  STA $C121
  LDA #$28
  STA $C122
api_text_rect_row_21:
  LDA #$00
  CMP #$00
  BCC api_range_valid_22_upper
  BNE api_range_invalid_23
  LDA $C121
  CMP #$19
  BCS api_range_invalid_23
api_range_valid_22_upper:
  JMP api_range_valid_22
api_range_invalid_23:
  JMP api_text_rect_done_14
api_range_valid_22:
  LDA $C121
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC #$00
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC #$00
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
api_text_rect_row_21_pixels:
  LDA #$20
  STA ($FB),Y
  LDA $0286
  AND #$0F
  STA ($FD),Y
  INY
  CPY $C122
  BNE api_text_rect_row_21_pixels
api_text_rect_row_21_next:
  LDA $C121
  CMP $C11F
  BEQ api_text_rect_row_21_next_done
  INC $C121
  JMP api_text_rect_row_21
api_text_rect_row_21_next_done:
api_text_rect_done_14:
  LDX #$00
printat_loop_24:
  LDA str_screen_0,X
  BEQ printat_done_25
  STA $0722,X
  LDA $0286
  AND #$0F
  STA $DB22,X
  INX
  BNE printat_loop_24
printat_done_25:
__js_return_27:
  RTS
user_routine___js_message_26_after:
  JMP user_routine___js_reset_6_after
user_routine___js_reset_6:
  LDA #$00
  LDX #$10
natural_array_fill_26:
  DEX
  STA __js_array_0,X
  BNE natural_array_fill_26
  LDA #$00
  STA $C103
  LDA #$00
  STA $C104
  JSR user_routine___js_press_9
  LDA #$02
  STA $C103
  LDA #$01
  STA $C104
  JSR user_routine___js_press_9
  LDA #$01
  STA $C103
  LDA #$02
  STA $C104
  JSR user_routine___js_press_9
  LDA #$00
  STA $C11A
  LDA #$00
  STA $C11B
  LDA #$00
  STA $C11C
  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  JSR user_routine___js_message_26
__js_return_7:
  RTS
user_routine___js_reset_6_after:
  JMP user_routine___js_draw_29_after
user_routine___js_draw_29:
  LDA #$00
  STA $C10B
__js_loop_32:
  LDA $C10B
  CMP #$04
  BCC condition_pass_28
  JMP control_if_else_27
condition_pass_28:
  LDA #$00
  STA $C10C
__js_loop_36:
  LDA $C10C
  CMP #$04
  BCC condition_pass_30
  JMP control_if_else_29
condition_pass_30:
  LDA $C10B
  STA $C10E
  LDA $C10E
  STA $C10F
  ASL $C10E
  ASL $C10E
  LDA $C10E
  STA $C10F
  LDA $C10F
  CLC
  ADC $C10C
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$00
  CMP #$00
  BCC api_range_valid_32_upper
  BNE api_range_invalid_33
  LDA $C10F
  CMP #$10
  BCS api_range_invalid_33
api_range_valid_32_upper:
  JMP api_range_valid_32
api_range_invalid_33:
  JMP natural_array_done_31
api_range_valid_32:
  LDX $C10F
  LDA __js_array_0,X
  STA $C110
natural_array_done_31:
  LDA $C110
  CMP #$00
  BNE condition_pass_35
  JMP control_if_else_34
condition_pass_35:
  LDA #$07
  STA $C10D
  JMP control_if_end_34
control_if_else_34:
  LDA #$0B
  STA $C10D
control_if_end_34:
  LDA $C10D
  STA $C111
  LDA $C10C
  CMP $C100
  BEQ condition_pass_37
  JMP control_if_else_36
condition_pass_37:
  LDA $C10B
  CMP $C101
  BEQ condition_pass_39
  JMP control_if_else_38
condition_pass_39:
  JMP __js_logic_yes_45
  JMP control_if_end_38
control_if_else_38:
  JMP __js_logic_no_46
control_if_end_38:
  JMP control_if_end_36
control_if_else_36:
  JMP __js_logic_no_46
control_if_end_36:
__js_logic_yes_45:
  LDA #$03
  STA $C111
  JMP __js_logic_end_47
__js_logic_no_46:
__js_logic_end_47:
  LDA $C10B
  STA $C10E
  LDA $C10E
  STA $C10F
  ASL $C10E
  ASL $C10E
  LDA $C10E
  STA $C10F
  LDA $C10F
  CLC
  ADC $C10C
  STA $C10F
  LDA #$00
  STA $C113
  LDA #$00
  CMP #$00
  BCC api_range_valid_41_upper
  BNE api_range_invalid_42
  LDA $C10F
  CMP #$10
  BCS api_range_invalid_42
api_range_valid_41_upper:
  JMP api_range_valid_41
api_range_invalid_42:
  JMP natural_array_done_40
api_range_valid_41:
  LDX $C10F
  LDA __js_array_0,X
  STA $C113
natural_array_done_40:
  LDA $C113
  CMP #$00
  BNE condition_pass_44
  JMP control_if_else_43
condition_pass_44:
  LDA #$51
  STA $C112
  JMP control_if_end_43
control_if_else_43:
  LDA #$57
  STA $C112
control_if_end_43:
  LDA $C112
  STA $C114
  LDA $C10C
  STA $C10E
  LDA $C10E
  STA $C10F
  ASL $C10E
  LDA $C10E
  CLC
  ADC $C10F
  STA $C10E
  LDA #$0E
  STA $C10F
  LDA $C10F
  CLC
  ADC $C10E
  STA $C10F
  LDA $C10B
  STA $C10E
  LDA $C10E
  STA $C115
  ASL $C10E
  LDA #$07
  STA $C115
  LDA $C115
  CLC
  ADC $C10E
  STA $C115
  LDA #$00
  CMP #$00
  BCC api_range_valid_46_upper
  BNE api_range_invalid_47
  LDA $C10F
  CMP #$28
  BCS api_range_invalid_47
api_range_valid_46_upper:
  JMP api_range_valid_46
api_range_invalid_47:
  JMP api_char_done_45
api_range_valid_46:
  LDA #$00
  CMP #$00
  BCC api_range_valid_48_upper
  BNE api_range_invalid_49
  LDA $C115
  CMP #$19
  BCS api_range_invalid_49
api_range_valid_48_upper:
  JMP api_range_valid_48
api_range_invalid_49:
  JMP api_char_done_45
api_range_valid_48:
  LDA $C115
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC $C10F
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC $C10F
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
  LDA $C114
  STA ($FB),Y
  LDA $C111
  AND #$0F
  STA ($FD),Y
api_char_done_45:
__js_loop_next_38:
  INC $C10C
  JMP __js_loop_36
  JMP control_if_end_29
control_if_else_29:
control_if_end_29:
__js_loop_end_37:
__js_loop_next_34:
  INC $C10B
  JMP __js_loop_32
  JMP control_if_end_27
control_if_else_27:
control_if_end_27:
__js_loop_end_33:
  LDA $C11A
  CLC
  ADC #$30
  STA $06BC
  LDA #$01
  STA $DABC
  LDA $C11B
  CLC
  ADC #$30
  STA $06BD
  LDA #$01
  STA $DABD
  LDA $C11C
  CLC
  ADC #$30
  STA $06BE
  LDA #$01
  STA $DABE
__js_return_30:
  RTS
user_routine___js_draw_29_after:
  JMP user_routine___js_init_4_after
user_routine___js_init_4:
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDA $DD02
  ORA #$03
  STA $DD02
  LDA $DD00
  AND #$FC
  ORA #$03
  STA $DD00
  LDA #$15
  STA $D018
  LDA $D011
  AND #$DF
  STA $D011
  LDA #$93
  JSR $FFD2
  LDX #$00
printat_loop_50:
  LDA str_screen_1,X
  BEQ printat_done_51
  STA $045B,X
  LDA $0286
  AND #$0F
  STA $D85B,X
  INX
  BNE printat_loop_50
printat_done_51:
  LDX #$00
printat_loop_52:
  LDA str_screen_2,X
  BEQ printat_done_53
  STA $04A7,X
  LDA $0286
  AND #$0F
  STA $D8A7,X
  INX
  BNE printat_loop_52
printat_done_53:
  LDX #$00
printat_loop_54:
  LDA str_screen_3,X
  BEQ printat_done_55
  STA $06B4,X
  LDA $0286
  AND #$0F
  STA $DAB4,X
  INX
  BNE printat_loop_54
printat_done_55:
  JSR user_routine___js_reset_6
  JSR user_routine___js_draw_29
__js_return_5:
  RTS
user_routine___js_init_4_after:
  JMP user_routine___js_solved_75_after
user_routine___js_solved_75:
  LDA #$00
  STA $C117
__js_loop_78:
  LDA $C117
  CMP #$10
  BCC condition_pass_57
  JMP control_if_else_56
condition_pass_57:
  LDA #$00
  STA $C118
  LDA #$00
  CMP #$00
  BCC api_range_valid_59_upper
  BNE api_range_invalid_60
  LDA $C117
  CMP #$10
  BCS api_range_invalid_60
api_range_valid_59_upper:
  JMP api_range_valid_59
api_range_invalid_60:
  JMP natural_array_done_58
api_range_valid_59:
  LDX $C117
  LDA __js_array_0,X
  STA $C118
natural_array_done_58:
  LDA $C118
  CMP #$00
  BNE condition_pass_62
  JMP control_if_else_61
condition_pass_62:
  LDA #$00
  STA $C119
  JMP __js_return_76
  JMP control_if_end_61
control_if_else_61:
control_if_end_61:
__js_loop_next_80:
  INC $C117
  JMP __js_loop_78
  JMP control_if_end_56
control_if_else_56:
control_if_end_56:
__js_loop_end_79:
  LDA #$01
  STA $C119
  JMP __js_return_76
__js_return_76:
  RTS
user_routine___js_solved_75_after:
  JMP user_routine___js_message_83_after
user_routine___js_message_83:
  LDA #$28
  BEQ api_text_rect_nonempty_64
  LDA #$01
  BNE api_text_rect_nonempty_64_ok
api_text_rect_nonempty_64:
  JMP api_text_rect_done_63
api_text_rect_nonempty_64_ok:
  CLC
  LDA #$00
  ADC #$28
  STA $C11D
  LDA #$00
  ADC #$00
  STA $C11E
  LDA $C11E
  CMP #$00
  BCC api_range_valid_65_upper
  BNE api_range_invalid_66
  LDA $C11D
  CMP #$29
  BCS api_range_invalid_66
api_range_valid_65_upper:
  LDA $C11E
  CMP #$00
  BCC api_range_invalid_66
  BNE api_range_valid_65
  LDA $C11D
  CMP #$01
  BCC api_range_invalid_66
  JMP api_range_valid_65
api_range_invalid_66:
  JMP api_text_rect_done_63
api_range_valid_65:
  CLC
  LDA #$14
  ADC #$01
  STA $C11F
  LDA #$00
  ADC #$00
  STA $C120
  LDA $C120
  CMP #$00
  BCC api_range_valid_67_upper
  BNE api_range_invalid_68
  LDA $C11F
  CMP #$1A
  BCS api_range_invalid_68
api_range_valid_67_upper:
  LDA $C120
  CMP #$00
  BCC api_range_invalid_68
  BNE api_range_valid_67
  LDA $C11F
  CMP #$01
  BCC api_range_invalid_68
  JMP api_range_valid_67
api_range_invalid_68:
  JMP api_text_rect_done_63
api_range_valid_67:
  LDA $C11F
  BNE runtime_word_dec_done_69
  DEC $C120
runtime_word_dec_done_69:
  DEC $C11F
  LDA #$14
  STA $C121
  LDA #$28
  STA $C122
api_text_rect_row_70:
  LDA #$00
  CMP #$00
  BCC api_range_valid_71_upper
  BNE api_range_invalid_72
  LDA $C121
  CMP #$19
  BCS api_range_invalid_72
api_range_valid_71_upper:
  JMP api_range_valid_71
api_range_invalid_72:
  JMP api_text_rect_done_63
api_range_valid_71:
  LDA $C121
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC #$00
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC #$00
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
api_text_rect_row_70_pixels:
  LDA #$20
  STA ($FB),Y
  LDA $0286
  AND #$0F
  STA ($FD),Y
  INY
  CPY $C122
  BNE api_text_rect_row_70_pixels
api_text_rect_row_70_next:
  LDA $C121
  CMP $C11F
  BEQ api_text_rect_row_70_next_done
  INC $C121
  JMP api_text_rect_row_70
api_text_rect_row_70_next_done:
api_text_rect_done_63:
  LDX #$00
printat_loop_73:
  LDA str_screen_4,X
  BEQ printat_done_74
  STA $0722,X
  LDA $0286
  AND #$0F
  STA $DB22,X
  INX
  BNE printat_loop_73
printat_done_74:
__js_return_84:
  RTS
user_routine___js_message_83_after:
  JMP user_routine___js_update_60_after
user_routine___js_update_60:
  LDA #$00
  STA $C116
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_76
  JMP control_if_else_75
joystick_current_pressed_76:
  LDA $C769
  AND #$04
  BNE condition_pass_76
  JMP control_if_else_75
condition_pass_76:
  LDA $C100
  CMP #$00
  BNE condition_not_equal_78
  JMP control_if_else_77
condition_not_equal_78:
  BCS condition_pass_78
  JMP control_if_else_77
condition_pass_78:
  JMP __js_logic_yes_63
  JMP control_if_end_77
control_if_else_77:
  JMP __js_logic_no_64
control_if_end_77:
  JMP control_if_end_75
control_if_else_75:
  JMP __js_logic_no_64
control_if_end_75:
__js_logic_yes_63:
  DEC $C100
  LDA #$01
  STA $C116
  JMP __js_logic_end_65
__js_logic_no_64:
__js_logic_end_65:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_80
  JMP control_if_else_79
joystick_current_pressed_80:
  LDA $C769
  AND #$08
  BNE condition_pass_80
  JMP control_if_else_79
condition_pass_80:
  LDA $C100
  CMP #$03
  BCC condition_pass_82
  JMP control_if_else_81
condition_pass_82:
  JMP __js_logic_yes_66
  JMP control_if_end_81
control_if_else_81:
  JMP __js_logic_no_67
control_if_end_81:
  JMP control_if_end_79
control_if_else_79:
  JMP __js_logic_no_67
control_if_end_79:
__js_logic_yes_66:
  INC $C100
  LDA #$01
  STA $C116
  JMP __js_logic_end_68
__js_logic_no_67:
__js_logic_end_68:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_84
  JMP control_if_else_83
joystick_current_pressed_84:
  LDA $C769
  AND #$01
  BNE condition_pass_84
  JMP control_if_else_83
condition_pass_84:
  LDA $C101
  CMP #$00
  BNE condition_not_equal_86
  JMP control_if_else_85
condition_not_equal_86:
  BCS condition_pass_86
  JMP control_if_else_85
condition_pass_86:
  JMP __js_logic_yes_69
  JMP control_if_end_85
control_if_else_85:
  JMP __js_logic_no_70
control_if_end_85:
  JMP control_if_end_83
control_if_else_83:
  JMP __js_logic_no_70
control_if_end_83:
__js_logic_yes_69:
  DEC $C101
  LDA #$01
  STA $C116
  JMP __js_logic_end_71
__js_logic_no_70:
__js_logic_end_71:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_88
  JMP control_if_else_87
joystick_current_pressed_88:
  LDA $C769
  AND #$02
  BNE condition_pass_88
  JMP control_if_else_87
condition_pass_88:
  LDA $C101
  CMP #$03
  BCC condition_pass_90
  JMP control_if_else_89
condition_pass_90:
  JMP __js_logic_yes_72
  JMP control_if_end_89
control_if_else_89:
  JMP __js_logic_no_73
control_if_end_89:
  JMP control_if_end_87
control_if_else_87:
  JMP __js_logic_no_73
control_if_end_87:
__js_logic_yes_72:
  INC $C101
  LDA #$01
  STA $C116
  JMP __js_logic_end_74
__js_logic_no_73:
__js_logic_end_74:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_92
  JMP control_if_else_91
joystick_current_pressed_92:
  LDA $C769
  AND #$10
  BNE condition_pass_92
  JMP control_if_else_91
condition_pass_92:
  LDA $C102
  CMP #$00
  BNE condition_pass_94
  JMP control_if_else_93
condition_pass_94:
  JSR user_routine___js_reset_6
  JMP control_if_end_93
control_if_else_93:
  LDA $C100
  STA $C103
  LDA $C101
  STA $C104
  JSR user_routine___js_press_9
  CLC
  LDA $C11C
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_95_2
  STA $C11C
  CLC
  JMP game_counter_next_95_2
game_counter_carry_95_2:
  SBC #$0A
  STA $C11C
  SEC
game_counter_next_95_2:
  LDA $C11B
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_95_1
  STA $C11B
  CLC
  JMP game_counter_next_95_1
game_counter_carry_95_1:
  SBC #$0A
  STA $C11B
  SEC
game_counter_next_95_1:
  LDA $C11A
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_95_0
  STA $C11A
  CLC
  JMP game_counter_next_95_0
game_counter_carry_95_0:
  SBC #$0A
  STA $C11A
  SEC
game_counter_next_95_0:
  JSR user_routine___js_solved_75
  LDA $C119
  STA $C102
  LDA $C102
  CMP #$00
  BNE condition_pass_97
  JMP control_if_else_96
condition_pass_97:
  JSR user_routine___js_message_83
  JMP control_if_end_96
control_if_else_96:
control_if_end_96:
control_if_end_93:
  LDA #$01
  STA $C116
  JMP control_if_end_91
control_if_else_91:
control_if_end_91:
  LDA $C116
  CMP #$00
  BNE condition_pass_99
  JMP control_if_else_98
condition_pass_99:
  JSR user_routine___js_draw_29
  JMP control_if_end_98
control_if_else_98:
control_if_end_98:
__js_return_61:
  RTS
user_routine___js_update_60_after:
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
  LDA $D011
  BMI game_frame_wait_leave
  LDA $D012
  CMP #$F0
  BCS game_frame_wait_leave
game_frame_wait_target:
  LDA $D011
  BMI game_frame_target_reached
  LDA $D012
  CMP #$F0
  BCC game_frame_wait_target
game_frame_target_reached:
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
  BNE game_frame_counter_done_100
  INC $C76B
game_frame_counter_done_100:
  JSR user_routine___js_update_60
  JMP game_frame_loop
; String pool
str_screen_0:
  .byte $0A, $0F, $19, $20, $32, $3A, $20, $0D, $0F, $16, $05, $20, $2F, $20, $06, $09, $12, $05, $3A, $20, $06, $0C, $09, $10, $00
str_screen_1:
  .byte $0C, $09, $07, $08, $14, $13, $20, $0F, $15, $14, $20, $2D, $20, $0A, $13, $00
str_screen_2:
  .byte $14, $15, $12, $0E, $20, $0F, $06, $06, $20, $01, $0C, $0C, $20, $14, $08, $05, $20, $0C, $09, $07, $08, $14, $13, $00
str_screen_3:
  .byte $0D, $0F, $16, $05, $13, $3A, $00
str_screen_4:
  .byte $13, $0F, $0C, $16, $05, $04, $21, $20, $06, $09, $12, $05, $20, $14, $0F, $20, $10, $0C, $01, $19, $20, $01, $07, $01, $09, $0E, $00
; User data
__js_array_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
api_text_1024_55296_0_0:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_1:
  .byte $04, $04, $04, $04, $04, $04, $04, $05, $05, $05, $05, $05, $05, $06, $06, $06, $06, $06, $06, $06, $07, $07, $07, $07, $07
api_text_1024_55296_0_2:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_3:
  .byte $D8, $D8, $D8, $D8, $D8, $D8, $D8, $D9, $D9, $D9, $D9, $D9, $D9, $DA, $DA, $DA, $DA, $DA, $DA, $DA, $DB, $DB, $DB, $DB, $DB
