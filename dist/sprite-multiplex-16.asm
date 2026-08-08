; Clear all 16 logical sprite slots before user initialization
  LDX #$00
sprite_mux_init_loop:
  LDA #$00
  STA $C505,X
  STA $C400,X
  STA $C401,X
  STA $C402,X
  STA $C403,X
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
  LDA #$AF
  STA $C502
  LDA #$01
  STA $C503
  LDA #$FF
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
  LDA #$37
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
  LDA #$D7
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
  LDA #$69
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
  LDA #$87
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
  LDA #$2D
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
  LDA #$E1
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
  LDA #$5A
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
  LDA #$41
  STA $C542
  LDA #$FF
  STA $C543
  LDA #$01
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
  LDA #$C3
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
  LDA #$73
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
  LDA #$EB
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
  LDA #$96
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
  LDA #$50
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
  LDA #$A5
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
  LDA #$7D
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
  LDA $C400
  CMP #$00
  BNE sprite_play_start_0_0_2
  LDA $C403
  BNE sprite_play_done_0_0_3
sprite_play_start_0_0_2:
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
sprite_play_done_0_0_3:
  LDA $C440
  CMP #$00
  BNE sprite_play_start_8_0_4
  LDA $C443
  BNE sprite_play_done_8_0_5
sprite_play_start_8_0_4:
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
sprite_play_done_8_0_5:
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_6:
  LDA str_screen_0,X
  BEQ printat_done_7
  STA $040B,X
  LDA #$01
  STA $D80B,X
  INX
  BNE printat_loop_6
printat_done_7:
  LDX #$00
printat_loop_8:
  LDA str_screen_1,X
  BEQ printat_done_9
  STA $05EA,X
  LDA #$01
  STA $D9EA,X
  INX
  BNE printat_loop_8
printat_done_9:
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
  CMP #$C8
  BEQ game_frame_wait_leave
game_frame_wait_target:
  LDA $D012
  CMP #$C8
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
  BNE game_frame_counter_done_10
  INC $C76B
game_frame_counter_done_10:
  LDA $C505
  BNE sprite_update_active_0_12
  JMP sprite_update_inactive_0_11
sprite_update_active_0_12:
  CLC
  LDA $C500
  ADC $C503
  STA $C500
  LDA $C503
  BPL sprite_vx_positive_13
  LDA $C501
  ADC #$FF
  JMP sprite_vx_done_13
sprite_vx_positive_13:
  LDA $C501
  ADC #$00
sprite_vx_done_13:
  STA $C501
  LDA $C504
  BPL sprite_vy_positive_14
  CLC
  LDA $C502
  ADC $C504
  BCC sprite_vy_clamp_min_14
  JMP sprite_vy_store_14
sprite_vy_positive_14:
  CLC
  LDA $C502
  ADC $C504
  BCS sprite_vy_clamp_max_14
sprite_vy_store_14:
  STA $C502
  JMP sprite_vy_done_14
sprite_vy_clamp_min_14:
  LDA #$2D
  STA $C502
  LDA #$00
  SEC
  SBC $C504
  STA $C504
  JMP sprite_vy_done_14
sprite_vy_clamp_max_14:
  LDA #$E1
  STA $C502
  LDA #$00
  SEC
  SBC $C504
  STA $C504
sprite_vy_done_14:
  LDA $C501
  BMI sprite_x_clamp_min_15
  CMP #$00
  BCC sprite_x_clamp_min_15
  BNE sprite_x_min_ok_15
  LDA $C500
  CMP #$18
  BCS sprite_x_min_ok_15
sprite_x_clamp_min_15:
  LDA #$18
  STA $C500
  LDA #$00
  STA $C501
  LDA #$00
  SEC
  SBC $C503
  STA $C503
sprite_x_min_ok_15:
  LDA $C501
  CMP #$01
  BCC sprite_x_max_ok_15
  BNE sprite_x_clamp_max_15
  LDA $C500
  CMP #$40
  BCC sprite_x_max_ok_15
  BEQ sprite_x_max_ok_15
