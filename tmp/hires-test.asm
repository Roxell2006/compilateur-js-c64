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
  LDA #$01
  LDY #$00
hires_screen_write_3:
  STA ($FB),Y
  DEY
  BNE hires_screen_write_3
  INC $FC
  LDA $FC
  CMP #$60
  BCC hires_screen_page_2
  LDA #$14
  STA $C73B
  LDA #$00
  STA $C73E
  LDA #$14
  STA $C73C
  LDA #$01
  STA $C73D
  JSR hires_point_runtime
  LDA #$28
  STA $C73B
  LDA #$00
  STA $C73E
  LDA #$28
  STA $C73C
  LDA #$02
  STA $C73D
  JSR hires_point_runtime
  LDA #$50
  STA $C73B
  LDA #$00
  STA $C73E
  LDA #$3C
  STA $C73C
  LDA #$05
  STA $C73D
  JSR hires_point_runtime
  LDA #$0A
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$0A
  STA $C741
  LDA #$36
  STA $C742
  LDA #$01
  STA $C743
  LDA #$0A
  STA $C744
  LDA #$07
  STA $C745
  JSR hires_line_runtime
  LDA #$0A
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$0A
  STA $C741
  LDA #$0A
  STA $C742
  LDA #$00
  STA $C743
  LDA #$BE
  STA $C744
  LDA #$03
  STA $C745
  JSR hires_line_runtime
  LDA #$0A
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$BE
  STA $C741
  LDA #$36
  STA $C742
  LDA #$01
  STA $C743
  LDA #$BE
  STA $C744
  LDA #$0D
  STA $C745
  JSR hires_line_runtime
  LDA #$36
  STA $C73F
  LDA #$01
  STA $C740
  LDA #$0A
  STA $C741
  LDA #$36
  STA $C742
  LDA #$01
  STA $C743
  LDA #$BE
  STA $C744
  LDA #$0A
  STA $C745
  JSR hires_line_runtime
  LDA #$0A
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$0A
  STA $C741
  LDA #$36
  STA $C742
  LDA #$01
  STA $C743
  LDA #$BE
  STA $C744
  LDA #$08
  STA $C745
  JSR hires_line_runtime
  LDA #$36
  STA $C73F
  LDA #$01
  STA $C740
  LDA #$0A
  STA $C741
  LDA #$0A
  STA $C742
  LDA #$00
  STA $C743
  LDA #$BE
  STA $C744
  LDA #$0E
  STA $C745
  JSR hires_line_runtime
  LDA #$3C
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$32
  STA $C741
  LDA #$03
  STA $C742
  LDA #$01
  STA $C743
  LDA #$32
  STA $C744
  LDA #$02
  STA $C745
  JSR hires_line_runtime
  LDA #$3C
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$8B
  STA $C741
  LDA #$03
  STA $C742
  LDA #$01
  STA $C743
  LDA #$8B
  STA $C744
  LDA #$02
  STA $C745
  JSR hires_line_runtime
  LDA #$3C
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$32
  STA $C741
  LDA #$3C
  STA $C742
  LDA #$00
  STA $C743
  LDA #$8B
  STA $C744
  LDA #$02
  STA $C745
  JSR hires_line_runtime
  LDA #$03
  STA $C73F
  LDA #$01
  STA $C740
  LDA #$32
  STA $C741
  LDA #$03
  STA $C742
  LDA #$01
  STA $C743
  LDA #$8B
  STA $C744
  LDA #$02
  STA $C745
  JSR hires_line_runtime
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
hires_point_calc_4:
  ASL A
  ROL $FC
  DEX
  BNE hires_point_calc_4
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
  BEQ hires_point_no_shift_6
hires_point_shift_5:
  ASL A
  DEX
  BNE hires_point_shift_5
hires_point_no_shift_6:
  LDY #$00
  ORA ($FB),Y
  STA ($FB),Y
  LDA $C73C
  LSR A
  LSR A
  LSR A
  STA $FB
  LDA #$00
  STA $FC
  LDA $FB
  ASL A
  ROL $FC
  ASL A
  ROL $FC
  ASL A
  ROL $FC
  STA $FB
  LDA $C73C
  LSR A
  LSR A
  LSR A
  ASL A
  ASL A
  ASL A
  ASL A
  ASL A
  CLC
  ADC $FB
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $C73B
  LSR A
  LSR A
  LSR A
  CLC
  ADC $FB
  STA $FB
  BCC hires_point_screen_ok_7
  INC $FC
hires_point_screen_ok_7:
  LDA $C73E
  BEQ hires_point_screen_ok_7_hi_done
  CLC
  LDA $FB
  ADC #$20
  STA $FB
  BCC hires_point_screen_ok_7_hi_done
  INC $FC
hires_point_screen_ok_7_hi_done:
  LDA $FC
  ADC #$5C
  STA $FC
  LDA $C73D
  LDY #$00
  STA ($FB),Y
  RTS
hires_line_runtime:
  LDA $C73F
  STA $C746
  LDA $C740
  STA $C747
  LDA $C741
  STA $C748
  LDA $C743
  CMP $C740
  BCC hires_line_x_reverse_9
  BNE hires_line_x_forward_8
  LDA $C742
  CMP $C73F
  BCC hires_line_x_reverse_9
