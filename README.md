# Learn Your Way

A new way to visualize machine learning models with real-time input and output.
<img width="3584" height="2158" alt="Screenshot 2025-11-15 at 4 06 53 PM" src="https://github.com/user-attachments/assets/160f531b-5239-40e7-8b9e-6b29388998d6" />

## What It Does

Learn Your Way revolutionizes how you interact with and understand ML models by providing intelligent, automatic visualization of model architectures and their behavior.

### Key Features

- **Drag & Drop Interface**: Simply drop your training and inference code (with or without data)
- **Intelligent Layer Detection**: Automatically understands your model's architecture and layers
- **Smart Visualization**: Determines the best way to visualize your specific ML model
- **Real-time I/O Monitoring**: See inputs and outputs as they flow through your model
- **GPU-Ready Deployment**: Download and run on your own GPU instances

## How It Works

1. **Upload Your Code**: Drag and drop your ML training and inference code
2. **Automated Analysis**: Claude Code agents running in Daytona analyze your model structure
3. **FastAPI Server Generation**: Automatically creates a FastAPI server for model inference
4. **Deploy Anywhere**: Download the generated code and run it on your GPU instance
5. **Connect & Visualize**: Provide the connection URL and start visualizing your model in real-time

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **AI Agents**: Claude Code agents for code analysis and generation
- **Runtime Environment**: Daytona for isolated execution
- **Inference Server**: FastAPI (auto-generated)
- **Deployment**: Flexible - run on any GPU instance

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Use Cases

- Debug ML models by visualizing layer activations
- Understand how data flows through your network
- Demonstrate model behavior to non-technical stakeholders
- Experiment with different model architectures
- Educational tool for learning ML concepts

## Why Learn Your Way?

Traditional ML development involves writing code, running experiments, and analyzing logs or tensorboard outputs. Learn Your Way provides an intuitive, visual interface that helps you understand your models at a glance, making ML development faster and more accessible.

---

Built with Claude Code agents and Daytona for seamless ML model analysis and visualization.
