  LDA #$01
  STA $0286
  LDA #$A0
  STA $C100
  LDA #$00
  STA $C101
  LDA #$64
  STA $C102
  LDA #$08
  STA $C103
  LDA #$01
  STA $C104
  LDA #$00
  STA $C105
  LDA #$01
  STA $C106
  JSR user_routine___js_init_6
  JMP user_routine___js_draw_8_after
user_routine___js_draw_8:
  LDA $C105
  CMP #$00
  BEQ condition_pass_1
  JMP control_if_else_0
condition_pass_1:
  LDA $DD02
  ORA #$03
  STA $DD02
  LDA $DD00
  AND #$FC
  ORA #$02
  STA $DD00
  LDA $D018
  AND #$0F
  ORA #$70
  STA $D018
  LDA $D018
  AND #$F0
  ORA #$08
  STA $D018
  LDA $D011
  ORA #$20
  STA $D011
  LDA $C101
  CMP #$01
  BCC api_range_valid_3_upper
  BNE api_range_invalid_4
  LDA $C100
  CMP #$40
  BCS api_range_invalid_4
api_range_valid_3_upper:
  JMP api_range_valid_3
api_range_invalid_4:
  JMP api_hires_circle_done_2
api_range_valid_3:
  LDA #$00
  CMP #$00
  BCC api_range_valid_5_upper
  BNE api_range_invalid_6
  LDA $C102
  CMP #$C8
  BCS api_range_invalid_6
api_range_valid_5_upper:
  JMP api_range_valid_5
api_range_invalid_6:
  JMP api_hires_circle_done_2
api_range_valid_5:
  LDA #$00
  CMP #$00
  BCC api_range_valid_7_upper
  BNE api_range_invalid_8
  LDA $C103
  CMP #$C8
  BCS api_range_invalid_8
api_range_valid_7_upper:
  JMP api_range_valid_7
api_range_invalid_8:
  JMP api_hires_circle_done_2
api_range_valid_7:
  SEC
  LDA $C100
  SBC $C103
  STA $C10F
  LDA $C101
  SBC #$00
  STA $C110
  LDA $C110
  CMP #$01
  BCC api_range_valid_9_upper
  BNE api_range_invalid_10
  LDA $C10F
  CMP #$40
  BCS api_range_invalid_10
api_range_valid_9_upper:
  JMP api_range_valid_9
api_range_invalid_10:
  JMP api_hires_circle_done_2
api_range_valid_9:
  CLC
  LDA $C100
  ADC $C103
  STA $C10F
  LDA $C101
  ADC #$00
  STA $C110
  LDA $C110
  CMP #$01
  BCC api_range_valid_11_upper
  BNE api_range_invalid_12
  LDA $C10F
  CMP #$40
  BCS api_range_invalid_12
api_range_valid_11_upper:
  JMP api_range_valid_11
api_range_invalid_12:
  JMP api_hires_circle_done_2
api_range_valid_11:
  SEC
  LDA $C102
  SBC $C103
  STA $C10F
  LDA #$00
  SBC #$00
  STA $C110
  LDA $C110
  CMP #$00
  BCC api_range_valid_13_upper
  BNE api_range_invalid_14
  LDA $C10F
  CMP #$C8
  BCS api_range_invalid_14
api_range_valid_13_upper:
  JMP api_range_valid_13
api_range_invalid_14:
  JMP api_hires_circle_done_2
api_range_valid_13:
  CLC
  LDA $C102
  ADC $C103
  STA $C10F
  LDA #$00
  ADC #$00
  STA $C110
  LDA $C110
  CMP #$00
  BCC api_range_valid_15_upper
  BNE api_range_invalid_16
  LDA $C10F
  CMP #$C8
  BCS api_range_invalid_16
api_range_valid_15_upper:
  JMP api_range_valid_15
api_range_invalid_16:
  JMP api_hires_circle_done_2
