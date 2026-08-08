  LDA #$FF
  STA $C77A
  LDA #$FF
  STA $C77B
  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
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
  LDA #$00
  STA $C77A
  LDA #$FF
  STA $C77B
  JSR game_scene_enter_dispatch
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
  BNE game_frame_counter_done_0
  INC $C76B
game_frame_counter_done_0:
  JSR game_scene_update_dispatch
  JSR game_scene_apply_transition
  JMP game_frame_loop
; Apply at most one requested scene transition between frames
game_scene_apply_transition:
  LDA $C77B
  CMP #$FF
  BNE game_scene_transition_requested
  RTS
game_scene_transition_requested:
  CMP $C77A
  BNE game_scene_transition_changed
  LDA #$FF
  STA $C77B
  RTS
game_scene_transition_changed:
  PHA
  LDA #$FF
  STA $C77B
  JSR game_scene_exit_dispatch
  PLA
  STA $C77A
  JSR game_scene_enter_dispatch
  RTS
game_scene_enter_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_enter_dispatch_next_0
  JSR game_scene_title_enter
  RTS
game_scene_enter_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_enter_dispatch_next_1
  JSR game_scene_game_enter
  RTS
game_scene_enter_dispatch_next_1:
  LDA $C77A
  CMP #$02
  BNE game_scene_enter_dispatch_next_2
  JSR game_scene_pause_enter
  RTS
game_scene_enter_dispatch_next_2:
  LDA $C77A
  CMP #$03
  BNE game_scene_enter_dispatch_next_3
  JSR game_scene_gameOver_enter
  RTS
game_scene_enter_dispatch_next_3:
  RTS
game_scene_update_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_update_dispatch_next_0
  JSR game_scene_title_update
  RTS
game_scene_update_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_update_dispatch_next_1
  JSR game_scene_game_update
  RTS
game_scene_update_dispatch_next_1:
  LDA $C77A
  CMP #$02
  BNE game_scene_update_dispatch_next_2
  JSR game_scene_pause_update
  RTS
game_scene_update_dispatch_next_2:
  LDA $C77A
  CMP #$03
  BNE game_scene_update_dispatch_next_3
  JSR game_scene_gameOver_update
  RTS
game_scene_update_dispatch_next_3:
  RTS
game_scene_exit_dispatch:
  LDA $C77A
  CMP #$00
  BNE game_scene_exit_dispatch_next_0
  RTS
game_scene_exit_dispatch_next_0:
  LDA $C77A
  CMP #$01
  BNE game_scene_exit_dispatch_next_1
  RTS
game_scene_exit_dispatch_next_1:
  LDA $C77A
  CMP #$02
  BNE game_scene_exit_dispatch_next_2
  RTS
game_scene_exit_dispatch_next_2:
  LDA $C77A
  CMP #$03
  BNE game_scene_exit_dispatch_next_3
  RTS
game_scene_exit_dispatch_next_3:
  RTS
; Scene title: enter
game_scene_title_enter:
  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
  LDA #$93
  JSR $FFD2
  LDA #$06
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_1:
  LDA str_screen_0,X
  BEQ printat_done_2
  STA $0575,X
  LDA #$01
  STA $D975,X
  INX
  BNE printat_loop_1
printat_done_2:
  LDX #$00
printat_loop_3:
  LDA str_screen_1,X
  BEQ printat_done_4
  STA $05EC,X
  LDA #$01
  STA $D9EC,X
  INX
  BNE printat_loop_3
printat_done_4:
  RTS
; Scene title: update
game_scene_title_update:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_6
  JMP control_if_else_5
joystick_current_pressed_6:
  LDA $C769
  AND #$10
  BNE condition_pass_6
  JMP control_if_else_5
condition_pass_6:
  LDA #$01
  STA $C77B
  JMP control_if_end_5
control_if_else_5:
control_if_end_5:
  RTS
; Scene game: enter
game_scene_game_enter:
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D021
  LDX #$00
