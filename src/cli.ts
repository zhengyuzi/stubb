import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'
import {
  DEFAULT_ENTRY,
  DEFAULT_OUTPUT_DIR,
  OUTPUT_SUFFIXES,
} from './constants'
import { stub } from './stub'
import { fill } from './fill'

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  args: {
    entries: {
      type: 'positional',
      description: `Entry file paths. Default: ${DEFAULT_ENTRY}`,
      required: false,
    },
    outputDir: {
      type: 'string',
      description: `The folder name/path of the output file. Default: ${DEFAULT_OUTPUT_DIR}`,
    },
    fill: {
      type: 'boolean',
      description: 'Auto fill in exports/main/module/types in package.json. Default: false',
    },
    esm: {
      type: 'boolean',
      description: 'Open esm. Default: true',
    },
    cjs: {
      type: 'boolean',
      description: 'Open cjs. Default: true',
    },
    ts: {
      type: 'boolean',
      description: 'Open Types. Default: true',
    },
  },
  async run({ args }) {
    const { esm = true, cjs = true, ts = true, fill: isFill = false } = args

    const entries = (args.entries || DEFAULT_ENTRY).split(',')

    const outputDir = args.outputDir || DEFAULT_OUTPUT_DIR

    const outputSuffixes = {
      ...(cjs && { cjs: OUTPUT_SUFFIXES.cjs }),
      ...(esm && { esm: OUTPUT_SUFFIXES.esm }),
      ...(ts && { ts: OUTPUT_SUFFIXES.ts }),
    }

    await stub(entries, outputDir, outputSuffixes)

    if (isFill)
      await fill(entries, outputDir, outputSuffixes)
  },
})

runMain(main)