api_range_valid_15:
  LDA $C100
  STA $C755
  LDA $C101
  STA $C756
  LDA $C102
  STA $C757
  LDA $C103
  STA $C758
  LDA $C104
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C759
  LDA #$00
  STA $C75A
  JSR hires_circle_runtime
api_hires_circle_done_2:
  JMP control_if_end_0
control_if_else_0:
  LDA $C105
  CMP #$01
  BEQ condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA $C101
  CMP #$01
  BCC api_range_valid_20_upper
  BNE api_range_invalid_21
  LDA $C100
  CMP #$40
  BCS api_range_invalid_21
api_range_valid_20_upper:
  JMP api_range_valid_20
api_range_invalid_21:
  JMP api_hires_circle_done_19
api_range_valid_20:
  LDA #$00
  CMP #$00
  BCC api_range_valid_22_upper
  BNE api_range_invalid_23
  LDA $C102
  CMP #$C8
  BCS api_range_invalid_23
api_range_valid_22_upper:
  JMP api_range_valid_22
api_range_invalid_23:
  JMP api_hires_circle_done_19
api_range_valid_22:
  LDA #$00
  CMP #$00
  BCC api_range_valid_24_upper
  BNE api_range_invalid_25
  LDA $C103
  CMP #$C8
  BCS api_range_invalid_25
api_range_valid_24_upper:
  JMP api_range_valid_24
api_range_invalid_25:
  JMP api_hires_circle_done_19
api_range_valid_24:
  SEC
  LDA $C100
  SBC $C103
  STA $C10F
  LDA $C101
  SBC #$00
  STA $C110
  LDA $C110
  CMP #$01
  BCC api_range_valid_26_upper
  BNE api_range_invalid_27
  LDA $C10F
  CMP #$40
  BCS api_range_invalid_27
api_range_valid_26_upper:
  JMP api_range_valid_26
api_range_invalid_27:
  JMP api_hires_circle_done_19
api_range_valid_26:
  CLC
  LDA $C100
  ADC $C103
  STA $C10F
  LDA $C101
  ADC #$00
  STA $C110
  LDA $C110
  CMP #$01
  BCC api_range_valid_28_upper
  BNE api_range_invalid_29
  LDA $C10F
  CMP #$40
  BCS api_range_invalid_29
api_range_valid_28_upper:
  JMP api_range_valid_28
api_range_invalid_29:
  JMP api_hires_circle_done_19
api_range_valid_28:
  SEC
  LDA $C102
  SBC $C103
  STA $C10F
  LDA #$00
  SBC #$00
  STA $C110
  LDA $C110
  CMP #$00
  BCC api_range_valid_30_upper
  BNE api_range_invalid_31
  LDA $C10F
  CMP #$C8
  BCS api_range_invalid_31
api_range_valid_30_upper:
  JMP api_range_valid_30
api_range_invalid_31:
  JMP api_hires_circle_done_19
api_range_valid_30:
  CLC
  LDA $C102
  ADC $C103
  STA $C10F
  LDA #$00
  ADC #$00
  STA $C110
  LDA $C110
  CMP #$00
  BCC api_range_valid_32_upper
  BNE api_range_invalid_33
  LDA $C10F
  CMP #$C8
  BCS api_range_invalid_33
api_range_valid_32_upper:
  JMP api_range_valid_32
api_range_invalid_33:
  JMP api_hires_circle_done_19
api_range_valid_32:
  LDA $C100
  STA $C755
  LDA $C101
  STA $C756
  LDA $C102
  STA $C757
  LDA $C103
  STA $C758
  LDA $C104
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C759
  LDA #$01
  STA $C75A
  JSR hires_circle_runtime
api_hires_circle_done_19:
  JMP control_if_end_17
