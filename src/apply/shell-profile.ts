import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { Theme } from '../themes/types.js';
import { colorToHex } from '../themes/types.js';
import type { ShellInfo, ShellType } from '../shell.js';

const ZTHEME_MARKER_START = '# --- ztheme: ';
const ZTHEME_MARKER_END = '# --- ztheme end ---';

function getColorBlockLines(theme: Theme, shell: ShellType): string[] {
  const bg = colorToHex(theme.colors.background);
  const fg = colorToHex(theme.colors.foreground);
  const cursor = colorToHex(theme.colors.cursor);
  const colors = [
    ['0', theme.colors.black],
    ['1', theme.colors.red],
    ['2', theme.colors.green],
    ['3', theme.colors.yellow],
    ['4', theme.colors.blue],
    ['5', theme.colors.magenta],
    ['6', theme.colors.cyan],
    ['7', theme.colors.white],
    ['8', theme.colors.brightBlack],
    ['9', theme.colors.brightRed],
    ['10', theme.colors.brightGreen],
    ['11', theme.colors.brightYellow],
    ['12', theme.colors.brightBlue],
    ['13', theme.colors.brightMagenta],
    ['14', theme.colors.brightCyan],
    ['15', theme.colors.brightWhite],
  ] as const;

  const lines: string[] = [];

  if (shell === 'fish') {
    lines.push(`set -q TERM; and test "$TERM" != dumb; and begin`);
    lines.push(`  printf '\\033]10;${fg}\\033\\\\'       # foreground`);
    lines.push(`  printf '\\033]11;${bg}\\033\\\\'       # background`);
    lines.push(`  printf '\\033]12;${cursor}\\033\\\\'   # cursor`);
    for (const [idx, color] of colors) {
      const hex = colorToHex(color);
      lines.push(`  printf '\\033]4;${idx};${hex}\\033\\\\' # color ${idx}`);
    }
    lines.push('end');
  } else {
    lines.push('if [ -n "$TERM" ] && [ "$TERM" != dumb ]; then');
    lines.push(`  printf '\\033]10;${fg}\\033\\\\'       # foreground`);
    lines.push(`  printf '\\033]11;${bg}\\033\\\\'       # background`);
    lines.push(`  printf '\\033]12;${cursor}\\033\\\\'   # cursor`);
    for (const [idx, color] of colors) {
      const hex = colorToHex(color);
      lines.push(`  printf '\\033]4;${idx};${hex}\\033\\\\' # color ${idx}`);
    }
    lines.push('fi');
  }

  return lines;
}

function generateProfileBlock(theme: Theme, shell: ShellType): string {
  const header = `${ZTHEME_MARKER_START}${theme.name}`;
  const body = getColorBlockLines(theme, shell);
  const footer = ZTHEME_MARKER_END;
  return [header, ...body, footer].join('\n') + '\n';
}

export function applyShellProfile(theme: Theme, shell: ShellInfo): boolean {
  try {
    const existing: string = existsSync(shell.profilePath)
      ? readFileSync(shell.profilePath, 'utf-8')
      : '';

    const block = generateProfileBlock(theme, shell.type);

    const markerRegex = new RegExp(
      `${ZTHEME_MARKER_START}.+\\n[\\s\\S]*?${ZTHEME_MARKER_END}\\n?`,
    );

    let newContent: string;

    if (markerRegex.test(existing)) {
      newContent = existing.replace(markerRegex, block);
    } else {
      const trailingNewline = existing.endsWith('\n') ? '' : '\n';
      newContent = existing + trailingNewline + '\n' + block;
    }

    const dir = dirname(shell.profilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(shell.profilePath, newContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export function removeShellProfile(shell: ShellInfo): boolean {
  try {
    if (!existsSync(shell.profilePath)) return false;

    const existing = readFileSync(shell.profilePath, 'utf-8');
    const markerRegex = new RegExp(
      `${ZTHEME_MARKER_START}.+\\n[\\s\\S]*?${ZTHEME_MARKER_END}\\n?`,
    );

    if (!markerRegex.test(existing)) return false;

    const newContent = existing.replace(markerRegex, '');
    writeFileSync(shell.profilePath, newContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}
