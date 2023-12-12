# STUBB

Generate 'dist' during the development process to forward the package's entry file.

## Install

```bash
npm install --save-dev stubb
```

## Usage

### In the 'package.json' of the package in need:
```json
{
  // ...
  "scripts": {
    "stubb": "stubb"
  }
}
```

### Set entry file path (default: src/index):

```bash
stubb --entry path
stubb -e path

# Multiple Entry
stubb -e path,path,...
```

### Set output file name (default: dist):

If 'package.json -> exports/main/module/types' is set, ignore it.

```bash
stubb --output name
stubb -o name
```
