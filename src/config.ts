export const stubbDefaultConfig = {
  entry: 'src/index',
  separator: ',',
  output: 'dist',
  ext: {
    import: '.mjs',
    require: '.cjs',
    types: '.d.ts',
  },
}

export const ExitCode = {
  Success: 0,
  InvalidArgument: 9,
  FatalException: 1,
}
