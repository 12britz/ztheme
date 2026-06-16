import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export type ShellType = 'bash' | 'zsh' | 'ash' | 'fish' | 'unknown';

export interface ShellInfo {
  type: ShellType;
  name: string;
  profilePath: string;
}

function resolveProfilePath(filename: string): string {
  const home = homedir();
  const path = join(home, filename);
  const alt = filename.startsWith('.') ? join(home, filename) : '';
  if (existsSync(path)) return path;
  if (alt && existsSync(alt)) return alt;
  return path;
}

export function detectShell(): ShellInfo {
  const shellEnv = (process.env.SHELL || '').toLowerCase();
  const home = homedir();

  if (shellEnv.includes('zsh')) {
    return {
      type: 'zsh',
      name: 'Zsh',
      profilePath: resolveProfilePath('.zshrc'),
    };
  }

  if (shellEnv.includes('fish')) {
    const fishDir = join(home, '.config', 'fish');
    return {
      type: 'fish',
      name: 'Fish',
      profilePath: join(fishDir, 'config.fish'),
    };
  }

  if (shellEnv.includes('ash') || shellEnv.includes('busybox')) {
    return {
      type: 'ash',
      name: 'Ash',
      profilePath: resolveProfilePath('.profile'),
    };
  }

  if (shellEnv.includes('bash')) {
    const platform = process.platform;
    const bashrc = resolveProfilePath('.bashrc');
    const bashProfile = resolveProfilePath('.bash_profile');
    const profile = resolveProfilePath('.profile');

    if (platform === 'darwin') {
      return {
        type: 'bash',
        name: 'Bash',
        profilePath: existsSync(bashProfile) ? bashProfile : profile,
      };
    }

    return {
      type: 'bash',
      name: 'Bash',
      profilePath: existsSync(bashrc) ? bashrc : (existsSync(bashProfile) ? bashProfile : profile),
    };
  }

  if (shellEnv.includes('sh') || !shellEnv) {
    return {
      type: 'ash',
      name: 'POSIX sh',
      profilePath: resolveProfilePath('.profile'),
    };
  }

  return {
    type: 'unknown',
    name: shellEnv || 'Unknown',
    profilePath: resolveProfilePath('.profile'),
  };
}
