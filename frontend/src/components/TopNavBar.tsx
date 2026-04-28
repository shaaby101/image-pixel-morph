import React from 'react';

export default function TopNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 border-t-2 border-l-2 border-zinc-100 border-r-2 border-b-2 border-zinc-600 bg-zinc-300 dark:bg-zinc-800 shadow-[inset_1px_1px_0px_#fff] flex justify-between items-center h-10 px-1">
      <div className="flex items-center gap-2">
        <div className="text-lg font-black bg-blue-700 text-white px-2 py-0.5 border-r-2 border-b-2 border-black font-headline-md uppercase">SYS_HALT_v.01</div>
        <nav className="hidden md:flex gap-1">
          <a className="bg-blue-800 text-white px-2 font-label-mono text-sm font-bold uppercase tracking-widest" href="#">FILE</a>
          <a className="text-black dark:text-zinc-300 px-2 font-label-mono text-sm font-bold uppercase tracking-widest hover:bg-zinc-400 dark:hover:bg-zinc-700" href="#">DEBUG</a>
          <a className="text-black dark:text-zinc-300 px-2 font-label-mono text-sm font-bold uppercase tracking-widest hover:bg-zinc-400 dark:hover:bg-zinc-700" href="#">WORM</a>
          <a className="text-black dark:text-zinc-300 px-2 font-label-mono text-sm font-bold uppercase tracking-widest hover:bg-zinc-400 dark:hover:bg-zinc-700" href="#">ROOT</a>
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <div className="win95-inset bg-black px-2 py-0.5 flex items-center mr-2">
          <span className="text-primary-container font-label-mono text-xs">SCANNING...</span>
          <span className="material-symbols-outlined text-xs text-primary-container ml-2">search</span>
        </div>
        <button className="win95-outset w-6 h-6 flex items-center justify-center hover:bg-zinc-400">
          <span className="material-symbols-outlined text-sm">minimize</span>
        </button>
        <button className="win95-outset w-6 h-6 flex items-center justify-center hover:bg-zinc-400">
          <span className="material-symbols-outlined text-sm">fullscreen</span>
        </button>
        <button className="win95-outset w-6 h-6 flex items-center justify-center hover:bg-zinc-400">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </header>
  );
}
