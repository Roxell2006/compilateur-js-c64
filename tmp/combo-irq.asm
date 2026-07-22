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
  STA $0400,X
  LDA #$01
  STA $D800,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0450,X
  LDA #$01
  STA $D850,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $04A0,X
  LDA #$01
  STA $D8A0,X
  INX
  BNE printat_loop_4
printat_done_5:
  LDA #$0F
  STA $D418
  LDA #$40
  STA $D404
  LDA #$00
  STA $D402
  LDA #$08
  STA $D403
  LDA #$11
  STA $D405
  LDA #$F0
  STA $D406
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40C
  LDA #$D0
  STA $D40D
  LDA #$20
  STA $D412
  LDA #$11
  STA $D413
  LDA #$A0
  STA $D414
  LDA #$00
  STA $C0FE
  LDA #$00
  STA $C763
  LDA #$00
  STA $C764
  LDA #$01
  STA $C765
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$32
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
  LDA $C765
  BEQ sid_irq_body_done_jump_3
  LDA $C764
  BEQ sid_irq_body_process_jump_3
  DEC $C764
  JMP sid_irq_body_done_3
sid_irq_body_done_jump_3:
  JMP sid_irq_body_done_3
sid_irq_body_process_jump_3:
  JMP sid_irq_body_process_3
sid_irq_body_process_3:
  LDX $C763
  CPX #$08
  BNE sid_irq_body_stop_continue_3
  JMP sid_irq_body_stop_3
sid_irq_body_stop_continue_3:
  LDA sid_song_irq_body_3_v1_action,X
  BEQ sid_irq_body_voice1_rest_3
  CMP #$01
  BEQ sid_irq_body_voice1_hold_3
  LDA sid_song_irq_body_3_v1_lo,X
  STA $D400
  LDA sid_song_irq_body_3_v1_hi,X
  STA $D401
  LDA #$40
  STA $D404
  LDA #$41
  STA $D404
  JMP sid_irq_body_voice1_done_3
sid_irq_body_voice1_rest_3:
  LDA #$40
  STA $D404
  JMP sid_irq_body_voice1_done_3
sid_irq_body_voice1_hold_3:
; hold sid voice 1
sid_irq_body_voice1_done_3:
  LDA sid_song_irq_body_3_v2_action,X
  BEQ sid_irq_body_voice2_rest_3
  CMP #$01
  BEQ sid_irq_body_voice2_hold_3
  LDA sid_song_irq_body_3_v2_lo,X
  STA $D407
  LDA sid_song_irq_body_3_v2_hi,X
  STA $D408
  LDA #$10
  STA $D40B
  LDA #$11
  STA $D40B
  JMP sid_irq_body_voice2_done_3
sid_irq_body_voice2_rest_3:
  LDA #$10
  STA $D40B
  JMP sid_irq_body_voice2_done_3
sid_irq_body_voice2_hold_3:
; hold sid voice 2
sid_irq_body_voice2_done_3:
  LDA sid_song_irq_body_3_v3_action,X
  BEQ sid_irq_body_voice3_rest_3
  CMP #$01
  BEQ sid_irq_body_voice3_hold_3
  LDA sid_song_irq_body_3_v3_lo,X
  STA $D40E
  LDA sid_song_irq_body_3_v3_hi,X
  STA $D40F
  LDA #$20
  STA $D412
  LDA #$21
  STA $D412
  JMP sid_irq_body_voice3_done_3
sid_irq_body_voice3_rest_3:
  LDA #$20
  STA $D412
  JMP sid_irq_body_voice3_done_3
sid_irq_body_voice3_hold_3:
; hold sid voice 3
sid_irq_body_voice3_done_3:
  INC $C763
  LDA #$12
  STA $C764
  JMP sid_irq_body_done_3
sid_irq_body_stop_3:
  LDA #$00
  STA $C765
  LDA #$40
  STA $D404
  LDA #$10
  STA $D40B
  LDA #$20
  STA $D412
sid_irq_body_done_3:
  LDA #$02
  STA $D020
  LDA #$01
  STA $C0FE
  LDA #$96
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #$01
  STA $D019
  PLA
  TAY
  PLA
  TAX
  PLA
  RTI
irq_handler_1:
  LDA #$06
  STA $D020
  LDA #$00
  STA $C0FE
  LDA #$32
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #$01
  STA $D019
  PLA
  TAY
  PLA
  TAX
  PLA
  JMP $EA31
program_end:
  RTS
; String pool
str_screen_0:
  .byte $03, $0F, $0D, $02, $0F, $20, $09, $12, $11, $00
str_screen_1:
  .byte $0D, $15, $13, $09, $03, $20, $2B, $20, $12, $01, $13, $14, $05, $12, $00
str_screen_2:
  .byte $12, $05, $01, $04, $19, $20, $12, $05, $13, $14, $05, $20, $01, $03, $14, $09, $06, $00
; User data
sid_song_irq_body_3_v1_action:
  .byte $02, $02, $02, $02, $02, $02, $02, $00
sid_song_irq_body_3_v1_lo:
  .byte $67, $ED, $13, $CE, $13, $ED, $89, $00
sid_song_irq_body_3_v1_hi:
  .byte $11, $15, $1A, $22, $1A, $15, $13, $00
sid_song_irq_body_3_v2_action:
  .byte $02, $01, $02, $01, $02, $01, $02, $01
sid_song_irq_body_3_v2_lo:
  .byte $B4, $B4, $85, $85, $51, $51, $85, $85
sid_song_irq_body_3_v2_hi:
  .byte $08, $08, $06, $06, $07, $07, $06, $06
sid_song_irq_body_3_v3_action:
  .byte $02, $00, $02, $00, $02, $00, $02, $00
sid_song_irq_body_3_v3_lo:
  .byte $CE, $00, $DA, $00, $26, $00, $DA, $00
sid_song_irq_body_3_v3_hi:
  .byte $22, $00, $2B, $00, $34, $00, $2B, $00
