  LDX #$00
copydata_3000_sprite_frames_hero_0_63_0:
  LDA sprite_frames_hero_0,X
  STA $3000,X
  INX
  CPX #$3F
  BNE copydata_3000_sprite_frames_hero_0_63_0
  LDA #$00
  STA $303F
  LDX #$00
copydata_3040_sprite_frames_hero_1_63_1:
  LDA sprite_frames_hero_1,X
  STA $3040,X
  INX
  CPX #$3F
  BNE copydata_3040_sprite_frames_hero_1_63_1
  LDA #$00
  STA $307F
  LDA #$A0
  STA $C500
  LDA #$00
  STA $C501
  LDA #$78
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  JSR runtime_sprite_sync_0
  LDA #$C0
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$07
  STA $C405
  LDA #$07
  STA $D027
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDX #$00
printat_loop_2:
  LDA str_screen_0,X
  BEQ printat_done_3
  STA $0429,X
  LDA #$01
  STA $D829,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_1,X
  BEQ printat_done_5
  STA $0479,X
  LDA #$01
  STA $D879,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDX #$00
printat_loop_6:
  LDA str_screen_2,X
  BEQ printat_done_7
  STA $04C9,X
  LDA #$01
  STA $D8C9,X
  INX
  BNE printat_loop_6
printat_done_7:
__js_callback_end_0:
  JMP user_routine___js_updatePlayer_1_after
user_routine___js_updatePlayer_1:
  LDA $C767
  AND #$04
  BEQ condition_pass_9
  JMP control_if_else_8
condition_pass_9:
  LDA $C501
  CMP #$00
  BCC word_compare_low_11
  BNE condition_pass_11
  LDA $C500
  CMP #$18
  BEQ word_compare_low_11
  BCS condition_pass_11
word_compare_low_11:
  JMP control_if_else_10
condition_pass_11:
  JMP __js_logic_yes_3
  JMP control_if_end_10
control_if_else_10:
  JMP __js_logic_no_4
control_if_end_10:
  JMP control_if_end_8
control_if_else_8:
  JMP __js_logic_no_4
control_if_end_8:
__js_logic_yes_3:
  LDA $C500
  SEC
  SBC #$02
  STA $C500
  LDA $C501
  SBC #$00
  STA $C501
  JMP __js_logic_end_5
__js_logic_no_4:
__js_logic_end_5:
  LDA $C767
  AND #$08
  BEQ condition_pass_13
  JMP control_if_else_12
condition_pass_13:
  LDA $C501
  CMP #$01
  BCC condition_pass_15
  BNE word_compare_low_15
  LDA $C500
  CMP #$40
  BCC condition_pass_15
word_compare_low_15:
  JMP control_if_else_14
condition_pass_15:
  JMP __js_logic_yes_6
  JMP control_if_end_14
control_if_else_14:
  JMP __js_logic_no_7
control_if_end_14:
  JMP control_if_end_12
control_if_else_12:
  JMP __js_logic_no_7
control_if_end_12:
__js_logic_yes_6:
  LDA $C500
  CLC
  ADC #$02
  STA $C500
  LDA $C501
  ADC #$00
  STA $C501
  JMP __js_logic_end_8
__js_logic_no_7:
__js_logic_end_8:
  LDA $C767
  AND #$01
  BEQ condition_pass_17
  JMP control_if_else_16
condition_pass_17:
  LDA $C502
  CMP #$32
  BNE condition_not_equal_19
  JMP control_if_else_18
condition_not_equal_19:
  BCS condition_pass_19
  JMP control_if_else_18
condition_pass_19:
  JMP __js_logic_yes_9
  JMP control_if_end_18
control_if_else_18:
  JMP __js_logic_no_10
control_if_end_18:
  JMP control_if_end_16
control_if_else_16:
  JMP __js_logic_no_10
control_if_end_16:
__js_logic_yes_9:
  LDA $C502
  SEC
  SBC #$02
  STA $C502
  JMP __js_logic_end_11
__js_logic_no_10:
__js_logic_end_11:
  LDA $C767
  AND #$02
  BEQ condition_pass_21
  JMP control_if_else_20
condition_pass_21:
  LDA $C502
  CMP #$DC
  BCC condition_pass_23
  JMP control_if_else_22
condition_pass_23:
  JMP __js_logic_yes_12
  JMP control_if_end_22
control_if_else_22:
  JMP __js_logic_no_13
control_if_end_22:
  JMP control_if_end_20
control_if_else_20:
  JMP __js_logic_no_13
control_if_end_20:
__js_logic_yes_12:
  LDA $C502
  CLC
  ADC #$02
  STA $C502
  JMP __js_logic_end_14
__js_logic_no_13:
__js_logic_end_14:
  LDA $C767
  AND #$10
  BEQ condition_pass_25
  JMP control_if_else_24
condition_pass_25:
  LDA #$01
  STA $C100
  JMP control_if_end_24
control_if_else_24:
  LDA #$00
  STA $C100
control_if_end_24:
  LDA $C100
  ORA #$00
  BEQ api_flag_off_26
  LDA $C406
  ORA #$02
  STA $C406
  JMP api_flag_off_26_done
