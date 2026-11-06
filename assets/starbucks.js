(function () {
  "use strict";

  var FIXED_PAGE_ID = "C111966";
  var PARTNER_CODE = "STB01";
  var ENV_STORAGE_KEY = "emfi-bridge-env";

  var ENVIRONMENTS = {
    dev: { label: "개발", domain: "zemfi.kbstar.com" },
    staging: { label: "스테이징", domain: "yemfi.kbstar.com" },
    prod: { label: "운영", domain: "emfi.kbstar.com" },
  };

  var CARD_DOMAINS = {
    dev: "rm.kbcard.com",
    staging: "tm.kbcard.com",
    prod: "m.kbcard.com",
  };

  var cardEl = document.getElementById("card");
  var envButtons = document.querySelectorAll(".env-switch__option");
  var envDomainEl = document.getElementById("env-domain");
  var items = document.querySelectorAll(".shortcut-item");

  var currentEnv = ENVIRONMENTS[localStorage.getItem(ENV_STORAGE_KEY)]
    ? localStorage.getItem(ENV_STORAGE_KEY)
    : "prod";

  function buildUrl(redrtPage) {
    return (
      "https://" +
      ENVIRONMENTS[currentEnv].domain +
      "/quics?page=" +
      FIXED_PAGE_ID +
      "&redrtPage=" +
      redrtPage +
      "&alianCoCd=" +
      PARTNER_CODE
    );
  }

  function buildCardUrl(allianceCode) {
    return (
      "https://" +
      CARD_DOMAINS[currentEnv] +
      "/CRD/DVIEW/MCAMCXHIACRC0002?mainCC=b&inAppChnCd=B03&solicitorcode=2960100BBB&jehuId=KBEMB&allianceCode=" +
      allianceCode +
      "&serno="
    );
  }

  function urlForItem(item) {
    var allianceCode = item.getAttribute("data-card");
    if (allianceCode) {
      return buildCardUrl(allianceCode);
    }
    return buildUrl(item.getAttribute("data-redrt"));
  }

  function refreshLinks() {
    items.forEach(function (item) {
      var key = item.getAttribute("data-redrt") || item.getAttribute("data-card");
      var url = urlForItem(item);
      var urlEl = document.getElementById("url-" + key);
      var goEl = document.getElementById("go-" + key);
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
      var url = urlForItem(item);

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
