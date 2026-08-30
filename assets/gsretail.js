(function () {
  "use strict";

  var PARTNER_CODE = "GSR01";
  var ENV_STORAGE_KEY = "emfi-bridge-env";

  var ENVIRONMENTS = {
    dev: { label: "개발", domain: "zemfi.kbstar.com" },
    staging: { label: "스테이징", domain: "yemfi.kbstar.com" },
    prod: { label: "운영", domain: "emfi.kbstar.com" },
  };

  var cardEl = document.getElementById("card");
  var envButtons = document.querySelectorAll(".env-switch__option");
  var envDomainEl = document.getElementById("env-domain");
  var items = document.querySelectorAll(".shortcut-item");

  var currentEnv = ENVIRONMENTS[localStorage.getItem(ENV_STORAGE_KEY)]
    ? localStorage.getItem(ENV_STORAGE_KEY)
    : "prod";

  function buildUrl(pageId) {
    return (
      "https://" +
      ENVIRONMENTS[currentEnv].domain +
      "/quics?page=" +
      pageId +
      "&alianCoCd=" +
      PARTNER_CODE
    );
  }

  function refreshLinks() {
    items.forEach(function (item) {
      var pageId = item.getAttribute("data-page");
      var url = buildUrl(pageId);
      var urlEl = document.getElementById("url-" + pageId);
      var goEl = document.getElementById("go-" + pageId);
      urlEl.textContent = url.replace("https://", "");
      goEl.href = url;
    });
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

    refreshLinks();
  }

  envButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setEnv(btn.getAttribute("data-env"));
    });
  });

  items.forEach(function (item) {
    var copyBtn = item.querySelector(".shortcut-item__copy");
    copyBtn.addEventListener("click", function () {
      var url = buildUrl(item.getAttribute("data-page"));

      function markCopied() {
        copyBtn.classList.add("is-copied");
        setTimeout(function () {
          copyBtn.classList.remove("is-copied");
        }, 1200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(markCopied, markCopied);
      } else {
        var temp = document.createElement("textarea");
        temp.value = url;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        markCopied();
      }
    });
  });

  setEnv(currentEnv);
})();
