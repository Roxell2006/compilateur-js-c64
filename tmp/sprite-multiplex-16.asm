; Clear all 16 logical sprite slots before user initialization
  LDX #$00
sprite_mux_init_loop:
  LDA #$00
  STA $C505,X
  STA $C404,X
  STA $C405,X
  STA $C406,X
  TXA
  CLC
  ADC #$08
  TAX
  CPX #$80
  BNE sprite_mux_init_loop
  LDX #$00
copydata_3000_sprite_frames_multiplex_diamond_0_63_0:
  LDA sprite_frames_multiplex_diamond_0,X
  STA $3000,X
  INX
  CPX #$3F
  BNE copydata_3000_sprite_frames_multiplex_diamond_0_63_0
  LDA #$00
  STA $303F
  LDX #$00
copydata_3040_sprite_frames_multiplex_diamond_1_63_1:
  LDA sprite_frames_multiplex_diamond_1,X
  STA $3040,X
  INX
  CPX #$3F
  BNE copydata_3040_sprite_frames_multiplex_diamond_1_63_1
  LDA #$00
  STA $307F
  LDA #$20
  STA $C500
  LDA #$00
  STA $C501
  LDA #$37
  STA $C502
  LDA #$01
  STA $C503
  LDA #$00
  STA $C504
  LDA #$01
  STA $C505
  LDA #$01
  STA $C405
  LDA #$C0
  STA $C404
  LDA #$01
  STA $C405
  LDA #$46
  STA $C508
  LDA #$00
  STA $C509
  LDA #$55
  STA $C50A
  LDA #$00
  STA $C50B
  LDA #$00
  STA $C50C
  LDA #$01
  STA $C50D
  LDA #$01
  STA $C40D
  LDA #$C0
  STA $C40C
  LDA #$02
  STA $C40D
  LDA #$6C
  STA $C510
  LDA #$00
  STA $C511
  LDA #$37
  STA $C512
  LDA #$00
  STA $C513
  LDA #$00
  STA $C514
  LDA #$01
  STA $C515
  LDA #$01
  STA $C415
  LDA #$C0
  STA $C414
  LDA #$03
  STA $C415
  LDA #$92
  STA $C518
  LDA #$00
  STA $C519
  LDA #$55
  STA $C51A
  LDA #$00
  STA $C51B
  LDA #$00
  STA $C51C
  LDA #$01
  STA $C51D
  LDA #$01
  STA $C41D
  LDA #$C0
  STA $C41C
  LDA #$04
  STA $C41D
  LDA #$B8
  STA $C520
  LDA #$00
  STA $C521
  LDA #$37
  STA $C522
  LDA #$00
  STA $C523
  LDA #$00
  STA $C524
  LDA #$01
  STA $C525
  LDA #$01
  STA $C425
  LDA #$C0
  STA $C424
  LDA #$05
  STA $C425
  LDA #$DE
  STA $C528
  LDA #$00
  STA $C529
  LDA #$55
  STA $C52A
  LDA #$00
  STA $C52B
  LDA #$00
  STA $C52C
  LDA #$01
  STA $C52D
  LDA #$01
  STA $C42D
  LDA #$C0
  STA $C42C
  LDA #$06
  STA $C42D
  LDA #$04
  STA $C530
  LDA #$01
  STA $C531
  LDA #$37
  STA $C532
  LDA #$00
  STA $C533
  LDA #$00
  STA $C534
  LDA #$01
  STA $C535
  LDA #$01
  STA $C435
  LDA #$C0
  STA $C434
  LDA #$07
  STA $C435
  LDA #$2A
  STA $C538
  LDA #$01
  STA $C539
  LDA #$55
  STA $C53A
  LDA #$00
  STA $C53B
  LDA #$00
  STA $C53C
  LDA #$01
  STA $C53D
  LDA #$01
  STA $C43D
  LDA #$C0
  STA $C43C
  LDA #$08
  STA $C43D
  LDA #$20
  STA $C540
  LDA #$00
  STA $C541
  LDA #$AA
  STA $C542
  LDA #$FF
  STA $C543
  LDA #$00
  STA $C544
  LDA #$01
  STA $C545
  LDA #$01
  STA $C445
  LDA #$C0
  STA $C444
  LDA #$01
  STA $C445
  LDA #$46
  STA $C548
  LDA #$00
  STA $C549
  LDA #$C8
  STA $C54A
  LDA #$00
  STA $C54B
  LDA #$00
  STA $C54C
  LDA #$01
  STA $C54D
  LDA #$01
  STA $C44D
  LDA #$C0
  STA $C44C
  LDA #$02
  STA $C44D
  LDA #$6C
  STA $C550
  LDA #$00
  STA $C551
  LDA #$AA
  STA $C552
  LDA #$00
  STA $C553
  LDA #$00
  STA $C554
  LDA #$01
  STA $C555
  LDA #$01
  STA $C455
  LDA #$C0
  STA $C454
  LDA #$03
  STA $C455
  LDA #$92
  STA $C558
  LDA #$00
  STA $C559
  LDA #$C8
  STA $C55A
  LDA #$00
  STA $C55B
  LDA #$00
  STA $C55C
  LDA #$01
  STA $C55D
  LDA #$01
  STA $C45D
  LDA #$C0
  STA $C45C
  LDA #$04
  STA $C45D
  LDA #$B8
  STA $C560
  LDA #$00
  STA $C561
  LDA #$AA
  STA $C562
  LDA #$00
  STA $C563
  LDA #$00
  STA $C564
  LDA #$01
  STA $C565
  LDA #$01
  STA $C465
  LDA #$C0
  STA $C464
  LDA #$05
  STA $C465
  LDA #$DE
  STA $C568
  LDA #$00
  STA $C569
  LDA #$C8
  STA $C56A
  LDA #$00
  STA $C56B
  LDA #$00
  STA $C56C
  LDA #$01
  STA $C56D
  LDA #$01
  STA $C46D
  LDA #$C0
  STA $C46C
  LDA #$06
  STA $C46D
  LDA #$04
  STA $C570
  LDA #$01
  STA $C571
  LDA #$AA
  STA $C572
  LDA #$00
  STA $C573
  LDA #$00
  STA $C574
  LDA #$01
  STA $C575
  LDA #$01
  STA $C475
  LDA #$C0
  STA $C474
  LDA #$07
  STA $C475
  LDA #$2A
  STA $C578
  LDA #$01
  STA $C579
  LDA #$C8
  STA $C57A
  LDA #$00
  STA $C57B
  LDA #$00
  STA $C57C
  LDA #$01
  STA $C57D
  LDA #$01
  STA $C47D
  LDA #$C0
  STA $C47C
  LDA #$08
  STA $C47D
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_pulse
  STA $C404
  LDA #$00
  STA $C440
  LDA #$00
  STA $C441
  LDA #$00
  STA $C442
  LDA #$01
  STA $C443
  LDA sprite_sequence_8_pulse
  STA $C444
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_2:
  LDA str_screen_0,X
  BEQ printat_done_3
  STA $040B,X
  LDA #$01
  STA $D80B,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_1,X
  BEQ printat_done_5
  STA $05E8,X
  LDA #$01
  STA $D9E8,X
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
  LDA #$2D
  STA $C502
  JMP sprite_vy_done_10
