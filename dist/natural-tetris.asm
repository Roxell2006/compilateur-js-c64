  LDA #$01
  STA $0286
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
  LDA #$00
  STA $C135
  LDA #$00
  STA $C136
  LDA #$00
  STA $C137
  LDA #$00
  STA $C138
  LDA #$00
  STA $C139
  LDA #$03
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  LDA #$00
  STA $C103
  LDA #$25
  STA $C104
  LDA #$00
  STA $C105
  JSR user_routine___js_init_9
  JMP user_routine___js_drawCell_27_after
user_routine___js_drawCell_27:
  LDA #$0F
  STA $C10D
  LDA $C10D
  CLC
  ADC $C10A
  STA $C10D
  LDA #$03
  STA $C10E
  LDA $C10E
  CLC
  ADC $C10B
  STA $C10E
  LDA #$40
  STA $C10F
  LDA $C10F
  CLC
  ADC $C10C
  STA $C10F
  LDA $C10C
  CMP #$02
  BEQ condition_pass_1
  JMP control_if_else_0
condition_pass_1:
  LDA #$07
  STA $C110
  JMP control_if_end_0
control_if_else_0:
  LDA #$0E
  STA $C110
control_if_end_0:
  LDA #$00
  CMP #$00
  BCC api_range_valid_3_upper
  BNE api_range_invalid_4
  LDA $C10D
  CMP #$28
  BCS api_range_invalid_4
api_range_valid_3_upper:
  JMP api_range_valid_3
api_range_invalid_4:
  JMP api_char_done_2
api_range_valid_3:
  LDA #$00
  CMP #$00
  BCC api_range_valid_5_upper
  BNE api_range_invalid_6
  LDA $C10E
  CMP #$19
  BCS api_range_invalid_6
api_range_valid_5_upper:
  JMP api_range_valid_5
api_range_invalid_6:
  JMP api_char_done_2
api_range_valid_5:
  LDA $C10E
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC $C10D
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC $C10D
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
  LDA $C10F
  STA ($FB),Y
  LDA $C110
  AND #$0F
  STA ($FD),Y
api_char_done_2:
__js_return_28:
  RTS
user_routine___js_drawCell_27_after:
  JMP user_routine___js_drawBoard_13_after
user_routine___js_drawBoard_13:
  LDA #$00
  STA $C106
__js_loop_16:
  LDA $C106
  CMP #$14
  BCC condition_pass_8
  JMP control_if_else_7
condition_pass_8:
  LDA #$00
  STA $C107
__js_loop_20:
  LDA $C107
  CMP #$0A
  BCC condition_pass_10
  JMP control_if_else_9
condition_pass_10:
  LDA $C106
  STA $C108
  LDA $C108
  STA $C109
  ASL $C108
  ASL $C108
  LDA $C108
  CLC
  ADC $C109
  STA $C108
  ASL $C108
  LDA $C108
  STA $C109
  LDA $C109
  CLC
  ADC $C107
  STA $C109
  LDA #$00
  STA $C10C
  LDA #$00
  CMP #$00
  BCC api_range_valid_12_upper
  BNE api_range_invalid_13
  LDA $C109
  CMP #$C8
  BCS api_range_invalid_13
api_range_valid_12_upper:
  JMP api_range_valid_12
api_range_invalid_13:
  JMP natural_array_done_11
api_range_valid_12:
  LDX $C109
  LDA __js_array_0,X
  STA $C10C
natural_array_done_11:
  LDA $C107
  STA $C10A
  LDA $C106
  STA $C10B
  JSR user_routine___js_drawCell_27
__js_loop_next_22:
  INC $C107
  JMP __js_loop_20
  JMP control_if_end_9
control_if_else_9:
control_if_end_9:
__js_loop_end_21:
__js_loop_next_18:
  INC $C106
  JMP __js_loop_16
  JMP control_if_end_7
control_if_else_7:
control_if_end_7:
__js_loop_end_17:
  LDA $C135
  CLC
  ADC #$30
  STA $0541
  LDA #$07
  STA $D941
  LDA $C136
  CLC
  ADC #$30
  STA $0542
  LDA #$07
  STA $D942
  LDA $C137
  CLC
  ADC #$30
  STA $0543
  LDA #$07
  STA $D943
  LDA $C138
  CLC
  ADC #$30
  STA $0544
  LDA #$07
  STA $D944
  LDA $C139
  CLC
  ADC #$30
  STA $0545
  LDA #$07
  STA $D945