api_flag_off_26:
  LDA $C406
  AND #$FD
  STA $C406
api_flag_off_26_done:
  LDA $C100
  ORA #$00
  BEQ api_flag_off_27
  LDA $D01D
  ORA #$01
  STA $D01D
  JMP api_flag_off_27_done
api_flag_off_27:
  LDA $D01D
  AND #$FE
  STA $D01D
api_flag_off_27_done:
  LDA $C767
  AND #$10
  BEQ condition_pass_29
  JMP control_if_else_28
condition_pass_29:
  LDA #$03
  STA $C101
  JMP control_if_end_28
control_if_else_28:
  LDA #$07
  STA $C101
control_if_end_28:
  LDA $C101
  STA $C405
  LDA $C101
  STA $D027
  JSR runtime_sprite_sync_0
  LDA $C500
  STA $C102
  LDA $C501
  STA $C103
  JSR api_decimal_convert
  LDA $C106
  CLC
  ADC #$30
  STA $047C
  LDA #$01
  AND #$0F
  STA $D87C
  LDA $C107
  CLC
  ADC #$30
  STA $047D
  LDA #$01
  AND #$0F
  STA $D87D
  LDA $C108
  CLC
  ADC #$30
  STA $047E
  LDA #$01
  AND #$0F
  STA $D87E
  LDA $C502
  STA $C102
  LDA #$00
  STA $C103
  JSR api_decimal_convert
  LDA $C106
  CLC
  ADC #$30
  STA $0485
  LDA #$01
  AND #$0F
  STA $D885
  LDA $C107
  CLC
  ADC #$30
  STA $0486
  LDA #$01
  AND #$0F
  STA $D886
  LDA $C108
  CLC
  ADC #$30
  STA $0487
  LDA #$01
  AND #$0F
  STA $D887
__js_return_2:
  RTS
user_routine___js_updatePlayer_1_after:
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
  BNE game_frame_counter_done_30
  INC $C76B
game_frame_counter_done_30:
  JSR user_routine___js_updatePlayer_1
  JMP game_frame_loop
; Shared VIC-II synchronization for sprite 0
runtime_sprite_sync_0:
  LDA $C505
  BNE sprite_runtime_active_0_31
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_34
sprite_runtime_active_0_31:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_32
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_33
sprite_runtime_xhigh_0_32:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_33:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_34:
  RTS
api_decimal_convert:
  LDA #$00
  STA $C104
api_decimal_35:
  LDA $C103
  CMP #$27
  BCC api_decimal_35_done
  BNE api_decimal_35_subtract
  LDA $C102
  CMP #$10
  BCC api_decimal_35_done
api_decimal_35_subtract:
  SEC
  LDA $C102
  SBC #$10
  STA $C102
  LDA $C103
  SBC #$27
  STA $C103
  INC $C104
  JMP api_decimal_35
api_decimal_35_done:
  LDA #$00
  STA $C105
api_decimal_36:
  LDA $C103
  CMP #$03
  BCC api_decimal_36_done
  BNE api_decimal_36_subtract
  LDA $C102
  CMP #$E8
  BCC api_decimal_36_done
api_decimal_36_subtract:
  SEC
  LDA $C102
  SBC #$E8
  STA $C102
  LDA $C103
  SBC #$03
  STA $C103
  INC $C105
  JMP api_decimal_36
api_decimal_36_done:
  LDA #$00
  STA $C106
api_decimal_37:
  LDA $C103
  CMP #$00
  BCC api_decimal_37_done
  BNE api_decimal_37_subtract
  LDA $C102
  CMP #$64
  BCC api_decimal_37_done
api_decimal_37_subtract:
  SEC
  LDA $C102
  SBC #$64
  STA $C102
  LDA $C103
  SBC #$00
  STA $C103
  INC $C106
  JMP api_decimal_37
api_decimal_37_done:
  LDA #$00
  STA $C107
api_decimal_38:
  LDA $C103
  CMP #$00
  BCC api_decimal_38_done
  BNE api_decimal_38_subtract
  LDA $C102
  CMP #$0A
  BCC api_decimal_38_done
api_decimal_38_subtract:
  SEC
  LDA $C102
  SBC #$0A
  STA $C102
  LDA $C103
  SBC #$00
  STA $C103
  INC $C107
  JMP api_decimal_38
api_decimal_38_done:
  LDA $C102
  STA $C108
  RTS
; String pool
str_screen_0:
  .byte $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $32, $3A, $20, $0D, $0F, $16, $05, $00
str_screen_1:
  .byte $18, $3A, $20, $20, $20, $20, $20, $20, $20, $19, $3A, $00
str_screen_2:
  .byte $06, $09, $12, $05, $3A, $20, $05, $18, $10, $01, $0E, $04, $20, $2F, $20, $03, $0F, $0C, $0F, $12, $00
; User data
sprite_frames_hero_0:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $0C, $00, $30, $18, $00, $18, $30, $00, $0C, $60, $00, $06
sprite_frames_hero_1:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $18, $00, $18, $30, $00, $0C, $60, $00, $06, $30, $00, $0C
