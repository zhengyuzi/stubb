# stubb

![npm](https://img.shields.io/npm/v/stubb)
![NPM](https://img.shields.io/npm/l/stubb)

Stub ```dist``` link your project based on ```package.json``` during the development.

## Install

```bash
npm install --save-dev stubb
```

## Usage

In the 'package.json' of the package in need:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "stub": "stubb"
  }
}
```

Generate folders and files based on the ```main```, ```module```, ```types``` and ```exports``` in ```package.json```.

Default project structure:

```
|-- package
    |-- dist/
        |-- index.cjs
        |-- index.mjs
        |-- index.d.ts
    |-- src/
        |-- index.ts
    |-- package.json
```

Add ```entry``` in the ```exports``` field to modify the entry file:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "entry": "./test/index.ts"
    }
  },
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "stub": "stubb"
  }
}
```

if exposing multiple entry points:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./plugins": {
      "types": "./dist/plugins.d.ts",
      "import": "./dist/plugins.mjs",
      "require": "./dist/plugins.cjs"
    }
  },
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "stub": "stubb"
  }
}
```