__js_return_14:
  RTS
user_routine___js_drawBoard_13_after:
  JMP user_routine___js_fits_45_after
user_routine___js_fits_45:
  LDA $C113
  CMP #$0A
  BCS condition_pass_15
  JMP control_if_else_14
condition_pass_15:
  JMP __js_logic_yes_50
  JMP control_if_end_14
control_if_else_14:
  LDA $C114
  CMP #$14
  BCS condition_pass_17
  JMP control_if_else_16
condition_pass_17:
  JMP __js_logic_yes_50
  JMP control_if_end_16
control_if_else_16:
  JMP __js_logic_no_51
control_if_end_16:
control_if_end_14:
__js_logic_yes_50:
  LDA #$00
  STA $C116
  JMP __js_return_46
  JMP __js_logic_end_52
__js_logic_no_51:
__js_logic_end_52:
  LDA #$00
  STA $C117
__js_loop_55:
  LDA $C117
  CMP #$04
  BCC condition_pass_19
  JMP control_if_else_18
condition_pass_19:
  LDA $C102
  STA $C118
  LDA $C118
  CLC
  ADC $C115
  STA $C118
  LDA $C118
  CLC
  ADC $C117
  STA $C118
  LDA #$00
  STA $C119
  LDA #$00
  CMP #$00
  BCC api_range_valid_21_upper
  BNE api_range_invalid_22
  LDA $C118
  CMP #$40
  BCS api_range_invalid_22
api_range_valid_21_upper:
  JMP api_range_valid_21
api_range_invalid_22:
  JMP natural_array_done_20
api_range_valid_21:
  LDX $C118
  LDA __js_array_1,X
  STA $C119
natural_array_done_20:
  LDA $C113
  STA $C11A
  LDA $C11A
  CLC
  ADC $C119
  STA $C11A
  LDA #$00
  STA $C119
  LDA #$00
  CMP #$00
  BCC api_range_valid_24_upper
  BNE api_range_invalid_25
  LDA $C118
  CMP #$40
  BCS api_range_invalid_25
api_range_valid_24_upper:
  JMP api_range_valid_24
api_range_invalid_25:
  JMP natural_array_done_23
api_range_valid_24:
  LDX $C118
  LDA __js_array_2,X
  STA $C119
natural_array_done_23:
  LDA $C114
  STA $C11B
  LDA $C11B
  CLC
  ADC $C119
  STA $C11B
  LDA $C11A
  CMP #$0A
  BCS condition_pass_27
  JMP control_if_else_26
condition_pass_27:
  JMP __js_logic_yes_67
  JMP control_if_end_26
control_if_else_26:
  LDA $C11B
  CMP #$14
  BCS condition_pass_29
  JMP control_if_else_28
condition_pass_29:
  JMP __js_logic_yes_67
  JMP control_if_end_28
control_if_else_28:
  JMP __js_logic_no_68
control_if_end_28:
control_if_end_26:
__js_logic_yes_67:
  LDA #$00
  STA $C116
  JMP __js_return_46
  JMP __js_logic_end_69
__js_logic_no_68:
__js_logic_end_69:
  LDA $C11B
  STA $C119
  LDA $C119
  STA $C11C
  ASL $C119
  ASL $C119
  LDA $C119
  CLC
  ADC $C11C
  STA $C119
  ASL $C119
  LDA $C119
  STA $C11C
  LDA $C11C
  CLC
  ADC $C11A
  STA $C11C
  LDA #$00
  STA $C11D
  LDA #$00
  CMP #$00
  BCC api_range_valid_31_upper
  BNE api_range_invalid_32
  LDA $C11C
  CMP #$C8
  BCS api_range_invalid_32
api_range_valid_31_upper:
  JMP api_range_valid_31
api_range_invalid_32:
  JMP natural_array_done_30
api_range_valid_31:
  LDX $C11C
  LDA __js_array_0,X
  STA $C11D
natural_array_done_30:
  LDA $C11D
  CMP #$00
  BNE condition_pass_34
  JMP control_if_else_33
condition_pass_34:
  LDA #$00
  STA $C116
  JMP __js_return_46
  JMP control_if_end_33
control_if_else_33:
control_if_end_33:
__js_loop_next_57:
  INC $C117
  JMP __js_loop_55
  JMP control_if_end_18
