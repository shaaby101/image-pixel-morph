# Image Pixel Morph

A Streamlit app that morphs one image into another by rearranging pixels based on color sorting, then animating each pixel toward a matched destination.

If you enjoyed playing with this project, consider starring the repository.

## Technologies Used

- Python 3
- Streamlit (UI shell and app hosting)
- HTML/CSS/JavaScript embedded in Streamlit
- HTML5 Canvas 2D API for rendering
- Typed Arrays (`Float32Array`, `Uint8ClampedArray`) for fast per-pixel updates
- Browser `requestAnimationFrame` for smooth animation
- WebCodecs (`VideoEncoder`, `VideoFrame`) for video encoding
- `mp4-muxer` (loaded from CDN) to package encoded frames into an MP4

## How The Math Works

### 1. Pixel Extraction

Each image is center-cropped/rescaled to a square size `S x S`.
That gives `N = S^2` pixels.

Every pixel is represented as:

- position: `(x, y)`
- color: `(r, g, b)`

### 2. Color-Based Matching

Pixels from both images are sorted lexicographically by color:

- first by `r`
- then by `g`
- then by `b`

So pixel `i` in image A is matched with pixel `i` in image B after sorting.

### 3. Motion / Interpolation

For each frame, each pixel position is updated by exponential interpolation:

`x <- x + (tx - x) * speed`

`y <- y + (ty - y) * speed`

Where:

- `(x, y)` is current position
- `(tx, ty)` is the destination position
- `speed` is a small scalar (set by slider)

This is equivalent to a discrete first-order relaxation and creates a smooth convergence.

### 4. MP4 Export

For export, frames are regenerated deterministically at fixed FPS and encoded with H.264 via WebCodecs.

- frame timestamp (microseconds):
  - `t_k = round(1_000_000 * k / fps)`
- keyframe cadence:
  - one keyframe approximately every second

Encoded chunks are muxed into an MP4 and downloaded in-browser.

## Run Locally

## 1) Clone or open the project folder

Make sure these files are present:

- `app.py`
- `requirements.txt`

## 2) Create and activate a virtual environment

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 3) Install dependencies

```bash
pip install -r requirements.txt
```

## 4) Start the app

```bash
streamlit run app.py
```

Open the local URL printed by Streamlit (usually `http://localhost:8501`).

## Usage

1. Upload Image A and Image B.
2. Press **MORPH** (or press Space while focused on the canvas area).
3. After the animation completes, click **Download MP4**.

## Notes

- MP4 export requires a browser with WebCodecs support (best in Chromium-based browsers).
- If WebCodecs is unavailable, morph animation still works, but MP4 download is disabled.
