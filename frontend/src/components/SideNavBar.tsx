import React from 'react';

export default function SideNavBar() {
  return (
    <aside className="fixed left-0 top-10 h-full w-64 border-r-4 border-dotted border-zinc-800 bg-black flex flex-col p-6 space-y-8 z-40 hidden lg:flex">
      <div className="mb-4">
        <h2 className="font-graffiti-display italic font-black text-xl text-[#00FFC2] blur-[0.5px]">OPERATOR_0</h2>
        <p className="font-label-mono text-[10px] text-secondary opacity-80">STATUS: COMPROMISED</p>
      </div>
      <nav className="space-y-6">
        <a className="flex items-center gap-3 bg-white text-black -rotate-2 scale-110 border-2 border-black p-2 cursor-crosshair" href="#">
          <span className="material-symbols-outlined font-variation-settings-'FILL' 1">skull</span>
          <span className="font-graffiti-display italic font-black text-xl">INFILTRATE</span>
        </a>
        <a className="flex items-center gap-3 text-[#00FFC2] opacity-70 hover:opacity-100 hover:skew-x-6 transition-transform duration-75 cursor-crosshair" href="#">
          <span className="material-symbols-outlined">enhanced_encryption</span>
          <span className="font-graffiti-display italic font-black text-xl">ENCRYPT</span>
        </a>
        <a className="flex items-center gap-3 text-[#00FFC2] opacity-70 hover:opacity-100 hover:skew-x-6 transition-transform duration-75 cursor-crosshair" href="#">
          <span className="material-symbols-outlined">deployed_code</span>
          <span className="font-graffiti-display italic font-black text-xl">PAYLOAD</span>
        </a>
        <div className="h-px w-full bg-zinc-800 my-4"></div>
        <a className="flex items-center gap-3 text-[#00FFC2] opacity-70 hover:opacity-100 hover:skew-x-6 transition-transform duration-75 cursor-crosshair" href="#">
          <span className="material-symbols-outlined">power_settings_new</span>
          <span className="font-graffiti-display italic font-black text-xl text-error">LOGOUT</span>
        </a>
      </nav>
      {/* Digital Graffiti Sticker */}
      <div className="absolute bottom-20 -right-4 rotate-12 bg-white text-black p-1 border-2 border-black font-label-mono text-[10px] uppercase font-black">
        Trust No One
      </div>
    </aside>
  );
}
