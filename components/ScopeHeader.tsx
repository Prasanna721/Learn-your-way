'use client';

import { useState } from 'react';
import Link from 'next/link';
import SectionDropdown from './SectionDropdown';

type ScopeHeaderProps = {
  scopeId: string;
  onSectionChange?: (sectionId: string) => void;
};

export default function ScopeHeader({ scopeId, onSectionChange }: ScopeHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top header bar - full width */}
      <header className="w-full bg-[var(--brand-sand)]">
        <div className="h-20 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Learn Your Way branding */}
          <div className="flex items-center gap-3 flex-1">
            <Link href="/" className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-black hover:text-[var(--brand-coral-dark)] transition-colors cursor-pointer">
              Learn Your Way
            </Link>
          </div>

          {/* Center: Section Dropdown */}
          <div className="flex-1 flex items-center justify-center">
            <SectionDropdown onSectionChange={onSectionChange} />
          </div>

          {/* Right: Info icon */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Scope info"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-coral-light)] text-black/70 hover:text-black hover:bg-[var(--brand-coral)] transition-all duration-200 cursor-pointer"
            >
              {/* info icon - Material Design outline */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Info modal - Welcome dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border-4 border-[var(--brand-coral)] shadow-2xl p-8">
            <h2 className="text-xl text-black/80 mb-6">
              Welcome to Learn Your Way!
            </h2>

            <div className="space-y-2 text-black/80 text-lg">
              <p>
                This text has been personalized for a student in grade 7 who likes books.
                You'll see examples throughout this learning content where materials are
                tailored for grade and interests.
              </p>

              <p>
                Explore this content in multiple ways by clicking an icon at the top:
              </p>

              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Immersive Text</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Slides & Narration</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Audio Lesson</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Mindmap</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-pill btn-coral"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

