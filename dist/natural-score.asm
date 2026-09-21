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
  LDA #$0A
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  LDA #$00
  STA $C103
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0452,X
  LDA #$01
  STA $D852,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $04F2,X
  LDA #$01
  STA $D8F2,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $0542,X
  LDA #$01
  STA $D942,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDX #$00
printat_loop_6:
  LDA str_screen_3,X
  BEQ printat_done_7
  STA $0592,X
  LDA #$01
  STA $D992,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDX #$00
printat_loop_8:
  LDA str_screen_4,X
  BEQ printat_done_9
  STA $0632,X
  LDA #$01
  STA $DA32,X
  INX
  BNE printat_loop_8
printat_done_9:
  LDX #$00
printat_loop_10:
  LDA str_screen_5,X
  BEQ printat_done_11
  STA $0682,X
  LDA #$01
  STA $DA82,X
  INX
  BNE printat_loop_10
printat_done_11:
  JSR user_routine___js_drawHud_3
__js_callback_end_2:
  JMP user_routine___js_showValue_5_after
user_routine___js_showValue_5:
  LDA $C105
  STA $C10C
  LDA $C106
  STA $C10D
  JSR api_decimal_convert
  LDA #$00
  CMP #$00
  BCC api_range_valid_13_upper
  BNE api_range_invalid_14
  LDA $C104
  CMP #$19
  BCS api_range_invalid_14
api_range_valid_13_upper:
  JMP api_range_valid_13
api_range_invalid_14:
  JMP api_number_done_12
api_range_valid_13:
  LDA $C104
  TAX
  LDA api_text_1024_55296_0_0,X
  CLC
  ADC #$0F
  STA $FB
  LDA api_text_1024_55296_0_1,X
  ADC #$00
  STA $FC
  LDA api_text_1024_55296_0_2,X
  CLC
  ADC #$0F
  STA $FD
  LDA api_text_1024_55296_0_3,X
  ADC #$00
  STA $FE
  LDY #$00
  LDA $C10E
  CLC
  ADC #$30
  STA ($FB),Y
  LDA #$03
  AND #$0F
  STA ($FD),Y
  LDY #$01
  LDA $C10F
  CLC
  ADC #$30
  STA ($FB),Y
  LDA #$03
  AND #$0F
  STA ($FD),Y
  LDY #$02
  LDA $C110
  CLC
  ADC #$30
  STA ($FB),Y
  LDA #$03
  AND #$0F
  STA ($FD),Y
  LDY #$03
  LDA $C111
  CLC
  ADC #$30
  STA ($FB),Y
  LDA #$03
  AND #$0F
  STA ($FD),Y
  LDY #$04
  LDA $C112
  CLC
  ADC #$30
  STA ($FB),Y
  LDA #$03
  AND #$0F
  STA ($FD),Y
api_number_done_12:
__js_return_6:
  RTS
user_routine___js_showValue_5_after:
  JMP user_routine___js_drawHud_3_after
user_routine___js_drawHud_3:
  LDA $C107
  CLC
  ADC #$30
  STA $04FF
  LDA #$07
  STA $D8FF
  LDA $C108
  CLC
  ADC #$30
  STA $0500
  LDA #$07
  STA $D900
  LDA $C109
  CLC
  ADC #$30
  STA $0501
  LDA #$07
  STA $D901
  LDA $C10A
  CLC
  ADC #$30
  STA $0502
  LDA #$07
  STA $D902
  LDA $C10B
  CLC
  ADC #$30
  STA $0503
  LDA #$07
  STA $D903
  LDA #$08
  STA $C104
  LDA $C100
  STA $C105
  LDA $C101
  STA $C106
  JSR user_routine___js_showValue_5
  LDA #$0A
  STA $C104
  LDA $C102
  STA $C105
  LDA $C103
  STA $C106
  JSR user_routine___js_showValue_5
__js_return_4:
  RTS
user_routine___js_drawHud_3_after:
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
  BNE game_frame_counter_done_15
  INC $C76B
game_frame_counter_done_15:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_17
  JMP control_if_else_16
joystick_current_pressed_17:
  LDA $C769
  AND #$10
  BNE condition_pass_17
  JMP control_if_else_16
condition_pass_17:
  LDA $C100
  STA $C10C
  LDA $C101
  STA $C10D
  JSR api_decimal_convert
  CLC
  LDA $C10B
  ADC $C112
  CMP #$0A
  BCS game_counter_carry_18_4
  STA $C10B
  CLC
  JMP game_counter_next_18_4
game_counter_carry_18_4:
  SBC #$0A
  STA $C10B
  SEC
game_counter_next_18_4:
  LDA $C10A
  ADC $C111
  CMP #$0A
  BCS game_counter_carry_18_3
  STA $C10A
  CLC
  JMP game_counter_next_18_3
game_counter_carry_18_3:
  SBC #$0A
  STA $C10A
  SEC
game_counter_next_18_3:
  LDA $C109
  ADC $C110
  CMP #$0A
  BCS game_counter_carry_18_2
  STA $C109
  CLC
  JMP game_counter_next_18_2
game_counter_carry_18_2:
  SBC #$0A
  STA $C109
  SEC
