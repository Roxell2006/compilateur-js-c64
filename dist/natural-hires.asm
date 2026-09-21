  LDA #$01
  STA $0286
  LDA #$14
  STA $C100
  LDA #$00
  STA $C101
  LDA #$28
  STA $C102
  LDA #$01
  STA $C103
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
  LDA #$60
  STA $FC
  LDA #$00
  STA $FB
hires_bitmap_page_0:
  LDA #$00
  LDY #$00
hires_bitmap_write_1:
  STA ($FB),Y
  DEY
  BNE hires_bitmap_write_1
  INC $FC
  LDA $FC
  CMP #$80
  BCC hires_bitmap_page_0
  LDA #$5C
  STA $FC
  LDA #$00
  STA $FB
hires_screen_page_2:
  LDA #$00
  LDY #$00
hires_screen_write_3:
  STA ($FB),Y
  DEY
  BNE hires_screen_write_3
  INC $FC
  LDA $FC
  CMP #$60
  BCC hires_screen_page_2
__js_loop_3:
  LDA $C101
  CMP #$01
  BCC condition_pass_5
  BNE word_compare_low_5
  LDA $C100
  CMP #$18
  BCC condition_pass_5
word_compare_low_5:
  JMP control_if_else_4
condition_pass_5:
  LDA $C100
  STA $C104
  LDA $C101
  STA $C105
  LDA $C102
  STA $C106
  LDA $C103
  STA $C107
  JSR user_routine___js_drawShapes_6
  LDA $C100
  CLC
  ADC #$3C
  STA $C100
  LDA $C101
  ADC #$00
  STA $C101
  LDA $C102
  CLC
  ADC #$02
  STA $C102
  LDA $C103
  CLC
  ADC #$02
  STA $C103
__js_loop_next_5:
  JMP __js_loop_3
  JMP control_if_end_4
control_if_else_4:
control_if_end_4:
__js_loop_end_4:
  LDA $DC00
  STA $C75F
  LDA $DC02
  STA $C760
  LDA $DC03
  STA $C761
  LDA #$FF
  STA $DC02
  LDA #$00
  STA $DC03
  LDA #$FF
  STA $DC00
wait_key_loop_6:
  LDA #$00
  STA $C762
wait_key_scan_8:
  LDX $C762
  LDA wait_key_masks_11,X
  STA $DC00
  LDA $DC01
  CMP #$FF
  BNE wait_key_pressed_9
  INC $C762
  LDA $C762
  CMP #$08
  BCC wait_key_scan_8
  JMP wait_key_loop_6
wait_key_pressed_9:
wait_key_release_7:
  LDA #$00
  STA $C762
wait_key_scan_8_release:
  LDX $C762
  LDA wait_key_masks_11,X
  STA $DC00
  LDA $DC01
  CMP #$FF
  BNE wait_key_pressed_9_still
  INC $C762
  LDA $C762
  CMP #$08
  BCC wait_key_scan_8_release
  JMP wait_key_scan_done_10
wait_key_pressed_9_still:
  JMP wait_key_release_7
wait_key_scan_done_10:
  LDA #$FF
  STA $DC00
  LDA $C75F
  STA $DC00
  LDA $C760
  STA $DC02
  LDA $C761
  STA $DC03
wait_key_masks_11:
  .byte $FE, $FD, $FB, $F7, $EF, $DF, $BF, $7F
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
  JMP user_routine___js_drawShapes_6_after
user_routine___js_drawShapes_6:
  LDA $C105
  CMP #$01
  BCC api_range_valid_13_upper
  BNE api_range_invalid_14
  LDA $C104
  CMP #$40
  BCS api_range_invalid_14
api_range_valid_13_upper:
  JMP api_range_valid_13
api_range_invalid_14:
  JMP api_hires_rect_done_12
api_range_valid_13:
  LDA #$00
  CMP #$01
  BCC api_range_valid_15_upper
  BNE api_range_invalid_16
  LDA $C106
  CMP #$41
  BCS api_range_invalid_16
api_range_valid_15_upper:
  LDA #$00
  CMP #$00
  BCC api_range_invalid_16
  BNE api_range_valid_15
  LDA $C106
  CMP #$01
  BCC api_range_invalid_16
  JMP api_range_valid_15
api_range_invalid_16:
  JMP api_hires_rect_done_12
