"use client";

import React, { useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalWindowProps {
  title: string;
  icon?: string;
  className?: string;
  children: React.ReactNode;
  initialZIndex?: number;
  onFocus?: () => void;
}

export default function TerminalWindow({
  title,
  icon = "terminal",
  className,
  children,
  initialZIndex = 10,
  onFocus,
}: TerminalWindowProps) {
  const dragControls = useDragControls();
  const [zIndex, setZIndex] = useState(initialZIndex);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragControls.start(e);
    if (onFocus) onFocus();
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      style={{ zIndex }}
      onPointerDown={() => {
        setZIndex((prev) => prev + 1);
        if (onFocus) onFocus();
      }}
      className={cn("win95-outset relative flex flex-col pointer-events-auto", className)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Title Bar - Draggable Area */}
      <div
        className="bg-gradient-to-r from-blue-900 to-blue-600 p-1 flex justify-between items-center px-2 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-sm">{icon}</span>
          <span className="text-white font-label-mono text-xs font-bold">{title}</span>
        </div>
        <div className="flex gap-0.5 pointer-events-auto">
          <button className="win95-outset w-4 h-4 text-[10px] flex items-center justify-center font-bold hover:bg-zinc-300">?</button>
          <button className="win95-outset w-4 h-4 text-[10px] flex items-center justify-center font-bold hover:bg-zinc-300">X</button>
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden bg-black font-label-mono text-primary-container win95-inset relative cursor-auto">
        {children}
      </div>
    </motion.div>
  );
}
