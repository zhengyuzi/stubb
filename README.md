# stubb

![npm](https://img.shields.io/npm/v/stubb)
![NPM](https://img.shields.io/npm/l/stubb)

Stub ```dist``` link your project during the development.

## Install

```bash
npm install --save-dev stubb
```

## Usage

In the ```package.json``` of the package in need:

```json
{
  "scripts": {
    "stub": "stubb"
  }
}
```

Default project structure:

```
|-- package
    |-- dist/
        |-- index.js
        |-- index.cjs
        |-- index.mjs
        |-- index.d.ts
    |-- src/
        |-- index.ts
    |-- package.json
```

## Options

### entries

Set one or more entry paths. Default: ```src/index```

```json
{
  "scripts": {
    "stub": "stubb test/index,test/plugins"
  }
}
```

### outputDir

The folder name/path of the output file. Default: ```dist```

```json
{
  "scripts": {
    "stub": "stubb --outputDir=ouput"
  }
}
```

### fill

Auto fill in exports/main/module/types in package.json. Default: ```false```

```json
{
  "scripts": {
    "stub": "stubb --fill"
  }
}
```

### esm

Open esm. Default: ```true```

### cjs

Open cjs. Default: ```true```

### ts

Open types. Default: ```true```
