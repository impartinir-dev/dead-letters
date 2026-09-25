/**
 * Consent store that gates ad loading (GDPR / TDDDG).
 *
 * Today it is fed by the placeholder ConsentBanner (only shown when
 * ADS.enabled). To use a certified CMP instead, load the CMP, remove the
 * banner, and call `setConsent()` from the CMP's callback — e.g. for a
 * TCF v2.2 CMP:
 *
 *   window.__tcfapi?.('addEventListener', 2, (tcData, ok) => {
 *     if (ok && (tcData.eventStatus === 'tcloaded' || tcData.eventStatus === 'useractioncomplete'))
 *       setConsent(<all purposes your ad partner needs are consented> ? 'granted' : 'denied')
 *   })
 *
 * Everything ad-related reads consent through `useConsent()` / `getConsent()`,
 * so nothing else needs to change.
 */
import { useSyncExternalStore } from 'react'
import type { Consent } from './adsPolicy'

const KEY = 'deadletters.consent'
const listeners = new Set<() => void>()

function load(): Consent {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'granted' || v === 'denied') return v
  } catch {
    /* storage blocked — ask again next visit */
  }
  return 'unknown'
}

let consent: Consent = load()

export function getConsent(): Consent {
  return consent
}

export function setConsent(next: Consent): void {
  consent = next
  try {
    if (next === 'unknown') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, next)
  } catch {
    /* storage blocked — decision holds for this session */
  }
  for (const l of listeners) l()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, getConsent)
}
