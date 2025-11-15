'use client';

import { useState, useEffect } from 'react';
import ScopeHeader from '@/components/ScopeHeader';
import NeuralPianoVisualization from './components/NeuralPianoVisualization';
import Chat from './components/Chat';

type ImmersiveViewProps = {
  inputUrl: string;
  setInputUrl: (url: string) => void;
  handleConnect: () => void;
  backendUrl: string;
};

type StepCardProps = {
  title: string;
  description: string;
  icon: string;
  children?: React.ReactNode;
};

function StepCard({ title, description, icon, children }: StepCardProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-lg">
        <div className="flex items-center gap-6">
          {/* Spinning blob icon */}
          <div className="flex-shrink-0 w-20 h-20 relative">
            <div
              className="absolute inset-0 rounded-full opacity-20 animate-spin"
              style={{
                background: `linear-gradient(135deg, ${icon} 0%, ${icon}99 100%)`,
                animationDuration: '3s',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
              }}
            />
            <div
              className="absolute inset-2 rounded-full opacity-40 animate-spin"
              style={{
                background: `radial-gradient(circle, ${icon} 0%, ${icon}aa 100%)`,
                animationDuration: '4.5s',
                animationTimingFunction: 'cubic-bezier(0.3, 0.1, 0.7, 0.9)',
                animationDirection: 'reverse',
              }}
            />
            <div
              className="absolute inset-4 rounded-full animate-pulse"
              style={{
                background: icon,
              }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black mb-1">{title}</h3>
            <p className="text-sm text-black/60">{description}</p>
          </div>
        </div>

        {/* Additional content */}
        {children && <div className="mt-6 pt-6 border-t border-black/10">{children}</div>}
      </div>
    </div>
  );
}

function ImmersiveView({ inputUrl, setInputUrl, handleConnect, backendUrl }: ImmersiveViewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleDownloadNext = () => {
    setCurrentStep(1);
  };

  const handleInstallNext = () => {
    setCurrentStep(2);
  };

  const handleConnectSubmit = () => {
    handleConnect();
  };

  // If connected, show the visualization (no hero image)
  if (backendUrl) {
    return (
      <div className="w-full">
        <NeuralPianoVisualization backendUrl={backendUrl} />
      </div>
    );
  }

  // Step wizard with hero image
  return (
    <>
      {/* Hero Image - only during setup */}
      <div className="w-full h-64 rounded-3xl mb-8 overflow-hidden">
        <img
          src="/piano-hero.png"
          alt="Neural Music Network"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Step Wizard */}
      {currentStep === 0 && (
        <StepCard
          title="Download Neural Network Backend"
          description="Get the backend package to power your neural music network"
          icon="#8b5cf6"
        >
          <div className="space-y-4">
            <p className="text-sm text-black/70">
              The backend runs separately so you can use powerful GPU clusters if needed.
            </p>
            <div className="flex gap-3">
              <a
                href="/piano_learning_neural_network.zip"
                download
                onClick={(e) => {
                  // Let download happen, then move to next step
                  setTimeout(handleDownloadNext, 500);
                }}
                className="inline-flex items-center gap-2 bg-[var(--brand-coral)] text-white px-6 py-3 rounded-full hover:bg-[var(--brand-coral-strong)] transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download & Continue
              </a>
              <button
                onClick={handleDownloadNext}
                className="px-6 py-3 rounded-full bg-black/5 hover:bg-black/10 transition-all text-sm text-black/70"
              >
                Skip
              </button>
            </div>
          </div>
        </StepCard>
      )}

      {currentStep === 1 && (
        <StepCard
          title="Install & Run Backend"
          description="Extract and run these commands in your terminal"
          icon="#ec4899"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="bg-black/5 rounded-xl p-4 font-mono text-sm">
                <div className="text-black/50 mb-1"># Navigate to extracted folder</div>
                <div className="text-black">cd piano_learning_neural_network</div>
              </div>
              <div className="bg-black/5 rounded-xl p-4 font-mono text-sm">
                <div className="text-black/50 mb-1"># Install dependencies</div>
                <div className="text-black">pip install -r requirements.txt</div>
              </div>
              <div className="bg-black/5 rounded-xl p-4 font-mono text-sm">
                <div className="text-black/50 mb-1"># Start the server</div>
                <div className="text-black">python main.py</div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-900">
              <strong>Note:</strong> First startup takes 30-40 seconds for compilation.
            </div>
            <button
              onClick={handleInstallNext}
              className="w-full bg-[var(--brand-coral)] text-white px-6 py-3 rounded-full hover:bg-[var(--brand-coral-strong)] transition-all font-medium"
            >
              Continue to Connect
            </button>
          </div>
        </StepCard>
      )}

      {currentStep === 2 && (
        <StepCard
          title="Connect to Backend"
          description="Enter your backend URL and start the neural network"
          icon="#3b82f6"
        >
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-4 py-3 border border-black/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)]"
              />
              <button
                onClick={handleConnectSubmit}
                disabled={!inputUrl.trim()}
                className="bg-[var(--brand-coral)] text-white px-8 py-3 rounded-full hover:bg-[var(--brand-coral-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Connect & Launch
              </button>
            </div>
            <p className="text-sm text-black/60">
              💡 <strong>Pro tip:</strong> Run on a GPU server and paste its URL here!
            </p>
          </div>
        </StepCard>
      )}
    </>
  );
}

