export const StubbDefaultConfig = {
  entryName: 'index',
  entry: 'src/index',
  output: 'dist',
  ext: {
    import: 'mjs',
    require: 'cjs',
    types: 'd.ts',
  },
}

export const ExitCode = {
  Success: 0,
  InvalidArgument: 9,
  FatalException: 1,
}
