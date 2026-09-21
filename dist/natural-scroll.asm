  LDA #$01
  STA $0286
  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $8000,X
  INX
  BNE asset_map_initial_copy_2
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
  CPX #$14
  BNE asset_map_initial_rle_4
  LDA #$00
  STA $C102
  LDA #$07
  STA $C103
  LDA #$00
  STA $C104
  LDA #$07
  STA $C105
  LDA #$00
  STA $C109
  LDA #$00
  STA $C10A
  LDA #$00
  STA $C10B
  LDA #$00
  STA $C10C
  LDA $D011
  AND #$7F
  STA $C106
  LDA $D016
  STA $C107
  LDA $D018
  STA $C108
  LDA #$00
  LDX #$00
map_scroll_blank_charset_0:
  STA $3800,X
  STA $3900,X
  STA $3A00,X
  STA $3B00,X
  STA $3C00,X
  STA $3D00,X
  STA $3E00,X
  STA $3F00,X
  INX
  BNE map_scroll_blank_charset_0
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
  CPX #$20
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
  ORA #$10
  STA $D016
  LDA #$00
  STA $D021
  LDA #$05
  STA $D022
  LDA #$0A
  STA $D023
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $06F9,X
  LDA $0286
  AND #$0F
  STA $DAF9,X
  INX
  BNE printat_loop_1
printat_done_2:
  LDX #$00
printat_loop_3:
  LDA str_screen_1,X
  BEQ printat_done_4
  STA $0749,X
  LDA $0286
  AND #$0F
  STA $DB49,X
  INX
  BNE printat_loop_3
printat_done_4:
  LDA $C102
  STA $C7C0
  LDA $C104
  STA $C7C1
  LDA $D011
  AND #$7F
  STA $C106
  LDA $D016
  STA $C107
  LDA $D018
  STA $C108
  JSR runtime_map_viewport_0
  JSR runtime_map_scroll_restore_0
__js_callback_end_0:
  JMP user_routine___js_moveCamera_1_after
user_routine___js_moveCamera_1:
  LDA $C767
  AND #$10
  BEQ condition_pass_6
  JMP control_if_else_5
condition_pass_6:
  LDA #$04
  STA $C100
  JMP control_if_end_5
control_if_else_5:
  LDA #$01
  STA $C100
control_if_end_5:
  LDA $C100
  STA $C101
  LDA $C767
  AND #$04
  BEQ condition_pass_8
  JMP control_if_else_7
condition_pass_8:
  LDA #$00
  CMP #$00
  BCC api_range_valid_10_upper
  BNE api_range_invalid_11
  LDA $C101
  CMP #$09
  BCS api_range_invalid_11
api_range_valid_10_upper:
  JMP api_range_valid_10
api_range_invalid_11:
  JMP api_scroll_9_done
api_range_valid_10:
  LDA $C101
  STA $C10D
  LDA $C10D
  BNE api_scroll_9_start
  JMP api_scroll_9_done
api_scroll_9_start:
api_scroll_9:
  LDA $C102
  BNE map_scroll_can_move_12
  LDA $C103
  CMP #$07
  BEQ map_scroll_done_12
map_scroll_can_move_12:
  LDA $C103
  CMP #$07
  BEQ map_scroll_wrap_12
  INC $C103
  JMP map_scroll_moved_12
map_scroll_wrap_12:
  DEC $C102
  LDA #$00
  STA $C103
  JSR runtime_map_scroll_shift_right_0
map_scroll_moved_12:
  LDA $C109
  BNE map_scroll_pixel_x_dec_12_low
  DEC $C10A
map_scroll_pixel_x_dec_12_low:
  DEC $C109
map_scroll_done_12:
  DEC $C10D
  BEQ api_scroll_9_done
  JMP api_scroll_9
api_scroll_9_done:
  JMP control_if_end_7
control_if_else_7:
control_if_end_7:
  LDA $C767
  AND #$08
  BEQ condition_pass_14
  JMP control_if_else_13
condition_pass_14:
  LDA #$00
  CMP #$00
  BCC api_range_valid_16_upper
  BNE api_range_invalid_17
  LDA $C101
  CMP #$09
  BCS api_range_invalid_17
api_range_valid_16_upper:
  JMP api_range_valid_16
api_range_invalid_17:
  JMP api_scroll_15_done
