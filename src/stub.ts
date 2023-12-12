import process from 'node:process'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import pathParse from 'path-parse'
import type { PackageJsonExports, ParsedArgsOption } from './types'
import { ExitCode, stubbDefaultConfig } from './config'

export default async function stubb(option: ParsedArgsOption) {
  try {
    /**
     * Capture global errors
     */
    process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler)

    /**
     * Entry files
     */
    const entries = option.entry?.split(stubbDefaultConfig.separator) || [stubbDefaultConfig.entry]

    const entryFiles = await checkEntries(entries)

    /**
     * Find package.json
     */
    const { exports, main, module, types } = await fs.readJson('./package.json')

    if (exports) {
      /**
       * package.json -> exports
       */
      const _exports = Object.values(exports) as PackageJsonExports[]

      for (let index = 0; index < _exports.length; index++) {
        const entryFile = entryFiles[index]
        if (entryFile) {
          const { path } = entryFile
          const _export = _exports[index]
          await writeIn(_export, path)
        }
        else {
          console.warn(`WARNING: The entry path must be set correctly in order according to 'package.json -> exports'`)
        }
      }
    }
    else if (main || module || types) {
      const entryFile = entryFiles[0]
      if (entryFile) {
        const { path } = entryFile
        await writeIn({
          import: module,
          require: main,
          types,
        }, path)
      }
    }
    else {
      /**
       * Based on entry files without exports/main/module/types
       */
      for (const entryFile of entryFiles) {
        if (entryFile) {
          const { path, filename } = entryFile
          const output = option.output || stubbDefaultConfig.output
          await writeIn({
            import: `./${output}/${filename}${stubbDefaultConfig.ext.import}`,
            require: `./${output}/${filename}${stubbDefaultConfig.ext.require}`,
            types: `./${output}/${filename}${stubbDefaultConfig.ext.types}`,
          }, path)
        }
      }
    }
  }
  catch (error) {
    errorHandler(error as Error)
  }
}

/**
 * Check and return the entry file name and path
 * @param entries
 * @returns Promise<{ path: string; filename: string; }[]>
 */
async function checkEntries(entries: string[]) {
  const entryFiles = []

  for (const entry of entries) {
    const { name, ext } = pathParse(entry)
    /**
     * root: package.json
     * The complete path of the entry file
     */
    const path = resolve(ext ? entry : await findEntryFilePath(entry))
    /**
     * Check the entry path
     */
    const exists = await fs.pathExists(path)

    if (exists) {
      entryFiles.push({
        path,
        filename: name,
      })
    }
    else {
      throw new Error(`✘ The entry file 【${entry}】 does not exist. To set the correct entry path!`)
    }
  }

  return entryFiles
}

/**
 * Write and output files
 */
async function writeIn(exports: PackageJsonExports, path: string) {
  const file = await fs.readFile(path, 'utf8')

  const isExportDefault = checkEntryFile(file)

  const escapePath = path.replace(/\\/g, '\\\\')

  const data = {
    /**
     * import
     * `export { default } from '${}'/nexport * from '${}'`
     * `export * from '${}'`
     */
    import: isExportDefault ? `export { default } from '${escapePath}'\nexport * from '${escapePath}'` : `export * from '${escapePath}'`,
    /**
     * require
     * `module.exports = require('${}')`
     */
    require: `module.exports = require('${escapePath}')`,
    /**
     * types
     * `export { default } from '${}'/nexport * from '${}'`
     * `export * from '${}'`
     */
    types: isExportDefault ? `export { default } from '${escapePath}'\nexport * from '${escapePath}'` : `export * from '${escapePath}'`,
  }

  /**
   * ES Modules/CommonJS/Types Output
   */
  for (const key in exports) {
    /**
     * package.json -> exports -> keyof PackageJsonExports
     */
    const EXPORT = exports[key as keyof PackageJsonExports]

    if (EXPORT) {
      const outputPath = resolve(EXPORT)
      await fs.outputFile(outputPath, data[key as keyof PackageJsonExports])
    }
  }
}

/**
 * Handling paths without ext
 * @param entry
 * @returns Promise<string>
 */
async function findEntryFilePath(entry: string) {
  const files = await fg.glob(
      `${entry}.+(js|ts|cjs|mjs)`,
      {
        onlyFiles: true,
        deep: 1,
        unique: true,
        ignore: ['node_modules'],
      },
  )

  return files[0] || entry
}

function checkEntryFile(file: string) {
  const isExplainNoteReg = /(?<!\/\/|\/\*[^*]*\*\/)\sexport\s+default(?!\/\/|\/\*[^*]*\*\/)/g
  const isInStringReg = /(?<!['"`])export\s+default(?!['"`])/g

  return isExplainNoteReg.test(file) && isInStringReg.test(file)
}

function errorHandler(error: Error) {
  console.error(error.message)
  process.exit(ExitCode.FatalException)
}