control_if_else_17:
  LDA $C100
  STA $C107
  LDA $C101
  STA $C108
  LDA $C107
  SEC
  SBC $C103
  STA $C107
  LDA $C108
  SBC #$00
  STA $C108
  LDA $C102
  STA $C109
  LDA $C109
  SEC
  SBC $C103
  STA $C109
  LDA $C103
  STA $C10A
  LDA $C10A
  STA $C10B
  ASL $C10A
  LDA $C10A
  STA $C10B
  INC $C10B
  LDA $C103
  STA $C10A
  LDA $C10A
  STA $C10C
  ASL $C10A
  LDA $C10A
  STA $C10C
  INC $C10C
  LDA $C108
  CMP #$01
  BCC api_range_valid_35_upper
  BNE api_range_invalid_36
  LDA $C107
  CMP #$40
  BCS api_range_invalid_36
api_range_valid_35_upper:
  JMP api_range_valid_35
api_range_invalid_36:
  JMP api_hires_rect_done_34
api_range_valid_35:
  LDA #$00
  CMP #$00
  BCC api_range_valid_37_upper
  BNE api_range_invalid_38
  LDA $C109
  CMP #$C8
  BCS api_range_invalid_38
api_range_valid_37_upper:
  JMP api_range_valid_37
api_range_invalid_38:
  JMP api_hires_rect_done_34
api_range_valid_37:
  LDA #$00
  CMP #$01
  BCC api_range_valid_39_upper
  BNE api_range_invalid_40
  LDA $C10B
  CMP #$41
  BCS api_range_invalid_40
api_range_valid_39_upper:
  LDA #$00
  CMP #$00
  BCC api_range_invalid_40
  BNE api_range_valid_39
  LDA $C10B
  CMP #$01
  BCC api_range_invalid_40
  JMP api_range_valid_39
api_range_invalid_40:
  JMP api_hires_rect_done_34
api_range_valid_39:
  LDA #$00
  CMP #$00
  BCC api_range_valid_41_upper
  BNE api_range_invalid_42
  LDA $C10C
  CMP #$C9
  BCS api_range_invalid_42
api_range_valid_41_upper:
  LDA #$00
  CMP #$00
  BCC api_range_invalid_42
  BNE api_range_valid_41
  LDA $C10C
  CMP #$01
  BCC api_range_invalid_42
  JMP api_range_valid_41
api_range_invalid_42:
  JMP api_hires_rect_done_34
api_range_valid_41:
  CLC
  LDA $C107
  ADC $C10B
  STA $C111
  LDA $C108
  ADC #$00
  STA $C112
  LDA $C111
  BNE runtime_word_dec_done_43
  DEC $C112
runtime_word_dec_done_43:
  DEC $C111
  CLC
  LDA $C109
  ADC $C10C
  STA $C113
  LDA #$00
  ADC #$00
  STA $C114
  LDA $C113
  BNE runtime_word_dec_done_44
  DEC $C114
runtime_word_dec_done_44:
  DEC $C113
  LDA $C112
  CMP #$01
  BCC api_range_valid_45_upper
  BNE api_range_invalid_46
  LDA $C111
  CMP #$40
  BCS api_range_invalid_46
api_range_valid_45_upper:
  JMP api_range_valid_45
api_range_invalid_46:
  JMP api_hires_rect_done_34
api_range_valid_45:
  LDA $C114
  CMP #$00
  BCC api_range_valid_47_upper
  BNE api_range_invalid_48
  LDA $C113
  CMP #$C8
  BCS api_range_invalid_48
api_range_valid_47_upper:
  JMP api_range_valid_47
api_range_invalid_48:
  JMP api_hires_rect_done_34
api_range_valid_47:
  LDA $C107
  STA $C73F
  LDA $C108
  STA $C740
  LDA $C111
  STA $C742
  LDA $C112
  STA $C743
  LDA $C109
  STA $C741
  LDA $C104
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C745
  LDA $C113
  STA $C754
  JSR hires_fillrect_runtime
api_hires_rect_done_34:
control_if_end_17:
control_if_end_0:
__js_return_9:
  RTS