hires_line_x_forward_8:
  LDA #$00
  STA $C751
  SEC
  LDA $C742
  SBC $C73F
  STA $C749
  LDA $C743
  SBC $C740
  STA $C74A
  JMP hires_line_y_forward_10
hires_line_x_reverse_9:
  LDA #$01
  STA $C751
  SEC
  LDA $C73F
  SBC $C742
  STA $C749
  LDA $C740
  SBC $C743
  STA $C74A
hires_line_y_forward_10:
  LDA $C744
  CMP $C741
  BCC hires_line_y_reverse_11
  LDA #$00
  STA $C752
  SEC
  LDA $C744
  SBC $C741
  STA $C74B
  LDA #$00
  STA $C74C
  JMP hires_line_major_x_12
hires_line_y_reverse_11:
  LDA #$01
  STA $C752
  SEC
  LDA $C741
  SBC $C744
  STA $C74B
  LDA #$00
  STA $C74C
hires_line_major_x_12:
  LDA $C74A
  BNE hires_line_major_y_13
  LDA $C749
  CMP $C74B
  BCC hires_line_major_y_13
  LDA #$01
  STA $C753
  LDA $C749
  CLC
  ADC #$01
  STA $C74F
  LDA $C74A
  ADC #$00
  STA $C750
  JMP hires_line_loop_14
hires_line_major_y_13:
  LDA #$00
  STA $C753
  LDA $C74B
  CLC
  ADC #$01
  STA $C74F
  LDA $C74C
  ADC #$00
  STA $C750
  LDA #$00
  STA $C74D
  LDA #$00
  STA $C74E
hires_line_loop_14:
  LDA $C74F
  ORA $C750
  BNE hires_line_continue1_27
  JMP hires_line_done_15
hires_line_continue1_27:
  LDA $C746
  STA $C73B
  LDA $C747
  STA $C73E
  LDA $C748
  STA $C73C
  LDA $C745
  STA $C73D
  JSR hires_point_runtime
  SEC
  LDA $C74F
  SBC #$01
  STA $C74F
  LDA $C750
  SBC #$00
  STA $C750
  LDA $C74F
  ORA $C750
  BNE hires_line_continue2_28
  JMP hires_line_done_15
hires_line_continue2_28:
  LDA $C753
  BEQ hires_line_major_y_loop_16
  LDA $C751
  BEQ hires_line_update_x_pos_17
  SEC
  LDA $C746
  SBC #$01
  STA $C746
  LDA $C747
  SBC #$00
  STA $C747
  JMP hires_line_update_x_done_18
hires_line_update_x_pos_17:
  CLC
  LDA $C746
  ADC #$01
  STA $C746
  LDA $C747
  ADC #$00
  STA $C747
hires_line_update_x_done_18:
  CLC
  LDA $C74D
  ADC $C74B
  STA $C74D
  LDA $C74E
  ADC $C74C
  STA $C74E
  LDA $C74E
  CMP $C74A
  BCC hires_line_acc_keep_21
  BNE hires_line_major_x_adjust_y_23
  LDA $C74D
  CMP $C749
  BCC hires_line_acc_keep_21
hires_line_major_x_adjust_y_23:
  SEC
  LDA $C74D
  SBC $C749
  STA $C74D
  LDA $C74E
  SBC $C74A
  STA $C74E
  LDA $C752
  BEQ hires_line_update_y_pos_19
  DEC $C748
  JMP hires_line_acc_keep_21
hires_line_update_y_pos_19:
  INC $C748
hires_line_acc_keep_21:
  JMP hires_line_loop_14
hires_line_major_y_loop_16:
  LDA $C752
  BEQ hires_line_update_y_done_20
  DEC $C748
  JMP hires_line_acc_keep_y_22
hires_line_update_y_done_20:
  INC $C748
hires_line_acc_keep_y_22:
  CLC
  LDA $C74D
  ADC $C749
  STA $C74D
  LDA $C74E
  ADC $C74A
  STA $C74E
  LDA $C74E
  CMP $C74C
  BCS hires_line_major_y_continue1_29
  JMP hires_line_loop_14
hires_line_major_y_continue1_29:
  BNE hires_line_major_y_adjust_x_24
  LDA $C74D
  CMP $C74B
  BCS hires_line_major_y_continue2_30
  JMP hires_line_loop_14
hires_line_major_y_continue2_30:
hires_line_major_y_adjust_x_24:
  SEC
  LDA $C74D
  SBC $C74B
  STA $C74D
  LDA $C74E
  SBC $C74C
  STA $C74E
  LDA $C751
  BEQ hires_line_major_y_update_x_pos_25
  SEC
  LDA $C746
  SBC #$01
  STA $C746
  LDA $C747
  SBC #$00
  STA $C747
  JMP hires_line_major_y_after_x_26
hires_line_major_y_update_x_pos_25:
  CLC
  LDA $C746
  ADC #$01
  STA $C746
  LDA $C747
  ADC #$00
  STA $C747
hires_line_major_y_after_x_26:
  JMP hires_line_loop_14
hires_line_done_15:
  RTS
