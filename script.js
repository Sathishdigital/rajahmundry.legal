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

  // Supabase client authentication for Rajahmundry.Legal.
  // The publishable key is intended for browser use. Never put a secret key here.
  const SUPABASE_URL = "https://vfniaabryavvbjxlcxdh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZAAfmwS8qySjAWE_31cSAg_2OY8agRQ";
  const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

  const accountModal = document.getElementById("clientAccountModal");
  const signupForm = document.getElementById("clientSignupForm");
  const loginForm = document.getElementById("clientLoginForm");
  const accountStatus = document.getElementById("accountStatus");
  const dashboard = document.getElementById("clientDashboard");
  const dashboardEmail = document.getElementById("clientDashboardEmail");
  const dashboardPhone = document.getElementById("clientDashboardPhone");
  const logoutButton = document.getElementById("clientLogoutButton");
  let lastAccountTrigger = null;

  function setAccountStatus(message, isError = false) {
    if (!accountStatus) return;
    accountStatus.textContent = message;
    accountStatus.style.borderColor = isError ? "#8b0000" : "#d4d4d4";
  }

  function normalizeIndianMobile(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 10) digits = "91" + digits;
    if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
    return null;
  }

  function showClientDashboard(user) {
    if (!user || !dashboard) return;
    const metadata = user.user_metadata || {};
    if (signupForm) signupForm.hidden = true;
    if (loginForm) loginForm.hidden = true;
    document.querySelectorAll("[data-account-tab]").forEach((tab) => { tab.hidden = true; });
    dashboard.hidden = false;
    if (dashboardEmail) dashboardEmail.textContent = user.email ? `Email: ${user.email}` : "Email account";
    if (dashboardPhone) dashboardPhone.textContent = metadata.phone ? `Mobile: ${metadata.phone}` : "";
    setAccountStatus("You are signed in. Keep your login details private.");
  }

  function showAccountForms() {
    if (dashboard) dashboard.hidden = true;
    document.querySelectorAll("[data-account-tab]").forEach((tab) => { tab.hidden = false; });
  }

  const closeAccountModal = () => {
    if (!accountModal) return;
    accountModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastAccountTrigger && typeof lastAccountTrigger.focus === "function") lastAccountTrigger.focus();
  };

  document.querySelectorAll("[data-open-client-account]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!accountModal) return;
      lastAccountTrigger = button;
      if (primaryNav) primaryNav.classList.remove("is-open");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      accountModal.hidden = false;
      document.body.classList.add("modal-open");
      showAccountForms();
      if (!supabaseClient) {
        setAccountStatus("The account service did not load. Please refresh the page and try again.", true);
        return;
      }
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) showClientDashboard(session.user);
      else {
        const firstField = accountModal.querySelector('#clientSignupForm input[name="name"]');
        if (firstField) firstField.focus();
      }
    });
  });

  document.querySelectorAll("[data-close-client-account]").forEach((button) => button.addEventListener("click", closeAccountModal));
  if (accountModal) {
    accountModal.addEventListener("click", (event) => { if (event.target === accountModal) closeAccountModal(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !accountModal.hidden) closeAccountModal(); });
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
      setAccountStatus(signup
        ? "Register with your email and password. Verify your email using the confirmation link."
        : "Log in with your email address or registered mobile number and password.");
    });
  });

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!supabaseClient) return setAccountStatus("Authentication service unavailable. Refresh and try again.", true);
      if (!signupForm.reportValidity()) return;
      const data = new FormData(signupForm);
      const fullName = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const phone = normalizeIndianMobile(data.get("phone"));
      const password = String(data.get("password") || "");
      if (!phone) return setAccountStatus("Enter a valid 10-digit Indian mobile number.", true);
      if (password !== data.get("confirmPassword")) return setAccountStatus("The passwords do not match.", true);
      setAccountStatus("Creating your account…");
      const { data: result, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, phone }
        }
      });
      if (error) return setAccountStatus(error.message, true);
      signupForm.reset();
      if (result.session && result.user) {
        showClientDashboard(result.user);
        return;
      }
      setAccountStatus("Registration received. Please open the confirmation link sent to your email address, then return here and log in. If the email does not arrive, check your spam folder.");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!supabaseClient) return setAccountStatus("Authentication service unavailable. Refresh and try again.", true);
      if (!loginForm.reportValidity()) return;
      const data = new FormData(loginForm);
      const identity = String(data.get("identity") || "").trim();
      const password = String(data.get("password") || "");
      setAccountStatus("Signing you in…");
      let result;
      if (identity.includes("@")) {
        result = await supabaseClient.auth.signInWithPassword({ email: identity.toLowerCase(), password });
      } else {
        const phone = normalizeIndianMobile(identity);
        if (!phone) return setAccountStatus("Enter a valid email address or 10-digit Indian mobile number.", true);
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/client-phone-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({ phone, password })
          });
          const payload = await response.json();
          if (!response.ok || !payload.access_token || !payload.refresh_token) {
            return setAccountStatus(payload.error || "Unable to log in with those details. Check your number and password.", true);
          }
          result = await supabaseClient.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token
          });
        } catch (error) {
          return setAccountStatus("Mobile login service is not deployed yet. Email login is available; please try mobile login after setup is complete.", true);
        }
      }
      if (result.error) return setAccountStatus("Login failed. Check your email/mobile number and password. If you just registered, confirm your email first.", true);
      loginForm.reset();
      showClientDashboard(result.data.user || result.data.session?.user);
    });
  }

  if (logoutButton && supabaseClient) {
    logoutButton.addEventListener("click", async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) return setAccountStatus("Unable to log out. Please try again.", true);
      showAccountForms();
      if (signupForm) signupForm.hidden = true;
      if (loginForm) loginForm.hidden = false;
      setAccountStatus("You have logged out successfully.");
      document.querySelectorAll("[data-account-tab]").forEach((tab) => {
        const active = tab.dataset.accountTab === "login";
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    });
  }

  // Password recovery is email-based; mobile number alone is not used for recovery.
  if (loginForm) {
    const forgot = document.createElement("button");
    forgot.type = "button";
    forgot.className = "account-forgot";
    forgot.textContent = "Forgot password? Reset by email";
    forgot.addEventListener("click", async () => {
      const identityInput = loginForm.querySelector('[name="identity"]');
      const identity = String(identityInput?.value || "").trim();
      if (!identity.includes("@")) return setAccountStatus("For password recovery, enter your registered email address first.", true);
      const { error } = await supabaseClient.auth.resetPasswordForEmail(identity.toLowerCase(), { redirectTo: window.location.origin });
      setAccountStatus(error ? error.message : "If this email is registered, a password-reset link will be sent to it.", !!error);
    });
    loginForm.appendChild(forgot);
  }

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user && accountModal && !accountModal.hidden) showClientDashboard(session.user);
    });
  }

  // Keep the site language at English on initial load.
  setLanguage("en");
})();
