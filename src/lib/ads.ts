/**
 * Ad loading, gated by the master switch and consent. No ad network code is
 * included yet — `ensureAdScript()` is where it goes.
 */
import { ADS } from '../config'
import { adsAllowed, interstitialDue } from './adsPolicy'
import { getConsent } from './consent'

export function canShowAds(): boolean {
  return adsAllowed(ADS.enabled, getConsent())
}

let solvesThisSession = 0

/** Count a solve; true when leaving this case should show the interstitial. */
export function noteSolve(): boolean {
  solvesThisSession++
  return canShowAds() && interstitialDue(solvesThisSession, ADS.interstitialEvery)
}

let scriptRequested = false

/**
 * Load the ad network script once, and only once ads are allowed. Nothing is
 * fetched while ADS.enabled is false or consent is missing, so the PWA keeps
 * working fully offline.
 */
export function ensureAdScript(): void {
  if (scriptRequested || !canShowAds()) return
  scriptRequested = true
  // TODO(ads): inject the ad network's script tag here, e.g.
  //   const s = document.createElement('script'); s.async = true; s.src = '…'; document.head.append(s)
}