user_routine___js_draw_8_after:
  JMP user_routine___js_init_6_after
user_routine___js_init_6:
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDA #$60
  STA $FC
  LDA #$00
  STA $FB
hires_bitmap_page_49:
  LDA #$00
  LDY #$00
hires_bitmap_write_50:
  STA ($FB),Y
  DEY
  BNE hires_bitmap_write_50
  INC $FC
  LDA $FC
  CMP #$80
  BCC hires_bitmap_page_49
  LDA #$5C
  STA $FC
  LDA #$00
  STA $FB
hires_screen_page_51:
  LDA #$00
  LDY #$00
hires_screen_write_52:
  STA ($FB),Y
  DEY
  BNE hires_screen_write_52
  INC $FC
  LDA $FC
  CMP #$60
  BCC hires_screen_page_51
  JSR user_routine___js_draw_8
__js_return_7:
  RTS
user_routine___js_init_6_after:
  JMP user_routine___js_update_18_after
user_routine___js_update_18:
  LDA $C106
  CMP #$00
  BNE condition_pass_54
  JMP control_if_else_53
condition_pass_54:
  JMP control_if_end_53
control_if_else_53:
  JMP __js_return_19
control_if_end_53:
  LDA $C781
  BEQ keyboard_pressed_56
  JMP control_if_else_55
keyboard_pressed_56:
  LDA $C791
  BNE condition_pass_56
  JMP control_if_else_55
condition_pass_56:
  LDA #$00
  STA $C106
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
printat_loop_57:
  LDA str_screen_0,X
  BEQ printat_done_58
  STA $05E8,X
  LDA $0286
  AND #$0F
  STA $D9E8,X
  INX
  BNE printat_loop_57
printat_done_58:
  JMP __js_return_19
  JMP control_if_end_55
control_if_else_55:
control_if_end_55:
  LDA #$00
  STA $C10D
  LDA $C780
  BEQ keyboard_pressed_60
  JMP control_if_else_59
keyboard_pressed_60:
  LDA $C790
  BNE condition_pass_60
  JMP control_if_else_59
condition_pass_60:
  LDA #$60
  STA $FC
  LDA #$00
  STA $FB
hires_bitmap_page_61:
  LDA #$00
  LDY #$00
hires_bitmap_write_62:
  STA ($FB),Y
  DEY
  BNE hires_bitmap_write_62
  INC $FC
  LDA $FC
  CMP #$80
  BCC hires_bitmap_page_61
  LDA #$5C
  STA $FC
  LDA #$00
  STA $FB
hires_screen_page_63:
  LDA #$00
  LDY #$00
hires_screen_write_64:
  STA ($FB),Y
  DEY
  BNE hires_screen_write_64
  INC $FC
  LDA $FC
  CMP #$60
  BCC hires_screen_page_63
  LDA #$01
  STA $C10D
  JMP control_if_end_59
control_if_else_59:
control_if_end_59:
  LDA $C767
  AND #$10
  BEQ condition_pass_66
  JMP control_if_else_65
condition_pass_66:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_68
  JMP control_if_else_67
joystick_current_pressed_68:
  LDA $C769
  AND #$04
  BNE condition_pass_68
  JMP control_if_else_67
condition_pass_68:
  LDA $C103
  CMP #$02
  BNE condition_not_equal_70
  JMP control_if_else_69
condition_not_equal_70:
  BCS condition_pass_70
  JMP control_if_else_69
condition_pass_70:
  JMP __js_logic_yes_21
  JMP control_if_end_69
control_if_else_69:
  JMP __js_logic_no_22
control_if_end_69:
  JMP control_if_end_67
control_if_else_67:
  JMP __js_logic_no_22
control_if_end_67:
__js_logic_yes_21:
  DEC $C103
  LDA #$01
  STA $C10D
  JMP __js_logic_end_23
__js_logic_no_22:
__js_logic_end_23:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_72
  JMP control_if_else_71