sprite_x_clamp_max_15:
  LDA #$40
  STA $C500
  LDA #$01
  STA $C501
  LDA #$00
  SEC
  SBC $C503
  STA $C503
sprite_x_max_ok_15:
  LDA $C502
  CMP #$2D
  BCS sprite_y_min_ok_15
  LDA #$2D
  STA $C502
  LDA #$00
  SEC
  SBC $C504
  STA $C504
sprite_y_min_ok_15:
  LDA $C502
  CMP #$E1
  BCC sprite_y_max_ok_15
  BEQ sprite_y_max_ok_15
  LDA #$E1
  STA $C502
  LDA #$00
  SEC
  SBC $C504
  STA $C504
sprite_y_max_ok_15:
sprite_update_inactive_0_11:
  LDA $C403
  BNE sprite_anim_active_0_17
  JMP sprite_anim_done_0_16
sprite_anim_active_0_17:
  LDA $C400
  CMP #$00
  BNE sprite_anim_next_seq_0_0_18
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_0_19
  JMP sprite_anim_done_0_16
sprite_anim_advance_0_0_19:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$02
  BCC sprite_anim_pos_ok_0_0_20
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_0_20:
  LDX $C401
  LDA sprite_sequence_0_pulse,X
  STA $C404
  JMP sprite_anim_done_0_16
sprite_anim_next_seq_0_0_18:
sprite_anim_done_0_16:
  LDA $C545
  BNE sprite_update_active_8_22
  JMP sprite_update_inactive_8_21
sprite_update_active_8_22:
  CLC
  LDA $C540
  ADC $C543
  STA $C540
  LDA $C543
  BPL sprite_vx_positive_23
  LDA $C541
  ADC #$FF
  JMP sprite_vx_done_23
sprite_vx_positive_23:
  LDA $C541
  ADC #$00
sprite_vx_done_23:
  STA $C541
  LDA $C544
  BPL sprite_vy_positive_24
  CLC
  LDA $C542
  ADC $C544
  BCC sprite_vy_clamp_min_24
  JMP sprite_vy_store_24
sprite_vy_positive_24:
  CLC
  LDA $C542
  ADC $C544
  BCS sprite_vy_clamp_max_24
sprite_vy_store_24:
  STA $C542
  JMP sprite_vy_done_24
sprite_vy_clamp_min_24:
  LDA #$2D
  STA $C542
  LDA #$00
  SEC
  SBC $C544
  STA $C544
  JMP sprite_vy_done_24
sprite_vy_clamp_max_24:
  LDA #$E1
  STA $C542
  LDA #$00
  SEC
  SBC $C544
  STA $C544
sprite_vy_done_24:
  LDA $C541
  BMI sprite_x_clamp_min_25
  CMP #$00
  BCC sprite_x_clamp_min_25
  BNE sprite_x_min_ok_25
  LDA $C540
  CMP #$18
  BCS sprite_x_min_ok_25
sprite_x_clamp_min_25:
  LDA #$18
  STA $C540
  LDA #$00
  STA $C541
  LDA #$00
  SEC
  SBC $C543
  STA $C543
sprite_x_min_ok_25:
  LDA $C541
  CMP #$01
  BCC sprite_x_max_ok_25
  BNE sprite_x_clamp_max_25
  LDA $C540
  CMP #$40
  BCC sprite_x_max_ok_25
  BEQ sprite_x_max_ok_25
sprite_x_clamp_max_25:
  LDA #$40
  STA $C540
  LDA #$01
  STA $C541
  LDA #$00
  SEC
  SBC $C543
  STA $C543
sprite_x_max_ok_25:
  LDA $C542
  CMP #$2D
  BCS sprite_y_min_ok_25
  LDA #$2D
  STA $C542
  LDA #$00
  SEC
  SBC $C544
  STA $C544
