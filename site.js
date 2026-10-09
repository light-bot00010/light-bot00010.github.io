/* Stearling Connection — motion. No library, ~2 KB gzipped.
   Rule: an element is only ever hidden if it is below the fold when this
   script runs. Anything already on screen stays put. If this file fails to
   load, the page is simply static. */
(function () {
  "use strict";
  var d = document;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---- 1. reveal on scroll ------------------------------------------- */
  if (!reduce && hasIO) {
    d.querySelectorAll("[data-stagger]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.setProperty("--i", i);
        if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", "");
      });
    });
    var items = d.querySelectorAll("[data-reveal], .reveal");
    var fold = window.innerHeight * 0.9;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.remove("is-pending");
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    Array.prototype.forEach.call(items, function (el) {
      if (el.getBoundingClientRect().top > fold) {
        el.classList.add("is-pending");
        io.observe(el);
      } else {
        el.classList.add("is-in");
      }
    });
    window.addEventListener("beforeprint", function () {
      Array.prototype.forEach.call(items, function (el) { el.classList.remove("is-pending"); });
    });
  }

  /* ---- 2. the hero search -------------------------------------------- */
  var demo = d.querySelector("[data-demo]");
  if (!demo || reduce) return;
  var out = demo.querySelector("[data-typed]");
  var queries = (demo.getAttribute("data-demo") || "").split("|").filter(Boolean);
  if (!out || queries.length < 2) return;

  var visible = true;
  if (hasIO) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(demo);
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function ready() {
    return new Promise(function (r) {
      (function check() { if (visible && !d.hidden) r(); else setTimeout(check, 400); })();
    });
  }
  function state(s) { demo.setAttribute("data-state", s); }

  async function loop() {
    var i = 0;
    await sleep(1600);                 // the page opens on a finished search
    for (;;) {
      await ready(); state("call"); await sleep(2700);
      state("clear"); await sleep(380);
      var cur = out.textContent;
      for (var k = cur.length; k >= 0; k--) { out.textContent = cur.slice(0, k); await sleep(18); }
      i = (i + 1) % queries.length;
      var next = queries[i];
      state("typing"); await sleep(260);
      for (var n = 1; n <= next.length; n++) {
        await ready();
        out.textContent = next.slice(0, n);
        await sleep(48 + Math.random() * 70);
      }
      await sleep(420); state("results"); await sleep(1500);
    }
  }
  loop();
})();