api_range_valid_16:
  LDA $C101
  STA $C10D
  LDA $C10D
  BNE api_scroll_15_start
  JMP api_scroll_15_done
api_scroll_15_start:
api_scroll_15:
  LDA $C102
  CMP #$08
  BEQ map_scroll_done_18
map_scroll_can_move_18:
  LDA $C103
  BEQ map_scroll_wrap_18
  DEC $C103
  JMP map_scroll_moved_18
map_scroll_wrap_18:
  INC $C102
  LDA #$07
  STA $C103
  JSR runtime_map_scroll_shift_left_0
map_scroll_moved_18:
  INC $C109
  BNE map_scroll_pixel_x_inc_18_done
  INC $C10A
map_scroll_pixel_x_inc_18_done:
map_scroll_done_18:
  DEC $C10D
  BEQ api_scroll_15_done
  JMP api_scroll_15
api_scroll_15_done:
  JMP control_if_end_13
control_if_else_13:
control_if_end_13:
  LDA $C767
  AND #$01
  BEQ condition_pass_20
  JMP control_if_else_19
condition_pass_20:
  LDA #$00
  CMP #$00
  BCC api_range_valid_22_upper
  BNE api_range_invalid_23
  LDA $C101
  CMP #$09
  BCS api_range_invalid_23
api_range_valid_22_upper:
  JMP api_range_valid_22
api_range_invalid_23:
  JMP api_scroll_21_done
api_range_valid_22:
  LDA $C101
  STA $C10E
  LDA $C10E
  BNE api_scroll_21_start
  JMP api_scroll_21_done
api_scroll_21_start:
api_scroll_21:
  LDA $C104
  BNE map_scroll_y_can_move_24
  LDA $C105
  CMP #$07
  BEQ map_scroll_y_done_24
map_scroll_y_can_move_24:
  LDA $C105
  CMP #$07
  BEQ map_scroll_y_wrap_24
  INC $C105
  JMP map_scroll_y_moved_24
map_scroll_y_wrap_24:
  DEC $C104
  LDA #$00
  STA $C105
  JSR runtime_map_scroll_shift_down_0
map_scroll_y_moved_24:
  LDA $C10B
  BNE map_scroll_pixel_y_dec_24_low
  DEC $C10C
map_scroll_pixel_y_dec_24_low:
  DEC $C10B
map_scroll_y_done_24:
  DEC $C10E
  BEQ api_scroll_21_done
  JMP api_scroll_21
api_scroll_21_done:
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  LDA $C767
  AND #$02
  BEQ condition_pass_26
  JMP control_if_else_25
condition_pass_26:
  LDA #$00
  CMP #$00
  BCC api_range_valid_28_upper
  BNE api_range_invalid_29
  LDA $C101
  CMP #$09
  BCS api_range_invalid_29
api_range_valid_28_upper:
  JMP api_range_valid_28
api_range_invalid_29:
  JMP api_scroll_27_done
api_range_valid_28:
  LDA $C101
  STA $C10E
  LDA $C10E
  BNE api_scroll_27_start
  JMP api_scroll_27_done
api_scroll_27_start:
api_scroll_27:
  LDA $C104
  CMP #$08
  BEQ map_scroll_y_done_30
map_scroll_y_can_move_30:
  LDA $C105
  BEQ map_scroll_y_wrap_30
  DEC $C105
  JMP map_scroll_y_moved_30
map_scroll_y_wrap_30:
  INC $C104
  LDA #$07
  STA $C105
  JSR runtime_map_scroll_shift_up_0
map_scroll_y_moved_30:
  INC $C10B
  BNE map_scroll_pixel_y_inc_30_done
  INC $C10C
map_scroll_pixel_y_inc_30_done:
map_scroll_y_done_30:
  DEC $C10E
  BEQ api_scroll_27_done
  JMP api_scroll_27
api_scroll_27_done:
  JMP control_if_end_25
control_if_else_25:
control_if_end_25:
  LDA $C101
  STA $C10F
  LDA #$00
  STA $C110
  JSR api_decimal_convert
  LDA $C115
  CLC
  ADC #$30
  STA $075D
  LDA #$01
  AND #$0F
  STA $DB5D
__js_return_2:
  RTS
user_routine___js_moveCamera_1_after:
  SEI
  LDA #$7F
  STA $DC0D
  STA $DD0D
  LDA $DC0D
  LDA $DD0D
  LDA #$00
  STA $C0FE
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$1E
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<irq_dispatch
  STA $0314
  LDA #>irq_dispatch
  STA $0315
  CLI
  JMP program_end
