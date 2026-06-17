#!/usr/bin/env node
import { showBanner } from './banner.js';
import { detectTerminal, type TerminalInfo } from './detect.js';
import { detectShell } from './shell.js';
import { applyShellProfile } from './apply/shell-profile.js';
import { Theme, colorToHex } from './themes/types.js';
import { allThemes } from './themes/index.js';
import { applyMacTerminal } from './apply/mac-terminal.js';
import { applyIterm2 } from './apply/iterm2.js';
import { applyGnomeTerminal } from './apply/gnome.js';
import { applyKonsole } from './apply/konsole.js';
import { select, confirm, Separator } from '@inquirer/prompts';
import chalk from 'chalk';

const args = process.argv.slice(2);
const command = args[0];

function renderThemeName(theme: Theme): string {
  return chalk.hex(colorToHex(theme.colors.foreground))(theme.name);
}

function renderCompactPreview(theme: Theme): string {
  const { colors } = theme;
  const bg = colorToHex(colors.background);
  const fg = colorToHex(colors.foreground);

  const paletteColors = [
    colors.black, colors.red, colors.green, colors.yellow,
    colors.blue, colors.magenta, colors.cyan, colors.white,
    colors.brightBlack, colors.brightRed, colors.brightGreen, colors.brightYellow,
    colors.brightBlue, colors.brightMagenta, colors.brightCyan, colors.brightWhite,
  ];

  const palette = paletteColors.map(c => chalk.bgHex(colorToHex(c))(' ')).join('');
  const title = chalk.bgHex(bg).hex(fg)(` ${theme.name} `);

  return [
    `  ${title}`,
    `  ${palette}`,
  ].join('\n');
}

async function applyToShellProfile(theme: Theme): Promise<void> {
  const shell = detectShell();
  if (shell.type === 'unknown') {
    console.log(chalk.yellow('  ⚠ Could not detect shell type.'));
    return;
  }

  console.log(`  Detected shell: ${chalk.bold(shell.name)} (${shell.profilePath})`);

  const shouldPersist = await confirm({
    message: 'Persist these colors in your shell profile for new terminals?',
    default: true,
  });

  if (!shouldPersist) {
    console.log(chalk.dim('  Skipped.'));
    return;
  }

  const ok = applyShellProfile(theme, shell);
  if (ok) {
    console.log(chalk.green(`  ✓ Theme written to ${shell.profilePath}`));
    console.log(chalk.dim('    Open a new terminal to see the colors.'));
  } else {
    console.log(chalk.red(`  ✗ Failed to write to ${shell.profilePath}`));
  }
}

async function applyTheme(theme: Theme, terminal: TerminalInfo): Promise<void> {
  console.log(`\n  Applying ${chalk.bold(theme.name)}...\n`);

  switch (terminal.type) {
    case 'mac-terminal':
      await applyMacTerminal(theme);
      break;
    case 'iterm2':
      await applyIterm2(theme);
      break;
    case 'gnome-terminal':
      await applyGnomeTerminal(theme);
      break;
    case 'konsole':
      await applyKonsole(theme);
      break;
    default:
      console.log(chalk.yellow('  ⚠ Direct theme application not supported for this terminal.'));
      console.log('  Please manually apply the colors using the values below:\n');
      console.log(JSON.stringify(theme.colors, null, 2));
      break;
  }

  console.log(chalk.green(`  ✓ Theme "${theme.name}" applied successfully!`));
}

function listThemes() {
  console.log(chalk.bold('\n  Available Themes:\n'));
  for (const theme of allThemes) {
    console.log(`  ${chalk.bold(renderThemeName(theme))}`);
  }
  console.log();
}

function showTheme(name: string) {
  const theme = allThemes.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (!theme) {
    console.error(chalk.red(`  Theme "${name}" not found.`));
    console.log('\n  Available themes:');
    for (const t of allThemes) {
      console.log(`    - ${t.name}`);
    }
    process.exit(1);
  }
  console.log(renderCompactPreview(theme));
}

