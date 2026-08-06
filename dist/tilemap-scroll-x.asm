  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $8000,X
  INX
  BNE asset_map_initial_copy_2
  LDX #$00
asset_map_initial_copy_4:
  LDA asset_bytes_3,X
  STA $8100,X
  INX
  BNE asset_map_initial_copy_4
  LDX #$00
asset_map_initial_copy_6:
  LDA asset_bytes_5,X
  STA $8200,X
  INX
  BNE asset_map_initial_copy_6
  LDX #$00
asset_map_initial_copy_8:
  LDA asset_bytes_7,X
  STA $8300,X
  INX
  CPX #$C0
  BNE asset_map_initial_copy_8
  LDA #$00
  STA $C100
  LDA #$07
  STA $C101
  LDA #$00
  STA $C102
  LDA #$07
  STA $C103
  LDA #$00
  STA $C107
  LDA #$00
  STA $C108
  LDA #$00
  STA $C109
  LDA #$00
  STA $C10A
  LDA $D011
  AND #$7F
  STA $C104
  LDA $D016
  STA $C105
  LDA $D018
  STA $C106
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
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0701,X
  LDA #$01
  STA $DB01,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $074B,X
  LDA #$01
  STA $DB4B,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDA $C100
  STA $C7C0
  LDA $C102
  STA $C7C1
  LDA $D011
  AND #$7F
  STA $C104
  LDA $D016
  STA $C105
  LDA $D018
  STA $C106
  JSR runtime_map_viewport_0
  JSR runtime_map_scroll_restore_0
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
  LDA #$8C
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
  LDA #$3C
  STA $C76F
  LDA #$FF
  STA $C767
  LDA #$FF
  STA $C769
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
  LDA $D012
  CMP #$A6
  BEQ game_frame_wait_leave
game_frame_wait_target:
  LDA $D012
  CMP #$A6
  BNE game_frame_wait_target
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
  BNE game_frame_counter_done_4
  INC $C76B
game_frame_counter_done_4:
  LDA $C767
  AND #$04
  BEQ condition_pass_6
  JMP control_if_else_5
condition_pass_6:
  LDA $C100
  BNE map_scroll_can_move_7
  LDA $C101
  CMP #$07
  BEQ map_scroll_done_7
map_scroll_can_move_7:
  LDA $C101
  CMP #$07
  BEQ map_scroll_wrap_7
  INC $C101
  JMP map_scroll_moved_7
map_scroll_wrap_7:
  DEC $C100
  JSR runtime_map_scroll_shift_right_0
  LDA #$00
  STA $C101
map_scroll_moved_7:
  LDA $C107
  BNE map_scroll_pixel_x_dec_7_low
  DEC $C108
map_scroll_pixel_x_dec_7_low:
  DEC $C107
map_scroll_done_7:
  JMP control_if_end_5
control_if_else_5:
control_if_end_5:
  LDA $C767
  AND #$08
  BEQ condition_pass_9
  JMP control_if_else_8
condition_pass_9:
  LDA $C100
  CMP #$14
  BEQ map_scroll_done_10
map_scroll_can_move_10:
  LDA $C101
  BEQ map_scroll_wrap_10
  DEC $C101
  JMP map_scroll_moved_10
map_scroll_wrap_10:
  INC $C100
  JSR runtime_map_scroll_shift_left_0
  LDA #$07
  STA $C101
map_scroll_moved_10:
  INC $C107
  BNE map_scroll_pixel_x_inc_10_done
  INC $C108
map_scroll_pixel_x_inc_10_done:
map_scroll_done_10:
  JMP control_if_end_8
control_if_else_8:
control_if_end_8:
  LDA $C767
  AND #$01
  BEQ condition_pass_12
  JMP control_if_else_11
condition_pass_12:
  LDA $C102
  BNE map_scroll_y_can_move_13
  LDA $C103
  CMP #$07
  BEQ map_scroll_y_done_13
map_scroll_y_can_move_13:
  LDA $C103
  CMP #$07
  BEQ map_scroll_y_wrap_13
  INC $C103
  JMP map_scroll_y_moved_13
map_scroll_y_wrap_13:
  DEC $C102
  JSR runtime_map_scroll_shift_down_0
  LDA #$00
  STA $C103
map_scroll_y_moved_13:
  LDA $C109
  BNE map_scroll_pixel_y_dec_13_low
  DEC $C10A