joystick_current_pressed_72:
  LDA $C769
  AND #$08
  BNE condition_pass_72
  JMP control_if_else_71
condition_pass_72:
  LDA $C103
  CMP #$10
  BCC condition_pass_74
  JMP control_if_else_73
condition_pass_74:
  JMP __js_logic_yes_24
  JMP control_if_end_73
control_if_else_73:
  JMP __js_logic_no_25
control_if_end_73:
  JMP control_if_end_71
control_if_else_71:
  JMP __js_logic_no_25
control_if_end_71:
__js_logic_yes_24:
  INC $C103
  LDA #$01
  STA $C10D
  JMP __js_logic_end_26
__js_logic_no_25:
__js_logic_end_26:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_76
  JMP control_if_else_75
joystick_current_pressed_76:
  LDA $C769
  AND #$01
  BNE condition_pass_76
  JMP control_if_else_75
condition_pass_76:
  LDA $C104
  STA $C10E
  INC $C10E
  LDA $C10E
  AND #$0F
  STA $C10E
  LDA $C10E
  STA $C104
  LDA #$01
  STA $C10D
  JMP control_if_end_75
control_if_else_75:
control_if_end_75:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_78
  JMP control_if_else_77
joystick_current_pressed_78:
  LDA $C769
  AND #$02
  BNE condition_pass_78
  JMP control_if_else_77
condition_pass_78:
  INC $C105
  LDA $C105
  CMP #$03
  BEQ condition_pass_80
  JMP control_if_else_79
condition_pass_80:
  LDA #$00
  STA $C105
  JMP control_if_end_79
control_if_else_79:
control_if_end_79:
  LDA #$01
  STA $C10D
  JMP control_if_end_77
control_if_else_77:
control_if_end_77:
  JMP control_if_end_65
control_if_else_65:
  LDA $C767
  AND #$04
  BEQ condition_pass_82
  JMP control_if_else_81
condition_pass_82:
  LDA $C101
  CMP #$00
  BCC word_compare_low_84
  BNE condition_pass_84
  LDA $C100
  CMP #$11
  BEQ word_compare_low_84
  BCS condition_pass_84
word_compare_low_84:
  JMP control_if_else_83
condition_pass_84:
  JMP __js_logic_yes_29
  JMP control_if_end_83
control_if_else_83:
  JMP __js_logic_no_30
control_if_end_83:
  JMP control_if_end_81
control_if_else_81:
  JMP __js_logic_no_30
control_if_end_81:
__js_logic_yes_29:
  LDA $C100
  SEC
  SBC #$02
  STA $C100
  LDA $C101
  SBC #$00
  STA $C101
  LDA #$01
  STA $C10D
  JMP __js_logic_end_31
__js_logic_no_30:
__js_logic_end_31:
  LDA $C767
  AND #$08
  BEQ condition_pass_86
  JMP control_if_else_85
condition_pass_86:
  LDA $C101
  CMP #$01
  BCC condition_pass_88
  BNE word_compare_low_88
  LDA $C100
  CMP #$2E
  BCC condition_pass_88
word_compare_low_88:
  JMP control_if_else_87
condition_pass_88:
  JMP __js_logic_yes_32
  JMP control_if_end_87
control_if_else_87:
  JMP __js_logic_no_33
control_if_end_87:
  JMP control_if_end_85
control_if_else_85:
  JMP __js_logic_no_33
control_if_end_85:
__js_logic_yes_32:
  LDA $C100
  CLC
  ADC #$02
  STA $C100
  LDA $C101
  ADC #$00
  STA $C101
  LDA #$01
  STA $C10D
  JMP __js_logic_end_34
__js_logic_no_33:
__js_logic_end_34:
  LDA $C767
  AND #$01
  BEQ condition_pass_90
  JMP control_if_else_89
condition_pass_90:
  LDA $C102
  CMP #$11
  BNE condition_not_equal_92
  JMP control_if_else_91
