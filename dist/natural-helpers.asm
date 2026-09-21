  LDA #$01
  STA $0286
  LDA #$01
  STA $C100
  JSR user_routine___js_init_2
  JMP user_routine___js_paint_4_after
user_routine___js_paint_4:
  LDA $C100
  LDX #$10
natural_array_fill_0:
  DEX
  STA __js_array_0,X
  BNE natural_array_fill_0
  LDA #$00
  STA $C101
__js_loop_7:
  LDA $C101
  CMP #$10
  BCC condition_pass_2
  JMP control_if_else_1
condition_pass_2:
  LDA $C101
  STA $C102
  LDA $C102
  AND #$03
  STA $C102
  LDA $C102
  STA $C103
  ASL $C102
  ASL $C102
  LDA #$0C
  STA $C103
  LDA $C103
  CLC
  ADC $C102
  STA $C103
  LDA $C101
  STA $C102
  LSR $C102
  LSR $C102
  LDA $C102
  STA $C104
  ASL $C102
  LDA #$08
  STA $C104
  LDA $C104
  CLC
  ADC $C102
  STA $C104
  LDA #$00
  STA $C102
  LDA #$00
  CMP #$00
  BCC api_range_valid_4_upper
  BNE api_range_invalid_5
  LDA $C101
  CMP #$10
  BCS api_range_invalid_5
api_range_valid_4_upper:
  JMP api_range_valid_4
api_range_invalid_5:
  JMP natural_array_done_3
api_range_valid_4:
  LDX $C101
  LDA __js_array_0,X
  STA $C102
natural_array_done_3:
  LDA #$00
  CMP #$00
  BCC api_range_valid_7_upper
  BNE api_range_invalid_8
  LDA $C103
  CMP #$28
  BCS api_range_invalid_8
api_range_valid_7_upper:
  JMP api_range_valid_7
api_range_invalid_8:
  JMP api_char_done_6
api_range_valid_7:
  LDA #$00
  CMP #$00
  BCC api_range_valid_9_upper
  BNE api_range_invalid_10
  LDA $C104
  CMP #$19
  BCS api_range_invalid_10
api_range_valid_9_upper:
  JMP api_range_valid_9
api_range_invalid_10:
  JMP api_char_done_6
api_range_valid_9:
  LDA $C104
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC $C103
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC $C103
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
  LDA #$51
  STA ($FB),Y
  LDA $C102
  AND #$0F
  STA ($FD),Y
api_char_done_6:
__js_loop_next_9:
  INC $C101
  JMP __js_loop_7
  JMP control_if_end_1
control_if_else_1:
control_if_end_1:
__js_loop_end_8:
  LDA $C100
  STA $C106
  LDA #$00
  STA $C107
  JSR api_decimal_convert
  LDA $C10B
  CLC
  ADC #$30
  STA $06E5
  LDA $0286
  AND #$0F
  STA $DAE5
  LDA $C10C
  CLC
  ADC #$30
  STA $06E6
  LDA $0286
  AND #$0F
  STA $DAE6
__js_return_5:
  RTS
user_routine___js_paint_4_after:
  JMP user_routine___js_init_2_after
user_routine___js_init_2:
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$03
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
printat_loop_11:
  LDA str_screen_0,X
  BEQ printat_done_12
  STA $0481,X
  LDA $0286
  AND #$0F
  STA $D881,X
  INX
  BNE printat_loop_11
printat_done_12:
  LDX #$00
printat_loop_13:
  LDA str_screen_1,X
  BEQ printat_done_14
  STA $04CF,X
  LDA $0286
  AND #$0F
  STA $D8CF,X
  INX
  BNE printat_loop_13
printat_done_14:
  LDX #$00
printat_loop_15:
  LDA str_screen_2,X
  BEQ printat_done_16
  STA $06DD,X
  LDA $0286
  AND #$0F
  STA $DADD,X
  INX
  BNE printat_loop_15
printat_done_16:
  JSR user_routine___js_paint_4
__js_return_3:
  RTS
user_routine___js_init_2_after:
  JMP user_routine___js_update_19_after
user_routine___js_update_19:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_18
  JMP control_if_else_17
joystick_current_pressed_18:
  LDA $C769
  AND #$10
  BNE condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA $C100
  STA $C105
  INC $C105
  LDA $C105
  AND #$0F
  STA $C105
  LDA $C105
  STA $C100
  JSR user_routine___js_paint_4
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
__js_return_20:
  RTS
user_routine___js_update_19_after:
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
  BNE game_frame_counter_done_19
  INC $C76B
game_frame_counter_done_19:
  JSR user_routine___js_update_19
  JMP game_frame_loop
api_decimal_convert:
  LDA #$00
  STA $C108
api_decimal_20:
  LDA $C107
  CMP #$27
  BCC api_decimal_20_done
  BNE api_decimal_20_subtract
  LDA $C106
  CMP #$10
  BCC api_decimal_20_done
api_decimal_20_subtract:
  SEC
  LDA $C106
  SBC #$10
  STA $C106
  LDA $C107
  SBC #$27
  STA $C107
  INC $C108
  JMP api_decimal_20
api_decimal_20_done:
  LDA #$00
  STA $C109
api_decimal_21:
  LDA $C107
  CMP #$03
  BCC api_decimal_21_done
  BNE api_decimal_21_subtract
  LDA $C106
  CMP #$E8
  BCC api_decimal_21_done
api_decimal_21_subtract:
  SEC
  LDA $C106
  SBC #$E8
  STA $C106
  LDA $C107
  SBC #$03
  STA $C107
  INC $C109
  JMP api_decimal_21
api_decimal_21_done:
  LDA #$00
  STA $C10A
api_decimal_22:
  LDA $C107
  CMP #$00
  BCC api_decimal_22_done
  BNE api_decimal_22_subtract
  LDA $C106
  CMP #$64
  BCC api_decimal_22_done
api_decimal_22_subtract:
  SEC
  LDA $C106
  SBC #$64
  STA $C106
  LDA $C107
  SBC #$00
  STA $C107
  INC $C10A
  JMP api_decimal_22
api_decimal_22_done:
  LDA #$00
  STA $C10B
api_decimal_23:
  LDA $C107
  CMP #$00
  BCC api_decimal_23_done
  BNE api_decimal_23_subtract
  LDA $C106
  CMP #$0A
  BCC api_decimal_23_done
api_decimal_23_subtract:
  SEC
  LDA $C106
  SBC #$0A
  STA $C106
  LDA $C107
  SBC #$00
  STA $C107
  INC $C10B
  JMP api_decimal_23
api_decimal_23_done:
  LDA $C106
  STA $C10C
  RTS
; String pool
str_screen_0:
  .byte $03, $0F, $0D, $0D, $0F, $0E, $20, $08, $05, $0C, $10, $05, $12, $13, $20, $2D, $20, $0A, $13, $00
str_screen_1:
  .byte $0A, $0F, $19, $20, $32, $20, $06, $09, $12, $05, $3A, $20, $0E, $05, $18, $14, $20, $03, $0F, $0C, $0F, $12, $00
str_screen_2:
  .byte $03, $0F, $0C, $0F, $12, $3A, $00
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
