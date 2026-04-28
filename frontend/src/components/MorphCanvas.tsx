"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";

interface MorphCanvasProps {
  imgADataUrl: string | null;
  imgBDataUrl: string | null;
  speed: number;
  onStatusChange?: (status: string) => void;
  onMorphComplete?: () => void;
}

export interface MorphCanvasRef {
  startMorph: () => void;
  exportMp4: () => Promise<void>;
  canExport: boolean;
}

// Ensure Mp4 Muxer is loaded dynamically (client side only)
let Muxer: any = null;
let ArrayBufferTarget: any = null;

const MorphCanvas = forwardRef<MorphCanvasRef, MorphCanvasProps>(({ imgADataUrl, imgBDataUrl, speed, onStatusChange, onMorphComplete }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mp4Ready, setMp4Ready] = useState(false);
  const [lastMorphData, setLastMorphData] = useState<any>(null);
  const isAnimatingRef = useRef(false);

  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);
  
  // Size constraints
  const SIZE = 600;
  
  // Transform states for Pan and Zoom
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0, dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    // Load mp4-muxer
    import("mp4-muxer").then((mod) => {
      Muxer = mod.Muxer;
      ArrayBufferTarget = mod.ArrayBufferTarget;
      if ("VideoEncoder" in window && "VideoFrame" in window) {
        setMp4Ready(true);
      }
    }).catch((err) => {
      console.warn("Failed to load mp4-muxer", err);
    });
  }, []);

  // Load images when data URLs change
  useEffect(() => {
    if (imgADataUrl) {
      const img = new Image();
      img.onload = () => { imgARef.current = img; };
      img.src = imgADataUrl;
    } else {
      imgARef.current = null;
    }
  }, [imgADataUrl]);

  useEffect(() => {
    if (imgBDataUrl) {
      const img = new Image();
      img.onload = () => { imgBRef.current = img; };
      img.src = imgBDataUrl;
    } else {
      imgBRef.current = null;
    }
  }, [imgBDataUrl]);

  // Set up canvas interactions and base sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : SIZE;
      canvas.width = Math.min(w, SIZE) * dpr;
      canvas.height = Math.min(w, SIZE) * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // Initial draw to make it black
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Event listeners for pan/zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1 + (e.deltaY * -0.001);
      const t = transformRef.current;
      t.scale *= zoomFactor;
      t.scale = Math.max(0.5, Math.min(5, t.scale));
    };

    const handlePointerDown = (e: PointerEvent) => {
      transformRef.current.dragging = true;
      transformRef.current.lastX = e.clientX;
      transformRef.current.lastY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const t = transformRef.current;
      if (!t.dragging) return;
      t.offsetX += (e.clientX - t.lastX);
      t.offsetY += (e.clientY - t.lastY);
      t.lastX = e.clientX;
      t.lastY = e.clientY;
    };

    const handlePointerUp = () => {
      transformRef.current.dragging = false;
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("resize", updateSize);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const getPixelArray = (img: HTMLImageElement, size: number) => {
    const off = document.createElement("canvas");
    off.width = size; off.height = size;
    const octx = off.getContext("2d")!;
    const iw = img.naturalWidth; const ih = img.naturalHeight;
    const scaleImg = Math.max(size / iw, size / ih);
    const sw = size / scaleImg; const sh = size / scaleImg;
    const sx = (iw - sw) / 2; const sy = (ih - sh) / 2;
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    const data = octx.getImageData(0, 0, size, size).data;
    const arr = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        arr.push({ x, y, r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
    return arr;
  };

  const sortByColor = (arr: any[]) => {
    return [...arr].sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);
  };

  const startMorph = () => {
    if (isAnimatingRef.current) return;
    if (!imgARef.current || !imgBRef.current) {
      if (onStatusChange) onStatusChange("MISSING_IMAGES: Upload both to initiate morph");
      return;
    }

    isAnimatingRef.current = true;
    if (onStatusChange) onStatusChange("ANIMATING PIXEL MORPH...");

    const size = SIZE;
    const pixelsA = getPixelArray(imgARef.current, size);
    const pixelsB = getPixelArray(imgBRef.current, size);
    const sortedA = sortByColor(pixelsA);
    const sortedB = sortByColor(pixelsB);
    const N = size * size;

    const x = new Float32Array(N);
    const y = new Float32Array(N);
    const tx = new Float32Array(N);
    const ty = new Float32Array(N);
    const r = new Uint8ClampedArray(N);
    const g = new Uint8ClampedArray(N);
    const b = new Uint8ClampedArray(N);
    const x0 = new Float32Array(N);
    const y0 = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      x[i] = sortedA[i].x; y[i] = sortedA[i].y;
      x0[i] = sortedA[i].x; y0[i] = sortedA[i].y;
      tx[i] = sortedB[i].x; ty[i] = sortedB[i].y;
      r[i] = sortedA[i].r; g[i] = sortedA[i].g; b[i] = sortedA[i].b;
    }

    setLastMorphData({ size, x0, y0, tx, ty, r, g, b });

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(size, size);
    const buf = imageData.data;
    const dpr = window.devicePixelRatio || 1;

    const frame = () => {
      let done = true;
      for (let i = 0; i < N; i++) {
        x[i] += (tx[i] - x[i]) * speed;
        y[i] += (ty[i] - y[i]) * speed;
        if (Math.abs(x[i] - tx[i]) > 0.1 || Math.abs(y[i] - ty[i]) > 0.1) done = false;
      }

      buf.fill(0);
      for (let i = 0; i < N; i++) {
        const px = x[i] | 0;
        const py = y[i] | 0;
        const idx = (py * size + px) * 4;
        buf[idx] = r[i];
        buf[idx + 1] = g[i];
        buf[idx + 2] = b[i];
        buf[idx + 3] = 255;
      }

      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = transformRef.current;
      ctx.setTransform(t.scale * dpr, 0, 0, t.scale * dpr, t.offsetX, t.offsetY);
      ctx.putImageData(imageData, 0, 0);

      if (!done) {
        requestAnimationFrame(frame);
      } else {
        isAnimatingRef.current = false;
        if (onStatusChange) onStatusChange("MORPH COMPLETE.");
        if (onMorphComplete) onMorphComplete();
      }
    };

    requestAnimationFrame(frame);
  };

  const exportMp4 = async () => {
    if (!mp4Ready || !lastMorphData) return;
    if (onStatusChange) onStatusChange("ENCODING MP4...");
    
    try {
      const fps = 30;
      const targetFrames = 360;
      const epsilon = 0.25;
      const size = lastMorphData.size;

      const x = new Float32Array(lastMorphData.x0);
      const y = new Float32Array(lastMorphData.y0);
      const tx = lastMorphData.tx;
      const ty = lastMorphData.ty;
      const r = lastMorphData.r;
      const g = lastMorphData.g;
      const b = lastMorphData.b;
      const N = size * size;

      const maxStartDistance = Math.max(size, 1);
      const exportSpeed = 1 - Math.pow(epsilon / maxStartDistance, 1 / targetFrames);

      const off = document.createElement("canvas");
      off.width = size; off.height = size;
      const octx = off.getContext("2d", { willReadFrequently: true })!;
      const imageData = octx.createImageData(size, size);
      const buf = imageData.data;

      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: { codec: "avc", width: size, height: size },
        fastStart: "in-memory",
      });

      const encoder = new window.VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { throw e; },
      });

      let config = { codec: "avc1.42001E", width: size, height: size, bitrate: 3_000_000, framerate: fps };
      const support = await window.VideoEncoder.isConfigSupported(config);
      if (!support.supported) {
        config = { codec: "avc1.4d401f", width: size, height: size, bitrate: 3_000_000, framerate: fps };
      }
      encoder.configure(config);

      for (let frameIndex = 0; frameIndex < targetFrames; frameIndex++) {
        for (let i = 0; i < N; i++) {
          x[i] += (tx[i] - x[i]) * exportSpeed;
          y[i] += (ty[i] - y[i]) * exportSpeed;
        }

        buf.fill(0);
        for (let i = 0; i < N; i++) {
          const px = x[i] | 0;
          const py = y[i] | 0;
          const idx = (py * size + px) * 4;
          buf[idx] = r[i];
          buf[idx + 1] = g[i];
          buf[idx + 2] = b[i];
          buf[idx + 3] = 255;
        }

        octx.putImageData(imageData, 0, 0);
        const timestampUs = Math.round((1_000_000 * frameIndex) / fps);
        const vf = new window.VideoFrame(off, { timestamp: timestampUs });
        encoder.encode(vf, { keyFrame: frameIndex % fps === 0 });
        vf.close();

        if (frameIndex % 30 === 0) {
          if (onStatusChange) onStatusChange(`ENCODING MP4... ${Math.round((frameIndex / targetFrames) * 100)}%`);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      await encoder.flush();
      encoder.close();
      muxer.finalize();

      const blob = new Blob([target.buffer], { type: "video/mp4" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `pixel-morph-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      
      if (onStatusChange) onStatusChange("MP4 DOWNLOADED.");
    } catch (err: any) {
      if (onStatusChange) onStatusChange("MP4 EXPORT FAILED: " + err.message);
    }
  };

  useImperativeHandle(ref, () => ({
    startMorph,
    exportMp4,
    canExport: !!lastMorphData && mp4Ready
  }));

  return (
    <div className="w-full h-full relative group bg-black overflow-hidden flex items-center justify-center">
      {/* Glitchy Static Overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCubeHo3WngGiPUmmRieL-DTsaq1B9hmq9wNNIn0ikz05DJRS1l1JXcUKD0lcMYonMiI2lrOV7a1-eIBM4D3rcSbEOq66D-XoW3UfNWyWVF-Xv2qWIO9Yv6J3c5v13D1VPUoODWM7bvDP5eGNthca1fSdDg0xPxlrN5enis9p19ArJeAgzNn9h4wGPOvbWJwjJCuBjBv3NHkQozredY3Tv5izZ5Te4pbhTZbRA48bpixdizby0UedqAvDSNk3IBjrIFRuK9twWAHChd')]"
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />
      
      <canvas 
        ref={canvasRef} 
        className="block bg-transparent max-w-full max-h-full touch-none"
      />
      
      <div className="absolute top-2 right-2 flex items-center gap-1 text-red-500">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-bold font-label-mono">REC</span>
      </div>
      <div className="absolute bottom-2 left-2 text-[#00FFC2] font-label-mono text-[10px] bg-black/50 p-1">
        CAM_01 // 0x4F8A
      </div>
    </div>
  );
});

MorphCanvas.displayName = "MorphCanvas";

export default MorphCanvas;