control_if_else_18:
control_if_end_18:
__js_loop_end_56:
  LDA #$01
  STA $C116
  JMP __js_return_46
__js_return_46:
  RTS
user_routine___js_fits_45_after:
  JMP user_routine___js_paintPiece_74_after
user_routine___js_paintPiece_74:
  LDA #$00
  STA $C11F
__js_loop_78:
  LDA $C11F
  CMP #$04
  BCC condition_pass_36
  JMP control_if_else_35
condition_pass_36:
  LDA $C102
  STA $C120
  LDA $C120
  CLC
  ADC $C103
  STA $C120
  LDA $C120
  CLC
  ADC $C11F
  STA $C120
  LDA #$00
  STA $C121
  LDA #$00
  CMP #$00
  BCC api_range_valid_38_upper
  BNE api_range_invalid_39
  LDA $C120
  CMP #$40
  BCS api_range_invalid_39
api_range_valid_38_upper:
  JMP api_range_valid_38
api_range_invalid_39:
  JMP natural_array_done_37
api_range_valid_38:
  LDX $C120
  LDA __js_array_1,X
  STA $C121
natural_array_done_37:
  LDA $C100
  STA $C122
  LDA $C122
  CLC
  ADC $C121
  STA $C122
  LDA #$00
  STA $C121
  LDA #$00
  CMP #$00
  BCC api_range_valid_41_upper
  BNE api_range_invalid_42
  LDA $C120
  CMP #$40
  BCS api_range_invalid_42
api_range_valid_41_upper:
  JMP api_range_valid_41
api_range_invalid_42:
  JMP natural_array_done_40
api_range_valid_41:
  LDX $C120
  LDA __js_array_2,X
  STA $C121
natural_array_done_40:
  LDA $C101
  STA $C123
  LDA $C123
  CLC
  ADC $C121
  STA $C123
  LDA $C122
  STA $C10A
  LDA $C123
  STA $C10B
  LDA $C11E
  STA $C10C
  JSR user_routine___js_drawCell_27
  LDA $C11E
  CMP #$01
  BEQ condition_pass_44
  JMP control_if_else_43
condition_pass_44:
  LDA $C123
  STA $C121
  LDA $C121
  STA $C124
  ASL $C121
  ASL $C121
  LDA $C121
  CLC
  ADC $C124
  STA $C121
  ASL $C121
  LDA $C121
  STA $C124
  LDA $C124
  CLC
  ADC $C122
  STA $C124
  LDA #$01
  STA $C121
  LDA #$00
  CMP #$00
  BCC api_range_valid_46_upper
  BNE api_range_invalid_47
  LDA $C124
  CMP #$C8
  BCS api_range_invalid_47
api_range_valid_46_upper:
  JMP api_range_valid_46
api_range_invalid_47:
  JMP natural_array_done_45
api_range_valid_46:
  LDX $C124
  LDA $C121
  STA __js_array_0,X
natural_array_done_45:
  JMP control_if_end_43
control_if_else_43:
control_if_end_43:
__js_loop_next_80:
  INC $C11F
  JMP __js_loop_78
  JMP control_if_end_35
control_if_else_35:
control_if_end_35:
__js_loop_end_79:
__js_return_75:
  RTS
user_routine___js_paintPiece_74_after:
  JMP user_routine___js_spawn_36_after
user_routine___js_spawn_36:
  LDA $C104
  STA $C111
  LDA $C111
  CLC
  ADC #$49
  STA $C111
  LDA $C111
  EOR #$A7
  STA $C111
  LDA $C111
  STA $C104
  LDA $C104
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
  LDA $C104
  STA $C102
  LDA $C102
  AND #$30
  STA $C102
  LDA $C104
  STA $C103
  LDA $C103
  AND #$0C
  STA $C103
  LDA $C100
  STA $C113
  LDA $C101
  STA $C114
  LDA $C103
  STA $C115
  JSR user_routine___js_fits_45
  LDA $C116
  CMP #$00
  BNE condition_pass_49
  JMP control_if_else_48
condition_pass_49:
  LDA #$00
  STA $C112
  JMP control_if_end_48
control_if_else_48:
  LDA #$01
  STA $C112
control_if_end_48:
  LDA $C112
  STA $C105
  LDA $C105
  CMP #$00
  BNE condition_pass_51
  JMP control_if_else_50
condition_pass_51:
  LDA #$02
  STA $D020
  LDX #$00
