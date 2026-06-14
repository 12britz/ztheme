import { execa } from 'execa';
import { Theme, colorToHex } from '../themes/types.js';

function colorToGnomeHex(c: { r: number; g: number; b: number }): string {
  return `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;
}

async function getActiveProfile(): Promise<string | null> {
  try {
    const result = await execa('gsettings', [
      'get',
      'org.gnome.Terminal.ProfilesList',
      'list',
    ]);
    const profiles = result.stdout
      .replace(/^\[|]$/g, '')
      .split(',')
      .map((p) => p.trim().replace(/'/g, ''));
    return profiles[0] || null;
  } catch {
    return null;
  }
}

export async function applyGnomeTerminal(theme: Theme): Promise<void> {
  const profile = await getActiveProfile();
  if (!profile) {
    throw new Error('No GNOME Terminal profile found.');
  }

  const basePath = `/org/gnome/terminal/legacy/profiles:/:${profile}`;

  const settings: [string, string][] = [
    ['background-color', colorToGnomeHex(theme.colors.background)],
    ['foreground-color', colorToGnomeHex(theme.colors.foreground)],
    ['cursor-colors-set', 'true'],
    ['cursor-background-color', colorToGnomeHex(theme.colors.cursor)],
    ['cursor-foreground-color', colorToGnomeHex(theme.colors.cursorText)],
    ['highlight-colors-set', 'true'],
    ['highlight-background-color', colorToGnomeHex(theme.colors.selection)],
    ['highlight-foreground-color', colorToGnomeHex(theme.colors.selectionText)],
    ['bold-color-same-as-fg', 'true'],
    ['use-theme-colors', 'false'],
  ];

  for (const [key, value] of settings) {
    await execa('dconf', ['write', `${basePath}/${key}`, `'${value}'`]);
  }

  const palette = [
    theme.colors.black,
    theme.colors.red,
    theme.colors.green,
    theme.colors.yellow,
    theme.colors.blue,
    theme.colors.magenta,
    theme.colors.cyan,
    theme.colors.white,
    theme.colors.brightBlack,
    theme.colors.brightRed,
    theme.colors.brightGreen,
    theme.colors.brightYellow,
    theme.colors.brightBlue,
    theme.colors.brightMagenta,
    theme.colors.brightCyan,
    theme.colors.brightWhite,
  ].map(colorToGnomeHex);

  await execa('dconf', [
    'write',
    `${basePath}/palette`,
    `[${palette.map((c) => `'${c}'`).join(', ')}]`,
  ]);
}

export async function getGnomeTerminalThemes(): Promise<string[]> {
  const profile = await getActiveProfile();
  if (!profile) return [];

  const basePath = `/org/gnome/terminal/legacy/profiles:/:${profile}`;

  try {
    const result = await execa('dconf', ['read', `${basePath}/visible-name`]);
    return [result.stdout.replace(/'/g, '')];
  } catch {
    return [];
  }
}
