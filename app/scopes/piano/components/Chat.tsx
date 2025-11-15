'use client';

import { useState, useRef, useEffect } from 'react';

type ChatProps = {
  sandboxId: string;
  execSessionId: string;
  onAnalysisStart: (request: string) => void;
  onAnalysisComplete: (outputPath: string) => void;
  isProcessing: boolean;
};

export default function Chat({ sandboxId, execSessionId, onAnalysisStart, onAnalysisComplete, isProcessing }: ChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Trigger analysis
    onAnalysisStart(userMessage);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-black/10 bg-white">
        <h3 className="font-semibold text-black">Agent Chat</h3>
        <p className="text-xs text-black/60">Ask about the code architecture</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-black/40 text-sm py-8">
            Send a message to analyze the code
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-[var(--brand-coral)] text-white'
                  : 'bg-black/5 text-black'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-black/5 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[var(--brand-coral)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-black/60">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-black/10 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder="Ask about the code..."
            className="flex-1 px-4 py-2 border border-black/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)] disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-2 bg-[var(--brand-coral)] text-white rounded-full hover:bg-[var(--brand-coral-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
