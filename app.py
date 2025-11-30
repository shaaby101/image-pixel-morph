import streamlit as st
import base64

st.set_page_config(page_title="Pixel Rearranger", layout="wide")

st.title("Pixel Rearranger (Live JS version)")

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
    # Slider to control animation speed (will be injected into the JS SPEED variable)
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
    return f"data:{mime};base64," + base64.b64encode(data).decode()

img_a_url = to_data_url(upload_a)
img_b_url = to_data_url(upload_b)
autostart = "true" if morph_pressed else "false"

# HTML + JS: canvas will be rendered below the Morph button (this component is placed after the button)
html_template = """
<!DOCTYPE html>
<html>
<body style="background:#000; margin:0; color:white; font-family:sans-serif;">

<style>
  #stage {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  #c {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
</style>


<div style="width:100%; display:flex; justify-content:center; padding:10px 0;">
  <div id="stage" style="background:#111; padding:8px; border-radius:8px;">
    <canvas id="c" style="display:block; background:#000; border-radius:4px;"></canvas>
    <div style="text-align:center; margin-top:8px; font-size:12px; color:#bbb;">
      Press SPACE inside the canvas or click MORPH (Streamlit) to run.
    </div>
  </div>
</div>

<script>
const IMG_A = "__IMG_A__";
const IMG_B = "__IMG_B__";
const AUTOSTART = __AUTOSTART__;
const SPEED = __SPEED__; // injected from Streamlit

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

const SIZE = 600; // internal pixel grid size (tweak for perf)

// set canvas pixel size and CSS size
function setupCanvas() {
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvas();
window.addEventListener("resize", () => {
  // keep fixed SIZE for internal processing; CSS remains constant
  setupCanvas();
});

// IMAGE LOAD
let imgA = null;
let imgB = null;

function loadFromDataURL(dataURL, slot) {
  if (!dataURL) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    if (slot === "A") imgA = img;
    else imgB = img;
    maybeAutoStart();
  };
  img.src = dataURL;
}

if (IMG_A) loadFromDataURL(IMG_A, "A");
if (IMG_B) loadFromDataURL(IMG_B, "B");

// allow spacebar to trigger when focused
window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    if (imgA && imgB) startRearrange();
  }
});

function maybeAutoStart() {
  if (AUTOSTART && imgA && imgB) {
    startRearrange();
  }
}

// MAIN LOGIC (adapted from original)
function startRearrange() {
  const size = SIZE;

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
  const N = size * size;
  const imageData = ctx.createImageData(size, size);
  const buf = imageData.data;

  function frame() {
    let done = true;

    for (let i = 0; i < N; i++) {
      x[i] += (tx[i] - x[i]) * SPEED;
      y[i] += (ty[i] - y[i]) * SPEED;

      if (Math.abs(x[i] - tx[i]) > 0.1 || Math.abs(y[i] - ty[i]) > 0.1)
        done = false;
    }

    // clear buffer
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

    // draw at 0,0 inside the canvas
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
