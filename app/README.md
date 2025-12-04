# clickr

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Prod

Can test server side output by running the .exe through a cmd line.


### Logging
Logs are currently stored in the current locations:
On Linux: ~/.config/clickr/logs/main.log
On Windows: %USERPROFILE%\AppData\Roaming clickr\logs\main.log
On macOS: ~/Library/Application Support/clickr/logs/main.log

### Testing
All test files should be in the /tests/ directory and MUST be named with the following convention "name.test.ts"
Run the tests with the command "npx jest"
