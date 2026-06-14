import { execa } from 'execa';
import { Theme, colorToHex } from '../themes/types.js';
import { mkdir, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

function colorToItermHex(c: { r: number; g: number; b: number }): string {
  const r = (c.r / 255).toFixed(6);
  const g = (c.g / 255).toFixed(6);
  const b = (c.b / 255).toFixed(6);
  return `0 1 ${r} ${g} ${b}`;
}

function generateItermColors(theme: Theme): string {
  const { colors } = theme;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>Ansi 0 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.black.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.black.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.black.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 1 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.red.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.red.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.red.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 2 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.green.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.green.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.green.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 3 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.yellow.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.yellow.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.yellow.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 4 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.blue.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.blue.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.blue.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 5 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.magenta.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.magenta.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.magenta.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 6 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.cyan.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.cyan.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.cyan.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 7 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.white.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.white.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.white.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 8 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightBlack.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightBlack.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightBlack.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 9 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightRed.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightRed.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightRed.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 10 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightGreen.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightGreen.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightGreen.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 11 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightYellow.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightYellow.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightYellow.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 12 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightBlue.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightBlue.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightBlue.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 13 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightMagenta.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightMagenta.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightMagenta.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 14 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightCyan.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightCyan.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightCyan.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Ansi 15 Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.brightWhite.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.brightWhite.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.brightWhite.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Background Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.background.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.background.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.background.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Bold Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.foreground.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.foreground.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.foreground.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Cursor Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.cursor.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.cursor.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.cursor.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Cursor Text Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.cursorText.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.cursorText.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.cursorText.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Foreground Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.foreground.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.foreground.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.foreground.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Selected Text Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.selectionText.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.selectionText.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.selectionText.b / 255).toFixed(6)}</real>
\t</dict>
\t<key>Selection Color</key>
\t<dict>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Red Component</key>
\t\t<real>${(colors.selection.r / 255).toFixed(6)}</real>
\t\t<key>Green Component</key>
\t\t<real>${(colors.selection.g / 255).toFixed(6)}</real>
\t\t<key>Blue Component</key>
\t\t<real>${(colors.selection.b / 255).toFixed(6)}</real>
\t</dict>
</dict>
</plist>`;
}

export async function applyIterm2(theme: Theme): Promise<void> {
  const dirName = theme.name.toLowerCase().replace(/\s+/g, '-');
  const dynamicProfilesDir = join(
    homedir(),
    'Library',
    'Application Support',
    'iTerm2',
    'DynamicProfiles'
  );

  await mkdir(dynamicProfilesDir, { recursive: true });

  const profile = {
    Profiles: [
      {
        Name: theme.name,
        Guid: `com.themer.${dirName}`,
        'Dynamic Profile Parent Name': 'Default Profile',
        Colors: {
          'Ansi 0 Color': colorToItermHex(theme.colors.black),
          'Ansi 1 Color': colorToItermHex(theme.colors.red),
          'Ansi 2 Color': colorToItermHex(theme.colors.green),
          'Ansi 3 Color': colorToItermHex(theme.colors.yellow),
          'Ansi 4 Color': colorToItermHex(theme.colors.blue),
          'Ansi 5 Color': colorToItermHex(theme.colors.magenta),
          'Ansi 6 Color': colorToItermHex(theme.colors.cyan),
          'Ansi 7 Color': colorToItermHex(theme.colors.white),
          'Ansi 8 Color': colorToItermHex(theme.colors.brightBlack),
          'Ansi 9 Color': colorToItermHex(theme.colors.brightRed),
          'Ansi 10 Color': colorToItermHex(theme.colors.brightGreen),
          'Ansi 11 Color': colorToItermHex(theme.colors.brightYellow),
          'Ansi 12 Color': colorToItermHex(theme.colors.brightBlue),
          'Ansi 13 Color': colorToItermHex(theme.colors.brightMagenta),
          'Ansi 14 Color': colorToItermHex(theme.colors.brightCyan),
          'Ansi 15 Color': colorToItermHex(theme.colors.brightWhite),
          'Background Color': colorToItermHex(theme.colors.background),
          'Foreground Color': colorToItermHex(theme.colors.foreground),
          'Cursor Color': colorToItermHex(theme.colors.cursor),
          'Cursor Text Color': colorToItermHex(theme.colors.cursorText),
          'Selection Color': colorToItermHex(theme.colors.selection),
          'Selected Text Color': colorToItermHex(theme.colors.selectionText),
          'Bold Color': colorToItermHex(theme.colors.foreground),
        },
      },
    ],
  };

  const profilePath = join(dynamicProfilesDir, `${dirName}.json`);
  await writeFile(profilePath, JSON.stringify(profile, null, 2));

  const switchScript = `
    tell application "iTerm"
      tell current session of current window
        set color preset to "${theme.name}"
      end tell
    end tell
  `;

  try {
    await execa('osascript', ['-e', switchScript]);
  } catch {
    console.log(`Profile "${theme.name}" created. Please switch to it in iTerm2 preferences.`);
  }
}

export async function getIterm2Themes(): Promise<string[]> {
  const profilesDir = join(
    homedir(),
    'Library',
    'Application Support',
    'iTerm2',
    'DynamicProfiles'
  );

  try {
    const files = await readdir(profilesDir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', '').replace(/-/g, ' '));
  } catch {
    return [];
  }
}
