import process from 'node:process'
import { ExitCode } from './config'
import parse from './parse'
import stub from './stub'

export default async function run() {
  try {
    const { help, options } = await parse()

    if (help)
      process.exit(ExitCode.Success)

    else
      stub(options)
  }
  catch (error) {
    console.error((error as Error).message)
    return process.exit(ExitCode.FatalException)
  }
}
