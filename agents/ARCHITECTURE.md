# Code Analyzer Agent - Architecture

This document explains the internal architecture and design decisions of the Code Analyzer Agent.

## Overview

The Code Analyzer Agent is built on top of the Claude Agent SDK and provides an intelligent code analysis system that:

1. Understands codebases through exploration and analysis
2. Generates beautiful HTML documentation
3. Streams responses in real-time
4. Leverages Claude's reasoning capabilities with tool access

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Code Analyzer Agent                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐        ┌──────────────────┐            │
│  │  User Input     │───────▶│  Agent Instance  │            │
│  │  - code_path    │        │  - Initialize    │            │
│  │  - request      │        │  - Configure     │            │
│  │  - design       │        └────────┬─────────┘            │
│  └─────────────────┘                 │                      │
│                                       ▼                      │
│              ┌────────────────────────────────────┐          │
│              │   ClaudeSDKClient (Streaming)      │          │
│              │   - Tools: Bash, Read, Grep, Glob  │          │
│              │   - System Prompt Configuration     │          │
│              │   - Agent Definition               │          │
│              └────────┬───────────────────────────┘          │
│                       │                                      │
│                       ▼                                      │
│         ┌─────────────────────────────┐                     │
│         │   Analysis Loop (Streaming)  │                     │
│         │   ┌─────────────────────┐   │                     │
│         │   │ 1. Explore codebase  │   │                     │
│         │   │ 2. Read files        │   │                     │
│         │   │ 3. Analyze patterns  │   │                     │
│         │   │ 4. Generate insights │   │                     │
│         │   └─────────────────────┘   │                     │
│         └─────────┬───────────────────┘                     │
│                   │                                          │
│                   ▼                                          │
│    ┌──────────────────────────────────────┐                 │
│    │   Content Processing                 │                 │
│    │   - Console Output (real-time)       │                 │
│    │   - Content Accumulation             │                 │
│    └──────────────┬───────────────────────┘                 │
│                   │                                          │
│                   ▼                                          │
│    ┌──────────────────────────────────────┐                 │
│    │   HTML Generation                    │                 │
│    │   - Template Selection               │                 │
│    │   - Markdown to HTML Conversion      │                 │
│    │   - Styling Application              │                 │
│    │   - File Writing                     │                 │
│    └──────────────┬───────────────────────┘                 │
│                   │                                          │
│                   ▼                                          │
│         ┌──────────────────┐                                │
│         │  HTML Output     │                                │
│         │  - Beautiful     │                                │
│         │  - Responsive    │                                │
│         │  - Themed        │                                │
│         └──────────────────┘                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. CodeAnalyzerAgent Class

The main class that orchestrates the entire analysis process.

**Responsibilities:**
- Initialize configuration
- Create analysis prompts
- Manage streaming communication
- Process responses
- Generate HTML output

**Key Methods:**

```python
__init__(code_path, user_request, design_language, output_file)
    # Initialize agent with configuration

analyze_and_generate()
    # Main entry point - runs full analysis pipeline

_create_analysis_prompt()
    # Generates the initial prompt for Claude

_generate_html()
    # Converts analysis to HTML

_convert_to_html(markdown_text)
    # Markdown to HTML conversion

_get_html_template()
    # Returns design-specific HTML template
```

### 2. Claude SDK Integration

The agent leverages Claude SDK's streaming client for bidirectional communication.

**Configuration:**

```python
ClaudeAgentOptions(
    allowed_tools=["Bash", "Read", "Glob", "Grep", "Write"],
    system_prompt="...",
    cwd=str(code_path.parent),
    agents={...}
)
```

**Tools Used:**

- **Bash**: Execute shell commands for exploration (ls, find, tree, etc.)
- **Read**: Read file contents
- **Glob**: Pattern-based file finding
- **Grep**: Code search
- **Write**: Generate output files (used internally)

### 3. Streaming Pipeline

The agent uses async streaming for real-time output:

```python
async for message in client.receive_response():
    if isinstance(message, AssistantMessage):
        # Extract text content
        # Print to console (real-time)
        # Accumulate for HTML generation
    elif isinstance(message, ResultMessage):
        # Analysis complete
        # Generate final HTML
```

**Benefits:**
- Real-time feedback to user
- Progressive content accumulation
- Efficient memory usage
- Responsive UX

### 4. HTML Generation System

Multi-stage HTML generation process:

```
Analysis Text (Markdown-like)
        ↓
Parse Sections/Headers/Code
        ↓
Convert to HTML Elements
        ↓
Apply Design Template
        ↓
Write to File
```

**Design Templates:**

Each template is a complete HTML document with embedded CSS:

- **Modern**: Gradient headers, cards, modern UI
- **Minimal**: Typography-focused, clean design
- **Classic**: Traditional document style, serif fonts

### 5. Content Processing

The `_convert_to_html()` method handles:

1. **Code Blocks**: Detects ``` markers, creates `<pre><code>` elements
2. **Headers**: Converts ## to `<h2>`, ### to `<h3>`, etc.
3. **Lists**: Converts - and * to bullet points
4. **Inline Code**: Converts `code` to `<code>` tags
5. **Sections**: Groups content into styled divs
6. **HTML Escaping**: Prevents XSS in code samples

## Design Patterns

### 1. Builder Pattern

The agent builds up the HTML response incrementally:

```python
# Accumulate during streaming
self.analysis_content.append(block.text)

