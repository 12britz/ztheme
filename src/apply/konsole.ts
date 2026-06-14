import { execa } from 'execa';
import { Theme, colorToHex } from '../themes/types.js';
import { writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

function colorToKonsoleHex(c: { r: number; g: number; b: number }): string {
  return `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;
}

function generateKonsoleColorscheme(theme: Theme): string {
  const { colors } = theme;
  return `[General]
Description=${theme.name}
Name=${theme.name}

[Background]
Color=${colorToKonsoleHex(colors.background)}

[BackgroundFaint]
Color=${colorToKonsoleHex(colors.background)}

[BackgroundIntense]
Color=${colorToKonsoleHex(colors.background)}

[Color0]
Color=${colorToKonsoleHex(colors.black)}

[Color0Faint]
Color=${colorToKonsoleHex(colors.black)}

[Color0Intense]
Color=${colorToKonsoleHex(colors.brightBlack)}

[Color1]
Color=${colorToKonsoleHex(colors.red)}

[Color1Faint]
Color=${colorToKonsoleHex(colors.red)}

[Color1Intense]
Color=${colorToKonsoleHex(colors.brightRed)}

[Color2]
Color=${colorToKonsoleHex(colors.green)}

[Color2Faint]
Color=${colorToKonsoleHex(colors.green)}

[Color2Intense]
Color=${colorToKonsoleHex(colors.brightGreen)}

[Color3]
Color=${colorToKonsoleHex(colors.yellow)}

[Color3Faint]
Color=${colorToKonsoleHex(colors.yellow)}

[Color3Intense]
Color=${colorToKonsoleHex(colors.brightYellow)}

[Color4]
Color=${colorToKonsoleHex(colors.blue)}

[Color4Faint]
Color=${colorToKonsoleHex(colors.blue)}

[Color4Intense]
Color=${colorToKonsoleHex(colors.brightBlue)}

[Color5]
Color=${colorToKonsoleHex(colors.magenta)}

[Color5Faint]
Color=${colorToKonsoleHex(colors.magenta)}

[Color5Intense]
Color=${colorToKonsoleHex(colors.brightMagenta)}

[Color6]
Color=${colorToKonsoleHex(colors.cyan)}

[Color6Faint]
Color=${colorToKonsoleHex(colors.cyan)}

[Color6Intense]
Color=${colorToKonsoleHex(colors.brightCyan)}

[Color7]
Color=${colorToKonsoleHex(colors.white)}

[Color7Faint]
Color=${colorToKonsoleHex(colors.white)}

[Color7Intense]
Color=${colorToKonsoleHex(colors.brightWhite)}

[Foreground]
Color=${colorToKonsoleHex(colors.foreground)}

[ForegroundFaint]
Color=${colorToKonsoleHex(colors.foreground)}

[ForegroundIntense]
Color=${colorToKonsoleHex(colors.foreground)}

[General]
Blur=false
ColorRandomization=false
Description=${theme.name}
Name=${theme.name}
Opacity=1

[Selection]
Background=${colorToKonsoleHex(colors.selection)}
Color=${colorToKonsoleHex(colors.selectionText)}

[TerminalColor]
Color=${colorToKonsoleHex(colors.cursor)}

[TerminalColorBackground]
Color=${colorToKonsoleHex(colors.cursorText)}
`;
}

export async function applyKonsole(theme: Theme): Promise<void> {
  const konsoleDir = join(homedir(), '.local', 'share', 'konsole');
  const fileName = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.colorscheme`;
  const filePath = join(konsoleDir, fileName);

  await writeFile(filePath, generateKonsoleColorscheme(theme));

  try {
    const pidResult = await execa('qdbus', [
      'org.kde.konsole',
      '/Windows/1',
      'org.kde.konsole.mainWindow.activeSession',
    ]);

    await execa('qdbus', [
      'org.kde.konsole',
      '/Windows/1',
      'org.kde.KParts.Window.setActiveColorScheme',
      theme.name,
    ]);
  } catch {
    console.log(
      `Color scheme "${theme.name}" saved. Please restart Konsole or select it from Settings > Edit Current Profile > Appearance.`
    );
  }
}

export async function getKonsoleThemes(): Promise<string[]> {
  const konsoleDir = join(homedir(), '.local', 'share', 'konsole');

  try {
    const files = await readdir(konsoleDir);
    return files
      .filter((f) => f.endsWith('.colorscheme'))
      .map((f) => f.replace('.colorscheme', '').replace(/-/g, ' '));
  } catch {
    return [];
  }
}
