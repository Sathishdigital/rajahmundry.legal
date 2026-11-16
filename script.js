/* Rajahmundry.Legal — navigation and language controls */
(() => {
  "use strict";

  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const languageToggle = document.getElementById("languageToggle");
  const year = document.getElementById("currentYear");
  const lawyerModal = document.getElementById("lawyerModal");
  const lawyerForm = document.getElementById("lawyerEnquiryForm");
  let lastModalTrigger = null;

  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        primaryNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });

    document.addEventListener("click", (event) => {
      if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) {
        primaryNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // English / Telugu language toggle. English is the default.
  let currentLanguage = "en";

  function setLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language === "te" ? "te" : "en";

    document.querySelectorAll("[data-en][data-te]").forEach((element) => {
      const translation = element.dataset[language];
      if (translation) element.textContent = translation;
    });

    if (languageToggle) {
      languageToggle.textContent = language === "en" ? "తెలుగు" : "English";
      languageToggle.setAttribute(
        "aria-label",
        language === "en" ? "Switch to Telugu" : "Switch to English"
      );
    }
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "en" ? "te" : "en");
    });
  }



  // Talk to a Lawyer modal and WhatsApp enquiry hand-off.
  function openLawyerModal(trigger) {
    if (!lawyerModal) return;
    lastModalTrigger = trigger || document.activeElement;
    if (primaryNav) primaryNav.classList.remove("is-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    lawyerModal.hidden = false;
    document.body.classList.add("modal-open");
    const firstField = lawyerModal.querySelector('input[name="name"]');
    if (firstField) firstField.focus();
  }

  function closeLawyerModal() {
    if (!lawyerModal) return;
    lawyerModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastModalTrigger && typeof lastModalTrigger.focus === "function") lastModalTrigger.focus();
  }

  document.querySelectorAll("[data-open-lawyer-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLawyerModal(trigger));
  });

  // A topic in the Legal Advice directory opens the enquiry form with that issue selected.
  document.querySelectorAll("[data-legal-topic]").forEach((topicButton) => {
    topicButton.addEventListener("click", () => {
      const issueSelect = lawyerForm?.querySelector('select[name="issue"]');
      if (issueSelect) issueSelect.value = topicButton.dataset.legalTopic;
      openLawyerModal(topicButton);
    });
  });

  document.querySelectorAll("[data-close-lawyer-modal]").forEach((button) => {
    button.addEventListener("click", closeLawyerModal);
  });

  if (lawyerModal) {
    lawyerModal.addEventListener("click", (event) => {
      if (event.target === lawyerModal) closeLawyerModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lawyerModal.hidden) closeLawyerModal();
    });
  }

  if (lawyerForm) {
    lawyerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!lawyerForm.reportValidity()) return;
      const formData = new FormData(lawyerForm);
      const message = [
        "Hello Rajahmundry.Legal, I would like help finding a lawyer.",
        `Name: ${formData.get("name")}`,
        `Mobile: ${formData.get("phone")}`,
        `City / Town: ${formData.get("location")}`,
        `Legal issue: ${formData.get("issue")}`,
        `Brief details: ${formData.get("details")}`,
        "I agree to the Rajahmundry.Legal terms of use."
      ].join("\n");
      const whatsappUrl = `https://wa.me/919912115225?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  }

  // Client account interface. Authentication is intentionally not simulated.
  const accountModal = document.getElementById("clientAccountModal");
  const signupForm = document.getElementById("clientSignupForm");
  const loginForm = document.getElementById("clientLoginForm");
  const accountStatus = document.getElementById("accountStatus");
  let lastAccountTrigger = null;

  const closeAccountModal = () => {
    if (!accountModal) return;
    accountModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastAccountTrigger && typeof lastAccountTrigger.focus === "function") lastAccountTrigger.focus();
  };

  document.querySelectorAll("[data-open-client-account]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!accountModal) return;
      lastAccountTrigger = button;
      if (primaryNav) primaryNav.classList.remove("is-open");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      accountModal.hidden = false;
      document.body.classList.add("modal-open");
      const firstField = accountModal.querySelector('#clientSignupForm input[name="name"]');
      if (firstField) firstField.focus();
    });
  });

  document.querySelectorAll("[data-close-client-account]").forEach((button) => {
    button.addEventListener("click", closeAccountModal);
  });

  if (accountModal) {
    accountModal.addEventListener("click", (event) => {
      if (event.target === accountModal) closeAccountModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !accountModal.hidden) closeAccountModal();
    });
  }

  document.querySelectorAll("[data-account-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const signup = tab.dataset.accountTab === "signup";
      if (signupForm) signupForm.hidden = !signup;
      if (loginForm) loginForm.hidden = signup;
      document.querySelectorAll("[data-account-tab]").forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      if (accountStatus) accountStatus.textContent = "Account registration and login will be enabled after secure authentication is connected.";
    });
  });

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(signupForm);
      if (data.get("password") !== data.get("confirmPassword")) {
        if (accountStatus) accountStatus.textContent = "The passwords do not match. Please check and try again.";
        return;
      }
      if (accountStatus) accountStatus.textContent = "The sign-up form is ready, but account creation is not active yet. A secure authentication service must be connected before registration can be accepted.";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (accountStatus) accountStatus.textContent = "Login is not active yet. Please use the Talk to a Lawyer enquiry option until secure client login is connected.";
    });
  }

  // Keep the site language at English on initial load.
  setLanguage("en");
})();