; Raster IRQ dispatcher
irq_dispatch:
  PHA
  TXA
  PHA
  TYA
  PHA
  LDA $D019
  AND #$01
  BNE irq_dispatch_vic_raster
  LDA $DC0D
  LDA $DD0D
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
irq_dispatch_vic_raster:
  LDA #$01
  STA $D019
  LDA $C0FE
  CMP #$00
  BEQ irq_dispatch_match_0
  JMP irq_dispatch_next_0
irq_dispatch_match_0:
  JMP irq_handler_0
irq_dispatch_next_0:
  CMP #$01
  BEQ irq_dispatch_match_1
  JMP irq_dispatch_next_1
irq_dispatch_match_1:
  JMP irq_handler_1
irq_dispatch_next_1:
  JMP irq_handler_0
irq_handler_0:
  JSR runtime_map_scroll_apply_0
  LDA #$01
  STA $C0FE
  LDA #$84
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
irq_handler_1:
  JSR runtime_map_scroll_prepare_panel_0
  LDA #$00
  STA $C0FE
  LDA #$1E
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
program_end:
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
  CMP #$9E
  BCS game_frame_wait_leave
game_frame_wait_target:
  LDA $D011
  BMI game_frame_target_reached
  LDA $D012
  CMP #$9E
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
  BNE game_frame_counter_done_31
  INC $C76B
game_frame_counter_done_31:
  JSR user_routine___js_moveCamera_1
  JMP game_frame_loop
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA $C7B2
  STA $C7C2
  LDA $C7B3
  STA $C7C3
runtime_map_draw_tile_body_0:
  JSR runtime_map_pointer_0
  LDA ($FB),Y
  STA $C7B4
  LDA $C7B4
  STA $C7B5
  LDA #$CC
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
  ORA #$08
  LDY #$00
  STA ($FD),Y
  RTS
; Map 0: bounded coarse viewport 12x7
runtime_map_viewport_0:
  LDA #$00
  STA $C7C3
runtime_map_viewport_row_0:
  CLC
  LDA $C7C1
  ADC $C7C3
  STA $C7B3
  LDA #$00
  STA $C7C2
runtime_map_viewport_column_0:
  CLC
  LDA $C7C0
  ADC $C7C2
  STA $C7B2
  JSR runtime_map_draw_tile_body_0
  INC $C7C2
  LDA $C7C2
  CMP #$0C
  BNE runtime_map_viewport_column_0
  INC $C7C3
  LDA $C7C3
  CMP #$07
  BNE runtime_map_viewport_row_0
  RTS
; Map 0: enter raster-banded fine X/Y viewport
runtime_map_scroll_apply_0:
  LDA $D016
  AND #$F0
  ORA $C103
  STA $D016
  LDA $D011
  AND #$F0
  ORA $C105
  STA $D011
  RTS
; Map 0: cycle-stable VCBASE transition into the fixed panel
runtime_map_scroll_prepare_panel_0:
runtime_map_scroll_wait_normalize_0:
  LDA $D012
  CMP #$8D
  BCC runtime_map_scroll_wait_normalize_0
  LDA $C106
  AND #$F0
  ORA #$07
  STA $D011
runtime_map_scroll_wait_blank_0:
  LDA $D012
  CMP #$8E
  BCC runtime_map_scroll_wait_blank_0
  LDA $C108
  AND #$F0
  ORA #$0E
  STA $D018
runtime_map_scroll_wait_den_off_0:
  LDA $D012
  CMP #$96
  BCC runtime_map_scroll_wait_den_off_0
  LDA $C106
  AND #$E0
  ORA #$07
  STA $D011
runtime_map_scroll_wait_panel_y_0:
  LDA $D012
  CMP #$98
  BCC runtime_map_scroll_wait_panel_y_0
  LDA $C106
  STA $D011
  LDA $C108
  STA $D018
runtime_map_scroll_wait_panel_x_0:
  LDA $D012
  CMP #$9A
  BCC runtime_map_scroll_wait_panel_x_0
  LDA $C107
  STA $D016
  RTS
; Map 0: leave the scroll area with the fixed horizontal phase
runtime_map_scroll_leave_0:
  LDA $C107
  STA $D016
  RTS
