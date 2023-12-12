import process from 'node:process'
import cac from 'cac'
import type { ParsedArgs } from './types'
import { ExitCode, stubbDefaultConfig } from './config'

export default async function parse() {
  try {
    const cli = cac('stubb')

    const result = cli
      .option('-e, --entry <dir>', `Entry file path. If there are multiple entry files, the entry file path must be set in the order of 'package.json -> exports'. (default: ${stubbDefaultConfig.entry})`)
      .option('-o, --output <dir>', `Output file name. If 'package.json -> exports/main/module/types' is set, ignore it. (default: ${stubbDefaultConfig.output})`)
      .help()
      .parse()

    const opts = result.options

    const parsedArgs: ParsedArgs = {
      help: opts.help as boolean,
      options: {
        entry: opts.entry,
        output: opts.output,
      },
    }

    return parsedArgs
  }
  catch (error) {
    console.error((error as Error).message)
    return process.exit(ExitCode.InvalidArgument)
  }
}