map_scroll_pixel_y_dec_13_low:
  DEC $C109
map_scroll_y_done_13:
  JMP control_if_end_11
control_if_else_11:
control_if_end_11:
  LDA $C767
  AND #$02
  BEQ condition_pass_15
  JMP control_if_else_14
condition_pass_15:
  LDA $C102
  CMP #$0D
  BEQ map_scroll_y_done_16
map_scroll_y_can_move_16:
  LDA $C103
  BEQ map_scroll_y_wrap_16
  DEC $C103
  JMP map_scroll_y_moved_16
map_scroll_y_wrap_16:
  INC $C102
  JSR runtime_map_scroll_shift_up_0
  LDA #$07
  STA $C103
map_scroll_y_moved_16:
  INC $C109
  BNE map_scroll_pixel_y_inc_16_done
  INC $C10A
map_scroll_pixel_y_inc_16_done:
map_scroll_y_done_16:
  JMP control_if_end_14
control_if_else_14:
control_if_end_14:
  JMP game_frame_loop
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA $C7B2
  STA $C7C2
  LDA $C7B3
  STA $C7C3
runtime_map_draw_tile_body_0:
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA ($FB),Y
  STA $C7B4
  LDA $C7B4
  STA $C7B5
  LDA #$F6
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
  LDY #$00
  STA ($FD),Y
  RTS
; Map 0: bounded coarse viewport 28x7
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
  CMP #$1C
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
  ORA $C101
  STA $D016
  LDA $D011
  AND #$F0
  ORA $C103
  STA $D011
  RTS
; Map 0: cycle-stable VCBASE transition into the fixed panel
runtime_map_scroll_prepare_panel_0:
runtime_map_scroll_wait_normalize_0:
  LDA $D012
  CMP #$95
  BCC runtime_map_scroll_wait_normalize_0
  LDA $C104
  AND #$F0
  ORA #$07
  STA $D011
runtime_map_scroll_wait_blank_0:
  LDA $D012
  CMP #$96
  BCC runtime_map_scroll_wait_blank_0
  LDA $C106
  AND #$F0
  ORA #$0E
  STA $D018
runtime_map_scroll_wait_den_off_0:
  LDA $D012
  CMP #$9E
  BCC runtime_map_scroll_wait_den_off_0
  LDA $C104
  AND #$E0
  ORA #$07
  STA $D011
runtime_map_scroll_wait_panel_y_0:
  LDA $D012
  CMP #$A0
  BCC runtime_map_scroll_wait_panel_y_0
  LDA $C104
  STA $D011
  LDA $C106
  STA $D018
runtime_map_scroll_wait_panel_x_0:
  LDA $D012
  CMP #$A2
  BCC runtime_map_scroll_wait_panel_x_0
  LDA $C105
  STA $D016
  RTS
; Map 0: leave the scroll area with the fixed horizontal phase
runtime_map_scroll_leave_0:
  LDA $C105
  STA $D016
  RTS
; Map 0: restore both fixed-panel VIC-II phases after a full redraw
runtime_map_scroll_restore_0:
  LDA $C105
  STA $D016
  LDA $C104
  STA $D011
  LDA $C106
  STA $D018
  RTS
; Map 0: shift Screen RAM and Color RAM one character left
runtime_map_scroll_shift_left_0:
  LDA $C100
  CLC
  ADC #$1B
  STA $C7B2
  LDA $C102
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA $04F7
  STA $04F6
  LDA $D8F7
  STA $D8F6
  LDX #$E6
runtime_map_scroll_left_row_0_0:
  LDA $0412,X
  STA $0411,X
  LDA $D812,X
  STA $D811,X
  INX
  LDA $0412,X
  STA $0411,X
  LDA $D812,X
  STA $D811,X
  INX
  BNE runtime_map_scroll_left_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0511
  LDA asset_map_colors_0,X
  STA $D911
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $051F
  STA $051E
  LDA $D91F
  STA $D91E
  LDX #$E6
runtime_map_scroll_left_row_0_1:
  LDA $043A,X
  STA $0439,X
  LDA $D83A,X
  STA $D839,X
  INX
  LDA $043A,X
  STA $0439,X
  LDA $D83A,X
  STA $D839,X
  INX
  BNE runtime_map_scroll_left_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0539
  LDA asset_map_colors_0,X
  STA $D939
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0547
  STA $0546
  LDA $D947
  STA $D946
  LDX #$E6
