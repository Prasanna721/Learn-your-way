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
        design_language: str = "modern and clean",
        output_file: str = "output/analysis.html",
    ):
        """Initialize the Code Analyzer Agent.

        Args:
            code_path: Path to the code directory to analyze
            user_request: User's request/question about the code
            design_language: Design style description for HTML output (e.g., "dark mode", "minimalist", "cyberpunk")
            output_file: Output HTML file path
        """
        self.code_path = Path(code_path).resolve()
        self.user_request = user_request
        self.design_language = design_language
        self.output_file = Path(output_file)
        self.output_file.parent.mkdir(parents=True, exist_ok=True)

        # HTML content accumulator
        self.html_content = []

    def _create_analysis_prompt(self) -> str:
        """Create the analysis prompt for Claude."""
        return f"""You are a code analysis expert. Analyze the code at path: {self.code_path}

User Request: {self.user_request}

Please follow these steps:
1. First, explore the directory structure using bash commands (ls, find, tree, etc.)
2. Read relevant code files to understand the implementation
3. Analyze the code based on the user's request
4. Provide a comprehensive analysis

IMPORTANT: After completing your analysis, you MUST generate a complete HTML report.

The HTML report should:
- Follow the design language: "{self.design_language}"
- Be a complete, valid HTML document with <!DOCTYPE html>
- Include embedded CSS styling that matches the design language
- Be responsive and professional
- Include the following metadata:
  * Code Path: {self.code_path}
  * User Request: {self.user_request}
  * Design Language: {self.design_language}
  * Generated Timestamp
- Organize the analysis content with proper headings, sections, and code blocks
- Use syntax highlighting for code (using <pre><code> with appropriate styling)
- Be visually appealing and easy to read

Generate the complete HTML as the final part of your response, starting with "<!DOCTYPE html>".
The HTML should be production-ready and render beautifully in any browser.

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
                            # Accumulate all content
                            self.html_content.append(block.text)
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
        """Extract and save the HTML generated by Claude."""
        full_response = "\n".join(self.html_content)

        # Extract HTML from Claude's response
        # Claude should generate HTML starting with <!DOCTYPE html>
        html_start = full_response.find("<!DOCTYPE html>")

        if html_start != -1:
            # Extract everything from <!DOCTYPE html> onwards
            html_content = full_response[html_start:]

            # Clean up any trailing markdown or text after </html>
            html_end = html_content.find("</html>")
            if html_end != -1:
                html_content = html_content[:html_end + 7]  # +7 for </html>
        else:
            # Fallback: if Claude didn't generate HTML, create a simple one
            print("Warning: Claude didn't generate HTML. Creating simple fallback...")
            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Report</title>
    <style>
        body {{ font-family: system-ui; max-width: 1200px; margin: 2rem auto; padding: 2rem; line-height: 1.6; }}
        pre {{ background: #f5f5f5; padding: 1rem; overflow-x: auto; border-radius: 4px; }}
        code {{ background: #e9ecef; padding: 0.2rem 0.4rem; border-radius: 4px; }}
    </style>
</head>
<body>
    <h1>Code Analysis Report</h1>
    <p><strong>Path:</strong> {self.code_path}</p>
    <p><strong>Request:</strong> {self.user_request}</p>
    <p><strong>Design:</strong> {self.design_language}</p>
    <hr>
    <pre>{self._escape_html(full_response)}</pre>
</body>
</html>"""

        # Write to file
        self.output_file.write_text(html_content, encoding="utf-8")
        print(f"HTML report generated: {self.output_file.resolve()}")
        print(f"Open in browser: file://{self.output_file.resolve()}")

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
        default="modern and clean",
        help="Design language/style for HTML output (e.g., 'dark mode', 'minimalist', 'cyberpunk', 'glassmorphism')",
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
