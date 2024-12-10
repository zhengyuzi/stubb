export const DEFAULT_FILENAME = 'index'

export const DEFAULT_ENTRY = `src/${DEFAULT_FILENAME}`

export const DEFAULT_OUTPUT_DIR = 'dist'

export const SUFFIX_JS = '.js'
export const SUFFIX_CJS = '.cjs'
export const SUFFIX_MJS = '.mjs'
export const SUFFIX_TS = '.d.ts'

export const OUTPUT_SUFFIXES = {
  cjs: [SUFFIX_JS, SUFFIX_CJS],
  esm: [SUFFIX_JS, SUFFIX_MJS],
  ts: [SUFFIX_TS],
}

export const EXPORT_CONTENT = {
  defaultExport: `export { default } from 'path'`,
  namedExport: `export * from 'path'`,
  moduleExport: `module.exports = require('path')`,
}

export const EXIT_CODE = {
  success: 0,
  invalidArgument: 9,
  fatalException: 1,
}