sprite_y_min_ok_25:
  LDA $C542
  CMP #$E1
  BCC sprite_y_max_ok_25
  BEQ sprite_y_max_ok_25
  LDA #$E1
  STA $C542
  LDA #$00
  SEC
  SBC $C544
  STA $C544
sprite_y_max_ok_25:
sprite_update_inactive_8_21:
  LDA $C443
  BNE sprite_anim_active_8_27
  JMP sprite_anim_done_8_26
sprite_anim_active_8_27:
  LDA $C440
  CMP #$00
  BNE sprite_anim_next_seq_8_0_28
  INC $C442
  LDA $C442
  CMP #$08
  BCS sprite_anim_advance_8_0_29
  JMP sprite_anim_done_8_26
sprite_anim_advance_8_0_29:
  LDA #$00
  STA $C442
  INC $C441
  LDA $C441
  CMP #$02
  BCC sprite_anim_pos_ok_8_0_30
  LDA #$00
  STA $C441
sprite_anim_pos_ok_8_0_30:
  LDX $C441
  LDA sprite_sequence_8_pulse,X
  STA $C444
  JMP sprite_anim_done_8_26
sprite_anim_next_seq_8_0_28:
sprite_anim_done_8_26:
  JSR runtime_sprite_mux_render
  JMP game_frame_loop
; Dynamic 16-to-8 sprite multiplexer: sort active sprites by Y
runtime_sprite_mux_sort:
  LDA #$00
  STA $C590
  LDA #$00
  STA $C591
runtime_sprite_mux_sort_outer:
  LDY $C591
  LDA $C505,Y
  BEQ runtime_sprite_mux_sort_next
  STY $C592
  LDA $C502,Y
  STA $C593
  LDX $C590
runtime_sprite_mux_sort_insert:
  CPX #$00
  BEQ runtime_sprite_mux_sort_place
  DEX
  LDA $C580,X
  TAY
  LDA $C502,Y
  CMP $C593
  BCC runtime_sprite_mux_sort_after
  BEQ runtime_sprite_mux_sort_after
  LDA $C580,X
  STA $C581,X
  JMP runtime_sprite_mux_sort_insert
runtime_sprite_mux_sort_after:
  INX
runtime_sprite_mux_sort_place:
  LDA $C592
  STA $C580,X
  INC $C590
runtime_sprite_mux_sort_next:
  CLC
  LDA $C591
  ADC #$08
  STA $C591
  CMP #$80
  BNE runtime_sprite_mux_sort_outer
  RTS
; Copy one logical sprite to one VIC-II hardware channel
runtime_sprite_mux_draw:
  STX $C595
  STY $C597
  TXA
  ASL A
  TAX
  LDA $C500,Y
  STA $D000,X
  LDA $C502,Y
  STA $D001,X
  LDX $C595
  LDA runtime_sprite_mux_bit_masks,X
  STA $C599
  LDA runtime_sprite_mux_inverse_masks,X
  STA $C59A
  LDA $C404,Y
  STA $07F8,X
  LDA $C405,Y
  STA $D027,X
  LDA $D015
  ORA $C599
  STA $D015
  LDA $D010
  AND $C59A
  STA $D010
  LDY $C597
  LDA $C501,Y
  AND #$01
  BEQ runtime_sprite_mux_x_low
  LDA $D010
  ORA $C599
  STA $D010
runtime_sprite_mux_x_low:
  LDA $D01C
  AND $C59A
  STA $D01C
  LDY $C597
  LDA $C406,Y
  AND #$01
  BEQ runtime_sprite_mux_no_multicolor
  LDA $D01C
  ORA $C599
  STA $D01C
runtime_sprite_mux_no_multicolor:
  LDA $D01D
  AND $C59A
  STA $D01D
  LDY $C597
  LDA $C406,Y
  AND #$02
  BEQ runtime_sprite_mux_no_expand_x
  LDA $D01D
  ORA $C599
  STA $D01D
