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
copydata_2800_sprite_frames_platformerActors_0_63_0:
  LDA sprite_frames_platformerActors_0,X
  STA $2800,X
  INX
  CPX #$3F
  BNE copydata_2800_sprite_frames_platformerActors_0_63_0
  LDA #$00
  STA $283F
  LDX #$00
copydata_2840_sprite_frames_platformerActors_1_63_1:
  LDA sprite_frames_platformerActors_1,X
  STA $2840,X
  INX
  CPX #$3F
  BNE copydata_2840_sprite_frames_platformerActors_1_63_1
  LDA #$00
  STA $287F
  LDX #$00
copydata_2880_sprite_frames_platformerEnemy_0_63_2:
  LDA sprite_frames_platformerEnemy_0,X
  STA $2880,X
  INX
  CPX #$3F
  BNE copydata_2880_sprite_frames_platformerEnemy_0_63_2
  LDA #$00
  STA $28BF
  LDX #$00
copydata_28c0_sprite_frames_platformerCoin_0_63_3:
  LDA sprite_frames_platformerCoin_0,X
  STA $28C0,X
  INX
  CPX #$3F
  BNE copydata_28c0_sprite_frames_platformerCoin_0_63_3
  LDA #$00
  STA $28FF
  LDX #$00
  LDY #$00
asset_map_initial_rle_2:
  LDA asset_rle_1,X
  STA $C777
  INX
  LDA asset_rle_1,X
  INX
asset_map_initial_rle_2_repeat:
  STA $8000,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_2_repeat
  CPX #$04
  BNE asset_map_initial_rle_2
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
  CPX #$06
  BNE asset_map_initial_rle_4
  LDX #$00
  LDY #$00
asset_map_initial_rle_6:
  LDA asset_rle_5,X
  STA $C777
  INX
  LDA asset_rle_5,X
  INX
asset_map_initial_rle_6_repeat:
  STA $8200,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_6_repeat
  CPX #$0A
  BNE asset_map_initial_rle_6
  LDX #$00
  LDY #$00
asset_map_initial_rle_8:
  LDA asset_rle_7,X
  STA $C777
  INX
  LDA asset_rle_7,X
  INX
asset_map_initial_rle_8_repeat:
  STA $8300,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_8_repeat
  CPX #$0E
  BNE asset_map_initial_rle_8
  LDX #$00
  LDY #$00
asset_map_initial_rle_10:
  LDA asset_rle_9,X
  STA $C777
  INX
  LDA asset_rle_9,X
  INX
asset_map_initial_rle_10_repeat:
  STA $8400,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_10_repeat
  CPX #$12
  BNE asset_map_initial_rle_10
  LDX #$00
  LDY #$00
asset_map_initial_rle_12:
  LDA asset_rle_11,X
  STA $C777
  INX
  LDA asset_rle_11,X
  INX
asset_map_initial_rle_12_repeat:
  STA $8500,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_12_repeat
  CPX #$1E
  BNE asset_map_initial_rle_12
  LDX #$00
  LDY #$00
asset_map_initial_rle_14:
  LDA asset_rle_13,X
  STA $C777
  INX
  LDA asset_rle_13,X
  INX
asset_map_initial_rle_14_repeat:
  STA $8600,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_14_repeat
  CPX #$16
  BNE asset_map_initial_rle_14
  LDX #$00
  LDY #$00
asset_map_initial_rle_15:
  LDA asset_rle_1,X
  STA $C777
  INX
  LDA asset_rle_1,X
  INX
asset_map_initial_rle_15_repeat:
  STA $8700,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_15_repeat
  CPX #$04
  BNE asset_map_initial_rle_15
  LDX #$00
  LDY #$00
asset_map_initial_rle_16:
  LDA asset_rle_1,X
  STA $C777
  INX
  LDA asset_rle_1,X
  INX
asset_map_initial_rle_16_repeat:
  STA $8800,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_16_repeat
  CPX #$04
  BNE asset_map_initial_rle_16
  LDX #$00
  LDY #$00
asset_map_initial_rle_18:
  LDA asset_rle_17,X
  STA $C777
  INX
  LDA asset_rle_17,X
  INX
asset_map_initial_rle_18_repeat:
  STA $8900,Y
  INY
  DEC $C777
  BNE asset_map_initial_rle_18_repeat
  CPX #$02
  BNE asset_map_initial_rle_18
  LDA #$00
  STA $C100
  LDA #$00
  STA $C101
  LDA #$30
  STA $C102
  LDA #$00
  STA $C500
  LDA #$00
  STA $C501
  LDA #$00
  STA $C502
  LDA #$00
  STA $C503
  LDA #$00
  STA $C504
  LDA #$00
  STA $C505
  LDA #$01
  STA $C405
  LDA #$A0
  STA $C404
  LDA #$07
  STA $C405
  LDA $C406
  AND #$FE
  STA $C406
  LDA $C400
  CMP #$00
  BNE sprite_play_start_0_0_4
  LDA $C403
  BNE sprite_play_done_0_0_5
sprite_play_start_0_0_4:
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_idle-right
  STA $C404
sprite_play_done_0_0_5:
  LDA #$18
  STA $C103
  LDA #$00
  STA $C104
  LDA #$88
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$01
  STA $C10D
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$00
  STA $C508
  LDA #$00
  STA $C509
  LDA #$00
  STA $C50A
  LDA #$00
  STA $C50B
  LDA #$00
  STA $C50C
  LDA #$00
  STA $C50D
  LDA #$01
  STA $C40D
  LDA #$A2
  STA $C40C
  LDA #$02
  STA $C40D
  LDA $C40E
  AND #$FE
  STA $C40E
  LDA $C408
  CMP #$00
  BNE sprite_play_start_1_0_6
  LDA $C40B
  BNE sprite_play_done_1_0_7
sprite_play_start_1_0_6:
  LDA #$00
  STA $C408
  LDA #$00
  STA $C409
  LDA #$00
  STA $C40A
  LDA #$01
  STA $C40B
  LDA sprite_sequence_1_enemy
  STA $C40C
sprite_play_done_1_0_7:
  LDA #$E0
  STA $C111
  LDA #$00
  STA $C112
  LDA #$60
  STA $C113
  LDA #$00
  STA $C114
  LDA #$00
  STA $C115
  LDA #$00
  STA $C116
  LDA #$00
  STA $C117
  LDA #$00
  STA $C118
  LDA #$00
  STA $C119
  LDA #$00
  STA $C11A
  LDA #$01
  STA $C11B
  LDA #$00
  STA $C11C
  LDA #$00
  STA $C11D
  LDA #$00
  STA $C11E
  LDA #$00
  STA $C540
  LDA #$00
  STA $C541
  LDA #$00
  STA $C542
  LDA #$00
  STA $C543
  LDA #$00
  STA $C544
  LDA #$00
  STA $C545
  LDA #$01
  STA $C445
  LDA #$A3
  STA $C444
  LDA #$0A
  STA $C445
  LDA $C446
  AND #$FE
  STA $C446
  LDA $C440
  CMP #$00
  BNE sprite_play_start_8_0_8
  LDA $C443
  BNE sprite_play_done_8_0_9
sprite_play_start_8_0_8:
  LDA #$00
  STA $C440
  LDA #$00
  STA $C441
  LDA #$00
  STA $C442
  LDA #$01
  STA $C443
  LDA sprite_sequence_8_coin
  STA $C444
sprite_play_done_8_0_9:
  LDA #$E8
  STA $C11F
  LDA #$01
  STA $C120
  LDA #$18
  STA $C121
  LDA #$00
  STA $C122
  LDA #$00
  STA $C123
  LDA #$00
  STA $C124
  LDA #$00
  STA $C125
  LDA #$00
  STA $C126
  LDA #$00
  STA $C127
  LDA #$00
  STA $C128
  LDA #$01
  STA $C129
  LDA #$00
  STA $C12A
  LDA #$00
  STA $C12B
  LDA #$00
  STA $C12C
  LDA #$00
  STA $C12D
  LDA #$07
  STA $C12E
  LDA #$02
  STA $C12F
  LDA #$07
  STA $C130
  LDA #$00
  STA $C133
  LDA #$00
  STA $C134
  LDA #$10
  STA $C135
  LDA #$00
  STA $C136
  LDA $D011
  AND #$7F
  STA $C131
  LDA $D016
  STA $C132
  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D020
  LDA #$00
  STA $D021
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_10:
  LDA str_screen_0,X
  BEQ printat_done_11
  STA $0749,X
  LDA #$01
  STA $DB49,X
  INX
  BNE printat_loop_10
printat_done_11:
  LDX #$00
printat_loop_12:
  LDA str_screen_1,X
  BEQ printat_done_13
  STA $0799,X
  LDA #$01
  STA $DB99,X
  INX
  BNE printat_loop_12
printat_done_13:
  LDA #$0C
  STA $D418
  LDA $C12D
  STA $C7C0
  LDA $C12F
  STA $C7C1
  LDA $D011
  AND #$7F
  STA $C131
  LDA $D016
  STA $C132
  JSR runtime_map_viewport_0
  JSR runtime_map_scroll_restore_0
  LDA #$00
  STA $C137
  LDA #$00
  STA $C77E
  LDA #$00
  STA $C59B
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
  CMP #$02
  BEQ irq_dispatch_match_2
  JMP irq_dispatch_next_2
irq_dispatch_match_2:
  JMP irq_handler_2
irq_dispatch_next_2:
  CMP #$03
  BEQ irq_dispatch_match_3
  JMP irq_dispatch_next_3
irq_dispatch_match_3:
  JMP irq_handler_3
irq_dispatch_next_3:
  JMP irq_handler_0
irq_handler_0:
  JSR runtime_map_scroll_apply_0
  LDA #$01
  STA $C77E
  LDA #$01
  STA $C0FE
  LDA #$D2
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
  JSR runtime_map_scroll_leave_0
  LDA #$02
  STA $C0FE
  LDA #$FA
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
irq_handler_2:
  LDA #$00
  STA $D021
  LDA #$03
  STA $C0FE
  LDA #$00
  STA $D012
  LDA $D011
  AND #$7F
  ORA #$80
  STA $D011
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA81
irq_handler_3:
  JSR runtime_sprite_mux_present
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
  LDA $C77E
  BEQ game_frame_wait_leave
  LDA #$00
  STA $C77E
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
  BNE game_frame_counter_done_14
  INC $C76B
