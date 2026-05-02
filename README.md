# Kmod
Kmod — AST-based code migration engine with safety and validation

## Project Structure

- `bin/`: CLI entry point.
- `src/`: Core logic and modules.
  - `orchestrator/`: Pipeline control.
  - `scanner/`: Pre-analysis of codebases.
  - `transformer/`: Codemod engine and rules.
  - `safety/`: Risk detection and skip logic.
  - `ai/`: AI engine for complex cases.
  - `validator/`: Build and test runner.
  - `reporter/`: Reporting and summaries.
  - `core/`: Shared state.
  - `utils/`: Helpers.
- `test-project/`: Demo repository for testing.
- `reports/`: Generated migration reports.