api_range_valid_15:
  CLC
  LDA $C104
  ADC $C106
  STA $C10A
  LDA $C105
  ADC #$00
  STA $C10B
  LDA $C10A
  BNE runtime_word_dec_done_17
  DEC $C10B
runtime_word_dec_done_17:
  DEC $C10A
  CLC
  LDA #$19
  ADC #$19
  STA $C10C
  LDA #$00
  ADC #$00
  STA $C10D
  LDA $C10C
  BNE runtime_word_dec_done_18
  DEC $C10D
runtime_word_dec_done_18:
  DEC $C10C
  LDA $C10B
  CMP #$01
  BCC api_range_valid_19_upper
  BNE api_range_invalid_20
  LDA $C10A
  CMP #$40
  BCS api_range_invalid_20
api_range_valid_19_upper:
  JMP api_range_valid_19
api_range_invalid_20:
  JMP api_hires_rect_done_12
api_range_valid_19:
  LDA $C10D
  CMP #$00
  BCC api_range_valid_21_upper
  BNE api_range_invalid_22
  LDA $C10C
  CMP #$C8
  BCS api_range_invalid_22
api_range_valid_21_upper:
  JMP api_range_valid_21
api_range_invalid_22:
  JMP api_hires_rect_done_12
api_range_valid_21:
  LDA $C104
  STA $C73F
  LDA $C105
  STA $C740
  LDA $C10A
  STA $C742
  LDA $C10B
  STA $C743
  LDA #$19
  STA $C741
  LDA $C107
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C745
  JSR hires_hline_runtime
  LDA $C10C
  STA $C741
  JSR hires_hline_runtime
  LDA #$19
  STA $C741
  LDA $C10C
  STA $C744
  JSR hires_vline_runtime
  LDA $C10A
  STA $C73F
  LDA $C10B
  STA $C740
  JSR hires_vline_runtime
api_hires_rect_done_12:
  LDA $C105
  CMP #$01
  BCC api_range_valid_24_upper
  BNE api_range_invalid_25
  LDA $C104
  CMP #$40
  BCS api_range_invalid_25
api_range_valid_24_upper:
  JMP api_range_valid_24
api_range_invalid_25:
  JMP api_hires_rect_done_23
api_range_valid_24:
  LDA #$00
  CMP #$01
  BCC api_range_valid_26_upper
  BNE api_range_invalid_27
  LDA $C106
  CMP #$41
  BCS api_range_invalid_27
api_range_valid_26_upper:
  LDA #$00
  CMP #$00
  BCC api_range_invalid_27
  BNE api_range_valid_26
  LDA $C106
  CMP #$01
  BCC api_range_invalid_27
  JMP api_range_valid_26
api_range_invalid_27:
  JMP api_hires_rect_done_23
api_range_valid_26:
  CLC
  LDA $C104
  ADC $C106
  STA $C10A
  LDA $C105
  ADC #$00
  STA $C10B
  LDA $C10A
  BNE runtime_word_dec_done_28
  DEC $C10B
runtime_word_dec_done_28:
  DEC $C10A
  CLC
  LDA #$41
  ADC #$0F
  STA $C10C
  LDA #$00
  ADC #$00
  STA $C10D
  LDA $C10C
  BNE runtime_word_dec_done_29
  DEC $C10D
runtime_word_dec_done_29:
  DEC $C10C
  LDA $C10B
  CMP #$01
  BCC api_range_valid_30_upper
  BNE api_range_invalid_31
  LDA $C10A
  CMP #$40
  BCS api_range_invalid_31
api_range_valid_30_upper:
  JMP api_range_valid_30
api_range_invalid_31:
  JMP api_hires_rect_done_23
api_range_valid_30:
  LDA $C10D
  CMP #$00
  BCC api_range_valid_32_upper
  BNE api_range_invalid_33
  LDA $C10C
  CMP #$C8
  BCS api_range_invalid_33
api_range_valid_32_upper:
  JMP api_range_valid_32
api_range_invalid_33:
  JMP api_hires_rect_done_23
api_range_valid_32:
  LDA $C104
  STA $C73F
  LDA $C105
  STA $C740
  LDA $C10A
  STA $C742
  LDA $C10B
  STA $C743
  LDA #$41
  STA $C741
  LDA $C107
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C745
  LDA $C10C
  STA $C754
  JSR hires_fillrect_runtime