game_frame_counter_done_14:
  LDA #$00
  STA $C59B
  LDA #$00
  STA $C107
  LDA $C767
  AND #$04
  BEQ condition_pass_16
  JMP control_if_else_15
condition_pass_16:
  LDA #$FE
  STA $C107
  LDA #$01
  STA $C100
  JMP control_if_end_15
control_if_else_15:
control_if_end_15:
  LDA $C767
  AND #$08
  BEQ condition_pass_18
  JMP control_if_else_17
condition_pass_18:
  LDA #$02
  STA $C107
  LDA #$00
  STA $C100
  JMP control_if_end_17
control_if_else_17:
control_if_end_17:
  LDA $C109
  CMP #$01
  BEQ condition_pass_20
  JMP control_if_else_19
condition_pass_20:
  LDA $C767
  AND #$10
  BEQ joystick_current_pressed_22
  JMP control_if_else_21
joystick_current_pressed_22:
  LDA $C769
  AND #$10
  BNE condition_pass_22
  JMP control_if_else_21
condition_pass_22:
  LDA #$F8
  STA $C108
  LDA #$00
  STA $C109
  JMP control_if_end_21
control_if_else_21:
control_if_end_21:
  JMP control_if_end_19
control_if_else_19:
control_if_end_19:
  LDA $C108
  CLC
  ADC #$01
  STA $C108
  JSR runtime_map_entity_move_1
  LDA $C403
  BNE sprite_anim_active_0_24
  JMP sprite_anim_done_0_23
sprite_anim_active_0_24:
  LDA $C400
  CMP #$00
  BNE sprite_anim_next_seq_0_0_25
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_0_26
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_0_26:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$01
  BCC sprite_anim_pos_ok_0_0_27
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_0_27:
  LDX $C401
  LDA sprite_sequence_0_idle-right,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_0_25:
  LDA $C400
  CMP #$01
  BNE sprite_anim_next_seq_0_1_28
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_1_29
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_1_29:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$01
  BCC sprite_anim_pos_ok_0_1_30
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_1_30:
  LDX $C401
  LDA sprite_sequence_0_idle-left,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_1_28:
  LDA $C400
  CMP #$02
  BNE sprite_anim_next_seq_0_2_31
  INC $C402
  LDA $C402
  CMP #$05
  BCS sprite_anim_advance_0_2_32
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_2_32:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$02
  BCC sprite_anim_pos_ok_0_2_33
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_2_33:
  LDX $C401
  LDA sprite_sequence_0_run-right,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_2_31:
  LDA $C400
  CMP #$03
  BNE sprite_anim_next_seq_0_3_34
  INC $C402
  LDA $C402
  CMP #$05
  BCS sprite_anim_advance_0_3_35
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_3_35:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$02
  BCC sprite_anim_pos_ok_0_3_36
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_3_36:
  LDX $C401
  LDA sprite_sequence_0_run-left,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_3_34:
  LDA $C400
  CMP #$04
  BNE sprite_anim_next_seq_0_4_37
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_4_38
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_4_38:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$01
  BCC sprite_anim_pos_ok_0_4_39
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_4_39:
  LDX $C401
  LDA sprite_sequence_0_jump-right,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_4_37:
  LDA $C400
  CMP #$05
  BNE sprite_anim_next_seq_0_5_40
  INC $C402
  LDA $C402
  CMP #$08
  BCS sprite_anim_advance_0_5_41
  JMP sprite_anim_done_0_23
sprite_anim_advance_0_5_41:
  LDA #$00
  STA $C402
  INC $C401
  LDA $C401
  CMP #$01
  BCC sprite_anim_pos_ok_0_5_42
  LDA #$00
  STA $C401
sprite_anim_pos_ok_0_5_42:
  LDX $C401
  LDA sprite_sequence_0_jump-left,X
  STA $C404
  JMP sprite_anim_done_0_23
sprite_anim_next_seq_0_5_40:
sprite_anim_done_0_23:
  LDA $C109
  CMP #$01
  BEQ condition_pass_44
  JMP control_if_else_43
condition_pass_44:
  LDA $C107
  CMP #$00
  BEQ condition_pass_46
  JMP control_if_else_45
condition_pass_46:
  LDA $C100
  CMP #$01
  BEQ condition_pass_48
  JMP control_if_else_47
condition_pass_48:
  LDA $C400
  CMP #$01
  BNE sprite_play_start_0_1_49
  LDA $C403
  BNE sprite_play_done_0_1_50
sprite_play_start_0_1_49:
  LDA #$01
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_idle-left
  STA $C404
sprite_play_done_0_1_50:
  JMP control_if_end_47
control_if_else_47:
  LDA $C400
  CMP #$00
  BNE sprite_play_start_0_0_51
  LDA $C403
  BNE sprite_play_done_0_0_52
sprite_play_start_0_0_51:
  LDA #$00
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_idle-right
  STA $C404
sprite_play_done_0_0_52:
control_if_end_47:
  JMP control_if_end_45
control_if_else_45:
  LDA $C100
  CMP #$01
  BEQ condition_pass_54
  JMP control_if_else_53
condition_pass_54:
  LDA $C400
  CMP #$03
  BNE sprite_play_start_0_3_55
  LDA $C403
  BNE sprite_play_done_0_3_56
sprite_play_start_0_3_55:
  LDA #$03
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_run-left
  STA $C404
sprite_play_done_0_3_56:
  JMP control_if_end_53
control_if_else_53:
  LDA $C400
  CMP #$02
  BNE sprite_play_start_0_2_57
  LDA $C403
  BNE sprite_play_done_0_2_58
sprite_play_start_0_2_57:
  LDA #$02
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_run-right
  STA $C404
sprite_play_done_0_2_58:
control_if_end_53:
control_if_end_45:
  JMP control_if_end_43
control_if_else_43:
  LDA $C100
  CMP #$01
  BEQ condition_pass_60
  JMP control_if_else_59
condition_pass_60:
  LDA $C400
  CMP #$05
  BNE sprite_play_start_0_5_61
  LDA $C403
  BNE sprite_play_done_0_5_62
sprite_play_start_0_5_61:
  LDA #$05
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_jump-left
  STA $C404
sprite_play_done_0_5_62:
  JMP control_if_end_59
control_if_else_59:
  LDA $C400
  CMP #$04
  BNE sprite_play_start_0_4_63
  LDA $C403
  BNE sprite_play_done_0_4_64
sprite_play_start_0_4_63:
  LDA #$04
  STA $C400
  LDA #$00
  STA $C401
  LDA #$00
  STA $C402
  LDA #$01
  STA $C403
  LDA sprite_sequence_0_jump-right
  STA $C404
sprite_play_done_0_4_64:
control_if_end_59:
control_if_end_43:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  CLC
  LDA $C133
  ADC #$C7
  STA $C7BD
  LDA $C134
  ADC #$00
  STA $C7BE
  LDA $C7C5
  CMP $C7BE
  BEQ map_camera_follow_x_1_1_65_0_positive_compare_high_equal
  BCC map_camera_follow_x_1_1_65_0_positive_compare_false
  JMP map_camera_follow_x_1_1_65_0_move_positive
map_camera_follow_x_1_1_65_0_positive_compare_high_equal:
  LDA $C7C4
  CMP $C7BD
  BEQ map_camera_follow_x_1_1_65_0_positive_compare_false
  BCC map_camera_follow_x_1_1_65_0_positive_compare_false
  JMP map_camera_follow_x_1_1_65_0_move_positive
map_camera_follow_x_1_1_65_0_positive_compare_false:
  JMP map_camera_follow_x_1_1_65_0_check_negative
map_camera_follow_x_1_1_65_0_check_negative:
  CLC
  LDA $C133
  ADC #$68
  STA $C7BD
  LDA $C134
  ADC #$00
  STA $C7BE
  LDA $C7BE
  CMP $C7C5
  BEQ map_camera_follow_x_1_1_65_0_negative_compare_high_equal
  BCC map_camera_follow_x_1_1_65_0_negative_compare_false
  JMP map_camera_follow_x_1_1_65_0_move_negative
map_camera_follow_x_1_1_65_0_negative_compare_high_equal:
  LDA $C7BD
  CMP $C7C4
  BEQ map_camera_follow_x_1_1_65_0_negative_compare_false
  BCC map_camera_follow_x_1_1_65_0_negative_compare_false
  JMP map_camera_follow_x_1_1_65_0_move_negative
map_camera_follow_x_1_1_65_0_negative_compare_false:
  JMP map_camera_follow_x_1_1_65_0_done
map_camera_follow_x_1_1_65_0_move_positive:
  LDA $C12D
  CMP #$2C
  BEQ map_scroll_done_66
map_scroll_can_move_66:
  LDA $C12E
  BEQ map_scroll_wrap_66
  DEC $C12E
  JMP map_scroll_moved_66
map_scroll_wrap_66:
  INC $C12D
  LDA #$07
  STA $C12E
  LDA #$01
  STA $C137
map_scroll_moved_66:
  INC $C133
  BNE map_scroll_pixel_x_inc_66_done
  INC $C134
map_scroll_pixel_x_inc_66_done:
map_scroll_done_66:
  JMP map_camera_follow_x_1_1_65_0_done
map_camera_follow_x_1_1_65_0_move_negative:
  LDA $C12D
  BNE map_scroll_can_move_67
  LDA $C12E
  CMP #$07
  BEQ map_scroll_done_67
map_scroll_can_move_67:
  LDA $C12E
  CMP #$07
  BEQ map_scroll_wrap_67
  INC $C12E
  JMP map_scroll_moved_67
map_scroll_wrap_67:
  DEC $C12D
  LDA #$00
  STA $C12E
  LDA #$FF
  STA $C137
map_scroll_moved_67:
  LDA $C133
  BNE map_scroll_pixel_x_dec_67_low
  DEC $C134
map_scroll_pixel_x_dec_67_low:
  DEC $C133
map_scroll_done_67:
map_camera_follow_x_1_1_65_0_done:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  CLC
  LDA $C133
  ADC #$C7
  STA $C7BD
  LDA $C134
  ADC #$00
  STA $C7BE
  LDA $C7C5
  CMP $C7BE
  BEQ map_camera_follow_x_1_1_68_1_positive_compare_high_equal
  BCC map_camera_follow_x_1_1_68_1_positive_compare_false
  JMP map_camera_follow_x_1_1_68_1_move_positive
map_camera_follow_x_1_1_68_1_positive_compare_high_equal:
  LDA $C7C4
  CMP $C7BD
  BEQ map_camera_follow_x_1_1_68_1_positive_compare_false
  BCC map_camera_follow_x_1_1_68_1_positive_compare_false
  JMP map_camera_follow_x_1_1_68_1_move_positive
