#!/usr/bin/env python3
"""Quick test of the Code Analyzer Agent.

This is a minimal test to verify the agent works correctly.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import the agent
sys.path.insert(0, str(Path(__file__).parent))

from code_analyzer_agent import CodeAnalyzerAgent


async def test_basic_analysis():
    """Test basic agent functionality."""
    print("\n" + "=" * 70)
    print("Quick Test: Code Analyzer Agent")
    print("=" * 70)
    print("\nThis test will analyze the agents directory itself")
    print("and generate a simple HTML report.\n")

    # Create agent to analyze the agents directory
    agent = CodeAnalyzerAgent(
        code_path=".",  # Current directory (agents)
        user_request="List all Python files in this directory and briefly explain "
        "what each one does. Keep it concise.",
        design_language="modern",
        output_file="output/test-report.html",
    )

    try:
        await agent.analyze_and_generate()
        print("\n✅ Test completed successfully!")
        print(f"📄 Report saved to: {agent.output_file.resolve()}")
        print(f"🌐 Open in browser: file://{agent.output_file.resolve()}")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("Starting quick test...")
    try:
        asyncio.run(test_basic_analysis())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
