/* Perceptron demo — scaffold only (no learning logic yet)
   This file wires up the UI, dataset modes, table editing, and stubbed controls.
   You’ll see the page load without errors and basic interactivity works.
   We’ll add the actual perceptron updates + chart drawing next.
*/

// ---------- Global state ----------
const state = {
  mode: 'separable',
  data: [],           // [{ x1: number, x2: number, y: -1|+1 }]
  w: [0, 0],          // weights
  b: 0,               // bias
  lr: 0.1,            // learning rate
  epochs: 10,
  epoch: 0,
  running: false,
  timer: null
};

// ---------- DOM helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Readouts
const reads = {
  w: () => $('#w-readout'),
  upd: () => $('#update-readout'),
  ep: () => $('#epoch-readout'),
  acc: () => $('#acc-readout'),
  status: () => $('#status-readout')
};

function setStatus(msg) {
  reads.status().textContent = msg;
}

function updateReadouts() {
  reads.w().textContent = `[${state.w.map(v => v.toFixed(3)).join(', ')}], b=${state.b.toFixed(3)}`;
  reads.ep().textContent = String(state.epoch);
  reads.acc().textContent = accuracy().toFixed(3);
}

// ---------- Dataset presets ----------
function presetSeparable() {
  // Two clusters roughly separable by a line
  return [
    { x1: -2, x2: -1, y: -1 }, { x1: -1.5, x2: -1, y: -1 }, { x1: -1, x2: -1.2, y: -1 },
    { x1: -1.2, x2: -0.8, y: -1 }, { x1: -1.8, x2: -0.5, y: -1 }, { x1: -2.2, x2: -0.6, y: -1 },

    { x1: 1.5, x2: 1.0, y: +1 }, { x1: 1.8, x2: 1.2, y: +1 }, { x1: 2.2, x2: 0.8, y: +1 },
    { x1: 1.2, x2: 0.9, y: +1 }, { x1: 1.9, x2: 0.6, y: +1 }, { x1: 2.1, x2: 1.4, y: +1 }
  ];
}

function presetXOR() {
  // Classic XOR corners
  return [
    { x1: -1, x2: -1, y: -1 },
    { x1: -1, x2: +1, y: +1 },
    { x1: +1, x2: -1, y: +1 },
    { x1: +1, x2: +1, y: -1 }
  ];
}

// ---------- Table rendering & editing ----------
function renderTable() {
  const tbody = $('#data-body');
  tbody.innerHTML = '';
  state.data.forEach((row, idx) => {
    const tr = document.createElement('tr');

    ['x1', 'x2', 'y'].forEach((key) => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.value = row[key];
      input.step = key === 'y' ? '1' : '0.1';
      input.style.width = '6rem';
      input.addEventListener('change', () => {
        const v = Number(input.value);
        if (key === 'y') {
          state.data[idx][key] = v >= 0 ? +1 : -1;
          input.value = state.data[idx][key];
        } else {
          state.data[idx][key] = isFinite(v) ? v : 0;
        }
        drawChart();
        updateReadouts();
      });
      td.appendChild(input);
      tr.appendChild(td);
    });

    // delete row button
    const tdDel = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Delete row';
    delBtn.addEventListener('click', () => {
      state.data.splice(idx, 1);
      renderTable();
      drawChart();
      updateReadouts();
    });
    tdDel.appendChild(delBtn);
    tr.appendChild(tdDel);

    tbody.appendChild(tr);
  });
}

function addRow(x1 = 0, x2 = 0, y = +1) {
  state.data.push({ x1, x2, y: y >= 0 ? +1 : -1 });
  renderTable();
  drawChart();
  updateReadouts();
}

// ---------- Modes ----------
function setMode(mode) {
  state.mode = mode;
  if (mode === 'separable') state.data = presetSeparable();
  else if (mode === 'xor') state.data = presetXOR();
  else state.data = presetSeparable(); // default for custom start
  renderTable();
  drawChart();
  resetModel();
  setStatus(`mode: ${mode}`);
}

// ---------- Model reset / init ----------
function resetModel() {
  state.w = [0, 0];
  state.b = 0;
  state.epoch = 0;
  stopRun();
  updateReadouts();
}

function initWeights() {
  // small random init; harmless without learning yet
  state.w = [randn(0, 0.1), randn(0, 0.1)];
  state.b = randn(0, 0.1);
  state.epoch = 0;
  updateReadouts();
  setStatus('weights initialized');
}

// ---------- Accuracy (using current hyperplane sign) ----------
function predictPoint(p) {
  const s = state.w[0] * p.x1 + state.w[1] * p.x2 + state.b;
  return s >= 0 ? +1 : -1;
}

