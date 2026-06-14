import { execa } from 'execa';
import { Theme, Color } from '../themes/types.js';

function colorToTerminal(color: Color): string {
  const r = Math.round(color.r * 257);
  const g = Math.round(color.g * 257);
  const b = Math.round(color.b * 257);
  return `{${r}, ${g}, ${b}}`;
}

async function profileExists(name: string): Promise<boolean> {
  const script = `
    tell application "Terminal"
      try
        name of settings set "${name}"
        return "exists"
      on error
        return "not found"
      end try
    end tell
  `;
  try {
    const result = await execa('osascript', ['-e', script]);
    return result.stdout.trim() === 'exists';
  } catch {
    return false;
  }
}

export async function applyMacTerminal(theme: Theme): Promise<void> {
  const profileName = `ztheme-${theme.name}`;

  if (!(await profileExists(profileName))) {
    const createScript = `
      tell application "Terminal"
        set newProfile to make new settings set at end of settings sets with properties {name:"${profileName}"}
      end tell
    `;
    try {
      await execa('osascript', ['-e', createScript]);
    } catch {
      throw new Error(`Failed to create profile "${profileName}" in Terminal.app.`);
    }

    const { colors } = theme;
    const colorScript = `
      tell application "Terminal"
        set p to settings set "${profileName}"
        set background color of p to ${colorToTerminal(colors.background)}
        set normal text color of p to ${colorToTerminal(colors.foreground)}
        set cursor color of p to ${colorToTerminal(colors.cursor)}
        set bold text color of p to ${colorToTerminal(colors.foreground)}
      end tell
    `;
    try {
      await execa('osascript', ['-e', colorScript]);
    } catch {
      throw new Error(`Failed to set colors for "${theme.name}".`);
    }
  }

  const applyScript = `
    tell application "Terminal"
      set current settings of front window to settings set "${profileName}"
    end tell
  `;
  try {
    await execa('osascript', ['-e', applyScript]);
  } catch {
    throw new Error(`Failed to apply theme "${theme.name}" to Terminal.app.`);
  }
}

export async function getMacTerminalThemes(): Promise<string[]> {
  const script = `
    tell application "Terminal"
      return name of every settings set
    end tell
  `;
  try {
    const result = await execa('osascript', ['-e', script]);
    return result.stdout.split(', ').map((s) => s.trim());
  } catch {
    return [];
  }
}