api_hires_rect_done_23:
  LDA $C104
  STA $C108
  LDA $C105
  STA $C109
  LDA $C108
  CLC
  ADC #$14
  STA $C108
  LDA $C109
  ADC #$00
  STA $C109
  LDA $C109
  CMP #$01
  BCC api_range_valid_35_upper
  BNE api_range_invalid_36
  LDA $C108
  CMP #$40
  BCS api_range_invalid_36
api_range_valid_35_upper:
  JMP api_range_valid_35
api_range_invalid_36:
  JMP api_hires_circle_done_34
api_range_valid_35:
  SEC
  LDA $C108
  SBC #$0C
  STA $C10E
  LDA $C109
  SBC #$00
  STA $C10F
  LDA $C10F
  CMP #$01
  BCC api_range_valid_37_upper
  BNE api_range_invalid_38
  LDA $C10E
  CMP #$40
  BCS api_range_invalid_38
api_range_valid_37_upper:
  JMP api_range_valid_37
api_range_invalid_38:
  JMP api_hires_circle_done_34
api_range_valid_37:
  CLC
  LDA $C108
  ADC #$0C
  STA $C10E
  LDA $C109
  ADC #$00
  STA $C10F
  LDA $C10F
  CMP #$01
  BCC api_range_valid_39_upper
  BNE api_range_invalid_40
  LDA $C10E
  CMP #$40
  BCS api_range_invalid_40
api_range_valid_39_upper:
  JMP api_range_valid_39
api_range_invalid_40:
  JMP api_hires_circle_done_34
api_range_valid_39:
  SEC
  LDA #$6E
  SBC #$0C
  STA $C10E
  LDA #$00
  SBC #$00
  STA $C10F
  LDA $C10F
  CMP #$00
  BCC api_range_valid_41_upper
  BNE api_range_invalid_42
  LDA $C10E
  CMP #$C8
  BCS api_range_invalid_42
api_range_valid_41_upper:
  JMP api_range_valid_41
api_range_invalid_42:
  JMP api_hires_circle_done_34
api_range_valid_41:
  CLC
  LDA #$6E
  ADC #$0C
  STA $C10E
  LDA #$00
  ADC #$00
  STA $C10F
  LDA $C10F
  CMP #$00
  BCC api_range_valid_43_upper
  BNE api_range_invalid_44
  LDA $C10E
  CMP #$C8
  BCS api_range_invalid_44
api_range_valid_43_upper:
  JMP api_range_valid_43
api_range_invalid_44:
  JMP api_hires_circle_done_34
api_range_valid_43:
  LDA $C108
  STA $C755
  LDA $C109
  STA $C756
  LDA #$6E
  STA $C757
  LDA #$0C
  STA $C758
  LDA $C107
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C759
  LDA #$00
  STA $C75A
  JSR hires_circle_runtime
api_hires_circle_done_34:
  LDA $C104
  STA $C108
  LDA $C105
  STA $C109
  LDA $C108
  CLC
  ADC #$14
  STA $C108
  LDA $C109
  ADC #$00
  STA $C109
  LDA $C109
  CMP #$01
  BCC api_range_valid_46_upper
  BNE api_range_invalid_47
  LDA $C108
  CMP #$40
  BCS api_range_invalid_47
api_range_valid_46_upper:
  JMP api_range_valid_46
api_range_invalid_47:
  JMP api_hires_circle_done_45
api_range_valid_46:
  SEC
  LDA $C108
  SBC #$0C
  STA $C10E
  LDA $C109
  SBC #$00
  STA $C10F
  LDA $C10F
  CMP #$01
  BCC api_range_valid_48_upper
  BNE api_range_invalid_49
  LDA $C10E
  CMP #$40
  BCS api_range_invalid_49
api_range_valid_48_upper:
  JMP api_range_valid_48
api_range_invalid_49:
  JMP api_hires_circle_done_45
api_range_valid_48:
  CLC
  LDA $C108
  ADC #$0C
  STA $C10E
  LDA $C109
  ADC #$00
  STA $C10F
  LDA $C10F
  CMP #$01
  BCC api_range_valid_50_upper
  BNE api_range_invalid_51
  LDA $C10E
  CMP #$40
  BCS api_range_invalid_51
api_range_valid_50_upper:
  JMP api_range_valid_50
api_range_invalid_51:
  JMP api_hires_circle_done_45
