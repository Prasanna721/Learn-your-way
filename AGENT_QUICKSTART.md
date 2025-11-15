# Code Analyzer Agent - Quick Start Guide

## What Was Created

A powerful **Code Analyzer Agent** that:
- ✅ Analyzes code from any directory path
- ✅ Accepts user requests in natural language
- ✅ Generates beautiful HTML documentation
- ✅ Streams responses in real-time
- ✅ Has full bash command access
- ✅ Supports 3 design languages (modern, minimal, classic)

## Quick Start

### 1. Install Dependencies

```bash
pip install claude-agent-sdk
```

### 2. Run a Simple Example

```bash
# Analyze the examples directory
python agents/code_analyzer_agent.py \
    --path ./examples \
    --request "List all example files and explain what each demonstrates"
```

### 3. Run the Interactive Example Menu

```bash
cd agents
python example_usage.py
```

This will show you a menu with 8 different examples:

1. **Analyze SDK Examples** - Explore and categorize all SDK examples
2. **Architecture Analysis** - Deep dive into SDK architecture
3. **Hooks Deep Dive** - Understand hooks functionality
4. **Streaming Modes Comparison** - Compare different streaming approaches
5. **Security Review** - Security-focused code analysis
6. **MCP Servers Analysis** - Understand MCP server implementation
7. **Run All Examples** - Execute all examples sequentially
8. **Interactive Mode** - Custom analysis with your inputs

### 4. Quick Test

```bash
cd agents
python quick_test.py
```

This runs a simple test analyzing the agents directory itself.

## Usage Examples

### Example 1: Analyze Your Own Code

```bash
python agents/code_analyzer_agent.py \
    --path /path/to/your/project \
    --request "Explain the main architecture and components" \
    --design modern \
    --output my-analysis.html
```

### Example 2: Security Review

```bash
python agents/code_analyzer_agent.py \
    --path ./src \
    --request "Review for security vulnerabilities and best practices" \
    --design classic
```

### Example 3: Documentation Generation

```bash
python agents/code_analyzer_agent.py \
    --path ./api \
    --request "Document all API endpoints with examples" \
    --design minimal
```

### Example 4: Find TODOs and FIXMEs

```bash
python agents/code_analyzer_agent.py \
    --path ./src \
    --request "Find all TODOs and FIXMEs, categorize by priority" \
    --design modern
```

## Command-Line Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `--path` | Path to code directory | Yes | - |
| `--request` | Your question/request | Yes | - |
| `--design` | Design theme (modern/minimal/classic) | No | modern |
| `--output` | Output HTML file path | No | output/analysis.html |

## Design Languages

### Modern (default)
Beautiful gradient headers, card-based layout, modern shadows and styling.

### Minimal
Clean typography, no distractions, focused on content.

### Classic
Traditional document style with serif fonts and classic borders.

## Programmatic Usage

```python
import asyncio
from agents.code_analyzer_agent import CodeAnalyzerAgent

async def analyze():
    agent = CodeAnalyzerAgent(
        code_path="./src",
        user_request="Explain the architecture",
        design_language="modern",
        output_file="output/report.html"
    )
    await agent.analyze_and_generate()

asyncio.run(analyze())
```

## What the Agent Can Do

The agent has access to these tools:

- **Bash** - Run shell commands (ls, find, tree, grep, wc, etc.)
- **Read** - Read file contents
- **Glob** - Find files by pattern
- **Grep** - Search code for patterns

Example capabilities:

1. **Explore Structure**: Uses `ls`, `find`, `tree` to understand layout
2. **Read Code**: Analyzes actual file contents
3. **Search Patterns**: Finds specific code patterns
4. **Count Metrics**: Lines of code, file counts, etc.
5. **Analyze Dependencies**: Looks at imports, requirements
6. **Generate Insights**: Provides architectural understanding

## Output

The agent generates:

1. **Console Output** - Real-time streaming analysis
2. **HTML Report** - Beautiful, responsive HTML file with:
   - Professional styling
   - Code syntax highlighting
   - Structured sections
   - Metadata (path, request, timestamp)

## Example Requests

Here are great requests to try:

- "Explain the overall architecture and how components interact"
- "List all Python files and their purposes"
- "Find all API endpoints and document them"
- "Review for security vulnerabilities"
- "Analyze error handling patterns"
- "Find code duplication opportunities"
- "Explain the authentication flow"
- "Document all public APIs"
- "Find TODOs and categorize by priority"
- "Analyze test coverage and suggest improvements"

## Directory Structure

```
agents/
├── code_analyzer_agent.py   # Main agent implementation
├── example_usage.py          # 6+ example scenarios
├── quick_test.py             # Simple test
├── README.md                 # Detailed documentation
├── ARCHITECTURE.md           # Architecture deep dive
├── requirements.txt          # Dependencies
└── output/                   # Generated HTML reports (created automatically)
```

## Troubleshooting

### "claude-agent-sdk not found"

```bash
pip install claude-agent-sdk
```

### "Path does not exist"

Make sure you provide a valid directory path:

```bash
# Check the path exists
ls /path/to/your/code

# Then run the agent
python agents/code_analyzer_agent.py --path /path/to/your/code --request "..."
```

### Permission denied

```bash
chmod +x agents/code_analyzer_agent.py
```

## Next Steps

1. **Read the README**: `agents/README.md` for comprehensive documentation
2. **Explore Architecture**: `agents/ARCHITECTURE.md` for internals
3. **Run Examples**: Try `python agents/example_usage.py`
4. **Customize**: Modify prompts, add new design templates, extend functionality

## Advanced Features

### Stream Processing

The agent streams responses in real-time, showing you Claude's analysis as it happens:

```
=== Code Analyzer Agent ===
Analyzing: ./src
Request: Explain the architecture
============================

Streaming analysis...

[Using tool: Bash]
Claude: Let me explore the directory structure first...

[Using tool: Read]
Claude: I've found the main components...

## Architecture Overview
The codebase follows a...
```

### Custom Templates

Add your own HTML templates by modifying `_get_html_template()` in `code_analyzer_agent.py`.

### Extend Tools

Add more tools to the agent by extending the `allowed_tools` list in `ClaudeAgentOptions`.

## Contributing

To contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Same as the parent project.

---

**Ready to analyze your code?** Start with:

```bash
python agents/example_usage.py
```

Or jump right in:

```bash
python agents/code_analyzer_agent.py \
    --path . \
    --request "Analyze this project and explain what it does"
```
