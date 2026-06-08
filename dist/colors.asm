  LDA #$93
  JSR $FFD2
  LDA #$00
  STA $D021
  LDA #$00
  STA $D020
  LDA #$00
  STA $0286
  LDX #$00
printat_loop_0:
  LDA str_screen_0,X
  BEQ printat_done_1
  STA $0400,X
  LDA #$00
  STA $D800,X
  INX
  JMP printat_loop_0
printat_done_1:
  LDA #$01
  STA $0286
  LDX #$00
printat_loop_2:
  LDA str_screen_1,X
  BEQ printat_done_3
  STA $0428,X
  LDA #$01
  STA $D828,X
  INX
  JMP printat_loop_2
printat_done_3:
  LDA #$02
  STA $0286
  LDX #$00
printat_loop_4:
  LDA str_screen_2,X
  BEQ printat_done_5
  STA $0450,X
  LDA #$02
  STA $D850,X
  INX
  JMP printat_loop_4
printat_done_5:
  LDA #$03
  STA $0286
  LDX #$00
printat_loop_6:
  LDA str_screen_3,X
  BEQ printat_done_7
  STA $0478,X
  LDA #$03
  STA $D878,X
  INX
  JMP printat_loop_6
printat_done_7:
  LDA #$04
  STA $0286
  LDX #$00
printat_loop_8:
  LDA str_screen_4,X
  BEQ printat_done_9
  STA $04A0,X
  LDA #$04
  STA $D8A0,X
  INX
  JMP printat_loop_8
printat_done_9:
  LDA #$05
  STA $0286
  LDX #$00
printat_loop_10:
  LDA str_screen_5,X
  BEQ printat_done_11
  STA $04C8,X
  LDA #$05
  STA $D8C8,X
  INX
  JMP printat_loop_10
printat_done_11:
  LDA #$06
  STA $0286
  LDX #$00
printat_loop_12:
  LDA str_screen_6,X
  BEQ printat_done_13
  STA $04F0,X
  LDA #$06
  STA $D8F0,X
  INX
  JMP printat_loop_12
printat_done_13:
  LDA #$07
  STA $0286
  LDX #$00
printat_loop_14:
  LDA str_screen_7,X
  BEQ printat_done_15
  STA $0518,X
  LDA #$07
  STA $D918,X
  INX
  JMP printat_loop_14
printat_done_15:
  LDA #$08
  STA $0286
  LDX #$00
printat_loop_16:
  LDA str_screen_8,X
  BEQ printat_done_17
  STA $0540,X
  LDA #$08
  STA $D940,X
  INX
  JMP printat_loop_16
printat_done_17:
  LDA #$09
  STA $0286
  LDX #$00
printat_loop_18:
  LDA str_screen_9,X
  BEQ printat_done_19
  STA $0568,X
  LDA #$09
  STA $D968,X
  INX
  JMP printat_loop_18
printat_done_19:
  LDA #$0A
  STA $0286
  LDX #$00
printat_loop_20:
  LDA str_screen_10,X
  BEQ printat_done_21
  STA $0590,X
  LDA #$0A
  STA $D990,X
  INX
  JMP printat_loop_20
printat_done_21:
  LDA #$0B
  STA $0286
  LDX #$00
printat_loop_22:
  LDA str_screen_11,X
  BEQ printat_done_23
  STA $05B8,X
  LDA #$0B
  STA $D9B8,X
  INX
  JMP printat_loop_22
printat_done_23:
  LDA #$0C
  STA $0286
  LDX #$00
printat_loop_24:
  LDA str_screen_12,X
  BEQ printat_done_25
  STA $05E0,X
  LDA #$0C
  STA $D9E0,X
  INX
  JMP printat_loop_24
printat_done_25:
  LDA #$0D
  STA $0286
  LDX #$00
printat_loop_26:
  LDA str_screen_13,X
  BEQ printat_done_27
  STA $0608,X
  LDA #$0D
  STA $DA08,X
  INX
  JMP printat_loop_26
printat_done_27:
  LDA #$0E
  STA $0286
  LDX #$00
printat_loop_28:
  LDA str_screen_14,X
  BEQ printat_done_29
  STA $0630,X
  LDA #$0E
  STA $DA30,X
  INX
  JMP printat_loop_28
printat_done_29:
  LDA #$0F
  STA $0286
  LDX #$00
printat_loop_30:
  LDA str_screen_15,X
  BEQ printat_done_31
  STA $0658,X
  LDA #$0F
  STA $DA58,X
  INX
  JMP printat_loop_30
printat_done_31:
  RTS
; String pool
str_screen_0:
  .byte $03, $0F, $0C, $0F, $12, $20, $30, $00
str_screen_1:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $00
str_screen_2:
  .byte $03, $0F, $0C, $0F, $12, $20, $32, $00
str_screen_3:
  .byte $03, $0F, $0C, $0F, $12, $20, $33, $00
str_screen_4:
  .byte $03, $0F, $0C, $0F, $12, $20, $34, $00
str_screen_5:
  .byte $03, $0F, $0C, $0F, $12, $20, $35, $00
str_screen_6:
  .byte $03, $0F, $0C, $0F, $12, $20, $36, $00
str_screen_7:
  .byte $03, $0F, $0C, $0F, $12, $20, $37, $00
str_screen_8:
  .byte $03, $0F, $0C, $0F, $12, $20, $38, $00
str_screen_9:
  .byte $03, $0F, $0C, $0F, $12, $20, $39, $00
str_screen_10:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $30, $00
str_screen_11:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $31, $00
str_screen_12:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $32, $00
str_screen_13:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $33, $00
str_screen_14:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $34, $00
str_screen_15:
  .byte $03, $0F, $0C, $0F, $12, $20, $31, $35, $00