condition_not_equal_92:
  BCS condition_pass_92
  JMP control_if_else_91
condition_pass_92:
  JMP __js_logic_yes_35
  JMP control_if_end_91
control_if_else_91:
  JMP __js_logic_no_36
control_if_end_91:
  JMP control_if_end_89
control_if_else_89:
  JMP __js_logic_no_36
control_if_end_89:
__js_logic_yes_35:
  LDA $C102
  SEC
  SBC #$02
  STA $C102
  LDA #$01
  STA $C10D
  JMP __js_logic_end_37
__js_logic_no_36:
__js_logic_end_37:
  LDA $C767
  AND #$02
  BEQ condition_pass_94
  JMP control_if_else_93
condition_pass_94:
  LDA $C102
  CMP #$B6
  BCC condition_pass_96
  JMP control_if_else_95
condition_pass_96:
  JMP __js_logic_yes_38
  JMP control_if_end_95
control_if_else_95:
  JMP __js_logic_no_39
control_if_end_95:
  JMP control_if_end_93
control_if_else_93:
  JMP __js_logic_no_39
control_if_end_93:
__js_logic_yes_38:
  LDA $C102
  CLC
  ADC #$02
  STA $C102
  LDA #$01
  STA $C10D
  JMP __js_logic_end_40
__js_logic_no_39:
__js_logic_end_40:
control_if_end_65:
  LDA $C10D
  CMP #$00
  BNE condition_pass_98
  JMP control_if_else_97
condition_pass_98:
  JSR user_routine___js_draw_8
  JMP control_if_end_97
control_if_else_97:
control_if_end_97:
__js_return_19:
  RTS
user_routine___js_update_18_after:
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
  LDA #$01
  STA $C780
  LDA #$01
  STA $C790
  LDA #$01
  STA $C781
  LDA #$01
  STA $C791
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
  LDA $C781
  STA $C791
  LDA #$FE
  STA $DC00
  LDA $DC01
  AND #$02
  BEQ keyboard_scan_pressed_1
  LDA #$01
  JMP keyboard_scan_stored_1
keyboard_scan_pressed_1:
  LDA #$00
keyboard_scan_stored_1:
  STA $C781
  LDA $C76C
  STA $DC00
  LDA $C76D
  STA $DC02
  LDA $C76E
  STA $DC03
  INC $C76A
  BNE game_frame_counter_done_99
  INC $C76B
game_frame_counter_done_99:
  JSR user_routine___js_update_18
  JMP game_frame_loop
; Shared hires routines
hires_point_runtime:
  LDA $C73C
  STA $FC
  LDA $C73B
  STA $FD
  LDA $FC
  LSR A
  LSR A
  LSR A
  STA $FB
  LDA $FD
  STA $C738
  AND #$F8
  STA $FD
  LDA $FC
  AND #$07
  CLC
  ADC $FD
  STA $FD
  LDA $C73E
  ADC #$00
  STA $FE
  LDA #$00
  STA $FC
  LDA $FB
  LDX #$06
hires_point_calc_100:
  ASL A
  ROL $FC
  DEX
  BNE hires_point_calc_100
  STA $FB
  STA $C739
  LDA $FC
  STA $C73A
  LDA $C739
  ASL A
  ROL $C73A
  ASL A
  ROL $C73A
  CLC
  ADC $FB
  STA $FB
  LDA $C73A
  ADC $FC
  STA $FC
  CLC
  LDA $FB
  ADC $FD
  STA $FB
  LDA $FC
  ADC $FE
  ADC #$60
  STA $FC
  LDA $C738
  AND #$07
  STA $FD
  LDA #$07
  SEC
  SBC $FD
  STA $FD
  LDA #$01
  LDX $FD
  BEQ hires_point_no_shift_102
hires_point_shift_101:
  ASL A
  DEX
  BNE hires_point_shift_101
