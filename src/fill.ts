import { resolve } from 'node:path'
import pathParse from 'path-parse'
import fs from 'fs-extra'
import consola from 'consola'
import { DEFAULT_FILENAME, OUTPUT_SUFFIXES, SUFFIX_CJS, SUFFIX_MJS, SUFFIX_TS } from './constants'

export interface PackageExportFields {
  [key: string]: {
    types?: string
    default?: string
    import?: string
    require?: string
  }
}

export interface Fields {
  exports: PackageExportFields
  main?: string
  module?: string
  types?: string
}

/**
 * Auto fill in exports/main/module/types in package.json.
 */
export async function fill(
  entries: string[],
  outputDir: string,
  outputSuffixes: Partial<typeof OUTPUT_SUFFIXES> = OUTPUT_SUFFIXES,
) {
  const jsonPath = './package.json'

  const fields: Fields = {
    exports: {},
  }

  const dir = outputDir.replace(/\/$/, '')

  const dirPath = !dir.startsWith('.') && !dir.startsWith('/') ? `./${dir}` : dir

  for (const entry of entries) {
    const entrySplit = entry.split('/')

    const { name: filename } = pathParse(entry)

    const name = entrySplit.length > 2 && filename === DEFAULT_FILENAME ? entrySplit[entrySplit.length - 2] : filename

    const exportName = name === 'index' ? '.' : `./${name}`

    if (outputSuffixes.cjs && outputSuffixes.esm) {
      fields.exports[exportName] = {
        ...fields.exports[exportName],
        import: `${dirPath}/${name}${SUFFIX_MJS}`,
        require: `${dirPath}/${name}${SUFFIX_CJS}`,
      }

      if (!fields.main)
        fields.main = `${dir}/${name}${SUFFIX_CJS}`

      if (!fields.module)
        fields.module = `${dir}/${name}${SUFFIX_MJS}`
    }
    else if (outputSuffixes.cjs) {
      fields.exports[exportName] = {
        ...fields.exports[exportName],
        default: `${dirPath}/${name}${SUFFIX_CJS}`,
      }

      if (!fields.main)
        fields.main = `${dir}/${name}${SUFFIX_CJS}`
    }
    else if (outputSuffixes.esm) {
      fields.exports[exportName] = {
        ...fields.exports[exportName],
        default: `${dirPath}/${name}${SUFFIX_MJS}`,
      }

      if (!fields.main)
        fields.main = `${dir}/${name}${SUFFIX_MJS}`

      if (!fields.module)
        fields.module = `${dir}/${name}${SUFFIX_MJS}`
    }

    if (outputSuffixes.ts) {
      fields.exports[exportName] = {
        ...fields.exports[exportName],
        types: `${dirPath}/${name}${SUFFIX_TS}`,
      }

      if (!fields.types)
        fields.types = `${dir}/${name}${SUFFIX_TS}`
    }
  }

  try {
    const json = await fs.readJson(jsonPath)
    await fs.outputJson(jsonPath, { ...json, ...fields }, { spaces: 2 })
    consola.success(`Autofill success! ${resolve(jsonPath)}`)
  }
  catch (err) {
    consola.error(`Autofill Fail! ${resolve(jsonPath)} ${err}`)
  }
}
