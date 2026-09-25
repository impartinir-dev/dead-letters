/** Browser-side delivery of the share text (kept apart so share.ts stays DOM-free). */
import { shareText, type ShareResult } from './share'

function isMobile(): boolean {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
  if (typeof uaData?.mobile === 'boolean') return uaData.mobile
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) // iPadOS
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // insecure context or permission denied — legacy fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** Native share sheet on mobile, clipboard on desktop. */
export async function shareResult(r: ShareResult): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const text = shareText(r, location.origin + location.pathname)
  if (isMobile() && navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      /* share unavailable — fall through to clipboard */
    }
  }
  return (await copy(text)) ? 'copied' : 'failed'
}