printat_loop_52:
  LDA str_screen_0,X
  BEQ printat_done_53
  STA $06F9,X
  LDA #$02
  STA $DAF9,X
  INX
  BNE printat_loop_52
printat_done_53:
  JMP control_if_end_50
control_if_else_50:
  LDA #$02
  STA $C11E
  JSR user_routine___js_paintPiece_74
control_if_end_50:
__js_return_37:
  RTS
user_routine___js_spawn_36_after:
  JMP user_routine___js_newGame_11_after
user_routine___js_newGame_11:
  LDA #$00
  LDX #$C8
natural_array_fill_54:
  DEX
  STA __js_array_0,X
  BNE natural_array_fill_54
  LDA #$25
  STA $C104
  LDA #$00
  STA $C135
  LDA #$00
  STA $C136
  LDA #$00
  STA $C137
  LDA #$00
  STA $C138
  LDA #$00
  STA $C139
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDX #$00
printat_loop_55:
  LDA str_screen_1,X
  BEQ printat_done_56
  STA $0479,X
  LDA $0286
  AND #$0F
  STA $D879,X
  INX
  BNE printat_loop_55
printat_done_56:
  LDX #$00
printat_loop_57:
  LDA str_screen_2,X
  BEQ printat_done_58
  STA $04F1,X
  LDA $0286
  AND #$0F
  STA $D8F1,X
  INX
  BNE printat_loop_57
printat_done_58:
  LDX #$00
printat_loop_59:
  LDA str_screen_3,X
  BEQ printat_done_60
  STA $05E1,X
  LDA $0286
  AND #$0F
  STA $D9E1,X
  INX
  BNE printat_loop_59
printat_done_60:
  LDX #$00
printat_loop_61:
  LDA str_screen_4,X
  BEQ printat_done_62
  STA $0631,X
  LDA $0286
  AND #$0F
  STA $DA31,X
  INX
  BNE printat_loop_61
printat_done_62:
  LDX #$00
printat_loop_63:
  LDA str_screen_5,X
  BEQ printat_done_64
  STA $0681,X
  LDA $0286
  AND #$0F
  STA $DA81,X
  INX
  BNE printat_loop_63
printat_done_64:
  LDA #$0C
  BEQ api_text_rect_nonempty_66
  LDA #$16
  BNE api_text_rect_nonempty_66_ok
api_text_rect_nonempty_66:
  JMP api_text_rect_done_65
api_text_rect_nonempty_66_ok:
  CLC
  LDA #$0E
  ADC #$0C
  STA $C13C
  LDA #$00
  ADC #$00
  STA $C13D
  LDA $C13D
  CMP #$00
  BCC api_range_valid_67_upper
  BNE api_range_invalid_68
  LDA $C13C
  CMP #$29
  BCS api_range_invalid_68
api_range_valid_67_upper:
  LDA $C13D
  CMP #$00
  BCC api_range_invalid_68
  BNE api_range_valid_67
  LDA $C13C
  CMP #$01
  BCC api_range_invalid_68
  JMP api_range_valid_67
api_range_invalid_68:
  JMP api_text_rect_done_65
api_range_valid_67:
  CLC
  LDA #$02
  ADC #$16
  STA $C13E
  LDA #$00
  ADC #$00
  STA $C13F
  LDA $C13F
  CMP #$00
  BCC api_range_valid_69_upper
  BNE api_range_invalid_70
  LDA $C13E
  CMP #$1A
  BCS api_range_invalid_70
api_range_valid_69_upper:
  LDA $C13F
  CMP #$00
  BCC api_range_invalid_70
  BNE api_range_valid_69
  LDA $C13E
  CMP #$01
  BCC api_range_invalid_70
  JMP api_range_valid_69
api_range_invalid_70:
  JMP api_text_rect_done_65
api_range_valid_69:
  LDA $C13E
  BNE runtime_word_dec_done_71
  DEC $C13F
runtime_word_dec_done_71:
  DEC $C13E
  LDA #$02
  STA $C140
  LDA #$0C
  STA $C141
api_text_rect_row_72:
  LDA #$00
  CMP #$00
  BCC api_range_valid_73_upper
  BNE api_range_invalid_74
  LDA $C140
  CMP #$19
  BCS api_range_invalid_74
api_range_valid_73_upper:
  JMP api_range_valid_73
api_range_invalid_74:
  JMP api_text_rect_done_65
