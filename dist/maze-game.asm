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
  LDA #$01
  STA $C100
  LDA #$01
  STA $C101
  LDA #$01
  STA $C102
  LDA #$01
  STA $C103
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
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
  JSR runtime_map_redraw_0
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $04B7,X
  LDA #$01
  STA $D8B7,X
  INX
  BNE printat_loop_1
printat_done_2:
  LDX #$00
printat_loop_3:
  LDA str_screen_1,X
  BEQ printat_done_4
  STA $0507,X
  LDA #$01
  STA $D907,X
  INX
  BNE printat_loop_3
printat_done_4:
  LDX #$00
printat_loop_5:
  LDA str_screen_2,X
  BEQ printat_done_6
  STA $052F,X
  LDA #$01
  STA $D92F,X
  INX
  BNE printat_loop_5
printat_done_6:
  JMP user_routine_maze_try_move_after
user_routine_maze_try_move:
  LDA $C102
  CMP #$14
  BCC map_x_ok_8
  JMP control_if_else_7
map_x_ok_8:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_8
  JMP control_if_else_7
map_y_ok_8:
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
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
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
  TAX
  LDA asset_map_collisions_0,X
  CMP #$01
  BEQ condition_pass_8
  JMP control_if_else_7
condition_pass_8:
  JMP control_if_end_7
control_if_else_7:
  LDA $C100
  CMP #$14
  BCC map_x_ok_9
  JMP map_set_done_9
map_x_ok_9:
  STA $C7B2
  LDA $C101
  CMP #$0F
  BCC map_y_ok_9
  JMP map_set_done_9
map_y_ok_9:
  STA $C7B3
  LDA #$00
  CMP #$04
  BCC map_value_ok_9
  JMP map_set_done_9
map_value_ok_9:
  STA $C7B8
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
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_9:
  LDA $C102
  CMP #$14
  BCC map_x_ok_11
  JMP control_if_else_10
map_x_ok_11:
  STA $C7B2
  LDA $C103
  CMP #$0F
  BCC map_y_ok_11
  JMP control_if_else_10
map_y_ok_11:
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
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
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
  CMP #$02
  BEQ condition_pass_11
  JMP control_if_else_10
condition_pass_11:
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
  JMP control_if_end_10
control_if_else_10:
control_if_end_10:
  LDA $C102
  STA $C100
  LDA $C103
  STA $C101
  LDA $C100
  CMP #$14
  BCC map_x_ok_12
  JMP map_set_done_12
map_x_ok_12:
  STA $C7B2
  LDA $C101
  CMP #$0F
  BCC map_y_ok_12
  JMP map_set_done_12
map_y_ok_12:
  STA $C7B3
  LDA #$03
  CMP #$04
  BCC map_value_ok_12
  JMP map_set_done_12
map_value_ok_12:
  STA $C7B8
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
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
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
  LDA $C7B8
  STA ($FB),Y
  JSR runtime_map_draw_tile_0
map_set_done_12:
control_if_end_7:
  RTS
user_routine_maze_try_move_after:
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
  LDA $D012
  CMP #$F0
  BEQ game_frame_wait_leave
game_frame_wait_target:
  LDA $D012
  CMP #$F0
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
  BNE game_frame_counter_done_13
  INC $C76B
game_frame_counter_done_13:
  LDA $C100
  STA $C102
  LDA $C101
  STA $C103
  LDA $C767
  AND #$01
  BEQ joystick_current_pressed_15
  JMP control_if_else_14
joystick_current_pressed_15:
  LDA $C769
  AND #$01
  BNE condition_pass_15
  JMP control_if_else_14
condition_pass_15:
  DEC $C103
  JSR user_routine_maze_try_move
  JMP control_if_end_14
control_if_else_14:
control_if_end_14:
  LDA $C767
  AND #$02
  BEQ joystick_current_pressed_17
  JMP control_if_else_16
joystick_current_pressed_17:
  LDA $C769
  AND #$02
  BNE condition_pass_17
  JMP control_if_else_16
condition_pass_17:
  INC $C103
  JSR user_routine_maze_try_move
  JMP control_if_end_16
control_if_else_16:
control_if_end_16:
  LDA $C767
  AND #$04
  BEQ joystick_current_pressed_19
  JMP control_if_else_18
joystick_current_pressed_19:
  LDA $C769
  AND #$04
  BNE condition_pass_19
  JMP control_if_else_18
condition_pass_19:
  DEC $C102
  JSR user_routine_maze_try_move
  JMP control_if_end_18
control_if_else_18:
control_if_end_18:
  LDA $C767
  AND #$08
  BEQ joystick_current_pressed_21
  JMP control_if_else_20
joystick_current_pressed_21:
  LDA $C769
  AND #$08
  BNE condition_pass_21
  JMP control_if_else_20
condition_pass_21:
  INC $C102
  JSR user_routine_maze_try_move
  JMP control_if_end_20
control_if_else_20:
control_if_end_20:
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
  CLC
  LDA $C7B6
  ADC $C7B7
  STA $C7B6
  LDA $C7BA
  ADC $C7BF
  STA $C7BA
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
  LDA #$A1
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
; Dynamic map 0: redraw visible cells from runtime RAM
runtime_map_redraw_0:
  LDA #$00
  STA $C7B3
runtime_map_redraw_row_0:
  LDA #$00
  STA $C7B2
runtime_map_redraw_column_0:
  JSR runtime_map_draw_tile_0
  INC $C7B2
  LDA $C7B2
  CMP #$14
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$0F
  BNE runtime_map_redraw_row_0
  RTS
; String pool
str_screen_0:
  .byte $0D, $01, $1A, $05, $20, $16, $30, $2E, $39, $00
str_screen_1:
  .byte $12, $01, $0D, $01, $13, $13, $05, $1A, $00
str_screen_2:
  .byte $0C, $05, $13, $20, $03, $12, $0F, $09, $18, $00
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
