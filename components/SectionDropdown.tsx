'use client';

import { useState, useRef, useEffect } from 'react';

type Section = {
  id: string;
  word1: string;
  emoji: string;
  word2: string;
};

const sections: Section[] = [
  {
    id: 'immersive',
    word1: 'Immersive',
    emoji: '📖',
    word2: 'View',
  },
  {
    id: 'explore',
    word1: 'Explore',
    emoji: '📊',
    word2: 'Data',
  },
  {
    id: 'flow',
    word1: 'Flow',
    emoji: '🔄',
    word2: 'Diagram',
  },
];

type SectionDropdownProps = {
  onSectionChange?: (sectionId: string) => void;
};

export default function SectionDropdown({ onSectionChange }: SectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (section: Section) => {
    setSelectedSection(section);
    setIsOpen(false);
    onSectionChange?.(section.id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected section button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-4 rounded-full bg-[var(--brand-coral-light)] hover:bg-[var(--brand-coral)] transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-black">{selectedSection.word1}</span>
          <span className="text-base">{selectedSection.emoji}</span>
          <span className="text-base font-medium text-black">{selectedSection.word2}</span>
        </div>
        {/* Chevron down */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] flex flex-col gap-1.5 z-50">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSelect(section)}
              className={`
                flex items-center justify-center gap-2 px-5 py-4 bg-[var(--brand-coral-lighter)] hover:bg-[var(--brand-coral-light)]
                transition-all duration-200 cursor-pointer
                ${index === 0 ? 'rounded-t-2xl' : ''}
                ${index === sections.length - 1 ? 'rounded-b-2xl' : ''}
                ${selectedSection.id === section.id ? 'bg-[var(--brand-coral-light)]' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-black">{section.word1}</span>
                <span className="text-base">{section.emoji}</span>
                <span className="text-base font-medium text-black">{section.word2}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