# Build final HTML
analysis_html = self._convert_to_html("\n".join(self.analysis_content))
```

### 2. Strategy Pattern

Different HTML templates (strategies) for different design languages:

```python
templates = {
    "modern": "...",
    "minimal": "...",
    "classic": "..."
}
template = templates.get(self.design_language, templates["modern"])
```

### 3. Template Method Pattern

The `analyze_and_generate()` method defines the skeleton:

1. Configure client
2. Create prompt
3. Stream analysis
4. Generate HTML

Subclasses can override specific steps if needed.

## Data Flow

```
User Input
    ↓
CodeAnalyzerAgent.__init__()
    ↓
analyze_and_generate()
    ↓
ClaudeSDKClient (configured with tools)
    ↓
Claude receives prompt
    ↓
┌─────────────────────────────────┐
│  Claude's Analysis Loop          │
│  ┌───────────────────────────┐  │
│  │ 1. Use Bash (ls, find)    │  │
│  │ 2. Use Read (files)       │  │
│  │ 3. Use Grep (search)      │  │
│  │ 4. Think and analyze      │  │
│  │ 5. Generate response      │  │
│  └───────────────────────────┘  │
│  (Repeats as needed)            │
└─────────────────────────────────┘
    ↓
Messages streamed back
    ↓
Agent processes each message
    ↓
    ├─→ Print to console (real-time)
    └─→ Accumulate content
    ↓
ResultMessage received
    ↓
Generate HTML from accumulated content
    ↓
Write to file
    ↓
Done
```

## Security Considerations

### 1. Path Traversal Protection

The agent uses `Path.resolve()` to normalize paths and prevent traversal attacks.

### 2. HTML Escaping

All user content is HTML-escaped using `_escape_html()` to prevent XSS:

```python
def _escape_html(self, text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        # ...
    )
```

### 3. Tool Restrictions

Only specific tools are allowed:

```python
allowed_tools=["Bash", "Read", "Glob", "Grep", "Write"]
```

### 4. Working Directory Isolation

The agent runs in a specific working directory context:

```python
cwd=str(self.code_path.parent)
```

## Performance Considerations

### 1. Streaming for Responsiveness

Using async streaming provides:
- Immediate visual feedback
- Progressive content loading
- Better perceived performance

### 2. Lazy HTML Generation

HTML is only generated after analysis completes, avoiding unnecessary conversions.

### 3. Efficient String Building

Content accumulation uses list appending (O(1)) then join (O(n)):

```python
self.analysis_content.append(block.text)  # O(1)
"\n".join(self.analysis_content)          # O(n) once
```

## Extensibility

### Adding New Design Templates

1. Add template to `_get_html_template()`:
```python
templates = {
    "modern": "...",
    "minimal": "...",
    "classic": "...",
    "your_new_design": "..."  # Add here
}
```

2. Update CLI argument choices:
```python
choices=["modern", "minimal", "classic", "your_new_design"]
```

### Adding New Tools

1. Add to `allowed_tools`:
```python
allowed_tools=["Bash", "Read", "Glob", "Grep", "Write", "YourTool"]
```

2. Update analysis prompt to guide Claude on when to use it.

### Custom Analysis Types

Create subclasses for specialized analysis:

```python
class SecurityAnalyzerAgent(CodeAnalyzerAgent):
    def _create_analysis_prompt(self):
        return f"Security-focused prompt for {self.code_path}..."
```

## Testing Strategy

### Unit Tests

Test individual methods:
- `_convert_to_html()` - markdown conversion
- `_escape_html()` - HTML escaping
- `_get_html_template()` - template retrieval

### Integration Tests

Test the full pipeline:
- Create test codebase
- Run analysis
- Verify HTML output

### Example Test:

```python
async def test_basic_analysis():
    agent = CodeAnalyzerAgent(
        code_path="./test_data",
        user_request="List files",
        design_language="modern",
        output_file="test_output.html"
    )
    await agent.analyze_and_generate()
    assert Path("test_output.html").exists()
```

## Future Enhancements

### Potential Improvements

1. **Export Formats**: Add PDF, Markdown, JSON outputs
2. **Interactive HTML**: Add JavaScript for interactive features
3. **Diff Analysis**: Compare code versions
4. **Metrics Dashboard**: Add code metrics visualization
5. **Custom Themes**: User-configurable CSS themes
6. **Template Engine**: Use Jinja2 for more powerful templating
7. **Caching**: Cache analysis results for faster re-runs
8. **Async File I/O**: Use aiofiles for better async performance

### Code Quality Improvements

1. Add type hints throughout
2. Comprehensive error handling
3. Logging framework integration
4. Configuration file support (YAML/JSON)
5. Plugin system for custom analyzers

## Conclusion

The Code Analyzer Agent demonstrates:
- Effective use of Claude SDK's streaming capabilities
- Clean separation of concerns
- Extensible architecture
- Security-conscious design
- User-friendly output

It serves as both a useful tool and a reference implementation for building similar agents with the Claude Agent SDK.
