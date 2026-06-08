  LDA #$93
  JSR $FFD2
  LDA #$03
  STA $D020
  LDA #$06
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
  JMP printat_loop_0
printat_done_1:
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0450,X
  LDA #$01
  STA $D850,X
  INX
  JMP printat_loop_2
printat_done_3:
  JMP sprite_setup
balloon_sprite_data:
  .byte $00, $7F, $00, $01, $FF, $C0, $03, $FF, $E0, $03, $FF, $E0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $07, $FF, $F0, $03, $FF, $E0, $03, $FF, $E0, $01, $FF, $C0, $00, $FF, $00, $00, $7E, $00, $00, $3C, $00, $00, $3C, $00, $00, $18, $00, $00, $24, $00, $00, $7E, $00, $00, $7E, $00, $00, $3C, $00
sprite_setup:
  LDX #$00
copy_balloon_sprite:
  LDA balloon_sprite_data,X
  STA $2000,X
  INX
  CPX #$3F
  BNE copy_balloon_sprite
  LDA #$80
  STA $07F8
  LDA #$78
  STA $D000
  LDA #$5A
  STA $D001
  LDA #$02
  STA $D027
  LDA #$01
  STA $D015
  RTS
; String pool
str_screen_0:
  .byte $03, $36, $34, $20, $08, $0F, $14, $20, $01, $09, $12, $20, $02, $01, $0C, $0C, $0F, $0F, $0E, $00
str_screen_1:
  .byte $13, $10, $12, $09, $14, $05, $20, $30, $20, $06, $12, $0F, $0D, $20, $14, $08, $05, $20, $15, $13, $05, $12, $20, $0D, $01, $0E, $15, $01, $0C, $00