sprite_vy_clamp_max_10:
  LDA #$5F
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
  CMP #$2D
  BCS sprite_y_min_ok_11
  LDA #$2D
  STA $C502
sprite_y_min_ok_11:
  LDA $C502
  CMP #$5F
  BCC sprite_y_max_ok_11
  BEQ sprite_y_max_ok_11
  LDA #$5F
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
  CMP #$08
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
  LDA sprite_sequence_0_pulse,X
  STA $C404
  JMP sprite_anim_done_0_12
sprite_anim_next_seq_0_0_14:
sprite_anim_done_0_12:
  LDA $C545
  BNE sprite_update_active_8_18
  JMP sprite_update_inactive_8_17
sprite_update_active_8_18:
  CLC
  LDA $C540
  ADC $C543
  STA $C540
  LDA $C543
  BPL sprite_vx_positive_19
  LDA $C541
  ADC #$FF
  JMP sprite_vx_done_19
sprite_vx_positive_19:
  LDA $C541
  ADC #$00
sprite_vx_done_19:
  STA $C541
  LDA $C544
  BPL sprite_vy_positive_20
  CLC
  LDA $C542
  ADC $C544
  BCC sprite_vy_clamp_min_20
  JMP sprite_vy_store_20
sprite_vy_positive_20:
  CLC
  LDA $C542
  ADC $C544
  BCS sprite_vy_clamp_max_20
sprite_vy_store_20:
  STA $C542
  JMP sprite_vy_done_20
sprite_vy_clamp_min_20:
  LDA #$A5
  STA $C542
  JMP sprite_vy_done_20
sprite_vy_clamp_max_20:
  LDA #$DC
  STA $C542
sprite_vy_done_20:
  LDA $C541
  BMI sprite_x_clamp_min_21
  CMP #$00
  BCC sprite_x_clamp_min_21
  BNE sprite_x_min_ok_21
  LDA $C540
  CMP #$18
  BCS sprite_x_min_ok_21
sprite_x_clamp_min_21:
  LDA #$18
  STA $C540
  LDA #$00
  STA $C541
  LDA #$00
  SEC
  SBC $C543
  STA $C543
sprite_x_min_ok_21:
  LDA $C541
  CMP #$01
  BCC sprite_x_max_ok_21
  BNE sprite_x_clamp_max_21
  LDA $C540
  CMP #$40
  BCC sprite_x_max_ok_21
  BEQ sprite_x_max_ok_21
sprite_x_clamp_max_21:
  LDA #$40
  STA $C540
  LDA #$01
  STA $C541
  LDA #$00
  SEC
  SBC $C543
  STA $C543
