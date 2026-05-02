# Kmod: AI-Augmented Ethers.js Migration Engine (Boring AI Hackathon)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![npm version](https://img.shields.io/badge/npm-published-brightgreen.svg)](https://www.npmjs.com/package/kmod)

Kmod is a professional-grade CLI tool designed to automate the complex migration of Ethereum-based codebases from **Ethers.js v5 to v6**. It utilizes a unique **Hybrid Transformation Engine** that com[...]
<img width="1311" height="611" alt="image" src="https://github.com/user-attachments/assets/28cf73d5-e918-4403-9a7f-95f7170129a6" />

## Key Features

- **Dual AI Handshake**: Cross-validates complex migration cases using multiple LLMs (Gemini 2.0 & Llama 3.3) to eliminate hallucinations
- **Deterministic AST Engine**: Performs 100% safe, high-speed transformations for standard API renames
- **Safety Checkpoints**: Automatically backs up files before modification, allowing for instant, one-command rollbacks
- **Audit-Ready Reporting**: Provides clear, color-coded diffs with "Confidence Signals" (e.g., agreed by 2/2 models)
- **Zero-Trust Logic**: Automatically skips ambiguous code patterns to prevent breaking changes, flagging them for human review or AI resolution

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **OpenRouter API Key**: Required for the AI Consensus engine (get one at [openrouter.ai](https://openrouter.ai))
- **Git**: For tracking changes and rollback functionality

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mdfaizee19/KMOD.git
cd KMOD
npm install
```

### 2. Global Command Setup (Recommended)

To use the `kmod` command from anywhere on your machine:

```bash
npm link
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
OPENROUTER_KEY_1=your_openrouter_api_key
OPENROUTER_KEY_2=your_openrouter_api_key_2
```

## Command Reference

| Command | Action |
|---------|--------|
| `kmod run .` | **Guided Migration**: Runs scan, applies rules, and prompts for AI resolution on complex cases |
| `kmod preview .` | **Safe Audit**: Performs full analysis and AI consensus without writing changes to disk |
| `kmod apply .` | **Auto-Pilot**: Runs the entire migration (Rules + AI) instantly without prompts |
| `kmod rollback .` | **Safety Net**: Instantly restores the project to its pre-migration state |

## Usage Examples

### Step 1: Preview the Changes

```bash
kmod preview ./my-web3-project
```

Preview all detected migrations without modifying any files. Review the color-coded diffs and AI confidence signals.

### Step 2: Run the Interactive Migration

```bash
kmod run ./my-web3-project
```

Runs the full migration pipeline with prompts for complex cases. You control each decision.

### Step 3: Revert if Needed

```bash
kmod rollback ./my-web3-project
```

Instantly restores your project to its pre-migration state.

### Auto-Pilot Mode (Advanced)

```bash
kmod apply ./my-web3-project
```

Runs the entire migration automatically. Use only after validating with `preview` first.

## How It Works: The Four-Phase Engine

### Phase 1: Scan & Detect
Kmod identifies Ethers v5 patterns using high-speed regex and AST visitors, building a comprehensive inventory of migration targets.

### Phase 2: Deterministic Transform
Safe, standard renames (e.g., `ethers.utils.formatEther` → `ethers.formatEther`) are applied immediately with 100% confidence.

### Phase 3: AI Consensus
Risky or "chained" calls are sent to two independent AI models. A change is only applied if both models agree on the exact same syntax.

### Phase 4: Validation
Every AI suggestion is passed through a syntax validator to ensure the resulting code is parseable and bug-free.

## Safety & Reliability

### No Overwrites
Kmod never modifies code without a verified checkpoint. All changes are backed up automatically.

### Syntax Guard
Built-in validation prevents the tool from injecting invalid JavaScript. Every transformation is validated before writing.

### Git Aware
Warns you if you have uncommitted changes before starting a migration, protecting your work history.

### Confidence Signals
All changes are marked with confidence levels:
- **High Confidence**: Agreed by deterministic rules or dual AI consensus
- **Flagged**: Requires human review or manual intervention

## What Gets Migrated?

Kmod handles the full spectrum of Ethers.js v5 → v6 changes:

- API renames and namespace consolidation
- Function signature updates
- Constructor and factory changes
- Event listener modifications
- Error handling pattern upgrades
- Type imports and exports

## Output & Reporting

When you run `kmod preview` or `kmod run`, you'll see:

- **Color-coded diffs** showing before/after transformations
- **Confidence scores** for each change (e.g., "2/2 models agree")
- **File-by-file summaries** with change counts
- **Flagged items** requiring manual review
- **Rollback instructions** for instant reversal

## Advanced Configuration

### Custom Rule Sets (Future)
Extend Kmod with organization-specific migration rules (coming soon).

### AI Model Selection
Switch between Gemini 2.0 and Llama 3.3 or add custom models via OpenRouter.

## Project Structure

- `bin/`: CLI entry point
- `src/`: Core logic and modules
  - `orchestrator/`: Pipeline control
  - `scanner/`: Pre-analysis of codebases
  - `transformer/`: Codemod engine and rules
  - `safety/`: Risk detection and skip logic
  - `ai/`: AI engine for complex cases
  - `validator/`: Build and test runner
  - `reporter/`: Reporting and summaries
  - `core/`: Shared state
  - `utils/`: Helpers
- `test-project/`: Demo repository for testing
- `reports/`: Generated migration reports

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## Support & Community

- **Issues**: Found a bug? [Open an issue](https://github.com/mdfaizee19/KMOD/issues)
- **Discussions**: Have questions? [Start a discussion](https://github.com/mdfaizee19/KMOD/discussions)
- **Documentation**: Detailed guides in the [Wiki](https://github.com/mdfaizee19/KMOD/wiki)
- **Demo Video**: Watch the tool in action - [YouTube Demo](https://youtu.be/aiQO6gv-UUg?si=e4M0urTMTMX6c3wg)

## Roadmap

- [ ] Support for Hardhat plugin integration
- [ ] Web UI dashboard for migration visualization
- [ ] Custom rule builder
- [ ] Extended language support (TypeScript-first)
- [ ] Multi-file parallel processing

## Show Your Support

If Kmod saved you time migrating to Ethers.js v6, please give us a star! Your support helps us continue improving the tool.

---

Made with dedication by [mdfaizee19](https://github.com/mdfaizee19)

Migrating Ethers.js v5 to v6? Let Kmod handle the heavy lifting.