map_camera_follow_x_1_1_68_1_positive_compare_false:
  JMP map_camera_follow_x_1_1_68_1_check_negative
map_camera_follow_x_1_1_68_1_check_negative:
  CLC
  LDA $C133
  ADC #$68
  STA $C7BD
  LDA $C134
  ADC #$00
  STA $C7BE
  LDA $C7BE
  CMP $C7C5
  BEQ map_camera_follow_x_1_1_68_1_negative_compare_high_equal
  BCC map_camera_follow_x_1_1_68_1_negative_compare_false
  JMP map_camera_follow_x_1_1_68_1_move_negative
map_camera_follow_x_1_1_68_1_negative_compare_high_equal:
  LDA $C7BD
  CMP $C7C4
  BEQ map_camera_follow_x_1_1_68_1_negative_compare_false
  BCC map_camera_follow_x_1_1_68_1_negative_compare_false
  JMP map_camera_follow_x_1_1_68_1_move_negative
map_camera_follow_x_1_1_68_1_negative_compare_false:
  JMP map_camera_follow_x_1_1_68_1_done
map_camera_follow_x_1_1_68_1_move_positive:
  LDA $C12D
  CMP #$2C
  BEQ map_scroll_done_69
map_scroll_can_move_69:
  LDA $C12E
  BEQ map_scroll_wrap_69
  DEC $C12E
  JMP map_scroll_moved_69
map_scroll_wrap_69:
  INC $C12D
  LDA #$07
  STA $C12E
  LDA #$01
  STA $C137
map_scroll_moved_69:
  INC $C133
  BNE map_scroll_pixel_x_inc_69_done
  INC $C134
map_scroll_pixel_x_inc_69_done:
map_scroll_done_69:
  JMP map_camera_follow_x_1_1_68_1_done
map_camera_follow_x_1_1_68_1_move_negative:
  LDA $C12D
  BNE map_scroll_can_move_70
  LDA $C12E
  CMP #$07
  BEQ map_scroll_done_70
map_scroll_can_move_70:
  LDA $C12E
  CMP #$07
  BEQ map_scroll_wrap_70
  INC $C12E
  JMP map_scroll_moved_70
map_scroll_wrap_70:
  DEC $C12D
  LDA #$00
  STA $C12E
  LDA #$FF
  STA $C137
map_scroll_moved_70:
  LDA $C133
  BNE map_scroll_pixel_x_dec_70_low
  DEC $C134
map_scroll_pixel_x_dec_70_low:
  DEC $C133
map_scroll_done_70:
map_camera_follow_x_1_1_68_1_done:
  LDA $C10D
  BNE map_entity_enabled_1_71
  JMP map_entity_hidden_1_71
map_entity_enabled_1_71:
  CLC
  LDA $C103
  ADC #$18
  STA $C7BD
  LDA $C104
  ADC #$00
  STA $C7BE
  SEC
  LDA $C7BD
  SBC $C133
  STA $C7BD
  LDA $C7BE
  SBC $C134
  STA $C7BE
  BCS map_entity_x_71_not_before_72
  JMP map_entity_hidden_1_71
map_entity_x_71_not_before_72:
  LDA $C7BE
  CMP #$01
  BCC map_entity_x_visible_71
  BNE map_entity_x_visible_71_hidden
  LDA $C7BD
  CMP #$50
  BCC map_entity_x_visible_71
map_entity_x_visible_71_hidden:
  JMP map_entity_hidden_1_71
map_entity_x_visible_71:
  CLC
  LDA $C105
  ADC #$15
  STA $C7BB
  LDA $C106
  ADC #$00
  STA $C7BC
  SEC
  LDA $C7BB
  SBC $C135
  STA $C7BB
  LDA $C7BC
  SBC $C136
  STA $C7BC
  BCS map_entity_y_71_not_before_73
  JMP map_entity_hidden_1_71
map_entity_y_71_not_before_73:
  LDA $C7BC
  CMP #$00
  BCC map_entity_y_visible_71
  BNE map_entity_y_visible_71_hidden
  LDA $C7BB
  CMP #$CA
  BCC map_entity_y_visible_71
map_entity_y_visible_71_hidden:
  JMP map_entity_hidden_1_71
map_entity_y_visible_71:
  CLC
  LDA $C7BD
  ADC #$17
  STA $C500
  LDA $C7BE
  ADC #$00
  STA $C501
  CLC
  LDA $C7BB
  ADC #$1D
  STA $C502
  LDA #$01
  STA $C505
  JMP map_entity_shown_1_71
map_entity_hidden_1_71:
  LDA #$00
  STA $C505
map_entity_shown_1_71:
map_entity_project_done_1_71:
  LDA $C11B
  BNE map_entity_enabled_2_74
  JMP map_entity_hidden_2_74
map_entity_enabled_2_74:
  CLC
  LDA $C111
  ADC #$18
  STA $C7BD
  LDA $C112
  ADC #$00
  STA $C7BE
  SEC
  LDA $C7BD
  SBC $C133
  STA $C7BD
  LDA $C7BE
  SBC $C134
  STA $C7BE
  BCS map_entity_x_74_not_before_75
  JMP map_entity_hidden_2_74
map_entity_x_74_not_before_75:
  LDA $C7BE
  CMP #$01
  BCC map_entity_x_visible_74
  BNE map_entity_x_visible_74_hidden
  LDA $C7BD
  CMP #$50
  BCC map_entity_x_visible_74
map_entity_x_visible_74_hidden:
  JMP map_entity_hidden_2_74
map_entity_x_visible_74:
  CLC
  LDA $C113
  ADC #$15
  STA $C7BB
  LDA $C114
  ADC #$00
  STA $C7BC
  SEC
  LDA $C7BB
  SBC $C135
  STA $C7BB
  LDA $C7BC
  SBC $C136
  STA $C7BC
  BCS map_entity_y_74_not_before_76
  JMP map_entity_hidden_2_74
map_entity_y_74_not_before_76:
  LDA $C7BC
  CMP #$00
  BCC map_entity_y_visible_74
  BNE map_entity_y_visible_74_hidden
  LDA $C7BB
  CMP #$CA
  BCC map_entity_y_visible_74
map_entity_y_visible_74_hidden:
  JMP map_entity_hidden_2_74
map_entity_y_visible_74:
  CLC
  LDA $C7BD
  ADC #$17
  STA $C508
  LDA $C7BE
  ADC #$00
  STA $C509
  CLC
  LDA $C7BB
  ADC #$1D
  STA $C50A
  LDA #$01
  STA $C50D
  JMP map_entity_shown_2_74
map_entity_hidden_2_74:
  LDA #$00
  STA $C50D
map_entity_shown_2_74:
map_entity_project_done_2_74:
  LDA $C129
  BNE map_entity_enabled_3_77
  JMP map_entity_hidden_3_77
map_entity_enabled_3_77:
  CLC
  LDA $C11F
  ADC #$18
  STA $C7BD
  LDA $C120
  ADC #$00
  STA $C7BE
  SEC
  LDA $C7BD
  SBC $C133
  STA $C7BD
  LDA $C7BE
  SBC $C134
  STA $C7BE
  BCS map_entity_x_77_not_before_78
  JMP map_entity_hidden_3_77
map_entity_x_77_not_before_78:
  LDA $C7BE
  CMP #$01
  BCC map_entity_x_visible_77
  BNE map_entity_x_visible_77_hidden
  LDA $C7BD
  CMP #$50
  BCC map_entity_x_visible_77
map_entity_x_visible_77_hidden:
  JMP map_entity_hidden_3_77
map_entity_x_visible_77:
  CLC
  LDA $C121
  ADC #$15
  STA $C7BB
  LDA $C122
  ADC #$00
  STA $C7BC
  SEC
  LDA $C7BB
  SBC $C135
  STA $C7BB
  LDA $C7BC
  SBC $C136
  STA $C7BC
  BCS map_entity_y_77_not_before_79
  JMP map_entity_hidden_3_77
map_entity_y_77_not_before_79:
  LDA $C7BC
  CMP #$00
  BCC map_entity_y_visible_77
  BNE map_entity_y_visible_77_hidden
  LDA $C7BB
  CMP #$CA
  BCC map_entity_y_visible_77
map_entity_y_visible_77_hidden:
  JMP map_entity_hidden_3_77
map_entity_y_visible_77:
  CLC
  LDA $C7BD
  ADC #$17
  STA $C540
  LDA $C7BE
  ADC #$00
  STA $C541
  CLC
  LDA $C7BB
  ADC #$1D
  STA $C542
  LDA #$01
  STA $C545
  JMP map_entity_shown_3_77
map_entity_hidden_3_77:
  LDA #$00
  STA $C545
map_entity_shown_3_77:
map_entity_project_done_3_77:
  LDA $C10E
  CMP #$01
  BEQ condition_pass_81
  JMP control_if_else_80
condition_pass_81:
  LDA $C101
  CMP #$00
  BEQ condition_pass_83
  JMP control_if_else_82
condition_pass_83:
  LDA #$18
  STA $C103
  LDA #$00
  STA $C104
  LDA #$88
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$01
  STA $C10D
  LDA #$01
  STA $C505
  JMP control_if_end_82
control_if_else_82:
  LDA #$58
  STA $C103
  LDA #$01
  STA $C104
  LDA #$38
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$01
  STA $C10D
  LDA #$01
  STA $C505
control_if_end_82:
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_80
control_if_else_80:
control_if_end_80:
  LDA $C505
  BNE aabb_a_active_86
  JMP control_if_else_84
aabb_a_active_86:
  LDA $C50D
  BNE aabb_b_active_87
  JMP control_if_else_84
aabb_b_active_87:
  CLC
  LDA $C500
  ADC #$04
  STA $C7A0
  LDA $C501
  ADC #$00
  STA $C7A1
  CLC
  LDA $C500
  ADC #$14
  STA $C7A2
  LDA $C501
  ADC #$00
  STA $C7A3
  CLC
  LDA $C508
  ADC #$04
  STA $C7A4
  LDA $C509
  ADC #$00
  STA $C7A5
  CLC
  LDA $C508
  ADC #$14
  STA $C7A6
  LDA $C509
  ADC #$00
  STA $C7A7
  CLC
  LDA $C502
  ADC #$01
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C502
  ADC #$15
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C50A
  ADC #$02
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C50A
  ADC #$15
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_88
  JMP control_if_else_84