api_range_valid_73:
  LDA $C140
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC #$0E
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC #$0E
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
  LDA $C140
  CMP #$02
  BEQ api_text_rect_row_72_pixels
  CMP $C13E
  BEQ api_text_rect_row_72_pixels
  LDA #$43
  STA ($FB),Y
  LDA $0286
  AND #$0F
  STA ($FD),Y
  LDY $C141
  DEY
  LDA #$43
  STA ($FB),Y
  LDA $0286
  AND #$0F
  STA ($FD),Y
  JMP api_text_rect_row_72_next
api_text_rect_row_72_pixels:
  LDA #$43
  STA ($FB),Y
  LDA $0286
  AND #$0F
  STA ($FD),Y
  INY
  CPY $C141
  BNE api_text_rect_row_72_pixels
api_text_rect_row_72_next:
  LDA $C140
  CMP $C13E
  BEQ api_text_rect_row_72_next_done
  INC $C140
  JMP api_text_rect_row_72
api_text_rect_row_72_next_done:
api_text_rect_done_65:
  JSR user_routine___js_drawBoard_13
  JSR user_routine___js_spawn_36
__js_return_12:
  RTS
user_routine___js_newGame_11_after:
  JMP user_routine___js_init_9_after
user_routine___js_init_9:
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
  PHP
  SEI
  LDA $01
  PHA
  AND #$FB
  STA $01
  LDX #$00
charset_rom_copy_75:
  LDA $D000,X
  STA $3000,X
  LDA $D100,X
  STA $3100,X
  INX
  BNE charset_rom_copy_75
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
  JSR user_routine___js_newGame_11
__js_return_10:
  RTS
user_routine___js_init_9_after:
  JMP user_routine___js_move_98_after
user_routine___js_move_98:
  LDA $C125
  STA $C113
  LDA $C126
  STA $C114
  LDA $C127
  STA $C115
  JSR user_routine___js_fits_45
  LDA $C116
  CMP #$00
  BNE condition_pass_77
  JMP control_if_else_76
condition_pass_77:
  JMP control_if_end_76
control_if_else_76:
  LDA #$00
  STA $C128
  JMP __js_return_99
control_if_end_76:
  LDA #$00
  STA $C11E
  JSR user_routine___js_paintPiece_74
  LDA $C125
  STA $C100
  LDA $C126
  STA $C101
  LDA $C127
  STA $C103
  LDA #$02
  STA $C11E
  JSR user_routine___js_paintPiece_74
  LDA #$01
  STA $C128
  JMP __js_return_99
__js_return_99:
  RTS
user_routine___js_move_98_after:
  JMP user_routine___js_clearLines_110_after
user_routine___js_clearLines_110:
  LDA #$14
  STA $C129
  LDA #$00
  STA $C12A
__js_loop_114:
  LDA $C129
  CMP #$00
  BNE condition_not_equal_79
  JMP control_if_else_78
condition_not_equal_79:
  BCS condition_pass_79
  JMP control_if_else_78
condition_pass_79:
  DEC $C129
  LDA #$01
  STA $C12B
  LDA #$00
  STA $C12C
__js_loop_119:
  LDA $C12C
  CMP #$0A
  BCC condition_pass_81
  JMP control_if_else_80
condition_pass_81:
  LDA $C129
  STA $C12D
  LDA $C12D
  STA $C12E
  ASL $C12D
  ASL $C12D
  LDA $C12D
  CLC
  ADC $C12E
  STA $C12D
  ASL $C12D
  LDA $C12D
  STA $C12E
  LDA $C12E
  CLC
  ADC $C12C
  STA $C12E
  LDA #$00
  STA $C12F
  LDA #$00
  CMP #$00
  BCC api_range_valid_83_upper
  BNE api_range_invalid_84
  LDA $C12E
  CMP #$C8
  BCS api_range_invalid_84
api_range_valid_83_upper:
  JMP api_range_valid_83
api_range_invalid_84:
  JMP natural_array_done_82
api_range_valid_83:
  LDX $C12E
  LDA __js_array_0,X
  STA $C12F
natural_array_done_82:
  LDA $C12F
  CMP #$00
  BEQ condition_pass_86
  JMP control_if_else_85
condition_pass_86:
  LDA #$00
  STA $C12B
  JMP control_if_end_85
control_if_else_85:
control_if_end_85:
__js_loop_next_121:
  INC $C12C
  JMP __js_loop_119
  JMP control_if_end_80
