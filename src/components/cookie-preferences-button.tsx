"use client";

import { COOKIE_CONSENT_KEY } from "@/components/cookie-consent-banner";

export function CookiePreferencesButton() {
  function reopen() {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new Event("skullystore:cookie-consent-reset"));
  }

  return (
    <button
      type="button"
      onClick={reopen}
      className="hover:text-muted-foreground hover:underline"
    >
      Preferencias de cookies
    </button>
  );
}
