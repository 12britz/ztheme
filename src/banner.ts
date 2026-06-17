function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function interpolateColor(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
): string {
  const r = Math.round(color1.r + factor * (color2.r - color1.r));
  const g = Math.round(color1.g + factor * (color2.g - color1.g));
  const b = Math.round(color1.b + factor * (color2.b - color1.b));
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function showBanner(): string {
  const rawBanner = `███████╗████████╗██╗  ██╗███████╗███╗   ███╗███████╗
╚══███╔╝╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝
  ███╔╝    ██║   ███████║█████╗  ██╔████╔██║█████╗  
 ███╔╝     ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝  
███████╗   ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝`;

  const color1 = hexToRgb('#a78bfa'); // violet
  const color2 = hexToRgb('#2dd4bf'); // teal

  const lines = rawBanner.split('\n');
  const coloredLines = lines.map((line) => {
    let result = '';
    const len = line.length;
    for (let i = 0; i < len; i++) {
      const char = line[i];
      if (char === ' ') {
        result += ' ';
      } else {
        const factor = len > 1 ? i / (len - 1) : 0.5;
        const ansiColor = interpolateColor(color1, color2, factor);
        result += `${ansiColor}${char}`;
      }
    }
    return result + '\x1b[0m';
  });

  return '\n' + coloredLines.join('\n') + '\n';
}