api_range_valid_50:
  SEC
  LDA #$9B
  SBC #$0C
  STA $C10E
  LDA #$00
  SBC #$00
  STA $C10F
  LDA $C10F
  CMP #$00
  BCC api_range_valid_52_upper
  BNE api_range_invalid_53
  LDA $C10E
  CMP #$C8
  BCS api_range_invalid_53
api_range_valid_52_upper:
  JMP api_range_valid_52
api_range_invalid_53:
  JMP api_hires_circle_done_45
api_range_valid_52:
  CLC
  LDA #$9B
  ADC #$0C
  STA $C10E
  LDA #$00
  ADC #$00
  STA $C10F
  LDA $C10F
  CMP #$00
  BCC api_range_valid_54_upper
  BNE api_range_invalid_55
  LDA $C10E
  CMP #$C8
  BCS api_range_invalid_55
api_range_valid_54_upper:
  JMP api_range_valid_54
api_range_invalid_55:
  JMP api_hires_circle_done_45
api_range_valid_54:
  LDA $C108
  STA $C755
  LDA $C109
  STA $C756
  LDA #$9B
  STA $C757
  LDA #$0C
  STA $C758
  LDA $C107
  ASL A
  ASL A
  ASL A
  ASL A
  STA $C759
  LDA #$01
  STA $C75A
  JSR hires_circle_runtime
api_hires_circle_done_45:
__js_return_7:
  RTS
user_routine___js_drawShapes_6_after:
  RTS
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
hires_point_calc_56:
  ASL A
  ROL $FC
  DEX
  BNE hires_point_calc_56
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
  BEQ hires_point_no_shift_58
hires_point_shift_57:
  ASL A
  DEX
  BNE hires_point_shift_57
hires_point_no_shift_58:
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
  BCC hires_point_screen_ok_59
  INC $FC
hires_point_screen_ok_59:
  LDA $C73E
  BEQ hires_point_screen_ok_59_hi_done
  CLC
  LDA $FB
  ADC #$20
  STA $FB
  BCC hires_point_screen_ok_59_hi_done
  INC $FC
hires_point_screen_ok_59_hi_done:
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
hires_hline_loop_94:
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
  BNE hires_hline_loop_94_inc
  LDA $C746
  CMP $C742
  BEQ hires_hline_done_95
hires_hline_loop_94_inc:
  CLC
  LDA $C746
  ADC #$01
  STA $C746
  LDA $C747
  ADC #$00
  STA $C747
  JMP hires_hline_loop_94
hires_hline_done_95:
  RTS
hires_vline_runtime:
  LDA $C741
  STA $C748
hires_vline_loop_96:
  LDA $C73F
  STA $C73B
  LDA $C740
  STA $C73E
  LDA $C748
  STA $C73C
  LDA $C745
  STA $C73D
  JSR hires_point_runtime
  LDA $C748
  CMP $C744
  BEQ hires_vline_done_97
  INC $C748
  JMP hires_vline_loop_96
hires_vline_done_97:
  RTS
hires_fillrect_runtime:
hires_fillrect_loop_98:
  JSR hires_hline_runtime
  LDA $C741
  CMP $C754
  BEQ hires_fillrect_done_99
  INC $C741
  JMP hires_fillrect_loop_98
hires_fillrect_done_99:
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
hires_circle_loop_83:
  LDA $C75C
  CMP $C75B
  BCC hires_circle_after_draw_85
  BEQ hires_circle_after_draw_85
  JMP hires_circle_done_84
hires_circle_after_draw_85:
  LDA $C75A
  BNE hires_circle_do_fill_88
  JMP hires_circle_plot_mode_87
hires_circle_do_fill_88:
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
  BEQ hires_circle_fill_third_span_90
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
hires_circle_fill_third_span_90:
  LDA $C75B
  CMP $C75C
  BNE hires_circle_skip_extra_fill_93
  JMP hires_circle_fill_after_fourth_92
hires_circle_skip_extra_fill_93:
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
  JMP hires_circle_fill_after_fourth_92
hires_circle_plot_mode_87:
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
hires_circle_fill_after_fourth_92:
  INC $C75C
  LDA $C75E
  BMI hires_circle_err_negative_86
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
  JMP hires_circle_loop_83
hires_circle_err_negative_86:
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
  JMP hires_circle_loop_83
hires_circle_done_84:
  RTS
