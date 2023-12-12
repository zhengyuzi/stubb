export interface ParsedArgs {
  help: boolean
  options: ParsedArgsOption
}

export interface ParsedArgsOption {
  entry?: string
  output?: string
}

export interface PackageJsonExports {
  types?: string
  import?: string
  require?: string
}

export interface FormatEntryFile {
  path: string
  filename: string
}
