export type TerminalType =
  | 'mac-terminal'
  | 'iterm2'
  | 'vscode'
  | 'gnome-terminal'
  | 'konsole'
  | 'kitty'
  | 'alacritty'
  | 'wezterm'
  | 'ghostty'
  | 'mintty'
  | 'unknown';

export interface TerminalInfo {
  type: TerminalType;
  name: string;
  version?: string;
  supported: boolean;
}

export function detectTerminal(): TerminalInfo {
  const termProgram = process.env.TERM_PROGRAM;
  const term = process.env.TERM;
  const colorterm = process.env.COLORTERM;
  const termProgramVersion = process.env.TERM_PROGRAM_VERSION;

  if (termProgram === 'Apple_Terminal') {
    return {
      type: 'mac-terminal',
      name: 'Terminal.app',
      version: termProgramVersion,
      supported: true,
    };
  }

  if (termProgram === 'iTerm.app') {
    return {
      type: 'iterm2',
      name: 'iTerm2',
      version: termProgramVersion,
      supported: true,
    };
  }

  if (termProgram === 'vscode') {
    return {
      type: 'vscode',
      name: 'VS Code',
      version: termProgramVersion,
      supported: false,
    };
  }

  if (termProgram === 'WezTerm' || process.env.WEZTERM_PANE) {
    return {
      type: 'wezterm',
      name: 'WezTerm',
      supported: false,
    };
  }

  if (process.env.TERM_PROGRAM === 'mintty' || process.env.MSYSTEM) {
    return {
      type: 'mintty',
      name: 'mintty',
      supported: false,
    };
  }

  if (process.env.KITTY_PID) {
    return {
      type: 'kitty',
      name: 'Kitty',
      supported: false,
    };
  }

  if (process.env.ALACRITTY_SOCKET || process.env.ALACRITTY_WINDOW_ID) {
    return {
      type: 'alacritty',
      name: 'Alacritty',
      supported: false,
    };
  }

  if (process.env.GHOSTTY_RESOURCES_DIR) {
    return {
      type: 'ghostty',
      name: 'Ghostty',
      supported: false,
    };
  }

  if (process.platform === 'linux') {
    const linuxTerminal = detectLinuxTerminal();
    return linuxTerminal;
  }

  return {
    type: 'unknown',
    name: termProgram || term || 'Unknown Terminal',
    supported: false,
  };
}

function detectLinuxTerminal(): TerminalInfo {
  const desktopSession = process.env.DESKTOP_SESSION?.toLowerCase() || '';
  const xdgCurrentDesktop = process.env.XDG_CURRENT_DESKTOP?.toLowerCase() || '';

  if (desktopSession.includes('gnome') || xdgCurrentDesktop.includes('gnome')) {
    return {
      type: 'gnome-terminal',
      name: 'GNOME Terminal',
      supported: true,
    };
  }

  if (desktopSession.includes('kde') || xdgCurrentDesktop.includes('kde')) {
    return {
      type: 'konsole',
      name: 'Konsole',
      supported: true,
    };
  }

  return {
    type: 'unknown',
    name: 'Unknown Linux Terminal',
    supported: false,
  };
}