runtime_map_scroll_left_row_0_2:
  LDA $0462,X
  STA $0461,X
  LDA $D862,X
  STA $D861,X
  INX
  LDA $0462,X
  STA $0461,X
  LDA $D862,X
  STA $D861,X
  INX
  BNE runtime_map_scroll_left_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0561
  LDA asset_map_colors_0,X
  STA $D961
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $056F
  STA $056E
  LDA $D96F
  STA $D96E
  LDX #$E6
runtime_map_scroll_left_row_0_3:
  LDA $048A,X
  STA $0489,X
  LDA $D88A,X
  STA $D889,X
  INX
  LDA $048A,X
  STA $0489,X
  LDA $D88A,X
  STA $D889,X
  INX
  BNE runtime_map_scroll_left_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0589
  LDA asset_map_colors_0,X
  STA $D989
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0597
  STA $0596
  LDA $D997
  STA $D996
  LDX #$E6
runtime_map_scroll_left_row_0_4:
  LDA $04B2,X
  STA $04B1,X
  LDA $D8B2,X
  STA $D8B1,X
  INX
  LDA $04B2,X
  STA $04B1,X
  LDA $D8B2,X
  STA $D8B1,X
  INX
  BNE runtime_map_scroll_left_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05B1
  LDA asset_map_colors_0,X
  STA $D9B1
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05BF
  STA $05BE
  LDA $D9BF
  STA $D9BE
  LDX #$E6
runtime_map_scroll_left_row_0_5:
  LDA $04DA,X
  STA $04D9,X
  LDA $D8DA,X
  STA $D8D9,X
  INX
  LDA $04DA,X
  STA $04D9,X
  LDA $D8DA,X
  STA $D8D9,X
  INX
  BNE runtime_map_scroll_left_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05D9
  LDA asset_map_colors_0,X
  STA $D9D9
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05E7
  STA $05E6
  LDA $D9E7
  STA $D9E6
  LDX #$E6
runtime_map_scroll_left_row_0_6:
  LDA $0502,X
  STA $0501,X
  LDA $D902,X
  STA $D901,X
  INX
  LDA $0502,X
  STA $0501,X
  LDA $D902,X
  STA $D901,X
  INX
  BNE runtime_map_scroll_left_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0601
  LDA asset_map_colors_0,X
  STA $DA01
  RTS
; Map 0: shift Screen RAM and Color RAM one character right
runtime_map_scroll_shift_right_0:
  LDA $C100
  STA $C7B2
  LDA $C102
  STA $C7B3
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDA $0510
  STA $0511
  LDA $D910
  STA $D911
  LDX #$19
runtime_map_scroll_right_row_0_0:
  LDA $04F6,X
  STA $04F7,X
  LDA $D8F6,X
  STA $D8F7,X
  DEX
  LDA $04F6,X
  STA $04F7,X
  LDA $D8F6,X
  STA $D8F7,X
  DEX
  BPL runtime_map_scroll_right_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04F6
  LDA asset_map_colors_0,X
  STA $D8F6
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0538
  STA $0539
  LDA $D938
  STA $D939
  LDX #$19
runtime_map_scroll_right_row_0_1:
  LDA $051E,X
  STA $051F,X
  LDA $D91E,X
  STA $D91F,X
  DEX
  LDA $051E,X
  STA $051F,X
  LDA $D91E,X
  STA $D91F,X
  DEX
  BPL runtime_map_scroll_right_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $051E
  LDA asset_map_colors_0,X
  STA $D91E
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0560
  STA $0561
  LDA $D960
  STA $D961
  LDX #$19
runtime_map_scroll_right_row_0_2:
  LDA $0546,X
  STA $0547,X
  LDA $D946,X
  STA $D947,X
  DEX
  LDA $0546,X
  STA $0547,X
  LDA $D946,X
  STA $D947,X
  DEX
  BPL runtime_map_scroll_right_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0546
  LDA asset_map_colors_0,X
  STA $D946
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0588
  STA $0589
  LDA $D988
  STA $D989
  LDX #$19
