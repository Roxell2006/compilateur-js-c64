  LDX #$00
copydata_3000_sprite_frames_balloon_0_63_0:
  LDA sprite_frames_balloon_0,X
  STA $3000,X
  INX
  CPX #$3F
  BNE copydata_3000_sprite_frames_balloon_0_63_0
  LDA #$00
  STA $303F
  LDX #$00
copydata_3040_sprite_frames_balloon_1_63_1:
  LDA sprite_frames_balloon_1,X
  STA $3040,X
  INX
  CPX #$3F
  BNE copydata_3040_sprite_frames_balloon_1_63_1
  LDA #$00
  STA $307F
  LDA #$20
  STA $C500
  LDA #$00
  STA $C501
  LDA #$5A
  STA $C502
  LDA #$02
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
  LDA #$02
  STA $C405
  LDA #$02
  STA $D027
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_walk
  STA $C404
  LDA $C404
  STA $07F8
  LDA #$93
  JSR $FFD2
  LDA #$0E
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_2:
  LDA str_screen_0,X
  BEQ printat_done_3
  STA $0431,X
  LDA #$01
  STA $D831,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_1,X
  BEQ printat_done_5
  STA $0483,X
  LDA #$01
  STA $D883,X
  INX
  BNE printat_loop_4
printat_done_5:
; Deterministic game frame loop
  LDA #$00
  STA $C76A
  LDA #$00
  STA $C76B
  LDA #$00
  STA $C770
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
  INC $C76A
  BNE game_frame_counter_done_6
  INC $C76B
game_frame_counter_done_6:
  LDA $C505
  BNE sprite_update_active_0_8
  JMP sprite_update_inactive_0_7
sprite_update_active_0_8:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_9
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_9
sprite_vx_positive_9:
  LDA $C501
  ADC #$00
sprite_vx_done_9:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_10
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_10
  JMP sprite_vy_store_10
sprite_vy_positive_10:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_10
sprite_vy_store_10:
  STA $C502
  JMP sprite_vy_done_10
sprite_vy_clamp_min_10:
  LDA #$46
  STA $C502
  JMP sprite_vy_done_10
sprite_vy_clamp_max_10:
  LDA #$78
  STA $C502
sprite_vy_done_10:
  LDA $C501
  BMI sprite_x_clamp_min_11
  CMP #$00
  BCC sprite_x_clamp_min_11
  BNE sprite_x_min_ok_11
  LDA $C500
  CMP #$18
  BCS sprite_x_min_ok_11
sprite_x_clamp_min_11:
  LDA #$18
  STA $C500
  LDA #$00
  STA $C501
  LDA #$00
  SEC
  SBC $C503
  STA $C503
sprite_x_min_ok_11:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_11
  BNE sprite_x_clamp_max_11
  LDA $C500
  CMP #$40
  BCC sprite_x_max_ok_11
  BEQ sprite_x_max_ok_11
sprite_x_clamp_max_11:
  LDA #$40
  STA $C500
  LDA #$01
  STA $C501
  LDA #$00
  SEC
  SBC $C503
  STA $C503
sprite_x_max_ok_11:
  LDA $C502
  CMP #$46
  BCS sprite_y_min_ok_11
  LDA #$46
  STA $C502
sprite_y_min_ok_11:
  LDA $C502
  CMP #$78
  BCC sprite_y_max_ok_11
  BEQ sprite_y_max_ok_11
  LDA #$78
  STA $C502
sprite_y_max_ok_11:
sprite_update_inactive_0_7:
  LDA $C403
  BNE sprite_anim_active_0_13
  JMP sprite_anim_done_0_12
sprite_anim_active_0_13:
  LDA $C400
  CMP #$00
  BNE sprite_anim_next_seq_0_0_14
  INC $C402
  LDA $C402
  CMP #$06
  BCS sprite_anim_advance_0_0_15
  JMP sprite_anim_done_0_12
sprite_anim_advance_0_0_15:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$02
  BCC sprite_anim_pos_ok_0_0_16
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_0_16:
  LDX $C401
  LDA sprite_sequence_0_walk,X
  STA $C404
  LDA $C404
  STA $07F8
  JMP sprite_anim_done_0_12
sprite_anim_next_seq_0_0_14:
sprite_anim_done_0_12:
  JSR runtime_sprite_sync_0
  JMP game_frame_loop
; Shared VIC-II synchronization for sprite 0
runtime_sprite_sync_0:
  LDA $C505
  BNE sprite_runtime_active_0_17
  LDA $D015
  AND #$FE
  STA $D015
  JMP sprite_runtime_sync_done_0_20
sprite_runtime_active_0_17:
  LDA $D015
  ORA #$01
  STA $D015
  LDA $C500
  STA $D000
  LDA $C501
  AND #$01
  BNE sprite_runtime_xhigh_0_18
  LDA $D010
  AND #$FE
  STA $D010
  JMP sprite_runtime_xdone_0_19
sprite_runtime_xhigh_0_18:
  LDA $D010
  ORA #$01
  STA $D010
sprite_runtime_xdone_0_19:
  LDA $C502
  STA $D001
sprite_runtime_sync_done_0_20:
  RTS
; String pool
str_screen_0:
  .byte $13, $10, $12, $09, $14, $05, $20, $01, $0E, $09, $0D, $01, $14, $09, $0F, $0E, $20, $16, $30, $2E, $38, $00
str_screen_1:
  .byte $32, $20, $06, $12, $01, $0D, $05, $13, $20, $2B, $20, $12, $05, $02, $0F, $0E, $04, $00
; User data
sprite_frames_balloon_0:
  .byte $00, $7F, $00, $01, $FF, $C0, $03, $FF, $E0, $03, $FF, $E0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $03, $FF, $E0, $03, $FF, $E0, $01, $FF, $C0, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $3C, $00, $00, $18, $00, $00, $24, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00
sprite_frames_balloon_1:
  .byte $00, $7F, $00, $01, $FF, $C0, $03, $FF, $E0, $03, $FF, $E0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $03, $FF, $E0, $03, $FF, $E0, $01, $FF, $C0, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $3C, $00, $18, $00, $00, $0C, $00, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00
sprite_sequence_0_walk:
  .byte $C0, $C1