runtime_sprite_mux_no_expand_x:
  LDA $D017
  AND $C59A
  STA $D017
  LDY $C597
  LDA $C406,Y
  AND #$04
  BEQ runtime_sprite_mux_no_expand_y
  LDA $D017
  ORA $C599
  STA $D017
runtime_sprite_mux_no_expand_y:
  LDA $D01B
  AND $C59A
  STA $D01B
  LDY $C597
  LDA $C406,Y
  AND #$08
  BEQ runtime_sprite_mux_no_priority
  LDA $D01B
  ORA $C599
  STA $D01B
runtime_sprite_mux_no_priority:
  LDX $C595
  LDY $C597
  LDA $C406,Y
  AND #$04
  BEQ runtime_sprite_mux_normal_height
  LDA #$2D
  JMP runtime_sprite_mux_add_height
runtime_sprite_mux_normal_height:
  LDA #$18
runtime_sprite_mux_add_height:
  CLC
  ADC $C502,Y
  BCC runtime_sprite_mux_end_ready
  LDA #$FF
runtime_sprite_mux_end_ready:
  STA $C5A0,X
  RTS
; Render the sorted display list and recycle channels after sprite end
runtime_sprite_mux_render:
  JSR runtime_sprite_mux_sort
runtime_sprite_mux_wait_safe_raster:
  LDA $D011
  BMI runtime_sprite_mux_frame_ready
  LDA $D012
  CMP #$40
  BCC runtime_sprite_mux_frame_ready
  JMP runtime_sprite_mux_wait_safe_raster
runtime_sprite_mux_frame_ready:
  LDA #$00
  STA $D015
  LDX #$00
runtime_sprite_mux_first_slots:
  CPX $C590
  BCS runtime_sprite_mux_first_done
  CPX #$08
  BEQ runtime_sprite_mux_first_done
  LDA $C580,X
  TAY
  JSR runtime_sprite_mux_draw
  INX
  JMP runtime_sprite_mux_first_slots
runtime_sprite_mux_first_done:
  STX $C594
  CPX $C590
  BCS runtime_sprite_mux_render_done
runtime_sprite_mux_schedule_next:
  LDX $C594
  CPX $C590
  BCS runtime_sprite_mux_render_done
  LDX #$00
  STX $C595
  LDA $C5A0
  STA $C596
  INX
runtime_sprite_mux_find_slot:
  LDA $C5A0,X
  CMP $C596
  BCS runtime_sprite_mux_find_next
  STA $C596
  STX $C595
runtime_sprite_mux_find_next:
  INX
  CPX #$08
  BNE runtime_sprite_mux_find_slot
  LDX $C594
  LDA $C580,X
  STA $C597
  TAY
  LDA $C502,Y
  CMP $C596
  BCC runtime_sprite_mux_skip_overflow
runtime_sprite_mux_wait_release:
  LDA $D012
  CMP $C596
  BCC runtime_sprite_mux_wait_release
  LDX $C595
  LDY $C597
  JSR runtime_sprite_mux_draw
runtime_sprite_mux_skip_overflow:
  INC $C594
  JMP runtime_sprite_mux_schedule_next
runtime_sprite_mux_render_done:
  RTS
runtime_sprite_mux_bit_masks:
  .byte $01, $02, $04, $08, $10, $20, $40, $80
runtime_sprite_mux_inverse_masks:
  .byte $FE, $FD, $FB, $F7, $EF, $DF, $BF, $7F
; String pool
str_screen_0:
  .byte $31, $36, $20, $0C, $0F, $07, $09, $03, $01, $0C, $20, $13, $10, $12, $09, $14, $05, $13, $00
str_screen_1:
  .byte $01, $15, $14, $0F, $0D, $01, $14, $09, $03, $20, $19, $20, $13, $0F, $12, $14, $09, $0E, $07, $00
; User data
sprite_frames_multiplex_diamond_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_frames_multiplex_diamond_1:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $FF, $00, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
sprite_sequence_0_pulse:
  .byte $C0, $C1
sprite_sequence_8_pulse:
  .byte $C1, $C0
