  LDA $DD02
  ORA #$03
  STA $DD02
  LDA $DD00
  AND #$FC
  ORA #$03
  STA $DD00
  LDA $D018
  AND #$0F
  ORA #$10
  STA $D018
  LDA $D018
  AND #$F0
  ORA #$08
  STA $D018
  LDA $D011
  ORA #$20
  STA $D011
  LDA #$20
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
  CMP #$40
  BCC hires_bitmap_page_0
  LDA #$04
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
  CMP #$08
  BCC hires_screen_page_2
  LDA #$00
  STA $D020
  LDA #$14
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$2C
  STA $C742
  LDA #$01
  STA $C743
  LDA #$14
  STA $C741
  LDA #$10
  STA $C745
  JSR hires_hline_runtime
  LDA #$1E
  STA $C73F
  LDA #$00
  STA $C740
  LDA #$59
  STA $C742
  LDA #$00
  STA $C743
  LDA #$32
  STA $C741
  LDA #$4F
  STA $C754
  LDA #$30
  STA $C745
  JSR hires_fillrect_runtime
  LDA #$B4
  STA $C755
  LDA #$00
  STA $C756
  LDA #$50
  STA $C757
  LDA #$18
  STA $C758
  LDA #$20
  STA $C759
  LDA #$00
  STA $C75A
  JSR hires_circle_runtime
  LDA #$04
  STA $C755
  LDA #$01
  STA $C756
  LDA #$8C
  STA $C757
  LDA #$0A
  STA $C758
  LDA #$50
  STA $C759
  LDA #$01
  STA $C75A
  JSR hires_circle_runtime
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
wait_key_loop_4:
  LDA #$00
  STA $C762
wait_key_scan_6:
  LDX $C762
  LDA wait_key_masks_9,X
  STA $DC00
  LDA $DC01
  CMP #$FF
  BNE wait_key_pressed_7
  INC $C762
  LDA $C762
  CMP #$08
  BCC wait_key_scan_6
  JMP wait_key_loop_4
wait_key_pressed_7:
wait_key_release_5:
  LDA #$00
  STA $C762
wait_key_scan_6_release:
  LDX $C762
  LDA wait_key_masks_9,X
  STA $DC00
  LDA $DC01
  CMP #$FF
  BNE wait_key_pressed_7_still
  INC $C762
  LDA $C762
  CMP #$08
  BCC wait_key_scan_6_release
  JMP wait_key_scan_done_8
wait_key_pressed_7_still:
  JMP wait_key_release_5
wait_key_scan_done_8:
  LDA #$FF
  STA $DC00
  LDA $C75F
  STA $DC00
  LDA $C760
  STA $DC02
  LDA $C761
  STA $DC03
wait_key_masks_9:
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
  LDA #$93
  JSR $FFD2
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
hires_point_calc_10:
  ASL A
  ROL $FC
  DEX
  BNE hires_point_calc_10
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
  ADC #$20
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
  BEQ hires_point_no_shift_12
hires_point_shift_11:
  ASL A
  DEX
  BNE hires_point_shift_11
hires_point_no_shift_12:
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
  BCC hires_point_screen_ok_13
  INC $FC
hires_point_screen_ok_13:
  LDA $C73E
  BEQ hires_point_screen_ok_13_hi_done
  CLC
  LDA $FB
  ADC #$20
  STA $FB
  BCC hires_point_screen_ok_13_hi_done
  INC $FC
hires_point_screen_ok_13_hi_done:
  LDA $FC
  ADC #$04
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
hires_hline_loop_48:
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
  BNE hires_hline_loop_48_inc
  LDA $C746
  CMP $C742
  BEQ hires_hline_done_49
hires_hline_loop_48_inc:
  CLC
  LDA $C746
  ADC #$01
  STA $C746
  LDA $C747
  ADC #$00
  STA $C747
  JMP hires_hline_loop_48
hires_hline_done_49:
  RTS
hires_fillrect_runtime:
hires_fillrect_loop_50:
  JSR hires_hline_runtime
  LDA $C741
  CMP $C754
  BEQ hires_fillrect_done_51
  INC $C741
  JMP hires_fillrect_loop_50
hires_fillrect_done_51:
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
hires_circle_loop_37:
  LDA $C75C
  CMP $C75B
  BCC hires_circle_after_draw_39
  BEQ hires_circle_after_draw_39
  JMP hires_circle_done_38
hires_circle_after_draw_39:
  LDA $C75A
  BNE hires_circle_do_fill_42
  JMP hires_circle_plot_mode_41
hires_circle_do_fill_42:
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
  BEQ hires_circle_fill_third_span_44
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
hires_circle_fill_third_span_44:
  LDA $C75B
  CMP $C75C
  BNE hires_circle_skip_extra_fill_47
  JMP hires_circle_fill_after_fourth_46
hires_circle_skip_extra_fill_47:
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
  JMP hires_circle_fill_after_fourth_46
hires_circle_plot_mode_41:
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
hires_circle_fill_after_fourth_46:
  INC $C75C
  LDA $C75E
  BMI hires_circle_err_negative_40
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
  JMP hires_circle_loop_37
hires_circle_err_negative_40:
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
  JMP hires_circle_loop_37
hires_circle_done_38:
  RTS
