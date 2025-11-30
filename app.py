import streamlit as st

st.set_page_config(page_title="Pixel Rearranger", layout="wide")

st.title("Pixel Rearranger (Live JS version)")

st.write(
    "Upload two images and watch the pixels morph from the first to the second. "
    "You can press the Morph button or Spacebar to start."
)

# HTML + JS code embedded directly
html_code = """
<!DOCTYPE html>
<html>
<body style="background:#000; margin:0; overflow:hidden; color:white; font-family:sans-serif;">

<canvas id="c"></canvas>

<!-- UI -->
<div style="position:fixed; top:10px; left:10px; z-index:10;">
  <div>Upload Image A:</div>
  <input type="file" id="uploadA">
  <br><br>
  <div>Upload Image B:</div>
  <input type="file" id="uploadB">
  <br><br>
  <button id="morphBtn" style="padding:10px 20px; font-size:16px; background:#1d9bf0; color:white; border:none; border-radius:6px; cursor:pointer;">
    MORPH
  </button>
  <p style="font-size:12px; margin-top:10px; opacity:0.7;">Press SPACE or click MORPH to run the rearrangement.</p>
</div>

<script>
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
function resizeCanvas() {
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// IMAGE UPLOAD HANDLING
let imgA = null;
let imgB = null;

document.getElementById("uploadA").onchange = e => loadImage(e.target.files[0], "A");
document.getElementById("uploadB").onchange = e => loadImage(e.target.files[0], "B");

function loadImage(file, slot) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      if (slot === "A") imgA = img;
      if (slot === "B") imgB = img;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// MORPH TRIGGER
let canStart = true;

document.getElementById("morphBtn").addEventListener("click", () => {
  if (canStart && imgA && imgB) {
    canStart = false;
    startRearrange();
  }
});

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    if (canStart && imgA && imgB) {
      canStart = false;
      startRearrange();
    }
  }
});

// MAIN LOGIC
function startRearrange() {
  const size = 600; // adjust for performance

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
  off.width = size;
  off.height = size;
  const octx = off.getContext("2d");

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(size / iw, size / ih);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  octx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  const data = octx.getImageData(0, 0, size, size).data;

  const arr = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      arr.push({
        x,
        y,
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
  }
  return arr;
}

function sortByColor(arr) {
  return [...arr].sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);
}

function animateTyped(size, x, y, tx, ty, r, g, b) {
  const cx = (canvas.width / dpr - size) / 2;
  const cy = (canvas.height / dpr - size) / 2;

  const N = size * size;
  const imageData = ctx.createImageData(size, size);
  const buf = imageData.data;

  const SPEED = 0.001;

  function frame() {
    let done = true;

    for (let i = 0; i < N; i++) {
      x[i] += (tx[i] - x[i]) * SPEED;
      y[i] += (ty[i] - y[i]) * SPEED;

      if (Math.abs(x[i] - tx[i]) > 0.1 || Math.abs(y[i] - ty[i]) > 0.1)
        done = false;
    }

    buf.fill(0);

    for (let i = 0; i < N; i++) {
      const px = x[i] | 0;
      const py = y[i] | 0;
      const idx = (py * size + px) * 4;
      buf[idx]   = r[i];
      buf[idx+1] = g[i];
      buf[idx+2] = b[i];
      buf[idx+3] = 255;
    }

    ctx.putImageData(imageData, cx, cy);

    if (!done) requestAnimationFrame(frame);
    else canStart = true;
  }

  frame();
}
</script>
</body>
</html>
"""

# Render HTML in Streamlit
st.components.v1.html(html_code, height=700, scrolling=True)
