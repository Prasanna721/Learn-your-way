'use client';

import { useState } from 'react';
import ScopeHeader from '@/components/ScopeHeader';

type SectionContentProps = {
  scopeId: string;
};

function ImmersiveView({ scopeId }: SectionContentProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[var(--brand-sand)] p-8">
      <h2 className="text-2xl font-bold text-black mb-4">📖 Immersive View</h2>
      <div className="prose prose-lg max-w-none text-black/80">
        <p>
          This is the immersive text view for{' '}
          <span className="font-semibold text-black">{decodeURIComponent(scopeId)}</span>.
        </p>
        <p className="mt-4">
          In this mode, you can read detailed, narrative-style content that provides deep context
          and understanding. The text is personalized based on your grade level and interests.
        </p>
        <div className="mt-6 p-6 bg-white/80 rounded-xl">
          <h3 className="text-xl font-semibold text-black mb-3">Example Content</h3>
          <p className="text-black/70">
            Add your immersive learning content here. This could include rich text, images,
            interactive elements, and more.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExploreData({ scopeId }: SectionContentProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[var(--brand-sand)] p-8">
      <h2 className="text-2xl font-bold text-black mb-4">📊 Explore Data</h2>
      <div className="space-y-6">
        <p className="text-black/80">
          Explore data and visualizations for{' '}
          <span className="font-semibold text-black">{decodeURIComponent(scopeId)}</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white/80 rounded-xl">
            <h3 className="text-lg font-semibold text-black mb-3">Data Point 1</h3>
            <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-black/60">
              Chart Placeholder
            </div>
          </div>
          <div className="p-6 bg-white/80 rounded-xl">
            <h3 className="text-lg font-semibold text-black mb-3">Data Point 2</h3>
            <div className="h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center text-black/60">
              Chart Placeholder
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/80 rounded-xl">
          <h3 className="text-lg font-semibold text-black mb-3">Interactive Data Table</h3>
          <p className="text-sm text-black/70">Add interactive charts, graphs, and data visualizations here.</p>
        </div>
      </div>
    </div>
  );
}

function FlowDiagram({ scopeId }: SectionContentProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[var(--brand-sand)] p-8">
      <h2 className="text-2xl font-bold text-black mb-4">🔄 Flow Diagram</h2>
      <div className="space-y-6">
        <p className="text-black/80">
          Visual flow diagram for{' '}
          <span className="font-semibold text-black">{decodeURIComponent(scopeId)}</span>.
        </p>

        <div className="p-8 bg-white/80 rounded-xl">
          <div className="flex flex-col items-center gap-6">
            {/* Flow diagram boxes */}
            <div className="w-full max-w-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg text-center font-semibold text-black">
                  Step 1: Introduction
                </div>
                <div className="text-2xl text-black/40">↓</div>
                <div className="w-full p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg text-center font-semibold text-black">
                  Step 2: Main Concept
                </div>
                <div className="text-2xl text-black/40">↓</div>
                <div className="w-full p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg text-center font-semibold text-black">
                  Step 3: Application
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-black/70 text-center">
            Add your custom flow diagrams, process maps, or concept maps here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ScopePage({ params }: { params: Promise<{ scope_id: string }> }) {
  const [currentSection, setCurrentSection] = useState<string>('immersive');
  const [scopeId, setScopeId] = useState<string>('');

  // Unwrap params on mount
  useState(() => {
    params.then(({ scope_id }) => setScopeId(scope_id));
  });

  const renderContent = () => {
    switch (currentSection) {
      case 'immersive':
        return <ImmersiveView scopeId={scopeId} />;
      case 'explore':
        return <ExploreData scopeId={scopeId} />;
      case 'flow':
        return <FlowDiagram scopeId={scopeId} />;
      default:
        return <ImmersiveView scopeId={scopeId} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ScopeHeader scopeId={scopeId} onSectionChange={setCurrentSection} />

      {/* Page content area - changes based on selected section */}
      <main className="px-4 sm:px-6 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

