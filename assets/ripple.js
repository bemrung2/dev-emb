(function () {
  "use strict";

  function spawnRipple(event) {
    var el = event.currentTarget;
    if (el.disabled) return;

    var rect = el.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.6;
    var x = event.clientX - rect.left - size / 2;
    var y = event.clientY - rect.top - size / 2;

    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    el.insertBefore(ripple, el.firstChild);
    ripple.addEventListener("animationend", function () {
      ripple.remove();
    });
  }

  document.querySelectorAll(".ripple-surface").forEach(function (el) {
    el.addEventListener("pointerdown", spawnRipple);
  });
})();