async function applyByName(name: string) {
  const theme = allThemes.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (!theme) {
    console.error(chalk.red(`  Theme "${name}" not found.`));
    process.exit(1);
  }

  const terminal = detectTerminal();
  try {
    await applyTheme(theme, terminal);
    const shell = detectShell();
    if (shell.type !== 'unknown') {
      applyShellProfile(theme, shell);
      console.log(chalk.green(`  ✓ Theme persisted to ${shell.profilePath}`));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n  ✗ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
  ${chalk.bold('ztheme')} — Interactive terminal theme changer

  ${chalk.bold('Usage:')}
    ztheme                  Launch interactive mode
    ztheme list             List all available themes
    ztheme show <name>      Preview a specific theme
    ztheme apply <name>     Apply a theme directly
    ztheme help             Show this help message

  ${chalk.bold('Examples:')}
    ${chalk.dim('ztheme list')}
    ${chalk.dim('ztheme show dracula')}
    ${chalk.dim('ztheme apply "tokyo night"')}
  `);
}

async function main() {
  if (command === 'list') {
    listThemes();
    return;
  }

  if (command === 'show' && args[1]) {
    showTheme(args.slice(1).join(' '));
    return;
  }

  if (command === 'apply' && args[1]) {
    await applyByName(args.slice(1).join(' '));
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  console.clear();
  console.log(showBanner());
  console.log(chalk.dim('  Interactive terminal theme changer\n'));

  const terminal = detectTerminal();

  if (terminal.supported) {
    console.log(`  ${chalk.bold(terminal.name)}  ${chalk.green('✓')}`);
  } else {
    console.log(`  ${chalk.bold(terminal.name)}  ${chalk.yellow('⚠ limited')}`);
  }
  console.log();

  const popularThemes = allThemes.filter(t => t.category === 'popular');
  const classicThemes = allThemes.filter(t => t.category === 'classic');
  const lightThemes = allThemes.filter(t => t.category === 'light');

  const themeChoices: ({ name: string; value: Theme | null } | Separator)[] = [
    new Separator(chalk.dim(' ── Popular ─────────────────────')),
    ...popularThemes.map((t) => ({
      name: `  ${chalk.hex(colorToHex(t.colors.foreground))('◆')}  ${renderThemeName(t)}${t.author ? chalk.dim(` · ${t.author}`) : ''}`,
      value: t,
    })),
    new Separator(chalk.dim(' ── Classic ─────────────────────')),
    ...classicThemes.map((t) => ({
      name: `  ${chalk.hex(colorToHex(t.colors.foreground))('◆')}  ${renderThemeName(t)}${t.author ? chalk.dim(` · ${t.author}`) : ''}`,
      value: t,
    })),
    new Separator(chalk.dim(' ── Light ───────────────────────')),
    ...lightThemes.map((t) => ({
      name: `  ${chalk.hex(colorToHex(t.colors.foreground))('◆')}  ${renderThemeName(t)}${t.author ? chalk.dim(` · ${t.author}`) : ''}`,
      value: t,
    })),
    new Separator(),
    {
      name: chalk.dim('  Cancel'),
      value: null,
    },
  ];

  const selectedTheme = await select({
    message: 'Select a theme:',
    choices: themeChoices,
    pageSize: 14,
  });

  if (!selectedTheme) {
    console.log('  Cancelled.');
    return;
  }

  console.log('');
  console.log(renderCompactPreview(selectedTheme));
  console.log();

  const shouldApply = await confirm({
    message: 'Apply this theme?',
    default: true,
  });

  if (!shouldApply) {
    console.log('  Theme not applied.');
    return;
  }

  try {
    await applyTheme(selectedTheme, terminal);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n  ✗ Error: ${error.message}`));
    } else {
      console.error(chalk.red('\n  ✗ An unexpected error occurred'));
    }
    process.exit(1);
  }

  await applyToShellProfile(selectedTheme);
}

main().catch((error) => {
  console.error(chalk.red(`  Fatal error: ${error}`));
  process.exit(1);
});