sprite_aabb_pass_88:
  LDA $C101
  CMP #$00
  BEQ condition_pass_90
  JMP control_if_else_89
condition_pass_90:
  LDA #$18
  STA $C103
  LDA #$00
  STA $C104
  LDA #$88
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$01
  STA $C10D
  LDA #$01
  STA $C505
  JMP control_if_end_89
control_if_else_89:
  LDA #$58
  STA $C103
  LDA #$01
  STA $C104
  LDA #$38
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$01
  STA $C10D
  LDA #$01
  STA $C505
control_if_end_89:
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_84
control_if_else_84:
control_if_end_84:
  LDA $C505
  BNE aabb_a_active_93
  JMP control_if_else_91
aabb_a_active_93:
  LDA $C545
  BNE aabb_b_active_94
  JMP control_if_else_91
aabb_b_active_94:
  CLC
  LDA $C500
  ADC #$04
  STA $C7A0
  LDA $C501
  ADC #$00
  STA $C7A1
  CLC
  LDA $C500
  ADC #$14
  STA $C7A2
  LDA $C501
  ADC #$00
  STA $C7A3
  CLC
  LDA $C540
  ADC #$07
  STA $C7A4
  LDA $C541
  ADC #$00
  STA $C7A5
  CLC
  LDA $C540
  ADC #$11
  STA $C7A6
  LDA $C541
  ADC #$00
  STA $C7A7
  CLC
  LDA $C502
  ADC #$01
  STA $C7A8
  LDA #$00
  ADC #$00
  STA $C7A9
  CLC
  LDA $C502
  ADC #$15
  STA $C7AA
  LDA #$00
  ADC #$00
  STA $C7AB
  CLC
  LDA $C542
  ADC #$03
  STA $C7AC
  LDA #$00
  ADC #$00
  STA $C7AD
  CLC
  LDA $C542
  ADC #$0F
  STA $C7AE
  LDA #$00
  ADC #$00
  STA $C7AF
  JSR runtime_sprite_aabb_compare
  BNE sprite_aabb_pass_95
  JMP control_if_else_91
sprite_aabb_pass_95:
  LDA #$00
  STA $C129
  LDA #$00
  STA $C545
  INC $C102
  LDA $C102
  STA $0760
  LDA #$0F
  STA $D418
  JSR runtime_sid_click
  JMP control_if_end_91
control_if_else_91:
control_if_end_91:
  LDA $C110
  CMP #$01
  BEQ condition_pass_97
  JMP control_if_else_96
condition_pass_97:
  LDA $C101
  CMP #$00
  BEQ condition_pass_99
  JMP control_if_else_98
condition_pass_99:
  LDA #$01
  STA $C101
  LDA #$58
  STA $C103
  LDA #$01
  STA $C104
  LDA #$38
  STA $C105
  LDA #$00
  STA $C106
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
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$01
  STA $C10D
  LDA #$01
  STA $C505
  JMP control_if_end_98
control_if_else_98:
  LDA #$05
  STA $D020
control_if_end_98:
  JMP control_if_end_96
control_if_else_96:
control_if_end_96:
  LDA #$01
  STA $C59B
  LDA $C137
  BEQ map_scroll_deferred_done_0
map_scroll_deferred_wait_0:
  LDA $D011
  BMI map_scroll_deferred_ready_0
  LDA $D012
  CMP #$D6
  BCC map_scroll_deferred_wait_0
map_scroll_deferred_ready_0:
  LDA $C137
  BMI map_scroll_deferred_right_0
  JSR runtime_map_scroll_shift_left_0
  JMP map_scroll_deferred_done_0
map_scroll_deferred_right_0:
  JSR runtime_map_scroll_shift_right_0
map_scroll_deferred_done_0:
  LDA #$00
  STA $C137
  JMP game_frame_loop
; Shared non-blocking SID click
runtime_sid_click:
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
  RTS
; Shared strict AABB bounds comparison
runtime_sprite_aabb_compare:
  LDA $C7A3
  CMP $C7A5
  BEQ aabb_high_equal_runtime_0
  BCS aabb_greater_runtime_0
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_0:
  LDA $C7A2
  CMP $C7A4
  BNE aabb_low_not_equal_runtime_0
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_0:
  BCS aabb_greater_runtime_0
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_0:
  LDA $C7A7
  CMP $C7A1
  BEQ aabb_high_equal_runtime_1
  BCS aabb_greater_runtime_1
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_1:
  LDA $C7A6
  CMP $C7A0
  BNE aabb_low_not_equal_runtime_1
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_1:
  BCS aabb_greater_runtime_1
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_1:
  LDA $C7AB
  CMP $C7AD
  BEQ aabb_high_equal_runtime_2
  BCS aabb_greater_runtime_2
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_2:
  LDA $C7AA
  CMP $C7AC
  BNE aabb_low_not_equal_runtime_2
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_2:
  BCS aabb_greater_runtime_2
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_2:
  LDA $C7AF
  CMP $C7A9
  BEQ aabb_high_equal_runtime_3
  BCS aabb_greater_runtime_3
  JMP runtime_sprite_aabb_false
aabb_high_equal_runtime_3:
  LDA $C7AE
  CMP $C7A8
  BNE aabb_low_not_equal_runtime_3
  JMP runtime_sprite_aabb_false
aabb_low_not_equal_runtime_3:
  BCS aabb_greater_runtime_3
  JMP runtime_sprite_aabb_false
aabb_greater_runtime_3:
  LDA #$01
  RTS
runtime_sprite_aabb_false:
  LDA #$00
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
  LDA $C501,Y
  AND #$01
  BEQ runtime_sprite_mux_x_low
  LDA $D010
  ORA $C599
  BNE runtime_sprite_mux_x_low_store
runtime_sprite_mux_x_low:
  LDA $D010
  AND $C59A
runtime_sprite_mux_x_low_store:
  STA $D010
  LDA $C406,Y
  AND #$01
  BEQ runtime_sprite_mux_no_multicolor
  LDA $D01C
  ORA $C599
  BNE runtime_sprite_mux_no_multicolor_store
runtime_sprite_mux_no_multicolor:
  LDA $D01C
  AND $C59A
runtime_sprite_mux_no_multicolor_store:
  STA $D01C
  LDA $C406,Y
  AND #$02
  BEQ runtime_sprite_mux_no_expand_x
  LDA $D01D
  ORA $C599
  BNE runtime_sprite_mux_no_expand_x_store
runtime_sprite_mux_no_expand_x:
  LDA $D01D
  AND $C59A
runtime_sprite_mux_no_expand_x_store:
  STA $D01D
  LDA $C406,Y
  AND #$04
  BEQ runtime_sprite_mux_no_expand_y
  LDA $D017
  ORA $C599
  BNE runtime_sprite_mux_no_expand_y_store
runtime_sprite_mux_no_expand_y:
  LDA $D017
  AND $C59A
runtime_sprite_mux_no_expand_y_store:
  STA $D017
  LDA $C406,Y
  AND #$08
  BEQ runtime_sprite_mux_no_priority
  LDA $D01B
  ORA $C599
  BNE runtime_sprite_mux_no_priority_store
runtime_sprite_mux_no_priority:
  LDA $D01B
  AND $C59A
runtime_sprite_mux_no_priority_store:
  STA $D01B
  LDX $C595
  TXA
  ASL A
  TAX
  LDA $C502,Y
  STA $D001,X
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
runtime_sprite_mux_present:
  LDA $C59B
  BNE runtime_sprite_mux_present_ready
  RTS
runtime_sprite_mux_present_ready:
  LDA #$00
  STA $D015
  LDY #$00
  LDA $C505,Y
  BEQ runtime_sprite_mux_present_next_0
  LDX #$00
  JSR runtime_sprite_mux_draw
runtime_sprite_mux_present_next_0:
  LDY #$08
  LDA $C505,Y
  BEQ runtime_sprite_mux_present_next_1
  LDX #$01
  JSR runtime_sprite_mux_draw
runtime_sprite_mux_present_next_1:
  LDY #$40
  LDA $C505,Y
  BEQ runtime_sprite_mux_present_next_8
  LDX #$02
  JSR runtime_sprite_mux_draw
runtime_sprite_mux_present_next_8:
  LDA #$00
  STA $C59B
runtime_sprite_mux_present_done:
  RTS
runtime_sprite_mux_bit_masks:
  .byte $01, $02, $04, $08, $10, $20, $40, $80
runtime_sprite_mux_inverse_masks:
  .byte $FE, $FD, $FB, $F7, $EF, $DF, $BF, $7F
; Map entity 1: pixel-stepped X/Y tile collision
runtime_map_entity_move_1:
  LDA #$00
  STA $C109
  LDA #$00
  STA $C10A
  LDA #$00
  STA $C10B
  LDA #$00
  STA $C10C
  LDA #$00
  STA $C10E
  LDA #$00
  STA $C10F
  LDA #$00
  STA $C110
  LDA #$00
  STA $C7C9
  LDA $C107
  BNE runtime_map_entity_1_x_has_velocity
  JMP runtime_map_entity_1_x_done
runtime_map_entity_1_x_has_velocity:
  BPL runtime_map_entity_1_x_positive
  JMP runtime_map_entity_1_x_negative
runtime_map_entity_1_x_positive:
  LDA $C107
  CMP #$09
  BCC runtime_map_entity_1_x_positive_count_store
  LDA #$08
runtime_map_entity_1_x_positive_count_store:
  STA $C7C8
runtime_map_entity_1_x_positive_loop:
  INC $C103
  BNE runtime_map_entity_1_x_positive_step_done
  INC $C104
runtime_map_entity_1_x_positive_step_done:
  CLC
  LDA $C103
  ADC #$13
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  CLC
  LDA $C105
  ADC #$01
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_positive_sample_0_clear
  JMP runtime_map_entity_1_x_positive_hit
runtime_map_entity_1_x_positive_sample_0_clear:
  CLC
  LDA $C105
  ADC #$09
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_positive_sample_1_clear
  JMP runtime_map_entity_1_x_positive_hit
runtime_map_entity_1_x_positive_sample_1_clear:
  CLC
  LDA $C105
  ADC #$11
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_positive_sample_2_clear
  JMP runtime_map_entity_1_x_positive_hit
runtime_map_entity_1_x_positive_sample_2_clear:
  CLC
  LDA $C105
  ADC #$14
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_positive_sample_3_clear
  JMP runtime_map_entity_1_x_positive_hit
runtime_map_entity_1_x_positive_sample_3_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_1_x_positive_done
  JMP runtime_map_entity_1_x_positive_loop
