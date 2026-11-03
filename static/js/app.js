const $ = (id) => document.getElementById(id);
const textEl = $("text");
const counter = $("counter");
const submitBtn = $("submit");
const EMOTIONS = ["sadness", "joy", "love", "anger", "fear", "surprise"];

/* ---------- Background of floating SVG faces ---------- */
function rand(min, max) { return Math.random() * (max - min) + min; }

function seedBackdrop(dominant) {
  const box = $("backdrop");
  box.innerHTML = "";
  const count = 16;
  for (let i = 0; i < count; i++) {
    const emotion = dominant && Math.random() < 0.6
      ? dominant
      : EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const size = rand(44, 120);
    const el = document.createElement("div");
    el.className = "bg-face";
    el.innerHTML = faceSVG(emotion);
    el.style.cssText = `
      width:${size}px; height:${size}px;
      left:${rand(-2, 94)}%; top:${rand(-2, 92)}%;
      --rot:${rand(-25, 25).toFixed(1)}deg;
      --dx:${rand(-40, 40).toFixed(0)}px; --dy:${rand(-40, 40).toFixed(0)}px;
      --dur:${rand(7, 14).toFixed(1)}s; --delay:${(-rand(0, 10)).toFixed(1)}s;`;
    box.appendChild(el);
  }
}

/* ---------- Mirror (result) ---------- */
function showFace(emotion) {
  const wrap = $("face");
  wrap.innerHTML = faceSVG(emotion);
  wrap.classList.remove("pop");
  void wrap.offsetWidth;
  wrap.classList.add("pop");
}

function renderResult(data) {
  const emotion = data.predicted_emotion;
  document.body.dataset.emotion = emotion;
  showFace(emotion);
  seedBackdrop(emotion);
  $("emotion").textContent = emotion;
  $("confidence").textContent = `${(data.confidence * 100).toFixed(1)}% sure`;

  const sorted = Object.entries(data.all_probabilities).sort((a, b) => b[1] - a[1]);
  const bars = $("bars");
  bars.innerHTML = "";
  sorted.forEach(([label, prob], i) => {
    const li = document.createElement("li");
    li.className = "bar-row" + (i === 0 ? " top" : "");
    li.innerHTML = `<span class="bar-label"></span>
      <span class="bar-track"><span class="bar-fill" style="--c: var(--${label})"></span></span>
      <span class="bar-pct"></span>`;
    li.querySelector(".bar-label").textContent = label;
    li.querySelector(".bar-pct").textContent = `${(prob * 100).toFixed(0)}%`;
    bars.appendChild(li);
    requestAnimationFrame(() => {
      li.querySelector(".bar-fill").style.width = `${(prob * 100).toFixed(1)}%`;
    });
  });
}

function showError(message) {
  const el = $("error");
  el.textContent = message;
  el.hidden = !message;
}

function resetMirror() {
  document.body.dataset.emotion = "idle";
  showFace("idle");
  seedBackdrop(null);
  $("emotion").textContent = "Hmm?";
  $("confidence").textContent = "Feed me a sentence and I will make a face.";
  $("bars").innerHTML = "";
}

/* ---------- Server calls ---------- */
function setStatus(ok, message) {
  const status = $("status");
  status.classList.toggle("ok", ok);
  status.classList.toggle("bad", !ok);
  $("status-text").textContent = message;
}

async function checkHealth() {
  try {
    const data = await (await fetch("/health")).json();
    setStatus(!!data.model_loaded, data.model_loaded ? "Model ready" : "Model not loaded");
  } catch {
    setStatus(false, "Server unreachable");
  }
}

async function analyze() {
  const text = textEl.value.trim();
  if (!text) {
    showError("Write a sentence first, then press Read my mood.");
    textEl.focus();
    return;
  }
  showError("");
  submitBtn.disabled = true;
  submitBtn.textContent = "Reading...";
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) {
      const detail = Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(", ") : data.detail;
      showError(detail || "The server could not read this text. Try again.");
      return;
    }
    renderResult(data);
  } catch {
    showError("Could not reach the server. Check that it is running, then try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Read my mood";
  }
}

/* ---------- Events ---------- */
$("form").addEventListener("submit", (e) => { e.preventDefault(); analyze(); });
$("clear").addEventListener("click", () => {
  textEl.value = "";
  counter.textContent = "0 / 2000";
  showError("");
  resetMirror();
  textEl.focus();
});
textEl.addEventListener("input", () => { counter.textContent = `${textEl.value.length} / 2000`; });
textEl.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); analyze(); }
});
$("chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  textEl.value = chip.dataset.text;
  counter.textContent = `${textEl.value.length} / 2000`;
  analyze();
});

resetMirror();
checkHealth();
