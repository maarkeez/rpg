module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'src/test/features/support/**/*.ts',
      'src/test/features/step_definitions/**/*.ts',
      'src/test/features/step_definitions/**/*.tsx',
    ],
    format: ['progress-bar'],
    paths: ['src/test/features/**/*.feature'],
  },
};
