# MTG Top 100 Live — Bubble Fit + Slow Physics Patch

This patch changes the frontend bubble behavior.

## Goal

- Bubbles should fit on screen better.
- More bubbles should create slower, calmer movement.
- Large movers should still look big, but not so big that they push everything off-screen.
- The bubble chart should feel more like a market heat map, less like an arcade collision demo.

## File to edit

```text
frontend/index.html
```

---

# Step 1 — Replace `renderBubbles()`

Find your current function:

```js
function renderBubbles(){
```

Replace the entire function with this version:

```js
function renderBubbles(){
  const area = $("chart-card");
  const svg = $("bubble-svg");
  const W = area.clientWidth || 800;
  const H = area.clientHeight || 420;
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);

  if(raf) cancelAnimationFrame(raf);

  if(!filteredCards.length){
    svg.innerHTML = "";
    $("empty-state").classList.add("show");
    return;
  }

  $("empty-state").classList.remove("show");

  const cards = filteredCards.slice(0, renderLimit);
  const count = Math.max(1, cards.length);

  /*
    Screen-aware bubble sizing.

    We estimate available area and divide it across the number of bubbles.
    Then we cap the largest bubble so it cannot consume the whole viewport.

    This keeps 25 bubbles dramatic, 100 bubbles readable, and mobile usable.
  */
  const areaPx = Math.max(1, W * H);
  const densityRadius = Math.sqrt(areaPx / (count * Math.PI));

  const mobile = window.innerWidth < 940;

  const minR = mobile
    ? clamp(densityRadius * 0.32, 8, 16)
    : clamp(densityRadius * 0.34, 10, 18);

  const maxR = mobile
    ? clamp(densityRadius * 1.55, 24, Math.min(W, H) * 0.125)
    : clamp(densityRadius * 1.75, 30, Math.min(W, H) * 0.145);

  const values = cards.map(c => Math.abs(Number(c[state.metric] || c.bubbleScore || c.weightedMoveScore || 0)));
  const maxVal = Math.max(...values, 1);

  /*
    Sqrt scale prevents the top mover from becoming absurdly huge.
    WeightedMoveScore should already be the default metric after the previous patch.
  */
  const rScale = d3.scaleSqrt()
    .domain([0, maxVal])
    .range([minR, maxR])
    .clamp(true);

  nodes = cards.map((c,i)=>{
    const a = (i / count) * Math.PI * 2;
    const ring = Math.sqrt(i / count);
    const spread = Math.min(W, H) * (mobile ? 0.22 : 0.27) * ring;
    const r = Math.max(minR, Math.min(maxR, rScale(Math.abs(Number(c[state.metric] || c.bubbleScore || c.weightedMoveScore || 0)))));

    return {
      ...c,
      r,
      x: W / 2 + Math.cos(a) * spread + (Math.random() - 0.5) * Math.min(24, densityRadius),
      y: H / 2 + Math.sin(a) * spread + (Math.random() - 0.5) * Math.min(24, densityRadius),
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      mass: r * r
    };
  });

  drawBubbleSvg(W,H);
  tickPhysics(W,H);
}
```

---

# Step 2 — Replace `tickPhysics()`

Find your current function:

```js
function tickPhysics(baseW,baseH){
```

Replace the entire function with this version:

