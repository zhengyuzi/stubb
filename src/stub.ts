import process from 'node:process'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import { resolveModuleExportNames } from 'mlly'
import { ExitCode, StubbDefaultConfig } from './constants'
import type { PackageJsonExport } from './types'

export async function stub() {
  process.on('uncaughtException', error => errorHandler(`${error}`))
  process.on('unhandledRejection', reason => errorHandler(`${reason}`))

  try {
    const exports = await readPackageJson()

    for (const _export of exports) {
      const path = await getEntryPath(_export.entry || StubbDefaultConfig.entry)

      const hasDefaultExport = await resolveDefaultExport(path)

      const _path = path.replace(/\\/g, '/')

      const data = {
        import: [`export * from '${_path}'`, hasDefaultExport ? `export { default } from '${_path}'` : ''].join('\n'),
        require: `module.exports = require('${_path}')`,
        types: [`export * from '${_path}'`, hasDefaultExport ? `export { default } from '${_path}'` : ''].join('\n'),
      }

      for (const [key, value] of Object.entries(_export)) {
        if (key === 'entry' || !value)
          continue

        fs.outputFile(resolve(value), String(data[key as keyof typeof data]))
      }
    }
  }
  catch (error) {
    errorHandler((error as Error).message)
  }
}

/**
 * Read package.json
 */
async function readPackageJson() {
  const { exports, main, module, types } = await fs.readJson('./package.json')

  /**
   * 'exports' have higher priority than 'main', 'module', and 'types'
   */
  if (exports) {
    return Object.values(exports) as PackageJsonExport[]
  }
  else if (main || module || types) {
    return [
      {
        import: module,
        require: main,
        types,
      },
    ] as PackageJsonExport[]
  }
  else {
    // eslint-disable-next-line no-console
    console.log(`WARNING: Not set exports/main/module/types\n at ${resolve('./package.json')}`)
    return []
  }
}

/**
 * Retrieve the export name of the entry file
 * @param entry
 */
async function getEntryPath(entry: string) {
  const entryPath = await findEntryFilePath(entry)

  const path = resolve(entryPath)

  const exists = await fs.pathExists(entryPath)

  if (!exists) {
    throw new Error(`ERROR: The entry file 【${entryPath}】 does not exist. To set the correct entry path!`)
  }

  return path
}

/**
 * Determine whether it is a default export, otherwise it is a named export
 * @param filePath
 * @returns boolean
 */
async function resolveDefaultExport(filePath: string) {
  const namedExports: string[] = await resolveModuleExportNames(
    filePath,
    {
      extensions: ['.ts', '.js'],
    },
  ).catch((error) => {
    errorHandler(`Cannot analyze ${filePath} for exports:${error}`)
    return []
  })

  return namedExports.includes('default') || namedExports.length === 0
}

/**
 * Handling paths without ext
 * @param entry
 * @returns Promise<string>
 */
async function findEntryFilePath(entry: string) {
  const files = await fg.glob(
    `${entry}.+(ts|js)`,
    {
      onlyFiles: true,
      deep: 1,
      unique: true,
      ignore: ['node_modules'],
    },
  )

  return files[0] || entry
}

function errorHandler(message: string) {
  console.error(message)
  process.exit(ExitCode.FatalException)
}
