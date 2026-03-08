// Store frontend translations for English and Norwegian
const translations = {
  en: {
    createUser: "Create user",
    username: "Username",
    password: "Password",
    acceptTerms: "I accept",
    terms: "Terms",
    and: "and",
    privacy: "Privacy",
    signUp: "Sign up",
    calling: "Calling",
    loginEdit: "Login / Edit",
    login: "Login",
    reloadMe: "Reload /me",
    logout: "Logout",
    loggedInAs: "Logged in as",
    newUsernameOptional: "New username (optional)",
    newPasswordOptional: "New password (optional)",
    saveChanges: "Save changes",
    deleteAccount: "Delete account",
    requiresLogin: "Requires login (token in memory).",
    deleteMyAccount: "Delete my account",
    confirmDelete: "Are you sure you want to delete your account?",
    requiredField: "This field is required.",
    usernameTooShort: "Username must be at least 3 characters.",
    passwordTooShort: "Password must be at least 8 characters.",
    acceptTermsRequired: "You must accept the Terms and Privacy."
  },
  no: {
    createUser: "Opprett bruker",
    username: "Brukernavn",
    password: "Passord",
    acceptTerms: "Jeg godtar",
    terms: "Terms",
    and: "og",
    privacy: "Privacy",
    signUp: "Registrer",
    calling: "Kaller",
    loginEdit: "Logg inn / Rediger",
    login: "Logg inn",
    reloadMe: "Last inn /me på nytt",
    logout: "Logg ut",
    loggedInAs: "Innlogget som",
    newUsernameOptional: "Nytt brukernavn (valgfritt)",
    newPasswordOptional: "Nytt passord (valgfritt)",
    saveChanges: "Lagre endringer",
    deleteAccount: "Slett konto",
    requiresLogin: "Krever innlogging (token i minnet).",
    deleteMyAccount: "Slett kontoen min",
    confirmDelete: "Er du sikker på at du vil slette kontoen din?",
    requiredField: "Dette feltet er obligatorisk.",
    usernameTooShort: "Brukernavn må være minst 3 tegn.",
    passwordTooShort: "Passord må være minst 8 tegn.",
    acceptTermsRequired: "Du må godta Terms og Privacy."
  }
};

// Detect the browser language
export function detectLanguage() {
  const lang = navigator.language.toLowerCase();

  if (lang.startsWith("no") || lang.startsWith("nb") || lang.startsWith("nn")) {
    return "no";
  }

  return "en";
}

// Return a translated string
export function t(key) {
  const lang = detectLanguage();
  return translations[lang]?.[key] ?? key;
}