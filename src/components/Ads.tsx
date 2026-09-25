import { useEffect } from 'react'
import { ADS } from '../config'
import { adsAllowed } from '../lib/adsPolicy'
import { ensureAdScript } from '../lib/ads'
import { setConsent, useConsent } from '../lib/consent'

/**
 * Placeholder ad slot. Renders nothing unless ADS.enabled and the player has
 * consented. Allowed placements only: under the solved-case overlay and in
 * the between-cases interstitial — never on or beside the grid.
 */
export function AdSlot({ placement }: { placement: 'overlay' | 'interstitial' }) {
  const consent = useConsent()
  const show = adsAllowed(ADS.enabled, consent)
  useEffect(() => {
    if (show) ensureAdScript()
  }, [show])
  if (!show) return null
  return (
    <aside className={`ad-slot ad-${placement}`} aria-label="Advertisement">
      <span className="ad-label">Anzeige · Advertisement</span>
      {/* the ad network renders into this box */}
      <div className="ad-box" data-ad-placement={placement} />
    </aside>
  )
}

/** Full-screen break between cases (only ever shown when ads are allowed). */
export function Interstitial({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="overlay interstitial" role="dialog" aria-modal="true" aria-label="Advertisement break">
      <div className="interstitial-card">
        <AdSlot placement="interstitial" />
        <button className="btn btn-primary" onClick={onContinue} autoFocus>
          Continue to the next case
        </button>
      </div>
    </div>
  )
}

/**
 * Placeholder consent banner, shown only while ADS.enabled and no decision is
 * stored. Replace with a certified CMP before running real ads — see
 * src/lib/consent.ts.
 */
export function ConsentBanner({ nav }: { nav: (h: string) => void }) {
  const consent = useConsent()
  if (!ADS.enabled || consent !== 'unknown') return null
  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <p>
        We’d like to show ads to keep DEAD LETTERS free. Ad partners may store and read data on your
        device.{' '}
        <button className="link" onClick={() => nav('#/datenschutz')}>
          Datenschutz
        </button>
      </p>
      <div className="consent-actions">
        <button className="btn" onClick={() => setConsent('denied')}>
          Decline
        </button>
        {/* equal weight for both choices — declining must be as easy as accepting */}
        <button className="btn" onClick={() => setConsent('granted')}>
          Accept
        </button>
      </div>
    </div>
  )
}