; Map 0: restore both fixed-panel VIC-II phases after a full redraw
runtime_map_scroll_restore_0:
  LDA $C107
  STA $D016
  LDA $C106
  STA $D011
  LDA $C108
  STA $D018
  RTS
; Map 0: shift Screen RAM and Color RAM one character left
runtime_map_scroll_shift_left_0:
  LDA $C102
  CLC
  ADC #$0B
  STA $C7B2
  LDA $C104
  STA $C7B3
  JSR runtime_map_pointer_0
  LDA $04CD
  STA $04CC
  LDA $D8CD
  STA $D8CC
  LDX #$F6
runtime_map_scroll_left_row_0_0:
  LDA $03D8,X
  STA $03D7,X
  LDA $D7D8,X
  STA $D7D7,X
  INX
  LDA $03D8,X
  STA $03D7,X
  LDA $D7D8,X
  STA $D7D7,X
  INX
  BNE runtime_map_scroll_left_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04D7
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D8D7
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04F5
  STA $04F4
  LDA $D8F5
  STA $D8F4
  LDX #$F6
runtime_map_scroll_left_row_0_1:
  LDA $0400,X
  STA $03FF,X
  LDA $D800,X
  STA $D7FF,X
  INX
  LDA $0400,X
  STA $03FF,X
  LDA $D800,X
  STA $D7FF,X
  INX
  BNE runtime_map_scroll_left_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04FF
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D8FF
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $051D
  STA $051C
  LDA $D91D
  STA $D91C
  LDX #$F6
runtime_map_scroll_left_row_0_2:
  LDA $0428,X
  STA $0427,X
  LDA $D828,X
  STA $D827,X
  INX
  LDA $0428,X
  STA $0427,X
  LDA $D828,X
  STA $D827,X
  INX
  BNE runtime_map_scroll_left_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0527
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D927
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0545
  STA $0544
  LDA $D945
  STA $D944
  LDX #$F6
runtime_map_scroll_left_row_0_3:
  LDA $0450,X
  STA $044F,X
  LDA $D850,X
  STA $D84F,X
  INX
  LDA $0450,X
  STA $044F,X
  LDA $D850,X
  STA $D84F,X
  INX
  BNE runtime_map_scroll_left_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $054F
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D94F
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $056D
  STA $056C
  LDA $D96D
  STA $D96C
  LDX #$F6
runtime_map_scroll_left_row_0_4:
  LDA $0478,X
  STA $0477,X
  LDA $D878,X
  STA $D877,X
  INX
  LDA $0478,X
  STA $0477,X
  LDA $D878,X
  STA $D877,X
  INX
  BNE runtime_map_scroll_left_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0577
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D977
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0595
  STA $0594
  LDA $D995
  STA $D994
  LDX #$F6
runtime_map_scroll_left_row_0_5:
  LDA $04A0,X
  STA $049F,X
  LDA $D8A0,X
  STA $D89F,X
  INX
  LDA $04A0,X
  STA $049F,X
  LDA $D8A0,X
  STA $D89F,X
  INX
  BNE runtime_map_scroll_left_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $059F
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D99F
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05BD
  STA $05BC
  LDA $D9BD
  STA $D9BC
  LDX #$F6
runtime_map_scroll_left_row_0_6:
  LDA $04C8,X
  STA $04C7,X
  LDA $D8C8,X
  STA $D8C7,X
  INX
  LDA $04C8,X
  STA $04C7,X
  LDA $D8C8,X
  STA $D8C7,X
  INX
  BNE runtime_map_scroll_left_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05C7
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D9C7
  RTS
; Map 0: shift Screen RAM and Color RAM one character right
runtime_map_scroll_shift_right_0:
  LDA $C102
  STA $C7B2
  LDA $C104
  STA $C7B3
  JSR runtime_map_pointer_0
  LDA $04D6
  STA $04D7
  LDA $D8D6
  STA $D8D7
  LDX #$09
runtime_map_scroll_right_row_0_0:
  LDA $04CC,X
  STA $04CD,X
  LDA $D8CC,X
  STA $D8CD,X
  DEX
  LDA $04CC,X
  STA $04CD,X
  LDA $D8CC,X
  STA $D8CD,X
  DEX
  BPL runtime_map_scroll_right_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04CC
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D8CC
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04FE
  STA $04FF
  LDA $D8FE
  STA $D8FF
  LDX #$09