hires_point_no_shift_102:
  LDY #$00
  ORA ($FB),Y
  STA ($FB),Y
  LDA $C73C
  LSR A
  LSR A
  LSR A
  STA $FB
  STA $FD
  LDA #$00
  STA $FC
  STA $FE
  LDA $FB
  ASL A
  ROL $FC
  ASL A
  ROL $FC
  ASL A
  ROL $FC
  STA $FB
  LDA $FD
  ASL A
  ROL $FE
  ASL A
  ROL $FE
  ASL A
  ROL $FE
  ASL A
  ROL $FE
  ASL A
  ROL $FE
  CLC
  ADC $FB
  STA $FB
  LDA $FC
  ADC $FE
  STA $FC
  LDA $C73B
  LSR A
  LSR A
  LSR A
  CLC
  ADC $FB
  STA $FB
  BCC hires_point_screen_ok_103
  INC $FC
hires_point_screen_ok_103:
  LDA $C73E
  BEQ hires_point_screen_ok_103_hi_done
  CLC
  LDA $FB
  ADC #$20
  STA $FB
  BCC hires_point_screen_ok_103_hi_done
  INC $FC
hires_point_screen_ok_103_hi_done:
  CLC
  LDA $FC
  ADC #$5C
  STA $FC
  LDA ($FB),Y
  AND #$0F
  ORA $C73D
  STA ($FB),Y
  LDA $C73D
  RTS
hires_hline_runtime:
  LDA $C73F
  STA $C746
  LDA $C740
  STA $C747
hires_hline_loop_138:
  LDA $C746
  STA $C73B
  LDA $C747
  STA $C73E
  LDA $C741
  STA $C73C
  LDA $C745
  STA $C73D
  JSR hires_point_runtime
  LDA $C747
  CMP $C743
  BNE hires_hline_loop_138_inc
  LDA $C746
  CMP $C742
  BEQ hires_hline_done_139
hires_hline_loop_138_inc:
  CLC
  LDA $C746
  ADC #$01
  STA $C746
  LDA $C747
  ADC #$00
  STA $C747
  JMP hires_hline_loop_138
hires_hline_done_139:
  RTS
hires_fillrect_runtime:
hires_fillrect_loop_140:
  JSR hires_hline_runtime
  LDA $C741
  CMP $C754
  BEQ hires_fillrect_done_141
  INC $C741
  JMP hires_fillrect_loop_140
hires_fillrect_done_141:
  RTS
hires_circle_runtime:
  LDA $C758
  STA $C75B
  LDA #$00
  STA $C75C
  LDA #$01
  SEC
  SBC $C758
  STA $C75D
  LDA #$00
  SBC #$00
  STA $C75E
hires_circle_loop_127:
  LDA $C75C
  CMP $C75B
  BCC hires_circle_after_draw_129
  BEQ hires_circle_after_draw_129
  JMP hires_circle_done_128
hires_circle_after_draw_129:
  LDA $C75A
  BNE hires_circle_do_fill_132
  JMP hires_circle_plot_mode_131
hires_circle_do_fill_132:
  SEC
  LDA $C755
  SBC $C75B
  STA $C73F
  LDA $C756
  SBC #$00
  STA $C740
  LDA $C755
  CLC
  ADC $C75B
  STA $C742
  LDA $C756
  ADC #$00
  STA $C743
  LDA $C757
  CLC
  ADC $C75C
  STA $C741
  LDA $C759
  STA $C745
  JSR hires_hline_runtime
  LDA $C75C
  BEQ hires_circle_fill_third_span_134
  SEC
  LDA $C755
  SBC $C75B
  STA $C73F
  LDA $C756
  SBC #$00
  STA $C740
  LDA $C755
  CLC
  ADC $C75B
  STA $C742
  LDA $C756
  ADC #$00
  STA $C743
  SEC
  LDA $C757
  SBC $C75C
  STA $C741
  LDA $C759
  STA $C745
  JSR hires_hline_runtime
