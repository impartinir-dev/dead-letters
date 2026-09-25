/** App-wide settings. Change these before launch. */

/**
 * Local date of daily case #1 (YYYY-MM-DD). Before this date the daily case
 * shows as #1 so the site can be previewed.
 */
export const LAUNCH_DATE = '2026-10-01'

/**
 * Public link to the Tally contact form (Impressum "second contact channel").
 * Leave empty until the form exists — the Impressum then shows a placeholder.
 */
export const CONTACT_FORM_URL = ''

/**
 * Advertising. `enabled` is the single master switch: while it is false, no
 * ad slot, consent banner or ad script is rendered or loaded anywhere.
 * Even when true, ads only appear after the player grants consent
 * (see src/lib/consent.ts) and only in the solved-case overlay and the
 * optional between-cases interstitial — never on or beside the grid.
 */
export const ADS: { enabled: boolean; interstitialEvery: number } = {
  enabled: false,
  /** show the interstitial when leaving every Nth solved case this session; 0 = never */
  interstitialEvery: 3,
}