runtime_map_scroll_right_row_0_1:
  LDA $04F4,X
  STA $04F5,X
  LDA $D8F4,X
  STA $D8F5,X
  DEX
  LDA $04F4,X
  STA $04F5,X
  LDA $D8F4,X
  STA $D8F5,X
  DEX
  BPL runtime_map_scroll_right_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04F4
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D8F4
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0526
  STA $0527
  LDA $D926
  STA $D927
  LDX #$09
runtime_map_scroll_right_row_0_2:
  LDA $051C,X
  STA $051D,X
  LDA $D91C,X
  STA $D91D,X
  DEX
  LDA $051C,X
  STA $051D,X
  LDA $D91C,X
  STA $D91D,X
  DEX
  BPL runtime_map_scroll_right_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $051C
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D91C
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $054E
  STA $054F
  LDA $D94E
  STA $D94F
  LDX #$09
runtime_map_scroll_right_row_0_3:
  LDA $0544,X
  STA $0545,X
  LDA $D944,X
  STA $D945,X
  DEX
  LDA $0544,X
  STA $0545,X
  LDA $D944,X
  STA $D945,X
  DEX
  BPL runtime_map_scroll_right_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0544
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D944
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0576
  STA $0577
  LDA $D976
  STA $D977
  LDX #$09
runtime_map_scroll_right_row_0_4:
  LDA $056C,X
  STA $056D,X
  LDA $D96C,X
  STA $D96D,X
  DEX
  LDA $056C,X
  STA $056D,X
  LDA $D96C,X
  STA $D96D,X
  DEX
  BPL runtime_map_scroll_right_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $056C
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D96C
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $059E
  STA $059F
  LDA $D99E
  STA $D99F
  LDX #$09
runtime_map_scroll_right_row_0_5:
  LDA $0594,X
  STA $0595,X
  LDA $D994,X
  STA $D995,X
  DEX
  LDA $0594,X
  STA $0595,X
  LDA $D994,X
  STA $D995,X
  DEX
  BPL runtime_map_scroll_right_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0594
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D994
  CLC
  LDA $FB
  ADC #$14
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05C6
  STA $05C7
  LDA $D9C6
  STA $D9C7
  LDX #$09
runtime_map_scroll_right_row_0_6:
  LDA $05BC,X
  STA $05BD,X
  LDA $D9BC,X
  STA $D9BD,X
  DEX
  LDA $05BC,X
  STA $05BD,X
  LDA $D9BC,X
  STA $D9BD,X
  DEX
  BPL runtime_map_scroll_right_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05BC
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D9BC
  RTS
; Map 0: shift Screen RAM and Color RAM one character up
runtime_map_scroll_shift_up_0:
  LDX #$F4
runtime_map_scroll_up_row_0_0:
  LDA $0400,X
  STA $03D8,X
  LDA $D800,X
  STA $D7D8,X
  INX
  LDA $0400,X
  STA $03D8,X
  LDA $D800,X
  STA $D7D8,X
  INX
  BNE runtime_map_scroll_up_row_0_0
  LDX #$F4
runtime_map_scroll_up_row_0_1:
  LDA $0428,X
  STA $0400,X
  LDA $D828,X
  STA $D800,X
  INX
  LDA $0428,X
  STA $0400,X
  LDA $D828,X
  STA $D800,X
  INX
  BNE runtime_map_scroll_up_row_0_1
  LDX #$F4
runtime_map_scroll_up_row_0_2:
  LDA $0450,X
  STA $0428,X
  LDA $D850,X
  STA $D828,X
  INX
  LDA $0450,X
  STA $0428,X
  LDA $D850,X
  STA $D828,X
  INX
  BNE runtime_map_scroll_up_row_0_2
  LDX #$F4
runtime_map_scroll_up_row_0_3:
  LDA $0478,X
  STA $0450,X
  LDA $D878,X
  STA $D850,X
  INX
  LDA $0478,X
  STA $0450,X
  LDA $D878,X
  STA $D850,X
  INX
  BNE runtime_map_scroll_up_row_0_3
  LDX #$F4
runtime_map_scroll_up_row_0_4:
  LDA $04A0,X
  STA $0478,X
  LDA $D8A0,X
  STA $D878,X
  INX
  LDA $04A0,X
  STA $0478,X
  LDA $D8A0,X
  STA $D878,X
  INX
  BNE runtime_map_scroll_up_row_0_4
  LDX #$F4
