export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Theme {
  name: string;
  author?: string;
  colors: {
    background: Color;
    foreground: Color;
    cursor: Color;
    cursorText: Color;
    selection: Color;
    selectionText: Color;
    black: Color;
    red: Color;
    green: Color;
    yellow: Color;
    blue: Color;
    magenta: Color;
    cyan: Color;
    white: Color;
    brightBlack: Color;
    brightRed: Color;
    brightGreen: Color;
    brightYellow: Color;
    brightBlue: Color;
    brightMagenta: Color;
    brightCyan: Color;
    brightWhite: Color;
  };
}

export function colorToHex(c: Color): string {
  return `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;
}

export function hexToColor(hex: string): Color {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}
