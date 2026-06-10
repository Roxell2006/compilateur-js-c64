  LDA #$93
  JSR $FFD2
  LDA #$0E
  STA $D020
  LDA #$06
  STA $D021
  LDA #$01
  STA $0286
  LDA #$06
  STA $0286
  LDA #$93
  JSR $FFD2
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0435,X
  LDA #$01
  STA $D835,X
  INX
  BNE printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0482,X
  LDA #$01
  STA $D882,X
  INX
  BNE printat_loop_2
printat_done_3:
  LDX #$00
copydata_2000_sprite_data_0_0_63_4:
  LDA sprite_data_0_0,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copydata_2000_sprite_data_0_0_63_4
  LDA #$80
  STA $07F8
  LDA #$02
  STA $D027
  LDA $D01D
  ORA #$01
  STA $D01D
  LDA $D017
  ORA #$01
  STA $D017
  LDA #$20
  STA $D000
  LDA $D010
  AND #$FE
  STA $D010
  LDA #$5A
  STA $D001
  LDA $D015
  ORA #$01
  STA $D015
  LDX #$00
copydata_c300_sprite_anim_init_0_1_8_5:
  LDA sprite_anim_init_0_1,X
  STA $C300,X
  INX
  CPX #$08
  BNE copydata_c300_sprite_anim_init_0_1_8_5
  SEI
  LDA #$01
  STA $D01A
  LDA #$01
  STA $D019
  LDA #$FA
  STA $D012
  LDA $D011
  AND #$7F
  STA $D011
  LDA #<sprite_animator_irq
  STA $0314
  LDA #>sprite_animator_irq
  STA $0315
  CLI
  JMP program_end_after_animator
; Sprite animator IRQ
sprite_animator_irq:
  PHA
  TXA
  PHA
  TYA
  PHA
  LDA $C301
  CMP $C303
  BEQ sprite_x_check_low_0_x
  BCC sprite_x_inc_0_x
  JMP sprite_x_dec_0_x
sprite_x_check_low_0_x:
  LDA $C300
  CMP $C302
  BEQ sprite_x_equal_0_x
  BCC sprite_x_inc_0_x
  JMP sprite_x_dec_0_x
sprite_x_equal_0_x:
  JMP sprite_x_done_0_x
sprite_x_inc_0_x:
  CLC
  LDA $C300
  ADC $C304
  STA $C300
  LDA $C301
  ADC #$00
  STA $C301
  LDA $C301
  CMP $C303
  BCC sprite_x_write_0_x
  BNE sprite_x_clamp_high_0_x
  LDA $C300
  CMP $C302
  BCC sprite_x_write_0_x
sprite_x_clamp_high_0_x:
  LDA $C302
  STA $C300
  LDA $C303
  STA $C301
  JMP sprite_x_write_0_x
sprite_x_dec_0_x:
  SEC
  LDA $C300
  SBC $C304
  STA $C300
  LDA $C301
  SBC #$00
  STA $C301
  LDA $C301
  CMP $C303
  BCC sprite_x_clamp_low_0_x
  BNE sprite_x_write_0_x
  LDA $C300
  CMP $C302
  BCS sprite_x_write_0_x
sprite_x_clamp_low_0_x:
  LDA $C302
  STA $C300
  LDA $C303
  STA $C301
sprite_x_write_0_x:
  LDA $C300
  STA $D000
  LDA $D010
  AND #$FE
  STA $D010
  LDA $C301
  BEQ sprite_x_clear_0_49920_49921
  LDA $D010
  ORA #$01
  STA $D010
  JMP sprite_x_end_0_49920_49921
sprite_x_clear_0_49920_49921:
  NOP
sprite_x_end_0_49920_49921:
sprite_x_done_0_x:
  NOP
  LDA $C305
  CMP $C306
  BEQ sprite_y_equal_0_y
  BCC sprite_y_inc_0_y
  JMP sprite_y_dec_0_y
sprite_y_equal_0_y:
  JMP sprite_y_done_0_y
sprite_y_inc_0_y:
  CLC
  LDA $C305
  ADC $C307
  STA $C305
  CMP $C306
  BCC sprite_y_write_0_y
sprite_y_clamp_high_0_y:
  LDA $C306
  STA $C305
  JMP sprite_y_write_0_y
sprite_y_dec_0_y:
  SEC
  LDA $C305
  SBC $C307
  STA $C305
  CMP $C306
  BCS sprite_y_write_0_y
sprite_y_clamp_low_0_y:
  LDA $C306
  STA $C305
sprite_y_write_0_y:
  LDA $C305
  STA $D001
sprite_y_done_0_y:
  NOP
  LDA #$FA
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
program_end_after_animator:
  RTS
; String pool
str_screen_0:
  .byte $13, $10, $12, $09, $14, $05, $20, $01, $0E, $09, $0D, $01, $14, $05, $00
str_screen_1:
  .byte $02, $01, $0C, $0C, $0F, $0F, $0E, $20, $14, $0F, $20, $14, $08, $05, $20, $12, $09, $07, $08, $14, $00
; User data
sprite_data_0_0:
  .byte $00, $7F, $00, $01, $FF, $C0, $03, $FF, $E0, $03, $FF, $E0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $03, $FF, $E0, $03, $FF, $E0, $01, $FF, $C0, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $3C, $00, $00, $18, $00, $00, $24, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00
sprite_anim_init_0_1:
  .byte $20, $00, $F0, $00, $02, $5A, $3C, $01
