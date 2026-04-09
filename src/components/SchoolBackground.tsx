import React from 'react';

const SchoolBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.03] dark:opacity-[0.05]">
      {/* Moving background shapes using SVG paths */}
      
      {/* Graduation Cap - Top Right */}
      <div className="absolute top-[10%] right-[5%] animate-float scale-150 rotate-12">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      {/* Book - Bottom Left */}
      <div className="absolute bottom-[15%] left-[5%] animate-[float_4s_ease-in-out_infinite] -rotate-12">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>

      {/* Atom - Mid Right */}
      <div className="absolute top-[45%] right-[8%] animate-[spin_20s_linear_infinite] opacity-50">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <circle cx="12" cy="12" r="1" />
          <path d="M20.2 20.2c2.04-2.03.02-7.36-4.52-11.9s-9.87-6.56-11.9-4.52s-.02 7.36 4.52 11.9s9.87 6.56 11.9 4.52z" />
          <path d="M3.8 3.8c-2.04 2.03-.02 7.36 4.52 11.9s9.87 6.56 11.9 4.52s.02-7.36-4.52-11.9s-9.87-6.56-11.9-4.52z" />
        </svg>
      </div>

      {/* Backpack - Top Left */}
      <div className="absolute top-[20%] left-[10%] animate-[float_5s_ease-in-out_infinite] scale-75 opacity-40">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M4 20V10c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <rect x="8" y="10" width="8" height="8" rx="1" />
          <path d="M8 14h8" />
        </svg>
      </div>

      {/* Mathematical Symbols */}
      <div className="absolute top-[35%] left-[20%] text-6xl font-serif text-primary rotate-45 select-none hover:scale-110 transition-transform cursor-default">π</div>
      <div className="absolute bottom-[30%] right-[25%] text-7xl font-serif text-secondary -rotate-12 select-none hover:scale-110 transition-transform cursor-default">∑</div>
      <div className="absolute top-[60%] left-[15%] text-5xl font-serif text-accent -rotate-45 select-none hover:scale-110 transition-transform cursor-default">∞</div>
      <div className="absolute bottom-[10%] right-[10%] text-6xl font-serif text-primary rotate-12 select-none hover:scale-110 transition-transform cursor-default">√</div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#5b4fe8_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.4]" />
    </div>
  );
};

export default SchoolBackground;
