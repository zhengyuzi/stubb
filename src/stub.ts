import { resolve } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import fs from 'fs-extra'
import pathParse from 'path-parse'
import { resolveModuleExportNames } from 'mlly'
import consola from 'consola'
import { EXIT_CODE, EXPORT_CONTENT, OUTPUT_SUFFIXES } from './constants'

/**
 * Stub
 * @param entries Entry file paths.
 * @param outputDir The folder name/path of the output file.
 * @param outputSuffixes ESM/CJS/TS file suffixes.
 */
export async function stub(
  entries: string[],
  outputDir: string,
  outputSuffixes: Partial<typeof OUTPUT_SUFFIXES> = OUTPUT_SUFFIXES,
) {
  // Path to the output file folder
  const outputDirPath = resolve(outputDir)

  try {
    for (const entry of entries) {
      // Path to the entry file
      const entryPath = await findEntryPath(entry)
      // Does the path exist
      const psthExists = await fs.pathExists(entryPath)

      if (!psthExists) {
        throw new Error(`The entry file ${entryPath} does not exist.`)
      }

      const { name } = pathParse(entryPath)

      const data = await getStubData(entryPath)

      for (const [key, suffixes] of Object.entries(outputSuffixes)) {
        const fileData = data[key as keyof typeof data]

        for (const suffix of suffixes) {
          // Output file path
          const ouputPath = resolve(`${outputDirPath}/${name}${suffix}`)

          // Write and output file
          await fs.outputFile(ouputPath, fileData).catch((error) => {
            throw new Error(`Failed to output file to ${ouputPath}: ${error}`)
          })
        }
      }
    }

    consola.success(`Stub success! ${outputDirPath}`)
  }
  catch (error: any) {
    consola.error(`Stub Fail! Error: ${error.message}\nat ${outputDirPath}`)
    process.exit(EXIT_CODE.fatalException)
  }
}

/**
 * Get stub export content
 */
async function getStubData(entryPath: string): Promise<{ [key in keyof typeof OUTPUT_SUFFIXES]: string }> {
  const isDefaultExport = await resolveDefaultExport(entryPath)

  const path = entryPath.replace(/\\/g, '/')

  const esm = `${EXPORT_CONTENT.namedExport}\n${isDefaultExport ? EXPORT_CONTENT.defaultExport : ''}`.replaceAll('path', path)

  const cjs = EXPORT_CONTENT.moduleExport.replaceAll('path', path)

  return {
    cjs,
    esm,
    ts: esm,
  }
}

/**
 * Is the default export or named export
 * @param path
 * @returns Promise<boolean>
 */
async function resolveDefaultExport(path: string) {
  const namedExports: string[] = await resolveModuleExportNames(
    path,
    {
      extensions: ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'],
    },
  )

  return namedExports.includes('default') || namedExports.length === 0
}

/**
 * Find the entry file path
 * @param entry
 * @returns Promise<string>
 */
async function findEntryPath(entry: string) {
  const files = await fg.glob(
    `${entry}.+(ts|mts|cts|js|mjs|cjs)`,
    {
      onlyFiles: true,
      deep: 1,
      unique: true,
      ignore: ['node_modules'],
    },
  )

  return resolve(files[0] || entry)
}
