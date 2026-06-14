# ztheme

Interactive terminal theme changer — one command, any terminal.

## Features

- Interactive theme selection with color previews
- Direct theme switching for supported terminals
- Cross-platform support (macOS, Linux)
- Built-in popular themes (Dracula, Nord, Gruvbox, Tokyo Night, Catppuccin, Solarized, Monokai)

## Supported Terminals

| Terminal | Platform | Status |
|----------|----------|--------|
| Terminal.app | macOS | ✓ Full support |
| iTerm2 | macOS | ✓ Full support |
| GNOME Terminal | Linux | ✓ Full support |
| Konsole | Linux | ✓ Full support |
| VS Code | Cross-platform | Manual colors |
| Kitty | Cross-platform | Manual colors |
| Alacritty | Cross-platform | Manual colors |

## Installation

```bash
npm install -g ztheme
```

Or link locally:

```bash
git clone <repo>
cd ztheme
npm install
npm link
```

## Usage

### Interactive Mode

```bash
ztheme
```

Launches an interactive menu to browse and apply themes.

### List Themes

```bash
ztheme list
```

### Preview a Theme

```bash
ztheme show dracula
ztheme show "tokyo night"
```

### Apply a Theme Directly

```bash
ztheme apply dracula
ztheme apply nord
```

### Help

```bash
ztheme help
```

## Supported Themes

| Theme | Author |
|-------|--------|
| Dracula | Zeno Rocha |
| Nord | Arctic Ice Studio |
| Gruvbox Dark | Pablo Olmos de Aguilera |
| Tokyo Night | Enkia |
| Catppuccin Mocha | Catppuccin |
| Solarized Dark | Ethan Schoonover |
| Monokai | Wimer Hazenberg |

## Development

```bash
npm install
npm run build
npm run dev  # Watch mode
```

## License

MIT
