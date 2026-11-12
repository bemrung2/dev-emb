(function () {
  "use strict";

  /* A press spreads from where the finger actually landed, and fades once it
     lifts (or leaves/cancels) rather than on a fixed timer. */
  function attach(node) {
    node.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      if (node.disabled) return;

      var box = node.getBoundingClientRect();
      var size = Math.max(box.width, box.height) * 2.2;
      var ink = document.createElement("span");
      ink.className = "ink";
      ink.style.width = ink.style.height = size + "px";
      ink.style.left = e.clientX - box.left - size / 2 + "px";
      ink.style.top = e.clientY - box.top - size / 2 + "px";
      node.insertBefore(ink, node.firstChild);

      var done = false;
      function off() {
        if (done) return;
        done = true;
        ink.classList.add("out");
        setTimeout(function () {
          ink.remove();
        }, 320);
      }
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
        node.addEventListener(ev, off, { once: true });
      });
      setTimeout(off, 1200);
    });
  }

  document.querySelectorAll(".ripple-surface").forEach(attach);
})();
