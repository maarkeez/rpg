module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/test/features/step_definitions/**/*.ts'],
    format: ['progress-bar'],
    paths: ['src/test/features/**/*.feature'],
  },
};