runtime_map_scroll_right_row_0_3:
  LDA $056E,X
  STA $056F,X
  LDA $D96E,X
  STA $D96F,X
  DEX
  LDA $056E,X
  STA $056F,X
  LDA $D96E,X
  STA $D96F,X
  DEX
  BPL runtime_map_scroll_right_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $056E
  LDA asset_map_colors_0,X
  STA $D96E
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05B0
  STA $05B1
  LDA $D9B0
  STA $D9B1
  LDX #$19
runtime_map_scroll_right_row_0_4:
  LDA $0596,X
  STA $0597,X
  LDA $D996,X
  STA $D997,X
  DEX
  LDA $0596,X
  STA $0597,X
  LDA $D996,X
  STA $D997,X
  DEX
  BPL runtime_map_scroll_right_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0596
  LDA asset_map_colors_0,X
  STA $D996
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05D8
  STA $05D9
  LDA $D9D8
  STA $D9D9
  LDX #$19
runtime_map_scroll_right_row_0_5:
  LDA $05BE,X
  STA $05BF,X
  LDA $D9BE,X
  STA $D9BF,X
  DEX
  LDA $05BE,X
  STA $05BF,X
  LDA $D9BE,X
  STA $D9BF,X
  DEX
  BPL runtime_map_scroll_right_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05BE
  LDA asset_map_colors_0,X
  STA $D9BE
  CLC
  LDA $FB
  ADC #$30
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0600
  STA $0601
  LDA $DA00
  STA $DA01
  LDX #$19
runtime_map_scroll_right_row_0_6:
  LDA $05E6,X
  STA $05E7,X
  LDA $D9E6,X
  STA $D9E7,X
  DEX
  LDA $05E6,X
  STA $05E7,X
  LDA $D9E6,X
  STA $D9E7,X
  DEX
  BPL runtime_map_scroll_right_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05E6
  LDA asset_map_colors_0,X
  STA $D9E6
  RTS
; Map 0: shift Screen RAM and Color RAM one character up
runtime_map_scroll_shift_up_0:
  LDX #$E4
runtime_map_scroll_up_row_0_0:
  LDA $043A,X
  STA $0412,X
  LDA $D83A,X
  STA $D812,X
  INX
  LDA $043A,X
  STA $0412,X
  LDA $D83A,X
  STA $D812,X
  INX
  BNE runtime_map_scroll_up_row_0_0
  LDX #$E4
runtime_map_scroll_up_row_0_1:
  LDA $0462,X
  STA $043A,X
  LDA $D862,X
  STA $D83A,X
  INX
  LDA $0462,X
  STA $043A,X
  LDA $D862,X
  STA $D83A,X
  INX
  BNE runtime_map_scroll_up_row_0_1
  LDX #$E4
runtime_map_scroll_up_row_0_2:
  LDA $048A,X
  STA $0462,X
  LDA $D88A,X
  STA $D862,X
  INX
  LDA $048A,X
  STA $0462,X
  LDA $D88A,X
  STA $D862,X
  INX
  BNE runtime_map_scroll_up_row_0_2
  LDX #$E4
runtime_map_scroll_up_row_0_3:
  LDA $04B2,X
  STA $048A,X
  LDA $D8B2,X
  STA $D88A,X
  INX
  LDA $04B2,X
  STA $048A,X
  LDA $D8B2,X
  STA $D88A,X
  INX
  BNE runtime_map_scroll_up_row_0_3
  LDX #$E4
runtime_map_scroll_up_row_0_4:
  LDA $04DA,X
  STA $04B2,X
  LDA $D8DA,X
  STA $D8B2,X
  INX
  LDA $04DA,X
  STA $04B2,X
  LDA $D8DA,X
  STA $D8B2,X
  INX
  BNE runtime_map_scroll_up_row_0_4
  LDX #$E4
runtime_map_scroll_up_row_0_5:
  LDA $0502,X
  STA $04DA,X
  LDA $D902,X
  STA $D8DA,X
  INX
  LDA $0502,X
  STA $04DA,X
  LDA $D902,X
  STA $D8DA,X
  INX
  BNE runtime_map_scroll_up_row_0_5
  LDA $C102
  CLC
  ADC #$06
  STA $C7B3
  LDA $C100
  STA $C7B2
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDY #$00
runtime_map_scroll_up_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05E6,Y
  LDA asset_map_colors_0,X
  STA $D9E6,Y
  INY
  CPY #$1C
  BNE runtime_map_scroll_up_line_0
  RTS
