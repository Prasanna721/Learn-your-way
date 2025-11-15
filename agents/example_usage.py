#!/usr/bin/env python3
"""Example usage of the Code Analyzer Agent.

This script demonstrates how to use the Code Analyzer Agent
programmatically to analyze code and generate HTML reports.
"""

import asyncio
from pathlib import Path

from code_analyzer_agent import CodeAnalyzerAgent


async def example_1_analyze_examples():
    """Example 1: Analyze the SDK examples directory."""
    print("\n" + "=" * 70)
    print("EXAMPLE 1: Analyzing SDK Examples")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../examples",
        user_request="List all example files and explain what each one demonstrates. "
        "Organize them by complexity level.",
        design_language="modern",
        output_file="output/examples-analysis.html",
    )

    await agent.analyze_and_generate()


async def example_2_analyze_architecture():
    """Example 2: Analyze the SDK architecture."""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Architecture Analysis")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../src/claude_agent_sdk",
        user_request="Explain the overall architecture of the Claude Agent SDK. "
        "Describe the main components, their responsibilities, and how they interact. "
        "Include class diagrams or structure overviews.",
        design_language="minimal",
        output_file="output/architecture-analysis.html",
    )

    await agent.analyze_and_generate()


async def example_3_hooks_deep_dive():
    """Example 3: Deep dive into hooks functionality."""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Hooks Deep Dive")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../examples",
        user_request="Focus on the hooks.py example. Explain in detail how hooks work, "
        "what different hook types are available, and provide best practices for using them.",
        design_language="classic",
        output_file="output/hooks-deep-dive.html",
    )

    await agent.analyze_and_generate()


async def example_4_compare_streaming_modes():
    """Example 4: Compare different streaming examples."""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Streaming Modes Comparison")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../examples",
        user_request="Compare streaming_mode.py, streaming_mode_ipython.py, and streaming_mode_trio.py. "
        "Explain the differences, when to use each approach, and provide usage recommendations.",
        design_language="modern",
        output_file="output/streaming-comparison.html",
    )

    await agent.analyze_and_generate()


async def example_5_security_review():
    """Example 5: Security-focused code review."""
    print("\n" + "=" * 70)
    print("EXAMPLE 5: Security Review")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../src",
        user_request="Review the code for security best practices. Look for: "
        "1. Input validation "
        "2. Command injection vulnerabilities "
        "3. File path traversal issues "
        "4. Secure handling of credentials "
        "5. Error message information disclosure. "
        "Provide specific recommendations for improvements.",
        design_language="modern",
        output_file="output/security-review.html",
    )

    await agent.analyze_and_generate()


async def example_6_mcp_servers():
    """Example 6: Analyze MCP server implementation."""
    print("\n" + "=" * 70)
    print("EXAMPLE 6: MCP Servers Analysis")
    print("=" * 70)

    agent = CodeAnalyzerAgent(
        code_path="../examples",
        user_request="Analyze the mcp_calculator.py example. Explain how MCP servers work, "
        "how to create custom tools, and the difference between in-process SDK MCP servers "
        "and external MCP servers. Include code examples.",
        design_language="modern",
        output_file="output/mcp-servers-analysis.html",
    )

    await agent.analyze_and_generate()


async def run_single_example(example_num: int):
    """Run a single example by number."""
    examples = {
        1: example_1_analyze_examples,
        2: example_2_analyze_architecture,
        3: example_3_hooks_deep_dive,
        4: example_4_compare_streaming_modes,
        5: example_5_security_review,
        6: example_6_mcp_servers,
    }

    if example_num in examples:
        await examples[example_num]()
    else:
        print(f"Example {example_num} not found")


async def run_all_examples():
    """Run all examples sequentially."""
    examples = [
        example_1_analyze_examples,
        example_2_analyze_architecture,
        example_3_hooks_deep_dive,
        example_4_compare_streaming_modes,
        example_5_security_review,
        example_6_mcp_servers,
    ]

    for i, example in enumerate(examples, 1):
        print(f"\n\n{'#' * 70}")
        print(f"Running Example {i} of {len(examples)}")
        print(f"{'#' * 70}")
        await example()
        await asyncio.sleep(2)  # Brief pause between examples


async def interactive_mode():
    """Interactive mode - prompt user for inputs."""
    print("\n" + "=" * 70)
    print("INTERACTIVE MODE")
    print("=" * 70)

    # Get user inputs
    code_path = input("\nEnter the code path to analyze: ").strip()
    if not code_path:
        code_path = "../examples"
        print(f"Using default: {code_path}")

    user_request = input("\nEnter your analysis request: ").strip()
    if not user_request:
        user_request = "Analyze this codebase and explain what it does"
        print(f"Using default: {user_request}")

    design = input("\nChoose design (modern/minimal/classic) [modern]: ").strip()
    if not design or design not in ["modern", "minimal", "classic"]:
        design = "modern"
        print(f"Using: {design}")

    output = input("\nEnter output file path [output/interactive-analysis.html]: ").strip()
    if not output:
        output = "output/interactive-analysis.html"

    # Validate path
    if not Path(code_path).exists():
        print(f"\nError: Path '{code_path}' does not exist!")
        return

    # Create and run agent
    agent = CodeAnalyzerAgent(
        code_path=code_path,
        user_request=user_request,
        design_language=design,
        output_file=output,
    )

    await agent.analyze_and_generate()


async def main():
    """Main entry point with menu."""
    print("\n" + "=" * 70)
    print("Code Analyzer Agent - Example Usage")
    print("=" * 70)
    print("\nAvailable Examples:")
    print("  1. Analyze SDK Examples")
    print("  2. Architecture Analysis")
    print("  3. Hooks Deep Dive")
    print("  4. Streaming Modes Comparison")
    print("  5. Security Review")
    print("  6. MCP Servers Analysis")
    print("  7. Run All Examples")
    print("  8. Interactive Mode")
    print("  0. Exit")

    choice = input("\nSelect an option (0-8): ").strip()

    if choice == "0":
        print("Goodbye!")
        return
    elif choice == "7":
        await run_all_examples()
    elif choice == "8":
        await interactive_mode()
    elif choice.isdigit() and 1 <= int(choice) <= 6:
        await run_single_example(int(choice))
    else:
        print("Invalid choice. Please run again and select 0-8.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback

        traceback.print_exc()
