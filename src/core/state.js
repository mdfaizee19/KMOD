function createState() {
  return {
    rules: {},
    filesScanned: 0,
    totalDetected: 0,
    totalTransformed: 0,
    totalSkipped: 0,
    logs: [],
    errors: [],
    validation: {},
    modifiedFiles: new Set()
  };
}
module.exports = createState;