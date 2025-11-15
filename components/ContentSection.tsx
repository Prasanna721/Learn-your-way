'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  'All',
  'Astronomy',
  'Biology',
  'Chemistry',
  'Computer Science',
  'ELA',
  'Economics',
  'Health',
  'History',
  'Philosophy',
  'Psychology',
  'Sociology'
];

const contentCards = [
  { category: 'Computer Science', title: 'Musical Neural Network', color: 'bg-purple-50', icon: '🎵', illustration: 'music', link: '/scopes/piano' },
  { category: 'History', title: 'Early Human Evolution and Migration', color: 'bg-amber-50', icon: '📚', illustration: 'history' },
  { category: 'Sociology', title: 'What is Sociology?', color: 'bg-blue-50', icon: '🏙️', illustration: 'sociology' },
  { category: 'Biology', title: 'Disruptions in the Immune System', color: 'bg-blue-100', icon: '🧬', illustration: 'biology' },
  { category: 'ELA', title: '"Reading" to understand and respond', color: 'bg-blue-50', icon: '📖', illustration: 'ela' },
  { category: 'Chemistry', title: 'Atoms and Molecules', color: 'bg-gray-100', icon: '🔬', illustration: 'chemistry' },
  { category: 'Chemistry', title: 'Carbon', color: 'bg-orange-50', icon: '🧪', illustration: 'carbon' },
  { category: 'Astronomy', title: 'Earth and Sky', color: 'bg-indigo-900', icon: '🌌', illustration: 'astronomy' }
];

export default function ContentSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  const filteredCards = activeCategory === 'All'
    ? contentCards
    : contentCards.filter(card => card.category === activeCategory);

  const handleCardClick = (card: typeof contentCards[0]) => {
    if (card.link) {
      router.push(card.link);
    }
  };

  return (
    <section className="h-screen w-full snap-start bg-white overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-10">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                inline-flex cursor-pointer items-center h-10 px-5 rounded-full
                font-semibold text-sm transition-all duration-200
                ${activeCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card)}
              className="group cursor-pointer overflow-hidden rounded-[24px] border border-[#ff6b4a33] bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#ff6b4a]">
                  <span className="text-[18px]">{card.icon}</span>
                  <span>{card.category}</span>
                </div>
                <h3 className="min-h-[3.25rem] text-[18px] font-semibold leading-6 text-black group-hover:text-neutral-700">
                  {card.title}
                </h3>
              </div>
              <div className={`${card.color} relative flex h-44 items-center justify-center overflow-hidden`}>
                {/* simple, lightweight placeholder illustrations */}
                {card.illustration === 'music' && (
                  <div className="relative flex items-center justify-center">
                    <div className="flex gap-2 items-end">
                      <div className="w-3 h-12 bg-purple-400 rounded-t-lg" />
                      <div className="w-3 h-20 bg-purple-500 rounded-t-lg" />
                      <div className="w-3 h-16 bg-purple-400 rounded-t-lg" />
                      <div className="w-3 h-24 bg-purple-600 rounded-t-lg" />
                      <div className="w-3 h-14 bg-purple-400 rounded-t-lg" />
                      <div className="w-3 h-22 bg-purple-500 rounded-t-lg" />
                      <div className="w-3 h-18 bg-purple-400 rounded-t-lg" />
                    </div>
                    <div className="absolute text-4xl opacity-70">🎵</div>
                  </div>
                )}
                {card.illustration === 'economics' && (
                  <div className="relative flex items-center justify-center">
                    <div className="relative h-24 w-24 rounded-full bg-sky-300">
                      <div className="absolute left-4 top-5 h-10 w-10 rounded-full bg-green-400" />
                      <div className="absolute right-4 top-6 h-6 w-6 rounded-full bg-yellow-300" />
                    </div>
                    <div className="absolute right-6 top-4 text-neutral-400">✈️</div>
                  </div>
                )}
                {card.illustration === 'history' && (
                  <div className="flex items-end justify-center gap-4 pb-6">
                    <div className="h-20 w-12 rounded-t-full bg-amber-700" />
                    <div className="h-16 w-12 rounded-t-full bg-amber-600" />
                    <div className="h-12 w-12 rounded-t-full bg-amber-500" />
                  </div>
                )}
                {card.illustration === 'sociology' && (
                  <div className="text-6xl">🏙️</div>
                )}
                {card.illustration === 'biology' && (
                  <div className="relative">
                    <div className="text-5xl">🦠</div>
                    <div className="absolute -left-10 -top-2 text-3xl">⚔️</div>
                  </div>
                )}
                {card.illustration === 'ela' && (
                  <div className="text-5xl">📄</div>
                )}
                {card.illustration === 'chemistry' && (
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-yellow-600 bg-yellow-400" />
                    ))}
                  </div>
                )}
                {card.illustration === 'carbon' && (
                  <div className="h-24 w-24 rounded-full bg-blue-300" />
                )}
                {card.illustration === 'astronomy' && (
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-t from-indigo-800 to-indigo-600" />
                    <div className="absolute left-1/2 top-8 h-16 w-1 -translate-x-1/2 bg-indigo-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
