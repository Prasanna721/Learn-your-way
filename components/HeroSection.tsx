export default function HeroSection() {
  return (
    <section className="relative h-screen w-full snap-start overflow-hidden bg-white">
      {/* SVG background that replicates the screenshot wave pattern */}
      <img
        src="/hero-waves.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-8 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left column */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-[28px] font-semibold tracking-tight text-black">Learn Your Way</span>
            </div>

            <h1 className="text-black font-extrabold tracking-tight leading-[1.05] text-[44px] sm:text-[56px] lg:text-[68px]">
              Re-imagining AI for every learner
            </h1>

            <p className="mt-5 max-w-xl text-[18px] leading-8 text-black/80">
              Learn Your Way transforms content into a dynamic and engaging learning experience tailored for you.
            </p>

            <div className="mt-6 flex items-center gap-3 text-black/80 cursor-pointer hover:text-black transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <span className="text-sm font-semibold">See how it works</span>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button className="btn-pill btn-coral" aria-label="Join waitlist and upload PDF">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z" />
                </svg>
                <span>Upload your Models</span>
              </button>

              <button className="btn-pill btn-sand" aria-label="Try it now">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
                </svg>
                <span>Try it now</span>
              </button>
            </div>
          </div>

          {/* Right column: interest card set into a soft container */}
          <div className="hidden lg:block">
            <div className="relative rounded-[28px] bg-[var(--brand-sand)] p-8 shadow-card w-[440px] ml-auto">
              <div className="mx-auto w-full rounded-2xl bg-white p-4 shadow-sm">
                <p className="px-1 pb-3 text-[13px] font-semibold text-black/70">What are your interests?</p>
                <div className="grid grid-cols-5 gap-3">
                  {['📚', '🛰️', '🧪', '🎨', '🎵', '🎬', '📸', '🌳', '🎮', '⚽', '🏀', '🚲', '🏐', '🎈', '🥎', '🧸', '🛼', '🧩', '🚗', '⚙️'].map((e, i) => (
                    <div key={i} className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f7f7f8] text-xl">
                      {e}
                    </div>
                  ))}
                </div>
              </div>
              {/* pointer triangle */}
              <div className="pointer-triangle absolute left-[68%] -bottom-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
