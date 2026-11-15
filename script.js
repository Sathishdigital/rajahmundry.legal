(() => {
  const body = document.body;
  const languageToggle = document.getElementById("languageToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  let language = "en";

  function setLanguage(next) {
    language = next;
    body.classList.toggle("telugu", language === "te");
    document.documentElement.lang = language === "te" ? "te" : "en";
    document.querySelectorAll("[data-en][data-te]").forEach((el) => {
      el.textContent = el.dataset[language];
    });
    document.querySelectorAll("[data-placeholder-en][data-placeholder-te]").forEach((el) => {
      el.placeholder = el.dataset[language === "te" ? "placeholderTe" : "placeholderEn"];
    });
    languageToggle.textContent = language === "en" ? "తెలుగు" : "English";
    languageToggle.setAttribute("aria-label", language === "en" ? "Switch to Telugu" : "Switch to English");
  }

  languageToggle.addEventListener("click", () => setLanguage(language === "en" ? "te" : "en"));
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  // The first release has no published advocate profiles yet.
  // Search controls are prepared for the directory database to be added later.
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", () => {
    const search = document.getElementById("advocateSearch").value.trim();
    const area = document.getElementById("practiceFilter").value;
    const empty = document.getElementById("directoryEmpty");
    if (search || area) {
      const heading = empty.querySelector("h3");
      const paragraph = empty.querySelector("p");
      heading.textContent = language === "te" ? "ప్రస్తుతం సరిపోలే వివరాలు లేవు" : "No matching advocate listings yet";
      paragraph.textContent = language === "te"
        ? "ధృవీకరించిన న్యాయవాదుల ప్రొఫైళ్లు ప్రచురించిన తర్వాత శోధన ఫలితాలు కనిపిస్తాయి."
        : "Search is ready for future listings. Verified advocate profiles have not been published yet.";
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  setLanguage("en");
})();