game_counter_next_18_2:
  LDA $C108
  ADC $C10F
  CMP #$0A
  BCS game_counter_carry_18_1
  STA $C108
  CLC
  JMP game_counter_next_18_1
game_counter_carry_18_1:
  SBC #$0A
  STA $C108
  SEC
game_counter_next_18_1:
  LDA $C107
  ADC $C10E
  CMP #$0A
  BCS game_counter_carry_18_0
  STA $C107
  CLC
  JMP game_counter_next_18_0
game_counter_carry_18_0:
  SBC #$0A
  STA $C107
  SEC
game_counter_next_18_0:
  LDA $C100
  CLC
  ADC #$05
  STA $C100
  LDA $C101
  ADC #$00
  STA $C101
  INC $C102
  BNE runtime_word_inc_done_19
  INC $C103
runtime_word_inc_done_19:
  JSR user_routine___js_drawHud_3
  JMP control_if_end_16
control_if_else_16:
control_if_end_16:
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_21
  JMP control_if_else_20
joystick_current_pressed_21:
  LDA $C769
  AND #$01
  BNE condition_pass_21
  JMP control_if_else_20
condition_pass_21:
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
  LDA #$0A
  STA $C100
  LDA #$00
  STA $C101
  LDA #$00
  STA $C102
  LDA #$00
  STA $C103
  JSR user_routine___js_drawHud_3
  JMP control_if_end_20
control_if_else_20:
control_if_end_20:
__js_callback_end_9:
  JMP game_frame_loop
api_decimal_convert:
  LDA #$00
  STA $C10E
api_decimal_22:
  LDA $C10D
  CMP #$27
  BCC api_decimal_22_done
  BNE api_decimal_22_subtract
  LDA $C10C
  CMP #$10
  BCC api_decimal_22_done
api_decimal_22_subtract:
  SEC
  LDA $C10C
  SBC #$10
  STA $C10C
  LDA $C10D
  SBC #$27
  STA $C10D
  INC $C10E
  JMP api_decimal_22
api_decimal_22_done:
  LDA #$00
  STA $C10F
api_decimal_23:
  LDA $C10D
  CMP #$03
  BCC api_decimal_23_done
  BNE api_decimal_23_subtract
  LDA $C10C
  CMP #$E8
  BCC api_decimal_23_done
api_decimal_23_subtract:
  SEC
  LDA $C10C
  SBC #$E8
  STA $C10C
  LDA $C10D
  SBC #$03
  STA $C10D
  INC $C10F
  JMP api_decimal_23
api_decimal_23_done:
  LDA #$00
  STA $C110
api_decimal_24:
  LDA $C10D
  CMP #$00
  BCC api_decimal_24_done
  BNE api_decimal_24_subtract
  LDA $C10C
  CMP #$64
  BCC api_decimal_24_done
api_decimal_24_subtract:
  SEC
  LDA $C10C
  SBC #$64
  STA $C10C
  LDA $C10D
  SBC #$00
  STA $C10D
  INC $C110
  JMP api_decimal_24
api_decimal_24_done:
  LDA #$00
  STA $C111
api_decimal_25:
  LDA $C10D
  CMP #$00
  BCC api_decimal_25_done
  BNE api_decimal_25_subtract
  LDA $C10C
  CMP #$0A
  BCC api_decimal_25_done
api_decimal_25_subtract:
  SEC
  LDA $C10C
  SBC #$0A
  STA $C10C
  LDA $C10D
  SBC #$00
  STA $C10D
  INC $C111
  JMP api_decimal_25
api_decimal_25_done:
  LDA $C10C
  STA $C112
  RTS
; String pool
str_screen_0:
  .byte $0E, $01, $14, $15, $12, $01, $0C, $20, $0A, $13, $20, $2D, $20, $13, $03, $0F, $12, $05, $00
str_screen_1:
  .byte $13, $03, $0F, $12, $05, $00
str_screen_2:
  .byte $0E, $05, $18, $14, $20, $02, $0F, $0E, $15, $13, $00
str_screen_3:
  .byte $14, $15, $12, $0E, $13, $00
str_screen_4:
  .byte $0A, $0F, $19, $20, $32, $20, $06, $09, $12, $05, $3A, $20, $01, $04, $04, $20, $02, $0F, $0E, $15, $13, $00
str_screen_5:
  .byte $0A, $0F, $19, $20, $32, $20, $15, $10, $3A, $20, $12, $05, $13, $05, $14, $00
; User data
api_text_1024_55296_0_0:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_1:
  .byte $04, $04, $04, $04, $04, $04, $04, $05, $05, $05, $05, $05, $05, $06, $06, $06, $06, $06, $06, $06, $07, $07, $07, $07, $07
api_text_1024_55296_0_2:
  .byte $00, $28, $50, $78, $A0, $C8, $F0, $18, $40, $68, $90, $B8, $E0, $08, $30, $58, $80, $A8, $D0, $F8, $20, $48, $70, $98, $C0
api_text_1024_55296_0_3:
  .byte $D8, $D8, $D8, $D8, $D8, $D8, $D8, $D9, $D9, $D9, $D9, $D9, $D9, $DA, $DA, $DA, $DA, $DA, $DA, $DA, $DB, $DB, $DB, $DB, $DB