runtime_map_entity_1_x_positive_done:
  JMP runtime_map_entity_1_x_done
runtime_map_entity_1_x_positive_hit:
  LDA $C103
  BNE runtime_map_entity_1_x_positive_undo_low
  DEC $C104
runtime_map_entity_1_x_positive_undo_low:
  DEC $C103
  LDA #$01
  STA $C10C
  LDA #$00
  STA $C107
  JMP runtime_map_entity_1_x_done
runtime_map_entity_1_x_negative:
  LDA $C107
  EOR #$FF
  CLC
  ADC #$01
  CMP #$09
  BCC runtime_map_entity_1_x_negative_count_store
  LDA #$08
runtime_map_entity_1_x_negative_count_store:
  STA $C7C8
runtime_map_entity_1_x_negative_loop:
  LDA $C103
  BNE runtime_map_entity_1_x_negative_step_low
  DEC $C104
runtime_map_entity_1_x_negative_step_low:
  DEC $C103
  CLC
  LDA $C103
  ADC #$04
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  CLC
  LDA $C105
  ADC #$01
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_negative_sample_0_clear
  JMP runtime_map_entity_1_x_negative_hit
runtime_map_entity_1_x_negative_sample_0_clear:
  CLC
  LDA $C105
  ADC #$09
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_negative_sample_1_clear
  JMP runtime_map_entity_1_x_negative_hit
runtime_map_entity_1_x_negative_sample_1_clear:
  CLC
  LDA $C105
  ADC #$11
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_negative_sample_2_clear
  JMP runtime_map_entity_1_x_negative_hit
runtime_map_entity_1_x_negative_sample_2_clear:
  CLC
  LDA $C105
  ADC #$14
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_x_negative_sample_3_clear
  JMP runtime_map_entity_1_x_negative_hit
runtime_map_entity_1_x_negative_sample_3_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_1_x_negative_done
  JMP runtime_map_entity_1_x_negative_loop
runtime_map_entity_1_x_negative_done:
  JMP runtime_map_entity_1_x_done
runtime_map_entity_1_x_negative_hit:
  INC $C103
  BNE runtime_map_entity_1_x_negative_undo_done
  INC $C104
runtime_map_entity_1_x_negative_undo_done:
  LDA #$01
  STA $C10B
  LDA #$00
  STA $C107
runtime_map_entity_1_x_done:
  LDA $C108
  BNE runtime_map_entity_1_y_has_velocity
  JMP runtime_map_entity_1_y_done
runtime_map_entity_1_y_has_velocity:
  BPL runtime_map_entity_1_y_positive
  JMP runtime_map_entity_1_y_negative
runtime_map_entity_1_y_positive:
  LDA #$01
  STA $C7C9
  LDA $C108
  CMP #$09
  BCC runtime_map_entity_1_y_positive_count_store
  LDA #$08
runtime_map_entity_1_y_positive_count_store:
  STA $C7C8
runtime_map_entity_1_y_positive_loop:
  INC $C105
  BNE runtime_map_entity_1_y_positive_step_done
  INC $C106
runtime_map_entity_1_y_positive_step_done:
  CLC
  LDA $C105
  ADC #$14
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  CLC
  LDA $C103
  ADC #$04
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_positive_sample_0_clear
  JMP runtime_map_entity_1_y_positive_hit
runtime_map_entity_1_y_positive_sample_0_clear:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_positive_sample_1_clear
  JMP runtime_map_entity_1_y_positive_hit
runtime_map_entity_1_y_positive_sample_1_clear:
  CLC
  LDA $C103
  ADC #$13
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_positive_sample_2_clear
  JMP runtime_map_entity_1_y_positive_hit
runtime_map_entity_1_y_positive_sample_2_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_1_y_positive_done
  JMP runtime_map_entity_1_y_positive_loop
runtime_map_entity_1_y_positive_done:
  JMP runtime_map_entity_1_y_done
runtime_map_entity_1_y_positive_hit:
  LDA $C105
  BNE runtime_map_entity_1_y_positive_undo_low
  DEC $C106
runtime_map_entity_1_y_positive_undo_low:
  DEC $C105
  LDA #$01
  STA $C109
  LDA #$00
  STA $C108
  JMP runtime_map_entity_1_y_done
runtime_map_entity_1_y_negative:
  LDA #$00
  STA $C7C9
  LDA $C108
  EOR #$FF
  CLC
  ADC #$01
  CMP #$09
  BCC runtime_map_entity_1_y_negative_count_store
  LDA #$08
runtime_map_entity_1_y_negative_count_store:
  STA $C7C8
runtime_map_entity_1_y_negative_loop:
  LDA $C105
  BNE runtime_map_entity_1_y_negative_step_low
  DEC $C106
runtime_map_entity_1_y_negative_step_low:
  DEC $C105
  CLC
  LDA $C105
  ADC #$01
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  CLC
  LDA $C103
  ADC #$04
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_negative_sample_0_clear
  JMP runtime_map_entity_1_y_negative_hit
runtime_map_entity_1_y_negative_sample_0_clear:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_negative_sample_1_clear
  JMP runtime_map_entity_1_y_negative_hit
runtime_map_entity_1_y_negative_sample_1_clear:
  CLC
  LDA $C103
  ADC #$13
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_y_negative_sample_2_clear
  JMP runtime_map_entity_1_y_negative_hit
runtime_map_entity_1_y_negative_sample_2_clear:
  DEC $C7C8
  LDA $C7C8
  BEQ runtime_map_entity_1_y_negative_done
  JMP runtime_map_entity_1_y_negative_loop
runtime_map_entity_1_y_negative_done:
  JMP runtime_map_entity_1_y_done
runtime_map_entity_1_y_negative_hit:
  INC $C105
  BNE runtime_map_entity_1_y_negative_undo_done
  INC $C106
runtime_map_entity_1_y_negative_undo_done:
  LDA #$01
  STA $C10A
  LDA #$00
  STA $C108
runtime_map_entity_1_y_done:
  LDA #$01
  STA $C7C9
  CLC
  LDA $C105
  ADC #$15
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  CLC
  LDA $C103
  ADC #$04
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_ground_probe_sample_0_clear
  JMP runtime_map_entity_1_grounded
runtime_map_entity_1_ground_probe_sample_0_clear:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_ground_probe_sample_1_clear
  JMP runtime_map_entity_1_grounded
runtime_map_entity_1_ground_probe_sample_1_clear:
  CLC
  LDA $C103
  ADC #$13
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  JSR runtime_map_entity_point_solid_0
  BEQ runtime_map_entity_1_ground_probe_sample_2_clear
  JMP runtime_map_entity_1_grounded
runtime_map_entity_1_ground_probe_sample_2_clear:
  JMP runtime_map_entity_1_behavior_probe
runtime_map_entity_1_grounded:
  LDA #$01
  STA $C109
runtime_map_entity_1_behavior_probe:
  CLC
  LDA $C103
  ADC #$0C
  STA $C7C4
  LDA $C104
  ADC #$00
  STA $C7C5
  CLC
  LDA $C105
  ADC #$0B
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_value_0
  CMP #$02
  BNE runtime_map_entity_1_center_danger_2_next
  LDA #$01
  STA $C10E
runtime_map_entity_1_center_danger_2_next:
  CMP #$03
  BNE runtime_map_entity_1_center_exit_3_next
  LDA #$01
  STA $C110
runtime_map_entity_1_center_exit_3_next:
  CMP #$04
  BNE runtime_map_entity_1_center_ladder_4_next
  LDA #$01
  STA $C10F
runtime_map_entity_1_center_ladder_4_next:
  CLC
  LDA $C105
  ADC #$14
  STA $C7C6
  LDA $C106
  ADC #$00
  STA $C7C7
  JSR runtime_map_entity_point_value_0
  CMP #$02
  BNE runtime_map_entity_1_bottom_danger_2_next
  LDA #$01
  STA $C10E
runtime_map_entity_1_bottom_danger_2_next:
  CMP #$03
  BNE runtime_map_entity_1_bottom_exit_3_next
  LDA #$01
  STA $C110
runtime_map_entity_1_bottom_exit_3_next:
  CMP #$04
  BNE runtime_map_entity_1_bottom_ladder_4_next
  LDA #$01
  STA $C10F
runtime_map_entity_1_bottom_ladder_4_next:
runtime_map_entity_1_done:
  RTS
; Map 0: logical collision lookup from 16-bit world pixels
runtime_map_entity_point_value_0:
  LDA $C7C5
  CMP #$02
  BCC runtime_map_entity_point_0_x_inside
  BNE runtime_map_entity_point_0_x_outside
  LDA $C7C4
  CMP #$80
  BCC runtime_map_entity_point_0_x_inside
runtime_map_entity_point_0_x_outside:
  JMP runtime_map_entity_point_0_outside
runtime_map_entity_point_0_x_inside:
  LDA $C7C7
  CMP #$00
  BCC runtime_map_entity_point_0_y_inside
  BNE runtime_map_entity_point_0_y_outside
  LDA $C7C6
  CMP #$F0
  BCC runtime_map_entity_point_0_y_inside
runtime_map_entity_point_0_y_outside:
  JMP runtime_map_entity_point_0_outside
runtime_map_entity_point_0_y_inside:
  LDA $C7C4
  STA $C7BB
  LDA $C7C5
  STA $C7BC
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LDA $C7BB
  STA $C7B2
  LDA $C7C6
  STA $C7BB
  LDA $C7C7
  STA $C7BC
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LSR $C7BC
  ROR $C7BB
  LDA $C7BB
  STA $C7B3
  JSR runtime_map_pointer_0
  LDA ($FB),Y
  TAX
  LDA asset_map_collisions_0,X
  RTS
runtime_map_entity_point_0_outside:
  LDA #$FF
  RTS
runtime_map_entity_point_solid_0:
  JSR runtime_map_entity_point_value_0
  CMP #$FF
  BEQ runtime_map_entity_point_0_solid
  CMP #$00
  BEQ runtime_map_entity_point_0_clear
  CMP #$02
  BEQ runtime_map_entity_point_0_clear
  CMP #$03
  BEQ runtime_map_entity_point_0_clear
  CMP #$04
  BEQ runtime_map_entity_point_0_clear
  JMP runtime_map_entity_point_0_solid
runtime_map_entity_point_0_solid:
  LDA #$01
  RTS
