/** Pure ad-gating rules (no DOM), shared by the ad components and the tests. */

export type Consent = 'unknown' | 'granted' | 'denied'

/** Ads may render/load only with the master switch on AND explicit consent. */
export function adsAllowed(enabled: boolean, consent: Consent): boolean {
  return enabled && consent === 'granted'
}

/** Interstitial after every `every`-th solve of the session (0 = never). */
export function interstitialDue(solvesThisSession: number, every: number): boolean {
  return every > 0 && solvesThisSession > 0 && solvesThisSession % every === 0
}
