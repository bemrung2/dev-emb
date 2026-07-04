(function () {
  "use strict";

  var FIXED_PAGE_ID = "C111966";
  var DEFAULT_PARTNER_CODE = "KBB01";
  var STORAGE_KEY = "emfi-bridge-mode";
  var ENV_STORAGE_KEY = "emfi-bridge-env";
  var CODE_PATTERN = /^[A-Z0-9]{5}$/;

  var ENVIRONMENTS = {
    dev: { label: "개발", domain: "zemfi.kbstar.com" },
    staging: { label: "스테이징", domain: "yemfi.kbstar.com" },
    prod: { label: "운영", domain: "emfi.kbstar.com" },
  };

  var PRODUCTS = [
    { id: "C111967", name: "KB스타통장" },
    { id: "C111969", name: "특별한적금" },
    { id: "C111968", name: "KB Star 정기예금" },
    { id: "C111970", name: "주택청약종합저축" },
    { id: "C112591", name: "ONE KB 사업자통장" },
    { id: "C112685", name: "KB 맑은하늘적금" },
    { id: "C112646", name: "가맹점등록/결제계좌변경" },
    { id: "C111974", name: "외화 선물하기" },
    { id: "C111971", name: "비회원 환전" },
  ];

  var CAPTIONS = {
    partner: "영문 대문자 + 숫자 5자리를 입력하면 해당 코드로 이동해요.",
    partnerError: "영문 대문자와 숫자를 조합한 5자리를 입력해주세요.",
    productCode: "비워두면 기본 코드 <strong>KBB01</strong>로 이동해요.",
    productCodeError: "영문 대문자와 숫자를 조합한 5자리를 입력하거나 비워두세요.",
  };

  var SUBTITLES = {
    partner: "브릿지페이지(C111966)로 이동해요",
    product: "페이지ID로 바로 이동해요",
  };

  var cardEl = document.getElementById("card");
  var envButtons = document.querySelectorAll(".env-switch__option");
  var envDomainEl = document.getElementById("env-domain");
  var toggleEl = document.querySelector(".toggle");
  var toggleButtons = document.querySelectorAll(".toggle__option");
  var panels = {
    partner: document.getElementById("panel-partner"),
    product: document.getElementById("panel-product"),
  };
  var partnerInput = document.getElementById("input-partner");
  var partnerCaption = document.getElementById("caption-partner");
  var productSelect = document.getElementById("select-product");
  var productCodeInput = document.getElementById("input-product-code");
  var productCodeCaption = document.getElementById("caption-product-code");
  var subtitleEl = document.getElementById("subtitle");
  var goBtn = document.getElementById("go-btn");

  var currentMode = localStorage.getItem(STORAGE_KEY) || "partner";
  var currentEnv = ENVIRONMENTS[localStorage.getItem(ENV_STORAGE_KEY)]
    ? localStorage.getItem(ENV_STORAGE_KEY)
    : "prod";

  PRODUCTS.forEach(function (product) {
    var option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.name + " · " + product.id;
    productSelect.appendChild(option);
  });

  function sanitize(raw) {
    return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function getEndpoint() {
    return "https://" + ENVIRONMENTS[currentEnv].domain + "/quics";
  }

  function setEnv(env) {
    currentEnv = env;
    localStorage.setItem(ENV_STORAGE_KEY, env);

    envButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-env") === env;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    cardEl.classList.remove("env-dev", "env-staging", "env-prod");
    cardEl.classList.add("env-" + env);
    envDomainEl.textContent = ENVIRONMENTS[env].domain;
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

    subtitleEl.textContent = SUBTITLES[mode];
  }

  function resetPartnerState() {
    partnerCaption.innerHTML = CAPTIONS.partner;
    partnerCaption.classList.remove("is-error");
    partnerInput.classList.remove("is-invalid");
  }

  function resetProductCodeState() {
    productCodeCaption.innerHTML = CAPTIONS.productCode;
    productCodeCaption.classList.remove("is-error");
    productCodeInput.classList.remove("is-invalid");
  }

  function showPartnerError() {
    partnerCaption.innerHTML = CAPTIONS.partnerError;
    partnerCaption.classList.add("is-error");
    partnerInput.classList.add("is-invalid");
  }

  function showProductCodeError() {
    productCodeCaption.innerHTML = CAPTIONS.productCodeError;
    productCodeCaption.classList.add("is-error");
    productCodeInput.classList.add("is-invalid");
  }

  function bindSanitizedInput(input, onChange) {
    input.addEventListener("input", function () {
      var caret = input.selectionStart;
      var before = input.value;
      input.value = sanitize(input.value);
      if (caret !== null) {
        var diff = before.length - input.value.length;
        input.setSelectionRange(caret - diff, caret - diff);
      }
      onChange();
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    });
  }

  toggleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode"));
    });
  });

  envButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setEnv(btn.getAttribute("data-env"));
    });
  });

  bindSanitizedInput(partnerInput, resetPartnerState);
  bindSanitizedInput(productCodeInput, resetProductCodeState);

  function submit() {
    var url;
    var endpoint = getEndpoint();

    if (currentMode === "partner") {
      var code = partnerInput.value.trim();
      if (!CODE_PATTERN.test(code)) {
        showPartnerError();
        partnerInput.focus();
        return;
      }
      resetPartnerState();
      url = endpoint + "?page=" + FIXED_PAGE_ID + "&alianCoCd=" + code;
    } else {
      var productId = productSelect.value;
      var rawCode = productCodeInput.value.trim();
      var partnerCode;

      if (rawCode === "") {
        partnerCode = DEFAULT_PARTNER_CODE;
      } else if (CODE_PATTERN.test(rawCode)) {
        partnerCode = rawCode;
      } else {
        showProductCodeError();
        productCodeInput.focus();
        return;
      }

      resetProductCodeState();
      url = endpoint + "?page=" + productId + "&alianCoCd=" + partnerCode;
    }

    goBtn.disabled = true;
    goBtn.classList.add("is-loading");
    setTimeout(function () {
      window.location.href = url;
    }, 350);
  }

  goBtn.addEventListener("click", submit);

  setEnv(currentEnv);
  setMode(currentMode);
})();
