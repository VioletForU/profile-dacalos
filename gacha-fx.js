/* ============================================================
   Gacha click effects — Umamusume-style tap bursts & SSR reveal
   - Every tap/click: ring + glow + sparkle burst
   - SSR reveal (rainbow flash, shine rays, star shower, banner):
       * guaranteed when you click the SSR badge / trainer card
       * random "lucky pull" on other taps at SSR_RATE (3% by default)
   Tweak the constants below to taste.
   ============================================================ */
(function () {
  "use strict";

  // ---- Config ------------------------------------------------
  var SSR_RATE = 0.03;                 // chance of a lucky SSR on a plain tap. Set 0 to disable.
  var SSR_SELECTOR = ".badge-ssr, .trainer-card, .trainer-stars";
  var TAP_COLORS = ["#ffffff", "#ffe57f", "#9dfa53", "#ffc83b", "#ff9ecb"];
  var RAINBOW = ["#ff4d6d", "#ffb84d", "#fff34d", "#5dff7a", "#4dd2ff", "#b34dff", "#ff4dd2", "#ffffff"];
  var MAX_LIVE_NODES = 120;            // safety cap when someone spam-clicks

  // ---- Setup -------------------------------------------------
  var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if (motion && motion.matches) return;

  var layer = document.createElement("div");
  layer.className = "gfx-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var revealing = false;

  // ---- Helpers -----------------------------------------------
  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function add(node) {
    if (layer.childNodes.length > MAX_LIVE_NODES) return null;
    layer.appendChild(node);
    node.addEventListener("animationend", function (e) {
      if (e.target === node && node.parentNode) node.parentNode.removeChild(node);
    });
    return node;
  }

  function at(node, x, y) {
    node.style.left = x + "px";
    node.style.top = y + "px";
    return node;
  }

  function div(cls) {
    var n = document.createElement("div");
    n.className = cls;
    return n;
  }

  function ring(x, y, color, delay, dur) {
    var r = at(div("gfx-ring"), x, y);
    r.style.setProperty("--gfx-c", color);
    if (delay) r.style.setProperty("--gfx-delay", delay + "s");
    if (dur) r.style.setProperty("--gfx-d", dur + "s");
    add(r);
  }

  function sparkle(x, y, angle, dist, size, dur, color) {
    var s = at(div("gfx-spark"), x, y);
    s.textContent = "\u2726"; // four-point star
    s.style.setProperty("--x", Math.cos(angle) * dist + "px");
    s.style.setProperty("--y", Math.sin(angle) * dist + "px");
    s.style.setProperty("--s", size + "px");
    s.style.setProperty("--d", dur + "s");
    s.style.setProperty("--c", color);
    add(s);
  }

  function burst(x, y, count, minD, maxD, minS, maxS, colors) {
    var step = (Math.PI * 2) / count;
    var offset = rand(0, Math.PI * 2);
    for (var i = 0; i < count; i++) {
      var angle = offset + step * i + rand(-step * 0.35, step * 0.35);
      sparkle(x, y, angle, rand(minD, maxD), rand(minS, maxS), rand(0.5, 0.95), pick(colors));
    }
  }

  // ---- Effects -----------------------------------------------
  function tapEffect(x, y) {
    add(at(div("gfx-glow"), x, y));
    ring(x, y, "#9dfa53");
    ring(x, y, "#ffe57f", 0.06, 0.45);
    burst(x, y, 9, 34, 100, 12, 26, TAP_COLORS);
  }

  function ssrReveal(x, y) {
    if (revealing) return;
    revealing = true;

    // 1. Rainbow flash
    add(div("gfx-flash"));

    // 2. Radiating shine lines from the tap point
    add(at(div("gfx-rays"), x, y));

    // 3. Staggered rings
    ring(x, y, "#ffffff", 0, 0.7);
    ring(x, y, "#ffd23b", 0.12, 0.8);
    ring(x, y, "#ff9ecb", 0.24, 0.9);

    // 4. Star shower: two layers of rainbow sparkles
    burst(x, y, 16, 90, 220, 18, 34, RAINBOW);
    burst(x, y, 20, 200, Math.max(320, window.innerWidth * 0.35), 14, 28, RAINBOW);

    // 5. "SSR" banner
    var banner = div("gfx-banner");
    var main = div("gfx-banner-main");
    main.textContent = "SSR";
    var stars = div("gfx-banner-stars");
    stars.textContent = "\u2605\u2605\u2605";
    var sub = div("gfx-banner-sub");
    sub.textContent = "Lucky Pull!";
    banner.appendChild(main);
    banner.appendChild(stars);
    banner.appendChild(sub);
    add(banner);

    setTimeout(function () { revealing = false; }, 1900);
  }

  // ---- Wiring ------------------------------------------------
  function handleTap(x, y, target) {
    var isSSRTarget = target && target.closest && target.closest(SSR_SELECTOR);
    var isControl = target && target.closest && target.closest("a, button, input, select, textarea, summary");
    var lucky = !isControl && SSR_RATE > 0 && Math.random() < SSR_RATE;

    if (isSSRTarget || lucky) {
      tapEffect(x, y);
      ssrReveal(x, y);
    } else {
      tapEffect(x, y);
    }
  }

  // pointerdown = instant feedback for mouse, touch and pen
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    handleTap(e.clientX, e.clientY, e.target);
  }, { passive: true });

  // Keyboard activation (Enter/Space on a focused button or link) fires click with detail 0
  document.addEventListener("click", function (e) {
    if (e.detail !== 0) return;
    var t = e.target && e.target.closest ? e.target.closest("a, button") : null;
    if (!t) return;
    var r = t.getBoundingClientRect();
    handleTap(r.left + r.width / 2, r.top + r.height / 2, t);
  });
})();
