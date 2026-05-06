const KEYS = {
  ACCESS:    'access_token',
  REFRESH:   'refresh_token',
  SIGNATURE: 'token_signature',
} as const;

// Sentinel — returned when no signature exists in storage.
// Distinct from 'Bearer' so callers can detect "not set" vs "explicitly Bearer".

export const tokenStorage = {
  getAccess:    () => localStorage.getItem(KEYS.ACCESS),
  getRefresh:   () => localStorage.getItem(KEYS.REFRESH),

  // Returns null if nothing stored — callers must handle null explicitly.
  // Never falls back silently to 'Bearer' here; that decision belongs to
  // the caller who has context about whether the fallback is safe.
  getSignature: () => localStorage.getItem(KEYS.SIGNATURE),

  setAccess:    (t: string) => localStorage.setItem(KEYS.ACCESS, t),
  setRefresh:   (t: string) => localStorage.setItem(KEYS.REFRESH, t),
  setSignature: (s: string) => localStorage.setItem(KEYS.SIGNATURE, s),

  clearAll: () => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    localStorage.removeItem(KEYS.SIGNATURE);
  },

  setCredentials: (access: string, refresh: string) => {
    localStorage.setItem(KEYS.ACCESS, access);
    localStorage.setItem(KEYS.REFRESH, refresh);
  },

  // Returns true only when all three values are present and non-empty.
  // Use this before attempting a refresh to avoid wasted round-trips.
  hasValidSession: (): boolean => {
    return !!(
      localStorage.getItem(KEYS.ACCESS)    &&
      localStorage.getItem(KEYS.REFRESH)   &&
      localStorage.getItem(KEYS.SIGNATURE)
    );
  },
};