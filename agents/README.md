# Code Analyzer Agent

An intelligent agent that analyzes codebases and generates beautiful HTML documentation using Claude Agent SDK.

## Features

- **Code Understanding**: Analyzes code structure, patterns, and architecture
- **Streaming Responses**: Real-time analysis output as Claude processes
- **HTML Generation**: Creates beautiful, responsive HTML reports
- **Bash Command Access**: Can run shell commands for deeper analysis
- **Multiple Design Languages**: Choose from modern, minimal, or classic themes
- **Customizable**: Flexible prompts and configurable options

## Installation

Ensure you have the required dependencies:

```bash
pip install claude-agent-sdk
```

## Usage

### Basic Usage

```bash
python agents/code_analyzer_agent.py \
    --path ./examples \
    --request "Explain the SDK examples and their purposes"
```

### With Custom Design

```bash
python agents/code_analyzer_agent.py \
    --path ./src \
    --request "Analyze the architecture and explain key components" \
    --design modern \
    --output output/my-report.html
```

### Available Options

- `--path`: Path to the code directory to analyze (required)
- `--request`: Your question or request about the code (required)
- `--design`: Design language for HTML output (modern, minimal, classic) - default: modern
- `--output`: Output HTML file path - default: output/analysis.html

## Design Languages

### Modern (default)
Beautiful gradient design with modern UI elements, cards, and smooth styling.

### Minimal
Clean, typography-focused design with minimal styling for distraction-free reading.

### Classic
Traditional document-style design with serif fonts and classic borders.

## Examples

### Example 1: Analyze SDK Examples

```bash
python agents/code_analyzer_agent.py \
    --path ./examples \
    --request "List all examples and explain what each one demonstrates" \
    --design modern
```

### Example 2: Architecture Analysis

```bash
python agents/code_analyzer_agent.py \
    --path ./src/claude_agent_sdk \
    --request "Explain the overall architecture and how components interact" \
    --design minimal
```

### Example 3: Security Review

```bash
python agents/code_analyzer_agent.py \
    --path ./src \
    --request "Review the code for potential security issues and best practices" \
    --design classic \
    --output security-review.html
```

### Example 4: Testing Analysis

```bash
python agents/code_analyzer_agent.py \
    --path ./tests \
    --request "Analyze test coverage and suggest improvements" \
    --design modern
```

## How It Works

1. **Initialization**: The agent configures Claude with necessary tools (Bash, Read, Glob, Grep)

2. **Exploration**: Claude explores the directory structure using bash commands

3. **Analysis**: Reads and analyzes relevant code files based on your request

4. **Streaming**: Outputs analysis in real-time to console

5. **HTML Generation**: Converts analysis to beautiful HTML with your chosen design

6. **Output**: Saves the HTML report and provides a file:// URL to open

## Agent Capabilities

The agent has access to:

- **Bash**: Run shell commands (ls, find, tree, grep, etc.)
- **Read**: Read file contents
- **Glob**: Find files by pattern
- **Grep**: Search code for patterns
- **Write**: Create output files

## Advanced Usage

### Programmatic Usage

```python
from agents.code_analyzer_agent import CodeAnalyzerAgent

agent = CodeAnalyzerAgent(
    code_path="./src",
    user_request="Explain the main components",
    design_language="modern",
    output_file="output/report.html"
)

await agent.analyze_and_generate()
```

### Custom Prompts

Modify the `_create_analysis_prompt()` method to customize how the agent analyzes code.

### Custom HTML Templates

Add new templates to the `_get_html_template()` method for different design languages.

## Output

The agent generates:

1. **Console Output**: Streaming analysis text in real-time
2. **HTML Report**: Beautiful HTML file with:
   - Header with metadata
   - Structured sections
   - Code blocks with syntax highlighting
   - Responsive design
   - Professional styling

## Example Requests

- "Explain the architecture and main components"
- "List all API endpoints and their purposes"
- "Find all TODOs and FIXMEs in the code"
- "Analyze error handling patterns"
- "Review the code for performance issues"
- "Explain how authentication works"
- "Document all public APIs"
- "Find code duplication and suggest refactoring"

## Troubleshooting

### Agent doesn't have permission to run commands

Make sure the file is executable:
```bash
chmod +x agents/code_analyzer_agent.py
```

### Path not found error

Ensure the path you provide exists and is accessible.

### Missing dependencies

Install the Claude Agent SDK:
```bash
pip install claude-agent-sdk
```

## Contributing

To add new features:

1. Add new tools to `ClaudeAgentOptions.allowed_tools`
2. Extend the analysis prompt in `_create_analysis_prompt()`
3. Add new design templates in `_get_html_template()`
4. Enhance HTML conversion in `_convert_to_html()`

## License

Same as the parent project.
