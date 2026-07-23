  LDX #$00
asset_map_initial_copy_2:
  LDA asset_bytes_1,X
  STA $C600,X
  INX
  CPX #$3C
  BNE asset_map_initial_copy_2
  LDA #$00
  STA $D020
  LDA #$06
  STA $D021
  LDX #$00
asset_charset_copy_4:
  LDA asset_bytes_3,X
  STA $3000,X
  INX
  BNE asset_charset_copy_4
  LDX #$00
asset_charset_copy_6:
  LDA asset_bytes_5,X
  STA $3100,X
  INX
  BNE asset_charset_copy_6
  LDX #$00
asset_charset_copy_7:
  LDA asset_bytes_5,X
  STA $3200,X
  INX
  BNE asset_charset_copy_7
  LDX #$00
asset_charset_copy_8:
  LDA asset_bytes_5,X
  STA $3300,X
  INX
  BNE asset_charset_copy_8
  LDX #$00
asset_charset_copy_9:
  LDA asset_bytes_5,X
  STA $3400,X
  INX
  BNE asset_charset_copy_9
  LDX #$00
asset_charset_copy_10:
  LDA asset_bytes_5,X
  STA $3500,X
  INX
  BNE asset_charset_copy_10
  LDX #$00
asset_charset_copy_11:
  LDA asset_bytes_5,X
  STA $3600,X
  INX
  BNE asset_charset_copy_11
  LDX #$00
asset_charset_copy_12:
  LDA asset_bytes_5,X
  STA $3700,X
  INX
  BNE asset_charset_copy_12
  LDA $DD00
  AND #$FC
  ORA #$03
  STA $DD00
  LDA $D018
  AND #$F1
  ORA #$0C
  STA $D018
  JSR runtime_map_redraw_0
  RTS
; Dynamic map 0: draw one changed metatile
runtime_map_draw_tile_0:
  LDA #$00
  STA $C7B6
  LDA $C7B3
  STA $C7B7
map_index_rows_renderer_0:
  LDA $C7B7
  BEQ map_index_done_renderer_0
  CLC
  LDA $C7B6
  ADC #$0A
  STA $C7B6
  DEC $C7B7
  JMP map_index_rows_renderer_0
map_index_done_renderer_0:
  CLC
  LDA $C7B6
  ADC $C7B2
  TAX
  LDA $C600,X
  STA $C7B4
  LDA $C7B4
  ASL A
  ASL A
  STA $C7B5
  LDA #$FA
  STA $FB
  LDA #$04
  STA $FC
  LDA $C7B3
  STA $C7B7
runtime_map_screen_y_loop_0:
  LDA $C7B7
  BEQ runtime_map_screen_y_done_0
  CLC
  LDA $FB
  ADC #$50
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  DEC $C7B7
  JMP runtime_map_screen_y_loop_0
runtime_map_screen_y_done_0:
  LDA #$00
  STA $C7B9
  LDA $C7B2
  STA $C7B7
runtime_map_screen_x_loop_0:
  LDA $C7B7
  BEQ runtime_map_screen_x_done_0
  CLC
  LDA $C7B9
  ADC #$02
  STA $C7B9
  DEC $C7B7
  JMP runtime_map_screen_x_loop_0
runtime_map_screen_x_done_0:
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
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_chars_0,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$01
  TAY
  LDA asset_map_colors_0,Y
  LDY #$01
  STA ($FD),Y
  CLC
  LDA $FB
  ADC #$28
  STA $FB
  LDA $FC
  ADC #$00
  STA $FC
  CLC
  LDA $FD
  ADC #$28
  STA $FD
  LDA $FE
  ADC #$00
  STA $FE
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_chars_0,Y
  LDY #$00
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$02
  TAY
  LDA asset_map_colors_0,Y
  LDY #$00
  STA ($FD),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_chars_0,Y
  LDY #$01
  STA ($FB),Y
  CLC
  LDA $C7B5
  ADC #$03
  TAY
  LDA asset_map_colors_0,Y
  LDY #$01
  STA ($FD),Y
  RTS
; Dynamic map 0: redraw every cell from runtime RAM
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
  CMP #$0A
  BNE runtime_map_redraw_column_0
  INC $C7B3
  LDA $C7B3
  CMP #$06
  BNE runtime_map_redraw_row_0
  RTS
; User data
asset_map_collisions_0:
  .byte $00, $01, $02
asset_map_chars_0:
  .byte $00, $00, $00, $00, $01, $01, $01, $01, $00, $02, $02, $00
asset_map_colors_0:
  .byte $06, $06, $06, $06, $0E, $0E, $0E, $0E, $06, $07, $07, $06
asset_bytes_1:
  .byte $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $00, $00, $02, $00, $00, $02, $00, $00, $01, $01, $00, $01, $01, $00, $00, $01, $01, $00, $01, $01, $02, $00, $00, $00, $00, $00, $00, $02, $01, $01, $00, $00, $01, $01, $01, $01, $00, $00, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
asset_bytes_3:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $FF, $81, $BD, $A5, $BD, $81, $FF, $00, $00, $00, $18, $3C, $3C, $18, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
asset_bytes_5:
  .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
