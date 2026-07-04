(function () {
  "use strict";

  var ENDPOINT = "https://emfi.kbstar.com/quics";
  var FIXED_PAGE_ID = "C111966";
  var FIXED_PARTNER_CODE = "KBB01";
  var STORAGE_KEY = "emfi-bridge-mode";

  var MODES = {
    partner: {
      pattern: /^[A-Z0-9]{5}$/,
      error: "영문 대문자와 숫자를 조합한 5자리를 입력해주세요.",
      footer: "제휴사 코드로 EMFI 페이지에 접속합니다.",
      buildUrl: function (value) {
        return ENDPOINT + "?page=" + FIXED_PAGE_ID + "&alianCoCd=" + value;
      },
    },
    product: {
      pattern: /^[A-Z][A-Z0-9]{3,9}$/,
      error: "영문으로 시작하는 4~10자리 페이지 ID를 입력해주세요. (예: C111966)",
      footer: "페이지 ID로 상품 목록 페이지에 접속합니다.",
      buildUrl: function (value) {
        return ENDPOINT + "?page=" + value + "&alianCoCd=" + FIXED_PARTNER_CODE;
      },
    },
  };

  var toggleEl = document.querySelector(".toggle");
  var toggleButtons = document.querySelectorAll(".toggle__option");
  var panels = {
    partner: document.getElementById("panel-partner"),
    product: document.getElementById("panel-product"),
  };
  var inputs = {
    partner: document.getElementById("input-partner"),
    product: document.getElementById("input-product"),
  };
  var errorEls = {
    partner: document.getElementById("error-partner"),
    product: document.getElementById("error-product"),
  };
  var previewEls = {
    partner: document.getElementById("preview-partner"),
    product: document.getElementById("preview-product"),
  };
  var footerDesc = document.getElementById("footer-desc");
  var goBtn = document.getElementById("go-btn");

  var currentMode = localStorage.getItem(STORAGE_KEY) || "partner";

  function sanitize(raw) {
    return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem(STORAGE_KEY, mode);

    toggleEl.setAttribute("data-mode", mode);
    toggleButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    Object.keys(panels).forEach(function (key) {
      panels[key].classList.toggle("is-active", key === mode);
    });

    footerDesc.textContent = MODES[mode].footer;
    updatePreview(mode);
  }

  function updatePreview(mode) {
    var value = inputs[mode].value;
    var config = MODES[mode];
    if (config.pattern.test(value)) {
      previewEls[mode].textContent = "이동 위치: " + config.buildUrl(value);
    } else {
      previewEls[mode].textContent = "";
    }
  }

  function clearError(mode) {
    errorEls[mode].textContent = "";
    inputs[mode].classList.remove("is-invalid");
  }

  function showError(mode) {
    errorEls[mode].textContent = MODES[mode].error;
    inputs[mode].classList.add("is-invalid");
  }

  toggleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode"));
    });
  });

  Object.keys(inputs).forEach(function (mode) {
    var input = inputs[mode];
    input.addEventListener("input", function () {
      var caret = input.selectionStart;
      var before = input.value;
      input.value = sanitize(input.value);
      if (caret !== null) {
        var diff = before.length - input.value.length;
        input.setSelectionRange(caret - diff, caret - diff);
      }
      clearError(mode);
      updatePreview(mode);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    });
  });

  function submit() {
    var mode = currentMode;
    var config = MODES[mode];
    var value = inputs[mode].value.trim();

    if (!config.pattern.test(value)) {
      showError(mode);
      inputs[mode].focus();
      return;
    }

    clearError(mode);
    goBtn.disabled = true;
    goBtn.classList.add("is-loading");

    var url = config.buildUrl(value);
    setTimeout(function () {
      window.location.href = url;
    }, 350);
  }

  goBtn.addEventListener("click", submit);

  setMode(currentMode);
})();