```js
function tickPhysics(baseW,baseH){
  const area = $("chart-card");

  /*
    Count-aware physics.

    More bubbles = slower, calmer interaction.
    Fewer bubbles = slightly more motion and drama.
  */
  const count = Math.max(1, nodes.length);
  const crowd = clamp(count / 100, 0, 1);

  const GAP = count > 120 ? 1.5 : count > 75 ? 2 : 3;

  // Higher damping number means less drag; lower means slower.
  const DAMP = lerp(0.91, 0.82, crowd);

  // Less gravity and less jitter when crowded.
  const GRAV = lerp(0.006, 0.0022, crowd);
  const NOISE = lerp(0.010, 0.0018, crowd);

  // Dramatically reduce max speed as bubble count increases.
  const MAX_V = lerp(1.05, 0.28, crowd);

  // Softer wall and collision response when crowded.
  const WALL = lerp(0.12, 0.055, crowd);
  const COLLISION_ITERATIONS = count > 150 ? 1 : count > 90 ? 2 : 3;

  function tick(){
    const W = area.clientWidth || baseW;
    const H = area.clientHeight || baseH;

    for(const n of nodes){
      n.vx += (Math.random() - 0.5) * NOISE;
      n.vy += (Math.random() - 0.5) * NOISE;

      n.vx += (W / 2 - n.x) * GRAV;
      n.vy += (H / 2 - n.y) * GRAV;

      n.vx *= DAMP;
      n.vy *= DAMP;

      const sp = Math.hypot(n.vx,n.vy);
      if(sp > MAX_V){
        n.vx = n.vx / sp * MAX_V;
        n.vy = n.vy / sp * MAX_V;
      }

      n.x += n.vx;
      n.y += n.vy;

      const pad = n.r + GAP;

      if(n.x < pad) n.vx += (pad - n.x) * WALL;
      if(n.x > W - pad) n.vx -= (n.x - (W - pad)) * WALL;
      if(n.y < pad) n.vy += (pad - n.y) * WALL;
      if(n.y > H - pad) n.vy -= (n.y - (H - pad)) * WALL;

      n.x = Math.max(pad, Math.min(W - pad, n.x));
      n.y = Math.max(pad, Math.min(H - pad, n.y));
    }

    /*
      Collision separation.
      This still prevents most overlap, but avoids violent movement when crowded.
    */
    for(let iter = 0; iter < COLLISION_ITERATIONS; iter++){
      for(let i = 0; i < nodes.length; i++){
        for(let j = i + 1; j < nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy;
          const target = a.r + b.r + GAP;

          if(dist2 >= target * target || dist2 < 0.0001) continue;

          const dist = Math.sqrt(dist2);
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = target - dist;
          const tm = a.mass + b.mass;

          const correction = overlap * lerp(0.82, 0.48, crowd);

          a.x -= nx * correction * (b.mass / tm);
          a.y -= ny * correction * (b.mass / tm);
          b.x += nx * correction * (a.mass / tm);
          b.y += ny * correction * (a.mass / tm);

          // Small velocity nudge only. This avoids hyperactive bouncing.
          const push = (overlap / target) * lerp(0.05, 0.012, crowd);
          a.vx -= nx * push;
          a.vy -= ny * push;
          b.vx += nx * push;
          b.vy += ny * push;
        }
      }
    }

    for(const n of nodes){
      const el = document.querySelector(`[data-bubble-id="${CSS.escape(String(n.id))}"]`);
      if(el) el.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
    }

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
}
```

---

# Step 3 — Add helper functions

Find this existing helper:

```js
function debounce(fn, ms){
```

Add these helper functions directly above it:

```js
function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t){
  return a + (b - a) * clamp(t, 0, 1);
}
```

---

# Step 4 — Recommended render slider range

Find this line in the HTML:

```html
<input id="render-limit" type="range" min="25" max="200" step="25" value="125">
```

Or if you already changed it:

```html
<input id="render-limit" type="range" min="25" max="100" step="25" value="100">
```

Use this instead:

```html
<input id="render-limit" type="range" min="25" max="100" step="25" value="75">
```

Then find the label near it:

```html
<span id="render-limit-label" class="mono" style="font-size:12px;color:var(--text)">100</span>
```

Change it to:

```html
<span id="render-limit-label" class="mono" style="font-size:12px;color:var(--text)">75</span>
```

Then find the JavaScript default:

```js
let renderLimit = 100;
```

Change it to:

```js
let renderLimit = 75;
```

This is my recommended default. Users can still move it up to 100, but 75 will look cleaner on mobile and desktop.

---

# Step 5 — Commit and redeploy

Commit the frontend change to `main`.

GitHub Pages should redeploy.

Then hard refresh:

```text
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

## Result

With 25 bubbles:
- larger bubbles
- more movement
- more dramatic view

With 75 bubbles:
- medium bubbles
- slower motion
- better packing

With 100 bubbles:
- smaller bubbles
- calm motion
- less bouncing and less off-screen crowding