hires_circle_fill_third_span_134:
  LDA $C75B
  CMP $C75C
  BNE hires_circle_skip_extra_fill_137
  JMP hires_circle_fill_after_fourth_136
hires_circle_skip_extra_fill_137:
  SEC
  LDA $C755
  SBC $C75C
  STA $C73F
  LDA $C756
  SBC #$00
  STA $C740
  LDA $C755
  CLC
  ADC $C75C
  STA $C742
  LDA $C756
  ADC #$00
  STA $C743
  LDA $C757
  CLC
  ADC $C75B
  STA $C741
  LDA $C759
  STA $C745
  JSR hires_hline_runtime
  SEC
  LDA $C755
  SBC $C75C
  STA $C73F
  LDA $C756
  SBC #$00
  STA $C740
  LDA $C755
  CLC
  ADC $C75C
  STA $C742
  LDA $C756
  ADC #$00
  STA $C743
  SEC
  LDA $C757
  SBC $C75B
  STA $C741
  LDA $C759
  STA $C745
  JSR hires_hline_runtime
  JMP hires_circle_fill_after_fourth_136
hires_circle_plot_mode_131:
  LDA $C755
  CLC
  ADC $C75B
  STA $C73B
  LDA $C756
  ADC #$00
  STA $C73E
  LDA $C757
  CLC
  ADC $C75C
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  SEC
  LDA $C755
  SBC $C75B
  STA $C73B
  LDA $C756
  SBC #$00
  STA $C73E
  LDA $C757
  CLC
  ADC $C75C
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  LDA $C755
  CLC
  ADC $C75B
  STA $C73B
  LDA $C756
  ADC #$00
  STA $C73E
  SEC
  LDA $C757
  SBC $C75C
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  SEC
  LDA $C755
  SBC $C75B
  STA $C73B
  LDA $C756
  SBC #$00
  STA $C73E
  SEC
  LDA $C757
  SBC $C75C
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  LDA $C755
  CLC
  ADC $C75C
  STA $C73B
  LDA $C756
  ADC #$00
  STA $C73E
  LDA $C757
  CLC
  ADC $C75B
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  SEC
  LDA $C755
  SBC $C75C
  STA $C73B
  LDA $C756
  SBC #$00
  STA $C73E
  LDA $C757
  CLC
  ADC $C75B
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  LDA $C755
  CLC
  ADC $C75C
  STA $C73B
  LDA $C756
  ADC #$00
  STA $C73E
  SEC
  LDA $C757
  SBC $C75B
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
  SEC
  LDA $C755
  SBC $C75C
  STA $C73B
  LDA $C756
  SBC #$00
  STA $C73E
  SEC
  LDA $C757
  SBC $C75B
  STA $C73C
  LDA $C759
  STA $C73D
  JSR hires_point_runtime
hires_circle_fill_after_fourth_136:
  INC $C75C
  LDA $C75E
  BMI hires_circle_err_negative_130
  DEC $C75B
  CLC
  LDA $C75C
  ASL A
  ADC #$01
  CLC
  ADC $C75D
  STA $C75D
  LDA $C75E
  ADC #$00
  STA $C75E
  SEC
  LDA $C75B
  ASL A
  STA $00FD
  LDA $C75D
  SBC $00FD
  STA $C75D
  LDA $C75E
  SBC #$00
  STA $C75E
  JMP hires_circle_loop_127
hires_circle_err_negative_130:
  CLC
  LDA $C75C
  ASL A
  ADC #$01
  CLC
  ADC $C75D
  STA $C75D
  LDA $C75E
  ADC #$00
  STA $C75E
  JMP hires_circle_loop_127
hires_circle_done_128:
  RTS
; String pool
str_screen_0:
  .byte $08, $09, $12, $05, $13, $20, $04, $05, $0D, $0F, $20, $06, $09, $0E, $09, $13, $08, $05, $04, $00
