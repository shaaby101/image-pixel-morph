"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import TerminalWindow from "@/components/TerminalWindow";
import MorphCanvas, { MorphCanvasRef } from "@/components/MorphCanvas";

export default function Page() {
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(0.0015);
  const [status, setStatus] = useState<string>("SYSTEM IDLE. WAITING FOR PAYLOADS.");
  
  const canvasRef = useRef<MorphCanvasRef>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: "A" | "B") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (slot === "A") setImgA(reader.result as string);
      else setImgB(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMorph = () => {
    if (canvasRef.current) {
      canvasRef.current.startMorph();
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.exportMp4();
    }
  };

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      
      <main className="lg:ml-64 mt-10 p-4 lg:p-margin h-[calc(100vh-40px)] relative overflow-y-auto lg:overflow-hidden halftone pb-24">
        {/* Background Decay Elements */}
        <div className="absolute inset-0 crt-scanline z-0"></div>

        {/* Chaos Bento Grid */}
        <div className="relative w-full min-h-full flex flex-col lg:block gap-4">
          {/* ROOT.EXE - Upload Controls */}
          <TerminalWindow 
            title="C:\PIXEL_MORPH\ROOT.EXE" 
            className="relative lg:absolute lg:top-4 lg:left-4 w-full lg:max-w-[400px] h-[350px]"
            initialZIndex={10}
          >
            <div className="p-4 overflow-y-auto">
              <pre className="text-[10px] leading-tight mb-4 text-secondary hidden sm:block">
{`   _  _   _  _   _  _   _  _ 
  / \\/ \\ / \\/ \\ / \\/ \\ / \\/ \\
 (  R  )(  O  )(  O  )(  T  )
  \\_/\\_/ \\_/\\_/ \\_/\\_/ \\_/\\_/`}
              </pre>
              <p className="mb-2">Initializing breach protocol...</p>
              
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col">
                  <label className="text-[10px] text-zinc-400 mb-1">PAYLOAD_A [Source Image]</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "A")} className="text-xs text-white" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[10px] text-zinc-400 mb-1">PAYLOAD_B [Target Image]</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "B")} className="text-xs text-white" />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-zinc-400 mb-1">MORPH_SPEED: {speed.toFixed(4)}</label>
                  <input 
                    type="range" 
                    min="0.0001" max="0.01" step="0.0001" 
                    value={speed} 
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-[#00FFC2]"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center text-secondary mt-6">
                <span className="material-symbols-outlined animate-pulse">keyboard_arrow_right</span>
                <button 
                  onClick={handleMorph}
                  className="bg-primary-container text-black px-2 py-1 font-bold hover:bg-white active:translate-y-px transition-all"
                >
                  MORPH --FORCE
                </button>
              </div>

              {/* Input Block */}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-primary-container">#ROOT@PIXEL_MORPH:</span>
                <div className="w-2 h-5 bg-primary-container animate-pulse"></div>
              </div>
            </div>

            {/* "Stickers" on Window Frame */}
            <div className="absolute -top-4 -right-2 bg-yellow-300 text-black px-2 py-1 rotate-6 border border-black shadow-md font-graffiti-display text-xs pointer-events-none">
              STAY BACK!
            </div>
          </TerminalWindow>

          {/* Live_Feed.raw - Canvas */}
          <TerminalWindow 
            title="Live_Feed.raw" 
            icon="videocam"
            className="relative lg:absolute lg:top-4 lg:left-[450px] w-full lg:max-w-[600px] h-[350px] lg:h-[450px]"
            initialZIndex={5}
          >
            <div className="w-full h-[calc(100%-2rem)]">
              <MorphCanvas 
                ref={canvasRef}
                imgADataUrl={imgA} 
                imgBDataUrl={imgB} 
                speed={speed} 
                onStatusChange={setStatus} 
              />
            </div>
            {/* Play bar */}
            <div className="h-8 bg-zinc-300 flex items-center px-2 gap-2 mt-auto">
              <button onClick={handleMorph} className="win95-outset w-6 h-4 flex items-center justify-center hover:bg-zinc-400">
                <span className="material-symbols-outlined text-xs">play_arrow</span>
              </button>
              <div className="win95-inset bg-black h-4 flex-grow relative">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-[#00FFC2]"
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </TerminalWindow>

          {/* Active_Payloads - Export Controls */}
          <TerminalWindow 
            title="Active_Payloads" 
            className="relative lg:absolute lg:bottom-12 lg:left-4 w-full lg:max-w-[350px] h-[200px]"
            initialZIndex={12}
          >
            <div className="p-2 flex flex-col gap-2 h-full justify-between">
              <div>
                <h3 className="font-label-mono text-[10px] font-black uppercase text-zinc-700 bg-zinc-400 px-1 mb-2">Operation_Status</h3>
                <div className="win95-inset bg-black p-2 mb-2 min-h-[40px]">
                  <p className="text-[10px] text-[#00FFC2]">{status}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="win95-inset bg-white/5 p-2 flex justify-between items-center hover:bg-white/10 cursor-pointer text-xs">
                  <span className="text-zinc-400">MP4_ENCODER.EXE</span>
                  {canvasRef.current?.canExport ? (
                    <span className="text-[#00FFC2]">READY</span>
                  ) : (
                    <span className="text-error">WAITING</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-500 mt-auto">
                <button 
                  onClick={handleExport}
                  className="w-full win95-outset py-2 font-label-mono font-black text-sm hover:translate-y-[1px] active:win95-inset bg-[#c0c0c0] text-black disabled:opacity-50"
                >
                  DOWNLOAD_MP4
                </button>
              </div>
            </div>
          </TerminalWindow>

          {/* Floating Rage Meme Sticker */}
          <motion.div 
            className="absolute bottom-12 right-12 z-50 group cursor-help hidden md:block pointer-events-auto"
            drag
            dragMomentum={false}
            whileHover={{ scale: 1.1, rotate: 10 }}
            initial={{ rotate: -12 }}
          >
            <div className="bg-white p-2 border-4 border-black win95-outset">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUCS1Bj5_yONtTo-EjWebHbVidyLK9Ar22vaBxEQDe6n1d6hsMaOcwv744AUI4AuYL20oJg_E5x4ceFtOqjxd6rbubyGaBlGqx2gdcQg0rbMlkj2-hz62Xs08h8pU91kWaia2mODhLUhVbgKnTkFtd--cnQfn7uZ7LLHvptOwGgh6Z7enncSedyUL7_RjkItI1eMemcdntO0Z-cL7G0Zcmd9_XtOTPQcvs6XfUcYM748tTt-HMTXDMCu8XL_uSV-9Aq9DW3fshM-to" 
                alt="horror rage meme pixel art" 
                className="w-20 h-20 invert grayscale" 
              />
              <p className="text-black font-graffiti-display text-center text-xs mt-2 uppercase font-black">U MAD BRO?</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full border-t border-green-900/50 bg-black/90 flex items-center justify-between px-4 py-1 overflow-hidden z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
            <span className="font-mono text-[10px] uppercase leading-none text-green-500">[SYSTEM_ERROR]: STACK_OVERFLOW_AT_0x00FFC2</span>
          </div>
        </div>
        <nav className="hidden md:flex divide-x divide-green-900/30">
          <a className="px-4 font-mono text-[10px] uppercase leading-none text-green-800 hover:text-cyan-400 hover:bg-green-900/20 transition-colors animate-pulse" href="#">PING_BACK</a>
          <a className="px-4 font-mono text-[10px] uppercase leading-none text-green-800 hover:text-cyan-400 hover:bg-green-900/20 transition-colors" href="#">WIPE_DRIVE</a>
          <a className="px-4 font-mono text-[10px] uppercase leading-none text-green-800 hover:text-cyan-400 hover:bg-green-900/20 transition-colors" href="#">SUDO_RM</a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-600">CPU: 99%</span>
          <div className="win95-inset bg-zinc-900 w-24 h-2">
            <motion.div 
              className="bg-red-600 h-full" 
              animate={{ width: ["90%", "99%", "85%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </footer>
    </>
  );
}