runtime_map_scroll_up_row_0_5:
  LDA $04C8,X
  STA $04A0,X
  LDA $D8C8,X
  STA $D8A0,X
  INX
  LDA $04C8,X
  STA $04A0,X
  LDA $D8C8,X
  STA $D8A0,X
  INX
  BNE runtime_map_scroll_up_row_0_5
  LDA $C104
  CLC
  ADC #$06
  STA $C7B3
  LDA $C102
  STA $C7B2
  JSR runtime_map_pointer_0
  LDY #$00
runtime_map_scroll_up_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05BC,Y
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D9BC,Y
  INY
  CPY #$0C
  BNE runtime_map_scroll_up_line_0
  RTS
; Map 0: shift Screen RAM and Color RAM one character down
runtime_map_scroll_shift_down_0:
  LDX #$F4
runtime_map_scroll_down_row_0_5:
  LDA $04A0,X
  STA $04C8,X
  LDA $D8A0,X
  STA $D8C8,X
  INX
  LDA $04A0,X
  STA $04C8,X
  LDA $D8A0,X
  STA $D8C8,X
  INX
  BNE runtime_map_scroll_down_row_0_5
  LDX #$F4
runtime_map_scroll_down_row_0_4:
  LDA $0478,X
  STA $04A0,X
  LDA $D878,X
  STA $D8A0,X
  INX
  LDA $0478,X
  STA $04A0,X
  LDA $D878,X
  STA $D8A0,X
  INX
  BNE runtime_map_scroll_down_row_0_4
  LDX #$F4
runtime_map_scroll_down_row_0_3:
  LDA $0450,X
  STA $0478,X
  LDA $D850,X
  STA $D878,X
  INX
  LDA $0450,X
  STA $0478,X
  LDA $D850,X
  STA $D878,X
  INX
  BNE runtime_map_scroll_down_row_0_3
  LDX #$F4
runtime_map_scroll_down_row_0_2:
  LDA $0428,X
  STA $0450,X
  LDA $D828,X
  STA $D850,X
  INX
  LDA $0428,X
  STA $0450,X
  LDA $D828,X
  STA $D850,X
  INX
  BNE runtime_map_scroll_down_row_0_2
  LDX #$F4
runtime_map_scroll_down_row_0_1:
  LDA $0400,X
  STA $0428,X
  LDA $D800,X
  STA $D828,X
  INX
  LDA $0400,X
  STA $0428,X
  LDA $D800,X
  STA $D828,X
  INX
  BNE runtime_map_scroll_down_row_0_1
  LDX #$F4
runtime_map_scroll_down_row_0_0:
  LDA $03D8,X
  STA $0400,X
  LDA $D7D8,X
  STA $D800,X
  INX
  LDA $03D8,X
  STA $0400,X
  LDA $D7D8,X
  STA $D800,X
  INX
  BNE runtime_map_scroll_down_row_0_0
  LDA $C104
  STA $C7B3
  LDA $C102
  STA $C7B2
  JSR runtime_map_pointer_0
  LDY #$00
runtime_map_scroll_down_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04CC,Y
  LDA asset_map_colors_0,X
  ORA #$08
  STA $D8CC,Y
  INY
  CPY #$0C
  BNE runtime_map_scroll_down_line_0
  RTS
; Dynamic map 0: redraw visible cells from runtime RAM
runtime_map_redraw_0:
  JMP runtime_map_viewport_0
runtime_map_pointer_0:
  LDY $C7B3
  CLC
  LDA runtime_map_row_lo_0,Y
  ADC $C7B2
  STA $FB
  LDA runtime_map_row_hi_0,Y
  ADC #$00
  STA $FC
  LDY #$00
  RTS
runtime_map_row_lo_0:
  .byte $00, $14, $28, $3C, $50, $64, $78, $8C, $A0, $B4, $C8, $DC, $F0, $04, $18
runtime_map_row_hi_0:
  .byte $80, $80, $80, $80, $80, $80, $80, $80, $80, $80, $80, $80, $80, $81, $81
api_decimal_convert:
  LDA #$00
  STA $C111
api_decimal_32:
  LDA $C110
  CMP #$27
  BCC api_decimal_32_done
  BNE api_decimal_32_subtract
  LDA $C10F
  CMP #$10
  BCC api_decimal_32_done