type ExploreDataProps = {
  sandboxInfo: any;
  setSandboxInfo: (info: any) => void;
  execSessionId: string;
  setExecSessionId: (id: string) => void;
};

function ExploreData({ sandboxInfo, setSandboxInfo, execSessionId, setExecSessionId }: ExploreDataProps) {
  const [sandboxStatus, setSandboxStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputHtml, setOutputHtml] = useState<string>('');

  // Check if already initialized from props
  useEffect(() => {
    if (sandboxInfo && sandboxInfo.sandboxId) {
      setSandboxStatus('ready');
    }
  }, [sandboxInfo]);

  const initializeSandbox = async () => {
    setSandboxStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/daytona/scope/piano', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSandboxStatus('ready');
        setSandboxInfo(data);
        setExecSessionId(data.execSessionId || 'agent-session');
      } else {
        setSandboxStatus('error');
        setErrorMessage(data.error || 'Failed to initialize sandbox');
      }
    } catch (error) {
      setSandboxStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleAnalysisStart = async (request: string) => {
    setIsProcessing(true);
    setOutputHtml('');

    try {
      // Trigger code analysis
      const response = await fetch('/api/daytona/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandboxId: sandboxInfo.sandboxId,
          execSessionId,
          request,
          scopeId: 'piano',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Start polling for output file
        pollForOutput(data.outputPath);
      } else {
        setIsProcessing(false);
        alert('Error: ' + data.error);
      }
    } catch (error) {
      setIsProcessing(false);
      alert('Error starting analysis: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const pollForOutput = async (outputPath: string) => {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/daytona/check-output?sandboxId=${sandboxInfo.sandboxId}&outputPath=${encodeURIComponent(outputPath)}`);
        const data = await response.json();

        if (data.ready) {
          clearInterval(poll);
          // Download and display HTML
          const htmlResponse = await fetch(`/api/daytona/download-output?sandboxId=${sandboxInfo.sandboxId}&outputPath=${encodeURIComponent(outputPath)}`);
          const htmlData = await htmlResponse.json();

          if (htmlData.success) {
            setOutputHtml(htmlData.content);
            setIsProcessing(false);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsProcessing(false);
          alert('Timeout waiting for analysis output');
        }
      } catch (error) {
        clearInterval(poll);
        setIsProcessing(false);
        alert('Error polling for output: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }, 1000); // Poll every second
  };

  // Show initialization view if not ready
  if (sandboxStatus !== 'ready') {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8">
        <h2 className="text-2xl font-bold text-black mb-4">📊 Explore Data</h2>
        <div className="space-y-6">
          <p className="text-black/80">
            Data exploration and analysis for the Neural Music Network.
          </p>

          <div className="p-6 bg-black/5 rounded-xl">
            <h3 className="text-lg font-semibold text-black mb-3">Code Agent</h3>

            {sandboxStatus === 'idle' && (
              <div className="space-y-3">
                <p className="text-sm text-black/70">
                  Initialize the code analysis agent to explore and understand the codebase.
                </p>
                <button
                  onClick={initializeSandbox}
                  className="px-6 py-3 bg-[var(--brand-coral)] text-white rounded-full hover:bg-[var(--brand-coral-dark)] transition-all font-medium shadow-md"
                >
                  Initialize Agent
                </button>
              </div>
            )}

            {sandboxStatus === 'loading' && (
              <div className="space-y-3">
                <p className="text-sm text-black/70">
                  Setting up agent environment...
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--brand-coral)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-black/60">Creating sandbox, mounting volume, and installing dependencies...</span>
                </div>
              </div>
            )}

            {sandboxStatus === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-red-700 font-medium">
                  ❌ Error initializing agent
                </p>
                <p className="text-sm text-red-600">{errorMessage}</p>
                <button
                  onClick={initializeSandbox}
                  className="px-4 py-2 bg-[var(--brand-coral-light)] text-black rounded-full hover:bg-[var(--brand-coral)] transition-all text-sm"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Two-column layout when ready
  return (
    <div className="fixed inset-0 top-20 flex" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Left column - Output view (65%) */}
      <div className="w-[65%] bg-white overflow-auto">
        {outputHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: outputHtml }}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black/40">
            <div className="text-center">
              <p className="text-lg mb-2">No analysis yet</p>
              <p className="text-sm">Send a message to start analyzing the code</p>
            </div>
          </div>
        )}
      </div>

      {/* Right column - Chat (35%) */}
      <div className="w-[35%] border-l border-black/10 bg-white">
        <Chat
          sandboxId={sandboxInfo.sandboxId}
          execSessionId={execSessionId}
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={() => {}}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-8">
      <h2 className="text-2xl font-bold text-black mb-4">🔄 Flow Diagram</h2>
      <div className="space-y-6">
        <p className="text-black/80">
          Visual representation of the neural network architecture and learning flow.
        </p>
        <div className="p-6 bg-black/5 rounded-xl">
          <h3 className="text-lg font-semibold text-black mb-3">Coming Soon</h3>
          <p className="text-sm text-black/70">
            Interactive flow diagrams showing signal propagation, learning mechanisms, and neural network architecture.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PianoPage() {
  const [backendUrl, setBackendUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('http://127.0.0.1:8000');
  const [currentSection, setCurrentSection] = useState<string>('immersive');

  // Persistent sandbox state across sections
  const [sandboxInfo, setSandboxInfo] = useState<any>(null);
  const [execSessionId, setExecSessionId] = useState<string>('');

  const handleConnect = () => {
    setBackendUrl(inputUrl);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'immersive':
        return <ImmersiveView inputUrl={inputUrl} setInputUrl={setInputUrl} handleConnect={handleConnect} backendUrl={backendUrl} />;
      case 'explore':
        return <ExploreData sandboxInfo={sandboxInfo} setSandboxInfo={setSandboxInfo} execSessionId={execSessionId} setExecSessionId={setExecSessionId} />;
      case 'flow':
        return <FlowDiagram />;
      default:
        return <ImmersiveView inputUrl={inputUrl} setInputUrl={setInputUrl} handleConnect={handleConnect} backendUrl={backendUrl} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-coral-lighter)]">
      <ScopeHeader scopeId="piano" onSectionChange={setCurrentSection} />

      {/* Page content area - changes based on selected section */}
      <main className={currentSection === 'immersive' && backendUrl ? 'w-full' : 'px-4 sm:px-6 py-6 max-w-5xl mx-auto'}>
        {renderContent()}
      </main>
    </div>
  );
}