printat_loop_7:
  LDA str_screen_2,X
  BEQ printat_done_8
  STA $059E,X
  LDA #$01
  STA $D99E,X
  INX
  BNE printat_loop_7
printat_done_8:
  LDX #$00
printat_loop_9:
  LDA str_screen_3,X
  BEQ printat_done_10
  STA $05EE,X
  LDA #$01
  STA $D9EE,X
  INX
  BNE printat_loop_9
printat_done_10:
  RTS
; Scene game: update
game_scene_game_update:
  INC $C100
  BNE runtime_word_inc_done_11
  INC $C101
runtime_word_inc_done_11:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_13
  JMP control_if_else_12
joystick_current_pressed_13:
  LDA $C769
  AND #$10
  BNE condition_pass_13
  JMP control_if_else_12
condition_pass_13:
  LDA #$02
  STA $C77B
  JMP control_if_end_12
control_if_else_12:
control_if_end_12:
  LDA $C101
  CMP #$00
  BCC word_compare_low_15
  BNE condition_pass_15
  LDA $C100
  CMP #$FA
  BCS condition_pass_15
word_compare_low_15:
  JMP control_if_else_14
condition_pass_15:
  LDA #$03
  STA $C77B
  JMP control_if_end_14
control_if_else_14:
control_if_end_14:
  RTS
; Scene pause: enter
game_scene_pause_enter:
  LDX #$00
printat_loop_16:
  LDA str_screen_4,X
  BEQ printat_done_17
  STA $0636,X
  LDA #$01
  STA $DA36,X
  INX
  BNE printat_loop_16
printat_done_17:
  RTS
; Scene pause: update
game_scene_pause_update:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_19
  JMP control_if_else_18
joystick_current_pressed_19:
  LDA $C769
  AND #$10
  BNE condition_pass_19
  JMP control_if_else_18
condition_pass_19:
  LDA #$01
  STA $C77B
  JMP control_if_end_18
control_if_else_18:
control_if_end_18:
  RTS
; Scene gameOver: enter
game_scene_gameOver_enter:
  LDA #$93
  JSR $FFD2
  LDA #$02
  STA $D021
  LDX #$00
printat_loop_20:
  LDA str_screen_5,X
  BEQ printat_done_21
  STA $059F,X
  LDA #$01
  STA $D99F,X
  INX
  BNE printat_loop_20
printat_done_21:
  LDX #$00
printat_loop_22:
  LDA str_screen_6,X
  BEQ printat_done_23
  STA $05EE,X
  LDA #$01
  STA $D9EE,X
  INX
  BNE printat_loop_22
printat_done_23:
  RTS
; Scene gameOver: update
game_scene_gameOver_update:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_25
  JMP control_if_else_24
joystick_current_pressed_25:
  LDA $C769
  AND #$10
  BNE condition_pass_25
  JMP control_if_else_24
condition_pass_25:
  LDA #$00
  STA $C77B
  JMP control_if_end_24
control_if_else_24:
control_if_end_24:
  RTS
; String pool
str_screen_0:
  .byte $0A, $13, $2D, $03, $36, $34, $20, $13, $03, $05, $0E, $05, $13, $00
str_screen_1:
  .byte $06, $09, $12, $05, $20, $10, $0F, $15, $12, $20, $0A, $0F, $15, $05, $12, $00
str_screen_2:
  .byte $0A, $05, $15, $20, $05, $0E, $20, $03, $0F, $15, $12, $13, $00
str_screen_3:
  .byte $06, $09, $12, $05, $3A, $20, $10, $01, $15, $13, $05, $00
str_screen_4:
  .byte $10, $01, $15, $13, $05, $20, $2D, $20, $06, $09, $12, $05, $20, $10, $0F, $15, $12, $20, $12, $05, $10, $12, $05, $0E, $04, $12, $05, $00
str_screen_5:
  .byte $07, $01, $0D, $05, $20, $0F, $16, $05, $12, $00
str_screen_6:
  .byte $06, $09, $12, $05, $3A, $20, $14, $09, $14, $12, $05, $00