control_if_else_80:
control_if_end_80:
__js_loop_end_120:
  LDA $C12B
  CMP #$00
  BNE condition_pass_88
  JMP control_if_else_87
condition_pass_88:
  LDA #$01
  STA $C12A
  LDA $C129
  STA $C130
__js_loop_127:
  LDA $C130
  CMP #$00
  BNE condition_not_equal_90
  JMP control_if_else_89
condition_not_equal_90:
  BCS condition_pass_90
  JMP control_if_else_89
condition_pass_90:
  LDA #$00
  STA $C131
__js_loop_131:
  LDA $C131
  CMP #$0A
  BCC condition_pass_92
  JMP control_if_else_91
condition_pass_92:
  LDA $C130
  STA $C12D
  LDA $C12D
  STA $C12E
  ASL $C12D
  ASL $C12D
  LDA $C12D
  CLC
  ADC $C12E
  STA $C12D
  ASL $C12D
  LDA $C12D
  STA $C12E
  LDA $C12E
  CLC
  ADC $C131
  STA $C12E
  LDA $C130
  STA $C12D
  DEC $C12D
  LDA $C12D
  STA $C132
  ASL $C12D
  ASL $C12D
  LDA $C12D
  CLC
  ADC $C132
  STA $C12D
  ASL $C12D
  LDA $C12D
  STA $C132
  LDA $C132
  CLC
  ADC $C131
  STA $C132
  LDA #$00
  STA $C12D
  LDA #$00
  CMP #$00
  BCC api_range_valid_94_upper
  BNE api_range_invalid_95
  LDA $C132
  CMP #$C8
  BCS api_range_invalid_95
api_range_valid_94_upper:
  JMP api_range_valid_94
api_range_invalid_95:
  JMP natural_array_done_93
api_range_valid_94:
  LDX $C132
  LDA __js_array_0,X
  STA $C12D
natural_array_done_93:
  LDA #$00
  CMP #$00
  BCC api_range_valid_97_upper
  BNE api_range_invalid_98
  LDA $C12E
  CMP #$C8
  BCS api_range_invalid_98
api_range_valid_97_upper:
  JMP api_range_valid_97
api_range_invalid_98:
  JMP natural_array_done_96
api_range_valid_97:
  LDX $C12E
  LDA $C12D
  STA __js_array_0,X
natural_array_done_96:
__js_loop_next_133:
  INC $C131
  JMP __js_loop_131
  JMP control_if_end_91
control_if_else_91:
control_if_end_91:
__js_loop_end_132:
__js_loop_next_129:
  DEC $C130
  JMP __js_loop_127
  JMP control_if_end_89
control_if_else_89:
control_if_end_89:
__js_loop_end_128:
  LDA #$00
  STA $C133
__js_loop_145:
  LDA $C133
  CMP #$0A
  BCC condition_pass_100
  JMP control_if_else_99
condition_pass_100:
  LDA $C133
  STA $C12D
  LDA #$00
  STA $C12E
  LDA #$00
  CMP #$00
  BCC api_range_valid_102_upper
  BNE api_range_invalid_103
  LDA $C12D
  CMP #$C8
  BCS api_range_invalid_103
api_range_valid_102_upper:
  JMP api_range_valid_102
api_range_invalid_103:
  JMP natural_array_done_101
api_range_valid_102:
  LDX $C12D
  LDA $C12E
  STA __js_array_0,X
natural_array_done_101:
__js_loop_next_147:
  INC $C133
  JMP __js_loop_145
  JMP control_if_end_99
control_if_else_99:
control_if_end_99:
__js_loop_end_146:
  CLC
  LDA $C139
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_104_4
  STA $C139
  CLC
  JMP game_counter_next_104_4
game_counter_carry_104_4:
  SBC #$0A
  STA $C139
  SEC
game_counter_next_104_4:
  LDA $C138
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_104_3
  STA $C138
  CLC
  JMP game_counter_next_104_3
game_counter_carry_104_3:
  SBC #$0A
  STA $C138
  SEC
game_counter_next_104_3:
  LDA $C137
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_104_2
  STA $C137
  CLC
  JMP game_counter_next_104_2
game_counter_carry_104_2:
  SBC #$0A
  STA $C137
  SEC
game_counter_next_104_2:
  LDA $C136
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_104_1
  STA $C136
  CLC
  JMP game_counter_next_104_1
game_counter_carry_104_1:
  SBC #$0A
  STA $C136
  SEC
