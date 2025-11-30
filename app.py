import streamlit as st
import base64

st.set_page_config(page_title="Pixel Rearranger", layout="wide")

st.title("Pixel Rearranger 🎨➡️🖼️")

st.write(
    "Upload two images and watch the pixels morph from the first to the second. "
    "You can press the Morph button below (or Space inside the canvas) to start."
)

col1, col2, col3 = st.columns([1, 1, 2])

with col1:
    upload_a = st.file_uploader("Upload Image A", type=["png", "jpg", "jpeg"], key="A")
with col2:
    upload_b = st.file_uploader("Upload Image B", type=["png", "jpg", "jpeg"], key="B")
with col3:
    morph_pressed = st.button("MORPH", key="morph")
    speed = st.slider(
        "Animation speed",
        min_value=0.0001,
        max_value=0.01,
        value=0.0015,
        step=0.0001,
        format="%.4f",
        key="speed",
    )

def to_data_url(uploaded):
    if not uploaded:
        return ""
    data = uploaded.read()
    mime = uploaded.type or "image/png"
    return "data:%s;base64,%s" % (mime, base64.b64encode(data).decode())

img_a_url = to_data_url(upload_a)
img_b_url = to_data_url(upload_b)
autostart = "true" if morph_pressed else "false"

# HTML + JS template (keep JS braces intact by using a plain Python string and placeholders)
html_template = """
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { background:#000; margin:0; color:white; font-family:sans-serif; display:flex; justify-content:center; }
  #wrapper { width:100%; max-width:650px; padding:10px; margin:0 auto; }
  #stage { width:100%; background:#111; padding:8px; border-radius:8px; position:relative; display:flex; justify-content:center; }
  #c { max-width:100%; height:auto; background:#000; border-radius:4px; display:block; }
  #fullscreen-btn { position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.15); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; backdrop-filter: blur(4px); }
</style>
</head>
<body>
<div style="width:100%; padding:10px 0; display:flex; justify-content:center;">
  <div style="background:#111; padding:8px; border-radius:8px;">
    <div id="stage">
      <div id="fullscreen-btn">⤢</div>
      <canvas id="c"></canvas>
      <div style="text-align:center; margin-top:8px; font-size:12px; color:#bbb;">
        Pinch to zoom. Drag to pan. Double-tap to fullscreen. Press SPACE to animate.
      </div>
    </div>
  </div>
</div>

<script>
const IMG_A = "__IMG_A__";
const IMG_B = "__IMG_B__";
const AUTOSTART = __AUTOSTART__;
const SPEED = __SPEED__;

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// ====== RESPONSIVE SIZING (internal resolution scales with dpr, CSS makes it responsive) ======
let SIZE = 600;
function updateSize() {
  // internal size used for pixel calculations
  SIZE = Math.min(Math.floor(Math.min(window.innerWidth * 0.9, 600)), 600);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  // visual scaling handled by CSS to make the canvas fluid
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
updateSize();
window.addEventListener("resize", updateSize);

// ====== ZOOM + PAN STATE ======
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let lastTouchDist = null;
let lastX = 0;
let lastY = 0;
let dragging = false;

function applyTransform() {
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX, offsetY);
}

// ====== TOUCH & MOUSE EVENTS ======
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    lastX = t.clientX; lastY = t.clientY; dragging = true;
  } else if (e.touches.length === 2) {
    lastTouchDist = getTouchDist(e.touches);
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length === 1 && dragging) {
    const t = e.touches[0];
    offsetX += (t.clientX - lastX);
    offsetY += (t.clientY - lastY);
    lastX = t.clientX; lastY = t.clientY;
  }
  if (e.touches.length === 2) {
    const newDist = getTouchDist(e.touches);
    if (lastTouchDist !== null) { scale *= newDist / lastTouchDist; scale = Math.max(0.5, Math.min(5, scale)); }
    lastTouchDist = newDist;
  }
});

canvas.addEventListener("touchend", () => { dragging = false; lastTouchDist = null; });

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

let lastTap = 0;
canvas.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTap < 250) toggleFullscreen();
  lastTap = now;
});

canvas.addEventListener("mousedown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener("mousemove", (e) => { if (!dragging) return; offsetX += (e.clientX - lastX); offsetY += (e.clientY - lastY); lastX = e.clientX; lastY = e.clientY; });
window.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("wheel", (e) => { e.preventDefault(); const zoomFactor = 1 + (e.deltaY * -0.001); scale *= zoomFactor; scale = Math.max(0.5, Math.min(5, scale)); });

// ====== FULLSCREEN ======
document.getElementById("fullscreen-btn").onclick = () => toggleFullscreen();
function toggleFullscreen() {
  const stage = document.getElementById("stage");
  if (!document.fullscreenElement) stage.requestFullscreen();
  else document.exitFullscreen();
}

// ====== IMAGE LOADING ======
let imgA = null;
let imgB = null;
function loadFromDataURL(dataURL, slot) {
  if (!dataURL) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => { if (slot === "A") imgA = img; else imgB = img; maybeAutoStart(); };
  img.src = dataURL;
}
if (IMG_A) loadFromDataURL(IMG_A, "A");
if (IMG_B) loadFromDataURL(IMG_B, "B");

window.addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); if (imgA && imgB) startRearrange(); } });

function maybeAutoStart() { if (AUTOSTART && imgA && imgB) startRearrange(); }

// ====== ANIMATION ======
function startRearrange() {
  const size = Math.floor(SIZE);
  const pixelsA = getPixelArray(imgA, size);
  const pixelsB = getPixelArray(imgB, size);
  const sortedA = sortByColor(pixelsA);
  const sortedB = sortByColor(pixelsB);
  const N = size * size;

  const x  = new Float32Array(N);
  const y  = new Float32Array(N);
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  const r  = new Uint8ClampedArray(N);
  const g  = new Uint8ClampedArray(N);
  const b  = new Uint8ClampedArray(N);

  for (let i = 0; i < N; i++) {
    x[i]  = sortedA[i].x;
    y[i]  = sortedA[i].y;
    tx[i] = sortedB[i].x;
    ty[i] = sortedB[i].y;
    r[i]  = sortedA[i].r;
    g[i]  = sortedA[i].g;
    b[i]  = sortedA[i].b;
  }

  animateTyped(size, x, y, tx, ty, r, g, b);
}

function getPixelArray(img, size) {
  const off = document.createElement("canvas");
  off.width = size; off.height = size;
  const octx = off.getContext("2d");
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
}

function sortByColor(arr) { return [...arr].sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b); }

function animateTyped(size, x, y, tx, ty, r, g, b) {
  const N = size * size;
  const imageData = ctx.createImageData(size, size);
  const buf = imageData.data;

  function frame() {
    let done = true;
    for (let i = 0; i < N; i++) {
      x[i] += (tx[i] - x[i]) * SPEED;
      y[i] += (ty[i] - y[i]) * SPEED;
      if (Math.abs(x[i] - tx[i]) > 0.1 || Math.abs(y[i] - ty[i]) > 0.1) done = false;
    }

    for (let i = 0; i < buf.length; i++) buf[i] = 0;
    for (let i = 0; i < N; i++) {
      const px = x[i] | 0;
      const py = y[i] | 0;
      const idx = (py * size + px) * 4;
      buf[idx]   = r[i];
      buf[idx+1] = g[i];
      buf[idx+2] = b[i];
      buf[idx+3] = 255;
    }

    // clear the drawing surface and apply zoom/pan before drawing
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyTransform();
    ctx.putImageData(imageData, 0, 0);

    if (!done) requestAnimationFrame(frame);
  }

  frame();
}
</script>
</body>
</html>
"""

html_code = html_template.replace("__IMG_A__", img_a_url).replace("__IMG_B__", img_b_url).replace("__AUTOSTART__", autostart).replace("__SPEED__", str(speed))
# Render the canvas component below the Streamlit controls
st.components.v1.html(html_code, height=720, scrolling=True)