runtime_map_entity_point_0_clear:
  LDA #$00
  RTS
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
  LDA #$02
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
; Map 0: bounded coarse viewport 36x20
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
  CMP #$24
  BNE runtime_map_viewport_column_0
  INC $C7C3
  LDA $C7C3
  CMP #$14
  BNE runtime_map_viewport_row_0
  RTS
; Map 0: enter raster-banded fine X/Y viewport
runtime_map_scroll_apply_0:
  LDA $D016
  AND #$F0
  ORA $C12E
  STA $D016
  RTS
; Map 0: cycle-stable VCBASE transition into the fixed panel
runtime_map_scroll_prepare_panel_0:
  RTS
; Map 0: leave the scroll area with the fixed horizontal phase
runtime_map_scroll_leave_0:
  LDA $C132
  STA $D016
  RTS
; Map 0: restore both fixed-panel VIC-II phases after a full redraw
runtime_map_scroll_restore_0:
  LDA $C132
  STA $D016
  RTS
; Map 0: shift Screen RAM and Color RAM one character left
runtime_map_scroll_shift_left_0:
  LDA $C12D
  CLC
  ADC #$23
  STA $C7B2
  LDA $C12F
  STA $C7B3
  JSR runtime_map_pointer_0
  LDA $0403
  STA $0402
  LDA $D803
  STA $D802
  LDA $0404
  STA $0403
  LDA $D804
  STA $D803
  LDA $0405
  STA $0404
  LDA $D805
  STA $D804
  LDX #$00
runtime_map_scroll_left_row_0_0:
  LDA $0406,X
  STA $0405,X
  LDA $D806,X
  STA $D805,X
  LDA $0407,X
  STA $0406,X
  LDA $D807,X
  STA $D806,X
  LDA $0408,X
  STA $0407,X
  LDA $D808,X
  STA $D807,X
  LDA $0409,X
  STA $0408,X
  LDA $D809,X
  STA $D808,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0425
  LDA asset_map_colors_0,X
  STA $D825
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $042B
  STA $042A
  LDA $D82B
  STA $D82A
  LDA $042C
  STA $042B
  LDA $D82C
  STA $D82B
  LDA $042D
  STA $042C
  LDA $D82D
  STA $D82C
  LDX #$00
runtime_map_scroll_left_row_0_1:
  LDA $042E,X
  STA $042D,X
  LDA $D82E,X
  STA $D82D,X
  LDA $042F,X
  STA $042E,X
  LDA $D82F,X
  STA $D82E,X
  LDA $0430,X
  STA $042F,X
  LDA $D830,X
  STA $D82F,X
  LDA $0431,X
  STA $0430,X
  LDA $D831,X
  STA $D830,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $044D
  LDA asset_map_colors_0,X
  STA $D84D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0453
  STA $0452
  LDA $D853
  STA $D852
  LDA $0454
  STA $0453
  LDA $D854
  STA $D853
  LDA $0455
  STA $0454
  LDA $D855
  STA $D854
  LDX #$00
runtime_map_scroll_left_row_0_2:
  LDA $0456,X
  STA $0455,X
  LDA $D856,X
  STA $D855,X
  LDA $0457,X
  STA $0456,X
  LDA $D857,X
  STA $D856,X
  LDA $0458,X
  STA $0457,X
  LDA $D858,X
  STA $D857,X
  LDA $0459,X
  STA $0458,X
  LDA $D859,X
  STA $D858,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0475
  LDA asset_map_colors_0,X
  STA $D875
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $047B
  STA $047A
  LDA $D87B
  STA $D87A
  LDA $047C
  STA $047B
  LDA $D87C
  STA $D87B
  LDA $047D
  STA $047C
  LDA $D87D
  STA $D87C
  LDX #$00
runtime_map_scroll_left_row_0_3:
  LDA $047E,X
  STA $047D,X
  LDA $D87E,X
  STA $D87D,X
  LDA $047F,X
  STA $047E,X
  LDA $D87F,X
  STA $D87E,X
  LDA $0480,X
  STA $047F,X
  LDA $D880,X
  STA $D87F,X
  LDA $0481,X
  STA $0480,X
  LDA $D881,X
  STA $D880,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $049D
  LDA asset_map_colors_0,X
  STA $D89D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04A3
  STA $04A2
  LDA $D8A3
  STA $D8A2
  LDA $04A4
  STA $04A3
  LDA $D8A4
  STA $D8A3
  LDA $04A5
  STA $04A4
  LDA $D8A5
  STA $D8A4
  LDX #$00
runtime_map_scroll_left_row_0_4:
  LDA $04A6,X
  STA $04A5,X
  LDA $D8A6,X
  STA $D8A5,X
  LDA $04A7,X
  STA $04A6,X
  LDA $D8A7,X
  STA $D8A6,X
  LDA $04A8,X
  STA $04A7,X
  LDA $D8A8,X
  STA $D8A7,X
  LDA $04A9,X
  STA $04A8,X
  LDA $D8A9,X
  STA $D8A8,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04C5
  LDA asset_map_colors_0,X
  STA $D8C5
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04CB
  STA $04CA
  LDA $D8CB
  STA $D8CA
  LDA $04CC
  STA $04CB
  LDA $D8CC
  STA $D8CB
  LDA $04CD
  STA $04CC
  LDA $D8CD
  STA $D8CC
  LDX #$00
runtime_map_scroll_left_row_0_5:
  LDA $04CE,X
  STA $04CD,X
  LDA $D8CE,X
  STA $D8CD,X
  LDA $04CF,X
  STA $04CE,X
  LDA $D8CF,X
  STA $D8CE,X
  LDA $04D0,X
  STA $04CF,X
  LDA $D8D0,X
  STA $D8CF,X
  LDA $04D1,X
  STA $04D0,X
  LDA $D8D1,X
  STA $D8D0,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04ED
  LDA asset_map_colors_0,X
  STA $D8ED
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04F3
  STA $04F2
  LDA $D8F3
  STA $D8F2
  LDA $04F4
  STA $04F3
  LDA $D8F4
  STA $D8F3
  LDA $04F5
  STA $04F4
  LDA $D8F5
  STA $D8F4
  LDX #$00
runtime_map_scroll_left_row_0_6:
  LDA $04F6,X
  STA $04F5,X
  LDA $D8F6,X
  STA $D8F5,X
  LDA $04F7,X
  STA $04F6,X
  LDA $D8F7,X
  STA $D8F6,X
  LDA $04F8,X
  STA $04F7,X
  LDA $D8F8,X
  STA $D8F7,X
  LDA $04F9,X
  STA $04F8,X
  LDA $D8F9,X
  STA $D8F8,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0515
  LDA asset_map_colors_0,X
  STA $D915
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $051B
  STA $051A
  LDA $D91B
  STA $D91A
  LDA $051C
  STA $051B
  LDA $D91C
  STA $D91B
  LDA $051D
  STA $051C
  LDA $D91D
  STA $D91C
  LDX #$00
runtime_map_scroll_left_row_0_7:
  LDA $051E,X
  STA $051D,X
  LDA $D91E,X
  STA $D91D,X
  LDA $051F,X
  STA $051E,X
  LDA $D91F,X
  STA $D91E,X
  LDA $0520,X
  STA $051F,X
  LDA $D920,X
  STA $D91F,X
  LDA $0521,X
  STA $0520,X
  LDA $D921,X
  STA $D920,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_7
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $053D
  LDA asset_map_colors_0,X
  STA $D93D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0543
  STA $0542
  LDA $D943
  STA $D942
  LDA $0544
  STA $0543
  LDA $D944
  STA $D943
  LDA $0545
  STA $0544
  LDA $D945
  STA $D944
  LDX #$00
runtime_map_scroll_left_row_0_8:
  LDA $0546,X
  STA $0545,X
  LDA $D946,X
  STA $D945,X
  LDA $0547,X
  STA $0546,X
  LDA $D947,X
  STA $D946,X
  LDA $0548,X
  STA $0547,X
  LDA $D948,X
  STA $D947,X
  LDA $0549,X
  STA $0548,X
  LDA $D949,X
  STA $D948,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_8
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0565
  LDA asset_map_colors_0,X
  STA $D965
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $056B
  STA $056A
  LDA $D96B
  STA $D96A
  LDA $056C
  STA $056B
  LDA $D96C
  STA $D96B
  LDA $056D
  STA $056C
  LDA $D96D
  STA $D96C
  LDX #$00
runtime_map_scroll_left_row_0_9:
  LDA $056E,X
  STA $056D,X
  LDA $D96E,X
  STA $D96D,X
  LDA $056F,X
  STA $056E,X
  LDA $D96F,X
  STA $D96E,X
  LDA $0570,X
  STA $056F,X
  LDA $D970,X
  STA $D96F,X
  LDA $0571,X
  STA $0570,X
  LDA $D971,X
  STA $D970,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_9
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $058D
  LDA asset_map_colors_0,X
  STA $D98D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0593
  STA $0592
  LDA $D993
  STA $D992
  LDA $0594
  STA $0593
  LDA $D994
  STA $D993
  LDA $0595
  STA $0594
  LDA $D995
  STA $D994
  LDX #$00
runtime_map_scroll_left_row_0_10:
  LDA $0596,X
  STA $0595,X
  LDA $D996,X
  STA $D995,X
  LDA $0597,X
  STA $0596,X
  LDA $D997,X
  STA $D996,X
  LDA $0598,X
  STA $0597,X
  LDA $D998,X
  STA $D997,X
  LDA $0599,X
  STA $0598,X
  LDA $D999,X
  STA $D998,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_10
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05B5
  LDA asset_map_colors_0,X
  STA $D9B5
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05BB
  STA $05BA
  LDA $D9BB
  STA $D9BA
  LDA $05BC
  STA $05BB
  LDA $D9BC
  STA $D9BB
  LDA $05BD
  STA $05BC
  LDA $D9BD
  STA $D9BC
  LDX #$00
runtime_map_scroll_left_row_0_11:
  LDA $05BE,X
  STA $05BD,X
  LDA $D9BE,X
  STA $D9BD,X
  LDA $05BF,X
  STA $05BE,X
  LDA $D9BF,X
  STA $D9BE,X
  LDA $05C0,X
  STA $05BF,X
  LDA $D9C0,X
  STA $D9BF,X
  LDA $05C1,X
  STA $05C0,X
  LDA $D9C1,X
  STA $D9C0,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_11
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05DD
  LDA asset_map_colors_0,X
  STA $D9DD
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05E3
  STA $05E2
  LDA $D9E3
  STA $D9E2
  LDA $05E4
  STA $05E3
  LDA $D9E4
  STA $D9E3
  LDA $05E5
  STA $05E4
  LDA $D9E5
  STA $D9E4
  LDX #$00