game_counter_next_104_1:
  LDA $C135
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_104_0
  STA $C135
  CLC
  JMP game_counter_next_104_0
game_counter_carry_104_0:
  SBC #$0A
  STA $C135
  SEC
game_counter_next_104_0:
  INC $C129
  JMP control_if_end_87
control_if_else_87:
control_if_end_87:
__js_loop_next_116:
  JMP __js_loop_114
  JMP control_if_end_78
control_if_else_78:
control_if_end_78:
__js_loop_end_115:
  LDA $C12A
  STA $C134
  JMP __js_return_111
__js_return_111:
  RTS
user_routine___js_clearLines_110_after:
  JMP user_routine___js_drop_107_after
user_routine___js_drop_107:
  LDA $C101
  STA $C126
  INC $C126
  LDA $C100
  STA $C125
  LDA $C103
  STA $C127
  JSR user_routine___js_move_98
  LDA $C128
  CMP #$00
  BNE condition_pass_106
  JMP control_if_else_105
condition_pass_106:
  JMP __js_return_108
  JMP control_if_end_105
control_if_else_105:
control_if_end_105:
  LDA #$01
  STA $C11E
  JSR user_routine___js_paintPiece_74
  CLC
  LDA $C139
  ADC #$01
  CMP #$0A
  BCS game_counter_carry_107_4
  STA $C139
  CLC
  JMP game_counter_next_107_4
game_counter_carry_107_4:
  SBC #$0A
  STA $C139
  SEC
game_counter_next_107_4:
  LDA $C138
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_107_3
  STA $C138
  CLC
  JMP game_counter_next_107_3
game_counter_carry_107_3:
  SBC #$0A
  STA $C138
  SEC
game_counter_next_107_3:
  LDA $C137
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_107_2
  STA $C137
  CLC
  JMP game_counter_next_107_2
game_counter_carry_107_2:
  SBC #$0A
  STA $C137
  SEC
game_counter_next_107_2:
  LDA $C136
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_107_1
  STA $C136
  CLC
  JMP game_counter_next_107_1
game_counter_carry_107_1:
  SBC #$0A
  STA $C136
  SEC
game_counter_next_107_1:
  LDA $C135
  ADC #$00
  CMP #$0A
  BCS game_counter_carry_107_0
  STA $C135
  CLC
  JMP game_counter_next_107_0
game_counter_carry_107_0:
  SBC #$0A
  STA $C135
  SEC
game_counter_next_107_0:
  JSR user_routine___js_clearLines_110
  LDA $C134
  CMP #$00
  BNE condition_pass_109
  JMP control_if_else_108
condition_pass_109:
  JSR user_routine___js_drawBoard_13
  JMP control_if_end_108
control_if_else_108:
  LDA $C135
  CLC
  ADC #$30
  STA $0541
  LDA #$07
  STA $D941
  LDA $C136
  CLC
  ADC #$30
  STA $0542
  LDA #$07
  STA $D942
  LDA $C137
  CLC
  ADC #$30
  STA $0543
  LDA #$07
  STA $D943
  LDA $C138
  CLC
  ADC #$30
  STA $0544
  LDA #$07
  STA $D944
  LDA $C139
  CLC
  ADC #$30
  STA $0545
  LDA #$07
  STA $D945
control_if_end_108:
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
  JSR user_routine___js_spawn_36
__js_return_108:
  RTS
user_routine___js_drop_107_after:
  JMP user_routine___js_update_95_after
user_routine___js_update_95:
  LDA $C105
  CMP #$00
  BNE condition_pass_111
  JMP control_if_else_110
condition_pass_111:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_113
  JMP control_if_else_112
joystick_current_pressed_113:
  LDA $C769
  AND #$10
  BNE condition_pass_113
  JMP control_if_else_112
condition_pass_113:
  JSR user_routine___js_newGame_11
  JMP control_if_end_112
control_if_else_112:
control_if_end_112:
  JMP __js_return_96
  JMP control_if_end_110
control_if_else_110:
control_if_end_110:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_115
  JMP control_if_else_114
joystick_current_pressed_115:
  LDA $C769
  AND #$04
  BNE condition_pass_115
  JMP control_if_else_114
condition_pass_115:
  LDA $C100
  STA $C125
  DEC $C125
  LDA $C101
  STA $C126
  LDA $C103
  STA $C127
  JSR user_routine___js_move_98
  JMP control_if_end_114