; Map 0: shift Screen RAM and Color RAM one character down
runtime_map_scroll_shift_down_0:
  LDX #$E4
runtime_map_scroll_down_row_0_5:
  LDA $04DA,X
  STA $0502,X
  LDA $D8DA,X
  STA $D902,X
  INX
  LDA $04DA,X
  STA $0502,X
  LDA $D8DA,X
  STA $D902,X
  INX
  BNE runtime_map_scroll_down_row_0_5
  LDX #$E4
runtime_map_scroll_down_row_0_4:
  LDA $04B2,X
  STA $04DA,X
  LDA $D8B2,X
  STA $D8DA,X
  INX
  LDA $04B2,X
  STA $04DA,X
  LDA $D8B2,X
  STA $D8DA,X
  INX
  BNE runtime_map_scroll_down_row_0_4
  LDX #$E4
runtime_map_scroll_down_row_0_3:
  LDA $048A,X
  STA $04B2,X
  LDA $D88A,X
  STA $D8B2,X
  INX
  LDA $048A,X
  STA $04B2,X
  LDA $D88A,X
  STA $D8B2,X
  INX
  BNE runtime_map_scroll_down_row_0_3
  LDX #$E4
runtime_map_scroll_down_row_0_2:
  LDA $0462,X
  STA $048A,X
  LDA $D862,X
  STA $D88A,X
  INX
  LDA $0462,X
  STA $048A,X
  LDA $D862,X
  STA $D88A,X
  INX
  BNE runtime_map_scroll_down_row_0_2
  LDX #$E4
runtime_map_scroll_down_row_0_1:
  LDA $043A,X
  STA $0462,X
  LDA $D83A,X
  STA $D862,X
  INX
  LDA $043A,X
  STA $0462,X
  LDA $D83A,X
  STA $D862,X
  INX
  BNE runtime_map_scroll_down_row_0_1
  LDX #$E4
runtime_map_scroll_down_row_0_0:
  LDA $0412,X
  STA $043A,X
  LDA $D812,X
  STA $D83A,X
  INX
  LDA $0412,X
  STA $043A,X
  LDA $D812,X
  STA $D83A,X
  INX
  BNE runtime_map_scroll_down_row_0_0
  LDA $C102
  STA $C7B3
  LDA $C100
  STA $C7B2
  LDA #$00
  STA $C7B6
  LDA #$00
  STA $C7BA
  LDA $C7B3
  STA $C7B7
  LDA #$00
  STA $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  ASL $C7B7
  ROL $C7BF
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
  CLC
  LDA $C7B6
  ADC $C7B2
  STA $C7B6
  LDA $C7BA
  ADC #$00
  STA $C7BA
  CLC
  LDA $C7B6
  ADC #$00
  STA $FB
  LDA $C7BA
  ADC #$80
  STA $FC
  LDY #$00
  LDY #$00
runtime_map_scroll_down_line_0:
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04F6,Y
  LDA asset_map_colors_0,X
  STA $D8F6,Y
  INY
  CPY #$1C
  BNE runtime_map_scroll_down_line_0
  RTS
; Dynamic map 0: redraw visible cells from runtime RAM
runtime_map_redraw_0:
  JMP runtime_map_viewport_0
; String pool
str_screen_0:
  .byte $16, $30, $2E, $31, $30, $20, $06, $09, $0E, $05, $20, $13, $03, $12, $0F, $0C, $0C, $20, $18, $2F, $19, $00
str_screen_1:
  .byte $13, $03, $0F, $12, $05, $20, $30, $30, $30, $30, $20, $2D, $20, $0A, $0F, $19, $13, $14, $09, $03, $0B, $20, $34, $20, $04, $09, $12, $05, $03, $14, $09, $0F, $0E, $13, $00
; User data
asset_map_collisions_0:
  .byte $00, $01, $00
asset_map_chars_0:
  .byte $20, $A0, $51
asset_map_colors_0:
  .byte $00, $05, $07
asset_bytes_1:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $02, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $01, $00, $00, $00, $00, $00, $01, $01, $01, $01, $00
asset_bytes_3:
  .byte $00, $00, $00, $00, $01, $01, $01, $01, $00, $00, $00, $00, $00, $01, $01, $01, $01, $00, $00, $00, $00, $00, $01, $01, $01, $01, $00, $00, $00, $00, $00, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_7:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