sprite_x_max_ok_21:
  LDA $C542
  CMP #$A5
  BCS sprite_y_min_ok_21
  LDA #$A5
  STA $C542
sprite_y_min_ok_21:
  LDA $C542
  CMP #$DC
  BCC sprite_y_max_ok_21
  BEQ sprite_y_max_ok_21
  LDA #$DC
  STA $C542
sprite_y_max_ok_21:
sprite_update_inactive_8_17:
  LDA $C443
  BNE sprite_anim_active_8_23
  JMP sprite_anim_done_8_22
sprite_anim_active_8_23:
  LDA $C440
  CMP #$00
  BNE sprite_anim_next_seq_8_0_24
  INC $C442
  LDA $C442
  CMP #$08
  BCS sprite_anim_advance_8_0_25
  JMP sprite_anim_done_8_22
sprite_anim_advance_8_0_25:
  LDA #$00
  STA $C442
  INC $C441
  LDA $C441
  CMP #$02
  BCC sprite_anim_pos_ok_8_0_26
  LDA #$00
  STA $C441
sprite_anim_pos_ok_8_0_26:
  LDX $C441
  LDA sprite_sequence_8_pulse,X
  STA $C444
  JMP sprite_anim_done_8_22
sprite_anim_next_seq_8_0_24:
sprite_anim_done_8_22:
sprite_mux_wait_top:
  LDA $D012
  CMP #$0A
  BNE sprite_mux_wait_top
  LDA #$00
  STA $C580
  JSR runtime_sprite_mux_render
sprite_mux_wait_split:
  LDA $D012
  CMP #$82
  BNE sprite_mux_wait_split
  LDA #$40
  STA $C580
  JSR runtime_sprite_mux_render
  JMP game_frame_loop
; Balanced 16-to-8 sprite multiplexer renderer
runtime_sprite_mux_render:
  LDA #$00
  STA $C583
  STA $C584
  STA $C585
  STA $C586
  STA $C587
  STA $C588
  LDX #$00
runtime_sprite_mux_loop:
  STX $C581
  TXA
  ASL A
  ASL A
  TAY
  TYA
  CLC
  ADC $C580
  TAY
  LDA $C500,Y
  STA $D000,X
  LDA $C502,Y
  STA $D001,X
  TXA
  LSR A
  TAX
  LDA runtime_sprite_mux_bit_masks,X
  STA $C582
  LDA $C404,Y
  STA $07F8,X
  LDA $C405,Y
  STA $D027,X
  LDA $C505,Y
  BEQ runtime_sprite_mux_inactive
  LDA $C583
  ORA $C582
  STA $C583
  LDA $C501,Y
  AND #$01
  BEQ runtime_sprite_mux_x_low
  LDA $C584
  ORA $C582
  STA $C584
runtime_sprite_mux_x_low:
  LDA $C406,Y
  AND #$01
  BEQ runtime_sprite_mux_no_multicolor
  LDA $C585
  ORA $C582
  STA $C585
runtime_sprite_mux_no_multicolor:
  LDA $C406,Y
  AND #$02
  BEQ runtime_sprite_mux_no_expand_x
  LDA $C586
  ORA $C582
  STA $C586
runtime_sprite_mux_no_expand_x:
  LDA $C406,Y
  AND #$04
  BEQ runtime_sprite_mux_no_expand_y
  LDA $C587
  ORA $C582
  STA $C587
runtime_sprite_mux_no_expand_y:
  LDA $C406,Y
  AND #$08
  BEQ runtime_sprite_mux_no_priority
  LDA $C588
  ORA $C582
  STA $C588
runtime_sprite_mux_no_priority:
  JMP runtime_sprite_mux_slot_done
runtime_sprite_mux_inactive:
runtime_sprite_mux_slot_done:
  LDX $C581
  INX
  INX
  CPX #$10
  BEQ runtime_sprite_mux_masks_ready
  JMP runtime_sprite_mux_loop
runtime_sprite_mux_masks_ready:
  LDA $C583
  STA $D015
  LDA $C584
  STA $D010
  LDA $C585
  STA $D01C
  LDA $C586
  STA $D01D
  LDA $C587
  STA $D017
  LDA $C588
  STA $D01B
  RTS
runtime_sprite_mux_bit_masks:
  .byte $01, $02, $04, $08, $10, $20, $40, $80
; String pool
str_screen_0:
  .byte $31, $36, $20, $0C, $0F, $07, $09, $03, $01, $0C, $20, $13, $10, $12, $09, $14, $05, $13, $00
str_screen_1:
  .byte $13, $10, $12, $09, $14, $05, $13, $20, $38, $2D, $31, $35, $20, $0D, $15, $0C, $14, $09, $10, $0C, $05, $18, $05, $04, $00
; User data
sprite_frames_multiplex_diamond_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_frames_multiplex_diamond_1:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $FF, $00, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_sequence_0_pulse:
  .byte $C0, $C1
sprite_sequence_8_pulse:
  .byte $C1, $C0