api_decimal_32_subtract:
  SEC
  LDA $C10F
  SBC #$10
  STA $C10F
  LDA $C110
  SBC #$27
  STA $C110
  INC $C111
  JMP api_decimal_32
api_decimal_32_done:
  LDA #$00
  STA $C112
api_decimal_33:
  LDA $C110
  CMP #$03
  BCC api_decimal_33_done
  BNE api_decimal_33_subtract
  LDA $C10F
  CMP #$E8
  BCC api_decimal_33_done
api_decimal_33_subtract:
  SEC
  LDA $C10F
  SBC #$E8
  STA $C10F
  LDA $C110
  SBC #$03
  STA $C110
  INC $C112
  JMP api_decimal_33
api_decimal_33_done:
  LDA #$00
  STA $C113
api_decimal_34:
  LDA $C110
  CMP #$00
  BCC api_decimal_34_done
  BNE api_decimal_34_subtract
  LDA $C10F
  CMP #$64
  BCC api_decimal_34_done
api_decimal_34_subtract:
  SEC
  LDA $C10F
  SBC #$64
  STA $C10F
  LDA $C110
  SBC #$00
  STA $C110
  INC $C113
  JMP api_decimal_34
api_decimal_34_done:
  LDA #$00
  STA $C114
api_decimal_35:
  LDA $C110
  CMP #$00
  BCC api_decimal_35_done
  BNE api_decimal_35_subtract
  LDA $C10F
  CMP #$0A
  BCC api_decimal_35_done
api_decimal_35_subtract:
  SEC
  LDA $C10F
  SBC #$0A
  STA $C10F
  LDA $C110
  SBC #$00
  STA $C110
  INC $C114
  JMP api_decimal_35
api_decimal_35_done:
  LDA $C10F
  STA $C115
  RTS
; String pool
str_screen_0:
  .byte $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $32, $3A, $20, $13, $03, $12, $0F, $0C, $0C, $00
str_screen_1:
  .byte $06, $09, $12, $05, $3A, $20, $06, $01, $13, $14, $20, $2D, $20, $13, $10, $05, $05, $04, $3A, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $00, $00
asset_map_chars_0:
  .byte $40, $41, $42, $43
asset_map_colors_0:
  .byte $00, $06, $07, $02
asset_bytes_1:
  .byte $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $03, $00, $00, $02, $00, $00, $00, $01, $00, $00, $00, $02, $00, $00, $00, $00, $02, $00, $01, $01, $00, $01, $01, $01, $00, $01, $00, $01, $00, $01, $01, $01, $01, $01, $00, $01, $01, $00, $01, $01, $00, $01, $02, $00, $00, $01, $00, $00, $00, $01, $00, $00, $00, $00, $00, $01, $02, $00, $01, $01, $00, $01, $00, $01, $01, $01, $01, $01, $00, $01, $00, $01, $01, $01, $01, $01, $00, $01, $01, $01, $00, $00, $00, $01, $00, $00, $02, $00, $00, $01, $00, $00, $00, $00, $02, $00, $00, $00, $01, $01, $01, $01, $00, $01, $00, $01, $01, $01, $01, $01, $01, $01, $00, $01, $01, $01, $01, $00, $01, $01, $02, $00, $00, $00, $00, $01, $00, $00, $00, $02, $00, $01, $00, $00, $00, $00, $01, $00, $01, $01, $00, $01, $01, $01, $01, $01, $00, $01, $01, $01, $00, $01, $01, $01, $01, $00, $01, $00, $01, $01, $00, $00, $00, $02, $00, $00, $00, $01, $00, $00, $00, $00, $00, $00, $01, $00, $00, $00, $01, $01, $00, $01, $01, $01, $01, $01, $01, $01, $00, $01, $01, $01, $01, $00, $01, $01, $01, $00, $01, $01, $00, $01, $00, $00, $00, $02, $00, $00, $00, $01, $00, $02, $00, $00, $00, $00, $01, $00, $01, $01, $00, $01, $00, $01, $01, $01, $01, $01, $01, $01, $00, $01, $01, $01, $01
asset_rle_3:
  .byte $01, $00, $01, $01, $01, $00, $02, $01, $01, $02, $0B, $00, $01, $02, $04, $00, $01, $02, $15, $01
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $C3, $99, $A5, $A5, $99, $C3, $FF, $00, $18, $18, $7E, $7E, $18, $18, $00, $3C, $7E, $DB, $FF, $FF, $DB, $7E, $3C