runtime_map_scroll_left_row_0_12:
  LDA $05E6,X
  STA $05E5,X
  LDA $D9E6,X
  STA $D9E5,X
  LDA $05E7,X
  STA $05E6,X
  LDA $D9E7,X
  STA $D9E6,X
  LDA $05E8,X
  STA $05E7,X
  LDA $D9E8,X
  STA $D9E7,X
  LDA $05E9,X
  STA $05E8,X
  LDA $D9E9,X
  STA $D9E8,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_12
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0605
  LDA asset_map_colors_0,X
  STA $DA05
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $060B
  STA $060A
  LDA $DA0B
  STA $DA0A
  LDA $060C
  STA $060B
  LDA $DA0C
  STA $DA0B
  LDA $060D
  STA $060C
  LDA $DA0D
  STA $DA0C
  LDX #$00
runtime_map_scroll_left_row_0_13:
  LDA $060E,X
  STA $060D,X
  LDA $DA0E,X
  STA $DA0D,X
  LDA $060F,X
  STA $060E,X
  LDA $DA0F,X
  STA $DA0E,X
  LDA $0610,X
  STA $060F,X
  LDA $DA10,X
  STA $DA0F,X
  LDA $0611,X
  STA $0610,X
  LDA $DA11,X
  STA $DA10,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_13
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $062D
  LDA asset_map_colors_0,X
  STA $DA2D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0633
  STA $0632
  LDA $DA33
  STA $DA32
  LDA $0634
  STA $0633
  LDA $DA34
  STA $DA33
  LDA $0635
  STA $0634
  LDA $DA35
  STA $DA34
  LDX #$00
runtime_map_scroll_left_row_0_14:
  LDA $0636,X
  STA $0635,X
  LDA $DA36,X
  STA $DA35,X
  LDA $0637,X
  STA $0636,X
  LDA $DA37,X
  STA $DA36,X
  LDA $0638,X
  STA $0637,X
  LDA $DA38,X
  STA $DA37,X
  LDA $0639,X
  STA $0638,X
  LDA $DA39,X
  STA $DA38,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_14
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0655
  LDA asset_map_colors_0,X
  STA $DA55
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $065B
  STA $065A
  LDA $DA5B
  STA $DA5A
  LDA $065C
  STA $065B
  LDA $DA5C
  STA $DA5B
  LDA $065D
  STA $065C
  LDA $DA5D
  STA $DA5C
  LDX #$00
runtime_map_scroll_left_row_0_15:
  LDA $065E,X
  STA $065D,X
  LDA $DA5E,X
  STA $DA5D,X
  LDA $065F,X
  STA $065E,X
  LDA $DA5F,X
  STA $DA5E,X
  LDA $0660,X
  STA $065F,X
  LDA $DA60,X
  STA $DA5F,X
  LDA $0661,X
  STA $0660,X
  LDA $DA61,X
  STA $DA60,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_15
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $067D
  LDA asset_map_colors_0,X
  STA $DA7D
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0683
  STA $0682
  LDA $DA83
  STA $DA82
  LDA $0684
  STA $0683
  LDA $DA84
  STA $DA83
  LDA $0685
  STA $0684
  LDA $DA85
  STA $DA84
  LDX #$00
runtime_map_scroll_left_row_0_16:
  LDA $0686,X
  STA $0685,X
  LDA $DA86,X
  STA $DA85,X
  LDA $0687,X
  STA $0686,X
  LDA $DA87,X
  STA $DA86,X
  LDA $0688,X
  STA $0687,X
  LDA $DA88,X
  STA $DA87,X
  LDA $0689,X
  STA $0688,X
  LDA $DA89,X
  STA $DA88,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_16
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06A5
  LDA asset_map_colors_0,X
  STA $DAA5
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06AB
  STA $06AA
  LDA $DAAB
  STA $DAAA
  LDA $06AC
  STA $06AB
  LDA $DAAC
  STA $DAAB
  LDA $06AD
  STA $06AC
  LDA $DAAD
  STA $DAAC
  LDX #$00
runtime_map_scroll_left_row_0_17:
  LDA $06AE,X
  STA $06AD,X
  LDA $DAAE,X
  STA $DAAD,X
  LDA $06AF,X
  STA $06AE,X
  LDA $DAAF,X
  STA $DAAE,X
  LDA $06B0,X
  STA $06AF,X
  LDA $DAB0,X
  STA $DAAF,X
  LDA $06B1,X
  STA $06B0,X
  LDA $DAB1,X
  STA $DAB0,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_17
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06CD
  LDA asset_map_colors_0,X
  STA $DACD
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06D3
  STA $06D2
  LDA $DAD3
  STA $DAD2
  LDA $06D4
  STA $06D3
  LDA $DAD4
  STA $DAD3
  LDA $06D5
  STA $06D4
  LDA $DAD5
  STA $DAD4
  LDX #$00
runtime_map_scroll_left_row_0_18:
  LDA $06D6,X
  STA $06D5,X
  LDA $DAD6,X
  STA $DAD5,X
  LDA $06D7,X
  STA $06D6,X
  LDA $DAD7,X
  STA $DAD6,X
  LDA $06D8,X
  STA $06D7,X
  LDA $DAD8,X
  STA $DAD7,X
  LDA $06D9,X
  STA $06D8,X
  LDA $DAD9,X
  STA $DAD8,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_18
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06F5
  LDA asset_map_colors_0,X
  STA $DAF5
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06FB
  STA $06FA
  LDA $DAFB
  STA $DAFA
  LDA $06FC
  STA $06FB
  LDA $DAFC
  STA $DAFB
  LDA $06FD
  STA $06FC
  LDA $DAFD
  STA $DAFC
  LDX #$00
runtime_map_scroll_left_row_0_19:
  LDA $06FE,X
  STA $06FD,X
  LDA $DAFE,X
  STA $DAFD,X
  LDA $06FF,X
  STA $06FE,X
  LDA $DAFF,X
  STA $DAFE,X
  LDA $0700,X
  STA $06FF,X
  LDA $DB00,X
  STA $DAFF,X
  LDA $0701,X
  STA $0700,X
  LDA $DB01,X
  STA $DB00,X
  INX
  INX
  INX
  INX
  CPX #$20
  BNE runtime_map_scroll_left_row_0_19
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $071D
  LDA asset_map_colors_0,X
  STA $DB1D
  RTS
; Map 0: shift Screen RAM and Color RAM one character right
runtime_map_scroll_shift_right_0:
  LDA $C12D
  STA $C7B2
  LDA $C12F
  STA $C7B3
  JSR runtime_map_pointer_0
  LDA $0424
  STA $0425
  LDA $D824
  STA $D825
  LDX #$21
runtime_map_scroll_right_row_0_0:
  LDA $0402,X
  STA $0403,X
  LDA $D802,X
  STA $D803,X
  DEX
  LDA $0402,X
  STA $0403,X
  LDA $D802,X
  STA $D803,X
  DEX
  BPL runtime_map_scroll_right_row_0_0
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0402
  LDA asset_map_colors_0,X
  STA $D802
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $044C
  STA $044D
  LDA $D84C
  STA $D84D
  LDX #$21
runtime_map_scroll_right_row_0_1:
  LDA $042A,X
  STA $042B,X
  LDA $D82A,X
  STA $D82B,X
  DEX
  LDA $042A,X
  STA $042B,X
  LDA $D82A,X
  STA $D82B,X
  DEX
  BPL runtime_map_scroll_right_row_0_1
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $042A
  LDA asset_map_colors_0,X
  STA $D82A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0474
  STA $0475
  LDA $D874
  STA $D875
  LDX #$21
runtime_map_scroll_right_row_0_2:
  LDA $0452,X
  STA $0453,X
  LDA $D852,X
  STA $D853,X
  DEX
  LDA $0452,X
  STA $0453,X
  LDA $D852,X
  STA $D853,X
  DEX
  BPL runtime_map_scroll_right_row_0_2
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0452
  LDA asset_map_colors_0,X
  STA $D852
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $049C
  STA $049D
  LDA $D89C
  STA $D89D
  LDX #$21
runtime_map_scroll_right_row_0_3:
  LDA $047A,X
  STA $047B,X
  LDA $D87A,X
  STA $D87B,X
  DEX
  LDA $047A,X
  STA $047B,X
  LDA $D87A,X
  STA $D87B,X
  DEX
  BPL runtime_map_scroll_right_row_0_3
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $047A
  LDA asset_map_colors_0,X
  STA $D87A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04C4
  STA $04C5
  LDA $D8C4
  STA $D8C5
  LDX #$21
runtime_map_scroll_right_row_0_4:
  LDA $04A2,X
  STA $04A3,X
  LDA $D8A2,X
  STA $D8A3,X
  DEX
  LDA $04A2,X
  STA $04A3,X
  LDA $D8A2,X
  STA $D8A3,X
  DEX
  BPL runtime_map_scroll_right_row_0_4
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04A2
  LDA asset_map_colors_0,X
  STA $D8A2
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $04EC
  STA $04ED
  LDA $D8EC
  STA $D8ED
  LDX #$21
runtime_map_scroll_right_row_0_5:
  LDA $04CA,X
  STA $04CB,X
  LDA $D8CA,X
  STA $D8CB,X
  DEX
  LDA $04CA,X
  STA $04CB,X
  LDA $D8CA,X
  STA $D8CB,X
  DEX
  BPL runtime_map_scroll_right_row_0_5
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04CA
  LDA asset_map_colors_0,X
  STA $D8CA
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0514
  STA $0515
  LDA $D914
  STA $D915
  LDX #$21
runtime_map_scroll_right_row_0_6:
  LDA $04F2,X
  STA $04F3,X
  LDA $D8F2,X
  STA $D8F3,X
  DEX
  LDA $04F2,X
  STA $04F3,X
  LDA $D8F2,X
  STA $D8F3,X
  DEX
  BPL runtime_map_scroll_right_row_0_6
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $04F2
  LDA asset_map_colors_0,X
  STA $D8F2
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $053C
  STA $053D
  LDA $D93C
  STA $D93D
  LDX #$21
runtime_map_scroll_right_row_0_7:
  LDA $051A,X
  STA $051B,X
  LDA $D91A,X
  STA $D91B,X
  DEX
  LDA $051A,X
  STA $051B,X
  LDA $D91A,X
  STA $D91B,X
  DEX
  BPL runtime_map_scroll_right_row_0_7
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $051A
  LDA asset_map_colors_0,X
  STA $D91A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0564
  STA $0565
  LDA $D964
  STA $D965
  LDX #$21