function accuracy() {
  if (!state.data.length) return 0;
  let correct = 0;
  for (const p of state.data) {
    if (predictPoint(p) === p.y) correct++;
  }
  return correct / state.data.length;
}

// ---------- Chart placeholder (simple SVG scatter + boundary line) ----------
function drawChart() {
  const container = $('#chart');
  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;

  // Determine data bounds with padding
  const xs = state.data.map(d => d.x1);
  const ys = state.data.map(d => d.x2);
  const minX = Math.min(...xs, -2) - 0.5;
  const maxX = Math.max(...xs,  2) + 0.5;
  const minY = Math.min(...ys, -2) - 0.5;
  const maxY = Math.max(...ys,  2) + 0.5;

  // scale helpers
  const sx = (x) => ((x - minX) / (maxX - minX)) * (W - 40) + 20;
  const sy = (y) => H - (((y - minY) / (maxY - minY)) * (H - 40) + 20);

  // build SVG
  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="scatter plot">
    <rect x="0" y="0" width="${W}" height="${H}" fill="rgba(0,0,0,0.15)"/>
    <!-- axes -->
    <line x1="20" y1="${H-20}" x2="${W-20}" y2="${H-20}" stroke="rgba(255,255,255,0.3)" />
    <line x1="20" y1="20" x2="20" y2="${H-20}" stroke="rgba(255,255,255,0.3)" />
  `;

  // points
  for (const p of state.data) {
    const cx = sx(p.x1), cy = sy(p.x2);
    const fill = (p.y === 1) ? '#8ecae6' : '#ffb703'; // blue for +1, orange for -1
    svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="${fill}" stroke="white" stroke-width="1"/>`;
  }

  // decision boundary line (w[0]*x + w[1]*y + b = 0) -> y = -(w0/w1)x - b/w1
  if (Math.abs(state.w[1]) > 1e-6) {
    const y1 = (x) => (-(state.w[0] / state.w[1]) * x) - (state.b / state.w[1]);
    const xA = minX, xB = maxX;
    const yA = y1(xA), yB = y1(xB);
    svg += `<line x1="${sx(xA)}" y1="${sy(yA)}" x2="${sx(xB)}" y2="${sy(yB)}" stroke="#ffffff" stroke-width="2" stroke-dasharray="6 4"/>`;
  } else {
    // vertical line: x = -b/w0 (if w0 != 0)
    if (Math.abs(state.w[0]) > 1e-6) {
      const xV = -state.b / state.w[0];
      svg += `<line x1="${sx(xV)}" y1="${sy(minY)}" x2="${sx(xV)}" y2="${sy(maxY)}" stroke="#ffffff" stroke-width="2" stroke-dasharray="6 4"/>`;
    }
  }

  svg += `</svg>`;
  container.innerHTML = svg;
}

// ---------- Learning stubs (no algorithm yet) ----------
function stepOnce() {
  // TODO: Implement perceptron single update step
  // For now, just fake an epoch increment and status change to show UI is wired.
  state.epoch += 1;
  reads.upd().textContent = 'step executed (stub)';
  updateReadouts();
  drawChart();
}

function runLoop() {
  if (state.running) return;
  state.running = true;
  setStatus('running (stub)');
  state.timer = setInterval(() => {
    stepOnce();
    if (state.epoch >= state.epochs) {
      stopRun();
      setStatus('stopped (reached epochs)');
    }
  }, 400);
}

function stopRun() {
  state.running = false;
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  setStatus('stopped');
}

// ---------- Utils ----------
function randn(mu = 0, sigma = 1) {
  // Box–Muller
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------- Wire up events ----------
document.addEventListener('DOMContentLoaded', () => {
  // controls
  const modeSel = $('#mode');
  const lrInput = $('#lr');
  const epInput = $('#epochs');

  $('#btn-init').addEventListener('click', () => initWeights());
  $('#btn-step').addEventListener('click', () => stepOnce());
  $('#btn-run').addEventListener('click', () => runLoop());
  $('#btn-stop').addEventListener('click', () => stopRun());
  $('#btn-reset').addEventListener('click', () => { setMode(state.mode); });

  $('#add-row').addEventListener('click', () => addRow(0, 0, +1));
  $('#reset-data').addEventListener('click', () => setMode(state.mode));

  modeSel.addEventListener('change', (e) => setMode(e.target.value));
  lrInput.addEventListener('change', (e) => {
    const v = Number(e.target.value);
    if (isFinite(v) && v > 0) state.lr = v;
  });
  epInput.addEventListener('change', (e) => {
    const v = Number(e.target.value);
    if (Number.isInteger(v) && v > 0) state.epochs = v;
  });

  // initial load
  setMode('separable'); // default
  initWeights();
  updateReadouts();
  drawChart();
  setStatus('idle');
});
