#!/usr/bin/env python3
"""Code Analyzer Agent - Analyzes code and generates HTML documentation.

This agent:
1. Analyzes code from a specified directory path
2. Takes user requests and design language preferences
3. Generates beautiful HTML output with streaming responses
4. Has access to bash commands for deeper analysis

Usage:
    python agents/code_analyzer_agent.py --path ./src --request "Explain the architecture" --design modern
"""

import argparse
import asyncio
import sys
from pathlib import Path
from typing import AsyncIterator

from claude_agent_sdk import (
    AgentDefinition,
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    ResultMessage,
    SystemMessage,
    TextBlock,
    ToolUseBlock,
)


class CodeAnalyzerAgent:
    """Agent for analyzing code and generating HTML documentation."""

    def __init__(
        self,
        code_path: str,
        user_request: str,
        design_language: str = "modern",
        output_file: str = "output/analysis.html",
    ):
        """Initialize the Code Analyzer Agent.

        Args:
            code_path: Path to the code directory to analyze
            user_request: User's request/question about the code
            design_language: Design style for HTML output (modern, minimal, classic)
            output_file: Output HTML file path
        """
        self.code_path = Path(code_path).resolve()
        self.user_request = user_request
        self.design_language = design_language
        self.output_file = Path(output_file)
        self.output_file.parent.mkdir(parents=True, exist_ok=True)

        # HTML content accumulator
        self.html_content = []
        self.analysis_content = []

    def _get_html_template(self) -> str:
        """Get HTML template based on design language."""
        templates = {
            "modern": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .meta {
            background: #f8f9fa;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e9ecef;
        }
        .meta-item {
            display: inline-block;
            margin-right: 2rem;
            color: #6c757d;
            font-size: 0.9rem;
        }
        .meta-item strong {
            color: #495057;
            font-weight: 600;
        }
        .content {
            padding: 2rem;
        }
        .section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .section p {
            color: #495057;
            margin-bottom: 1rem;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        code {
            background: #e9ecef;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
            color: #e83e8c;
        }
        pre code {
            background: transparent;
            padding: 0;
            color: #f8f8f2;
        }
        .analysis-block {
            background: white;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #6c757d;
            font-size: 0.9rem;
            border-top: 1px solid #e9ecef;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(102,126,234,.3);
            border-radius: 50%;
            border-top-color: #667eea;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #667eea;
            color: white;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-right: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Code Analysis Report</h1>
            <p>Intelligent code understanding powered by Claude</p>
        </div>
        <div class="meta">
            <div class="meta-item"><strong>Path:</strong> {code_path}</div>
            <div class="meta-item"><strong>Request:</strong> {user_request}</div>
            <div class="meta-item"><strong>Design:</strong> {design_language}</div>
            <div class="meta-item"><strong>Generated:</strong> {timestamp}</div>
        </div>
        <div class="content">
            {analysis_content}
        </div>
        <div class="footer">
            Generated by Code Analyzer Agent using Claude Agent SDK
        </div>
    </div>
</body>
</html>""",
            "minimal": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            line-height: 1.8;
            color: #222;
        }
        h1 { border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
        h2 { margin-top: 2rem; color: #444; }
        pre {
            background: #f5f5f5;
            padding: 1rem;
            overflow-x: auto;
            border-left: 3px solid #000;
        }
        .meta { color: #666; font-size: 0.9rem; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>Code Analysis</h1>
    <div class="meta">
        <p><strong>Path:</strong> {code_path}</p>
        <p><strong>Request:</strong> {user_request}</p>
        <p><strong>Generated:</strong> {timestamp}</p>
    </div>
    {analysis_content}
</body>
</html>""",
            "classic": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Report</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            background: #f4f1ea;
            padding: 2rem;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 3rem;
            border: 2px solid #8b4513;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #8b4513;
            border-bottom: 3px double #8b4513;
            padding-bottom: 1rem;
        }
        h2 { color: #654321; margin-top: 2rem; }
        pre {
            background: #faf8f3;
            border: 1px solid #d4cfc0;
            padding: 1rem;
            overflow-x: auto;
        }
        .meta {
            background: #faf8f3;
            padding: 1rem;
            border: 1px solid #d4cfc0;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Code Analysis Report</h1>
        <div class="meta">
            <p><strong>Analyzed Path:</strong> {code_path}</p>
            <p><strong>User Request:</strong> {user_request}</p>
            <p><strong>Report Generated:</strong> {timestamp}</p>
        </div>
        {analysis_content}
    </div>
</body>
</html>""",
        }

        return templates.get(self.design_language, templates["modern"])

    def _create_analysis_prompt(self) -> str:
        """Create the analysis prompt for Claude."""
        return f"""You are a code analysis expert. Analyze the code at path: {self.code_path}

User Request: {self.user_request}

Please follow these steps:
1. First, explore the directory structure using bash commands (ls, find, tree, etc.)
2. Read relevant code files to understand the implementation
3. Analyze the code based on the user's request
4. Provide a comprehensive analysis with:
   - Overview of the codebase structure
   - Key findings related to the user's request
   - Code examples with explanations
   - Any recommendations or insights

Format your response with clear sections using markdown headers (## Section Name).
Include code blocks with proper syntax highlighting.
Be thorough but concise.

Start by exploring the directory structure."""

    async def analyze_and_generate(self) -> None:
        """Run the analysis and generate HTML output with streaming."""
        print(f"\n{'='*60}")
        print(f"Code Analyzer Agent")
        print(f"{'='*60}")
        print(f"Analyzing: {self.code_path}")
        print(f"Request: {self.user_request}")
        print(f"Design: {self.design_language}")
        print(f"{'='*60}\n")

        # Configure Claude with necessary tools
        options = ClaudeAgentOptions(
            allowed_tools=["Bash", "Read", "Glob", "Grep", "Write"],
            system_prompt="You are an expert code analyzer. Provide detailed, "
            "structured analysis with clear explanations and code examples.",
            cwd=str(self.code_path.parent),
            agents={
                "code-analyzer": AgentDefinition(
                    description="Analyzes code structure and provides insights",
                    prompt="You are a code analysis expert specialized in understanding "
                    "codebases and explaining them clearly.",
                    tools=["Bash", "Read", "Glob", "Grep"],
                    model="sonnet",
                ),
            },
        )

        # Stream the analysis
        async with ClaudeSDKClient(options=options) as client:
            prompt = self._create_analysis_prompt()
            await client.query(prompt)

            print("Streaming analysis...\n")

            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            # Print to console
                            print(block.text)
                            # Accumulate for HTML
                            self.analysis_content.append(block.text)
                        elif isinstance(block, ToolUseBlock):
                            print(f"\n[Using tool: {block.name}]")

                elif isinstance(message, ResultMessage):
                    print(f"\n{'='*60}")
                    print("Analysis complete!")
                    if message.total_cost_usd:
                        print(f"Cost: ${message.total_cost_usd:.4f}")
                    if message.duration_ms:
                        print(f"Duration: {message.duration_ms}ms")
                    print(f"{'='*60}\n")

        # Generate HTML output
        await self._generate_html()

    async def _generate_html(self) -> None:
        """Generate the HTML output file."""
        from datetime import datetime

        # Convert markdown-like content to HTML
        analysis_html = self._convert_to_html("\n".join(self.analysis_content))

        # Get template and fill in values
        template = self._get_html_template()
        html = template.format(
            code_path=self.code_path,
            user_request=self.user_request,
            design_language=self.design_language,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            analysis_content=analysis_html,
        )

        # Write to file
        self.output_file.write_text(html, encoding="utf-8")
        print(f"HTML report generated: {self.output_file.resolve()}")
        print(f"Open in browser: file://{self.output_file.resolve()}")

    def _convert_to_html(self, markdown_text: str) -> str:
        """Convert markdown-like text to HTML."""
        html_parts = []
        in_code_block = False
        code_block = []
        current_section = []

        for line in markdown_text.split("\n"):
            # Code blocks
            if line.strip().startswith("```"):
                if in_code_block:
                    # Close code block
                    code = "\n".join(code_block)
                    html_parts.append(f"<pre><code>{self._escape_html(code)}</code></pre>")
                    code_block = []
                    in_code_block = False
                else:
                    # Start code block
                    in_code_block = True
                continue

            if in_code_block:
                code_block.append(line)
                continue

            # Headers
            if line.startswith("## "):
                if current_section:
                    html_parts.append(
                        f'<div class="section"><p>{"<br>".join(current_section)}</p></div>'
                    )
                    current_section = []
                html_parts.append(f'<div class="section"><h2>{line[3:]}</h2>')
            elif line.startswith("### "):
                html_parts.append(f"<h3>{line[4:]}</h3>")
            elif line.startswith("# "):
                html_parts.append(f"<h1>{line[2:]}</h1>")
            # Lists
            elif line.strip().startswith("- "):
                current_section.append(f"• {line.strip()[2:]}")
            elif line.strip().startswith("* "):
                current_section.append(f"• {line.strip()[2:]}")
            # Inline code
            elif "`" in line:
                line = line.replace("`", "<code>").replace("</code><code>", "</code>")
                current_section.append(line)
            # Regular text
            elif line.strip():
                current_section.append(line)
            # Empty line - close section if needed
            elif current_section:
                html_parts.append(
                    f'<div class="analysis-block"><p>{"<br>".join(current_section)}</p></div>'
                )
                current_section = []

        # Close any remaining section
        if current_section:
            html_parts.append(
                f'<div class="analysis-block"><p>{"<br>".join(current_section)}</p></div>'
            )
        if in_code_block and code_block:
            code = "\n".join(code_block)
            html_parts.append(f"<pre><code>{self._escape_html(code)}</code></pre>")

        return "\n".join(html_parts)

    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters."""
        return (
            text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#39;")
        )


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Code Analyzer Agent - Analyze code and generate HTML reports"
    )
    parser.add_argument(
        "--path",
        type=str,
        required=True,
        help="Path to the code directory to analyze",
    )
    parser.add_argument(
        "--request",
        type=str,
        required=True,
        help="Your request or question about the code",
    )
    parser.add_argument(
        "--design",
        type=str,
        choices=["modern", "minimal", "classic"],
        default="modern",
        help="Design language for HTML output (default: modern)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output/analysis.html",
        help="Output HTML file path (default: output/analysis.html)",
    )

    args = parser.parse_args()

    # Validate path exists
    if not Path(args.path).exists():
        print(f"Error: Path does not exist: {args.path}", file=sys.stderr)
        sys.exit(1)

    # Create and run agent
    agent = CodeAnalyzerAgent(
        code_path=args.path,
        user_request=args.request,
        design_language=args.design,
        output_file=args.output,
    )

    try:
        await agent.analyze_and_generate()
    except KeyboardInterrupt:
        print("\n\nAnalysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError during analysis: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