control_if_else_114:
control_if_end_114:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_117
  JMP control_if_else_116
joystick_current_pressed_117:
  LDA $C769
  AND #$08
  BNE condition_pass_117
  JMP control_if_else_116
condition_pass_117:
  LDA $C100
  STA $C125
  INC $C125
  LDA $C101
  STA $C126
  LDA $C103
  STA $C127
  JSR user_routine___js_move_98
  JMP control_if_end_116
control_if_else_116:
control_if_end_116:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_119
  JMP control_if_else_118
joystick_current_pressed_119:
  LDA $C769
  AND #$10
  BNE condition_pass_119
  JMP control_if_else_118
condition_pass_119:
  LDA $C103
  STA $C127
  LDA $C127
  CLC
  ADC #$04
  STA $C127
  LDA $C127
  AND #$0F
  STA $C127
  LDA $C100
  STA $C125
  LDA $C101
  STA $C126
  JSR user_routine___js_move_98
  JMP control_if_end_118
control_if_else_118:
control_if_end_118:
  LDA $C767
  AND #$02
  BEQ condition_pass_121
  JMP control_if_else_120
condition_pass_121:
  INC $C13A
  LDA $C13A
  CMP #$02
  BCS game_every_run_122
  JMP game_every_done_123
game_every_run_122:
  LDA #$00
  STA $C13A
  JSR user_routine___js_drop_107
game_every_done_123:
  JMP control_if_end_120
control_if_else_120:
  INC $C13B
  LDA $C13B
  CMP #$0C
  BCS game_every_run_124
  JMP game_every_done_125
game_every_run_124:
  LDA #$00
  STA $C13B
  JSR user_routine___js_drop_107
game_every_done_125:
control_if_end_120:
__js_return_96:
  RTS
user_routine___js_update_95_after:
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
  LDA #$00
  STA $C13A
  LDA #$00
  STA $C13B
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
  BNE game_frame_counter_done_126
  INC $C76B
game_frame_counter_done_126:
  JSR user_routine___js_update_95
  JMP game_frame_loop
; String pool
str_screen_0:
  .byte $07, $01, $0D, $05, $20, $0F, $16, $05, $12, $00
str_screen_1:
  .byte $14, $05, $14, $12, $09, $13, $20, $0D, $09, $0E, $09, $00
str_screen_2:
  .byte $13, $03, $0F, $12, $05, $00
str_screen_3:
  .byte $0A, $0F, $19, $20, $32, $00
str_screen_4:
  .byte $04, $0F, $17, $0E, $3A, $20, $06, $01, $13, $14, $00
str_screen_5:
  .byte $06, $09, $12, $05, $3A, $20, $14, $15, $12, $0E, $00
; User data
__js_array_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
__js_array_1:
  .byte $00, $01, $02, $01, $01, $00, $01, $01, $01, $00, $01, $02, $00, $00, $01, $00, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $00, $00, $01, $00, $00, $01, $02, $00, $01, $01, $01, $00, $01, $02, $02
__js_array_2:
  .byte $00, $00, $00, $01, $00, $01, $01, $02, $00, $01, $01, $01, $00, $01, $01, $02, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $01, $01, $00, $00, $00, $00, $00, $01, $02, $03, $00, $00, $00, $00, $00, $01, $02, $03, $00, $01, $02, $02, $00, $01, $00, $00, $00, $00, $01, $02, $01, $01, $01, $00
asset_map_collisions_0:
  .byte $00, $01, $00
asset_map_chars_0:
  .byte $40, $41, $42
asset_map_colors_0:
  .byte $00, $0E, $07
asset_rle_1:
  .byte $C8, $00
api_text_1024_55296_0_0:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_1:
  .byte $04, $04, $04, $04, $04, $04, $04, $05, $05, $05, $05, $05, $05, $06, $06, $06, $06, $06, $06, $06, $07, $07, $07, $07, $07
api_text_1024_55296_0_2:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_3:
  .byte $D8, $D8, $D8, $D8, $D8, $D8, $D8, $D9, $D9, $D9, $D9, $D9, $D9, $DA, $DA, $DA, $DA, $DA, $DA, $DA, $DB, $DB, $DB, $DB, $DB
asset_bytes_3:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $BD, $81, $FF, $00, $3C, $7E, $FF, $FF, $FF, $FF, $7E, $3C, $FF, $FF, $C3, $C3, $C3, $C3, $FF, $FF
