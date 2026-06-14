#!/usr/bin/env node
import { detectTerminal, type TerminalInfo } from './detect.js';
import { Theme, colorToHex } from './themes/types.js';
import { allThemes } from './themes/index.js';
import { applyMacTerminal } from './apply/mac-terminal.js';
import { applyIterm2 } from './apply/iterm2.js';
import { applyGnomeTerminal } from './apply/gnome.js';
import { applyKonsole } from './apply/konsole.js';
import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

const args = process.argv.slice(2);
const command = args[0];

function renderColorPreview(theme: Theme): string {
  const { colors } = theme;
  const lines: string[] = [];

  lines.push(chalk.bgHex(colorToHex(colors.background)).hex(colorToHex(colors.foreground))(` ${theme.name} `));
  lines.push('');

  const colorNames: Array<[string, { r: number; g: number; b: number }]> = [
    ['Black', colors.black],
    ['Red', colors.red],
    ['Green', colors.green],
    ['Yellow', colors.yellow],
    ['Blue', colors.blue],
    ['Magenta', colors.magenta],
    ['Cyan', colors.cyan],
    ['White', colors.white],
    ['Bright Black', colors.brightBlack],
    ['Bright Red', colors.brightRed],
    ['Bright Green', colors.brightGreen],
    ['Bright Yellow', colors.brightYellow],
    ['Bright Blue', colors.brightBlue],
    ['Bright Magenta', colors.brightMagenta],
    ['Bright Cyan', colors.brightCyan],
    ['Bright White', colors.brightWhite],
  ];

  for (const [name, color] of colorNames) {
    const hex = colorToHex(color);
    lines.push(
      `  ${chalk.bgHex(hex).hex(hex === '#000000' ? '#ffffff' : '#000000')('  ')} ${chalk.hex(colorToHex(colors.foreground))(name)}`
    );
  }

  return lines.join('\n');
}

async function applyTheme(theme: Theme, terminal: TerminalInfo): Promise<void> {
  console.log(`\nApplying ${chalk.bold(theme.name)} theme...\n`);

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
      console.log(chalk.yellow('⚠ Direct theme application not supported for this terminal.'));
      console.log('Please manually apply the colors using the values below:\n');
      console.log(JSON.stringify(theme.colors, null, 2));
      return;
  }

  console.log(chalk.green(`✓ Theme "${theme.name}" applied successfully!`));
}

function listThemes() {
  console.log(chalk.bold.cyan('\nAvailable Themes:\n'));
  for (const theme of allThemes) {
    const author = theme.author ? chalk.dim(` by ${theme.author}`) : '';
    console.log(`  ${chalk.bold(theme.name)}${author}`);
  }
  console.log();
}

function showTheme(name: string) {
  const theme = allThemes.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (!theme) {
    console.error(chalk.red(`Theme "${name}" not found.`));
    console.log('\nAvailable themes:');
    for (const t of allThemes) {
      console.log(`  - ${t.name}`);
    }
    process.exit(1);
  }
  console.log(renderColorPreview(theme));
}

async function applyByName(name: string) {
  const theme = allThemes.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (!theme) {
    console.error(chalk.red(`Theme "${name}" not found.`));
    process.exit(1);
  }

  const terminal = detectTerminal();
  try {
    await applyTheme(theme, terminal);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${chalk.bold.cyan('ztheme')} - Interactive terminal theme changer

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
  console.log(chalk.bold.cyan('╔══════════════════════════════╗'));
  console.log(chalk.bold.cyan('║        ztheme               ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════╝'));
  console.log();

  const terminal = detectTerminal();

  console.log(`Detected terminal: ${chalk.bold(terminal.name)}`);
  if (terminal.supported) {
    console.log(chalk.green('  ✓ Direct theme switching supported'));
  } else {
    console.log(chalk.yellow('  ⚠ Limited support - colors will be shown for manual setup'));
  }
  console.log();

  const themeChoices = allThemes.map((t) => ({
    name: `${t.name}${t.author ? ` (by ${t.author})` : ''}`,
    value: t,
  }));

  const selectedTheme = await select({
    message: 'Select a theme:',
    choices: [
      ...themeChoices,
      {
        name: chalk.dim('— Cancel —'),
        value: null,
      },
    ],
  });

  if (!selectedTheme) {
    console.log('Cancelled.');
    return;
  }

  console.log('\n');
  console.log(renderColorPreview(selectedTheme));
  console.log();

  const shouldApply = await confirm({
    message: 'Apply this theme?',
    default: true,
  });

  if (!shouldApply) {
    console.log('Theme not applied.');
    return;
  }

  try {
    await applyTheme(selectedTheme, terminal);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
    } else {
      console.error(chalk.red('\n✗ An unexpected error occurred'));
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(`Fatal error: ${error}`));
  process.exit(1);
});
