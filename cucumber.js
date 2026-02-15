export default {
  paths: ['e2e/features/**/*.feature'],
  import: ['e2e/step-definitions/**/*.ts', 'e2e/support/**/*.ts'],
  format: ['progress-bar'],
  retry: 1,
}