runtime_map_scroll_right_row_0_8:
  LDA $0542,X
  STA $0543,X
  LDA $D942,X
  STA $D943,X
  DEX
  LDA $0542,X
  STA $0543,X
  LDA $D942,X
  STA $D943,X
  DEX
  BPL runtime_map_scroll_right_row_0_8
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0542
  LDA asset_map_colors_0,X
  STA $D942
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $058C
  STA $058D
  LDA $D98C
  STA $D98D
  LDX #$21
runtime_map_scroll_right_row_0_9:
  LDA $056A,X
  STA $056B,X
  LDA $D96A,X
  STA $D96B,X
  DEX
  LDA $056A,X
  STA $056B,X
  LDA $D96A,X
  STA $D96B,X
  DEX
  BPL runtime_map_scroll_right_row_0_9
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $056A
  LDA asset_map_colors_0,X
  STA $D96A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05B4
  STA $05B5
  LDA $D9B4
  STA $D9B5
  LDX #$21
runtime_map_scroll_right_row_0_10:
  LDA $0592,X
  STA $0593,X
  LDA $D992,X
  STA $D993,X
  DEX
  LDA $0592,X
  STA $0593,X
  LDA $D992,X
  STA $D993,X
  DEX
  BPL runtime_map_scroll_right_row_0_10
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0592
  LDA asset_map_colors_0,X
  STA $D992
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $05DC
  STA $05DD
  LDA $D9DC
  STA $D9DD
  LDX #$21
runtime_map_scroll_right_row_0_11:
  LDA $05BA,X
  STA $05BB,X
  LDA $D9BA,X
  STA $D9BB,X
  DEX
  LDA $05BA,X
  STA $05BB,X
  LDA $D9BA,X
  STA $D9BB,X
  DEX
  BPL runtime_map_scroll_right_row_0_11
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05BA
  LDA asset_map_colors_0,X
  STA $D9BA
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0604
  STA $0605
  LDA $DA04
  STA $DA05
  LDX #$21
runtime_map_scroll_right_row_0_12:
  LDA $05E2,X
  STA $05E3,X
  LDA $D9E2,X
  STA $D9E3,X
  DEX
  LDA $05E2,X
  STA $05E3,X
  LDA $D9E2,X
  STA $D9E3,X
  DEX
  BPL runtime_map_scroll_right_row_0_12
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $05E2
  LDA asset_map_colors_0,X
  STA $D9E2
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $062C
  STA $062D
  LDA $DA2C
  STA $DA2D
  LDX #$21
runtime_map_scroll_right_row_0_13:
  LDA $060A,X
  STA $060B,X
  LDA $DA0A,X
  STA $DA0B,X
  DEX
  LDA $060A,X
  STA $060B,X
  LDA $DA0A,X
  STA $DA0B,X
  DEX
  BPL runtime_map_scroll_right_row_0_13
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $060A
  LDA asset_map_colors_0,X
  STA $DA0A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $0654
  STA $0655
  LDA $DA54
  STA $DA55
  LDX #$21
runtime_map_scroll_right_row_0_14:
  LDA $0632,X
  STA $0633,X
  LDA $DA32,X
  STA $DA33,X
  DEX
  LDA $0632,X
  STA $0633,X
  LDA $DA32,X
  STA $DA33,X
  DEX
  BPL runtime_map_scroll_right_row_0_14
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0632
  LDA asset_map_colors_0,X
  STA $DA32
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $067C
  STA $067D
  LDA $DA7C
  STA $DA7D
  LDX #$21
runtime_map_scroll_right_row_0_15:
  LDA $065A,X
  STA $065B,X
  LDA $DA5A,X
  STA $DA5B,X
  DEX
  LDA $065A,X
  STA $065B,X
  LDA $DA5A,X
  STA $DA5B,X
  DEX
  BPL runtime_map_scroll_right_row_0_15
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $065A
  LDA asset_map_colors_0,X
  STA $DA5A
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06A4
  STA $06A5
  LDA $DAA4
  STA $DAA5
  LDX #$21
runtime_map_scroll_right_row_0_16:
  LDA $0682,X
  STA $0683,X
  LDA $DA82,X
  STA $DA83,X
  DEX
  LDA $0682,X
  STA $0683,X
  LDA $DA82,X
  STA $DA83,X
  DEX
  BPL runtime_map_scroll_right_row_0_16
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $0682
  LDA asset_map_colors_0,X
  STA $DA82
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06CC
  STA $06CD
  LDA $DACC
  STA $DACD
  LDX #$21
runtime_map_scroll_right_row_0_17:
  LDA $06AA,X
  STA $06AB,X
  LDA $DAAA,X
  STA $DAAB,X
  DEX
  LDA $06AA,X
  STA $06AB,X
  LDA $DAAA,X
  STA $DAAB,X
  DEX
  BPL runtime_map_scroll_right_row_0_17
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06AA
  LDA asset_map_colors_0,X
  STA $DAAA
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $06F4
  STA $06F5
  LDA $DAF4
  STA $DAF5
  LDX #$21
runtime_map_scroll_right_row_0_18:
  LDA $06D2,X
  STA $06D3,X
  LDA $DAD2,X
  STA $DAD3,X
  DEX
  LDA $06D2,X
  STA $06D3,X
  LDA $DAD2,X
  STA $DAD3,X
  DEX
  BPL runtime_map_scroll_right_row_0_18
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06D2
  LDA asset_map_colors_0,X
  STA $DAD2
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  LDA $071C
  STA $071D
  LDA $DB1C
  STA $DB1D
  LDX #$21
runtime_map_scroll_right_row_0_19:
  LDA $06FA,X
  STA $06FB,X
  LDA $DAFA,X
  STA $DAFB,X
  DEX
  LDA $06FA,X
  STA $06FB,X
  LDA $DAFA,X
  STA $DAFB,X
  DEX
  BPL runtime_map_scroll_right_row_0_19
  LDY #$00
  LDA ($FB),Y
  TAX
  LDA asset_map_chars_0,X
  STA $06FA
  LDA asset_map_colors_0,X
  STA $DAFA
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
  .byte $00, $50, $A0, $F0, $40, $90, $E0, $30, $80, $D0, $20, $70, $C0, $10, $60, $B0, $00, $50, $A0, $F0, $40, $90, $E0, $30, $80, $D0, $20, $70, $C0, $10
runtime_map_row_hi_0:
  .byte $80, $80, $80, $80, $81, $81, $81, $82, $82, $82, $83, $83, $83, $84, $84, $84, $85, $85, $85, $85, $86, $86, $86, $87, $87, $87, $88, $88, $88, $89
; String pool
str_screen_0:
  .byte $10, $0C, $01, $14, $06, $0F, $12, $0D, $05, $12, $20, $0D, $09, $0E, $09, $20, $20, $13, $03, $0F, $12, $05, $20, $30, $00
str_screen_1:
  .byte $0A, $0F, $19, $32, $3A, $20, $0D, $0F, $16, $05, $20, $2F, $20, $06, $09, $12, $05, $3A, $20, $0A, $15, $0D, $10, $00
; User data
sprite_frames_platformerActors_0:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $0C, $00, $30, $18, $00, $18, $30, $00, $0C, $60, $00, $06
sprite_frames_platformerActors_1:
  .byte $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $DB, $00, $01, $FF, $80, $03, $FF, $C0, $03, $3C, $C0, $03, $7E, $C0, $03, $FF, $C0, $01, $FF, $80, $00, $7E, $00, $00, $3C, $00, $00, $66, $00, $00, $C3, $00, $01, $81, $80, $03, $00, $C0, $06, $00, $60, $18, $00, $18, $30, $00, $0C, $60, $00, $06, $30, $00, $0C
sprite_frames_platformerEnemy_0:
  .byte $00, $00, $00, $00, $7E, $00, $01, $FF, $80, $03, $FF, $C0, $07, $E7, $E0, $07, $E7, $E0, $07, $FF, $E0, $07, $7E, $E0, $07, $FF, $E0, $03, $FF, $C0, $01, $FF, $80, $00, $FF, $00, $01, $BD, $80, $03, $18, $C0, $06, $18, $60, $0C, $18, $30, $18, $18, $18, $30, $18, $0C, $60, $18, $06, $60, $00, $06, $00, $00, $00
sprite_frames_platformerCoin_0:
  .byte $00, $00, $00, $00, $00, $00, $00, $18, $00, $00, $3C, $00, $00, $7E, $00, $00, $66, $00, $00, $66, $00, $00, $66, $00, $00, $66, $00, $00, $7E, $00, $00, $3C, $00, $00, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_map_collisions_0:
  .byte $00, $01, $02, $03, $04
asset_map_chars_0:
  .byte $20, $A0, $56, $5E, $48
asset_map_colors_0:
  .byte $00, $0E, $02, $05, $07
asset_rle_1:
  .byte $FF, $00, $01, $00
asset_rle_3:
  .byte $85, $00, $07, $01, $74, $00
asset_rle_5:
  .byte $1A, $00, $07, $01, $3B, $00, $06, $01, $9E, $00
asset_rle_7:
  .byte $1D, $00, $01, $03, $2A, $00, $0D, $01, $03, $02, $18, $01, $90, $00
asset_rle_9:
  .byte $4D, $00, $06, $01, $47, $00, $01, $04, $2D, $00, $07, $01, $1B, $00, $01, $04, $15, $00
asset_rle_11:
  .byte $31, $00, $07, $01, $02, $00, $01, $04, $1E, $00, $06, $01, $2B, $00, $01, $04, $0C, $00, $06, $01, $26, $00, $05, $01, $12, $00, $01, $04, $25, $00
asset_rle_13:
  .byte $16, $00, $01, $03, $13, $00, $01, $04, $15, $00, $11, $01, $04, $02, $15, $01, $04, $02, $22, $01, $70, $00
asset_rle_17:
  .byte $60, $00
sprite_sequence_0_idle-right:
  .byte $A0
sprite_sequence_0_idle-left:
  .byte $A0
sprite_sequence_0_run-right:
  .byte $A0, $A1
sprite_sequence_0_run-left:
  .byte $A1, $A0
sprite_sequence_0_jump-right:
  .byte $A1
sprite_sequence_0_jump-left:
  .byte $A1
sprite_sequence_1_enemy:
  .byte $A2
sprite_sequence_8_coin:
  .byte $A3
