import { loadScript } from './aem.js';

/**
 * OneTrust consent management, loaded in the delayed phase (after LCP) by scripts.js.
 *
 * Loads OtAutoBlock.js first, then the SDK stub, which pulls in the banner. OneTrust calls
 * window.OptanonWrapper when it is ready and after every consent change; each call
 * publishes the state for consent-aware code (e.g. the embed block):
 * - `window.consentState = { managed, consented, groups }` for code that runs later,
 * - a `consent.update` event on window with the same object as `detail`.
 *
 * `consented` means the categories in CONSENT_GROUPS are active. When the page does not
 * use OneTrust (`managed: false`, see scripts.js), there is no consent gate on the page,
 * so `consented` is true.
 *
 * CSP (head.html): `script-src 'nonce-aem' 'strict-dynamic'` allows scripts that a trusted
 * (nonced) script inserts, so the dynamically created OneTrust scripts need no nonce.
 * Because OtAutoBlock loads after LCP, it can only block tags added after it, which is
 * fine: the site loads no other third-party tags.
 */

const DOMAIN_SCRIPT = '019878d6-0d4b-7b81-b399-94a1c6d2e133';
const AUTO_BLOCK_URL = `https://cdn.cookielaw.org/consent/${DOMAIN_SCRIPT}/OtAutoBlock.js`;
const SDK_STUB_URL = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';

/** OneTrust categories that must be active for third-party media (C0004: targeting). */
const CONSENT_GROUPS = ['C0004'];

/**
 * Publishes the consent state.
 * @param {{managed: boolean, consented: boolean, groups: string[]}} state
 */
function publish(state) {
  window.consentState = state;
  window.dispatchEvent(new CustomEvent('consent.update', { detail: state }));
}

/** Reads the active OneTrust groups (`",C0001,C0002,"`) and publishes them. */
function onOneTrustUpdate() {
  const groups = String(window.OnetrustActiveGroups || '').split(',').filter(Boolean);
  publish({
    managed: true,
    consented: CONSENT_GROUPS.every((group) => groups.includes(group)),
    groups,
  });
}

/**
 * Starts consent management for the page.
 * @param {{enabled: boolean}} options `enabled: false` skips OneTrust entirely
 */
export default async function initConsent({ enabled }) {
  if (!enabled) {
    publish({ managed: false, consented: true, groups: [] });
    return;
  }
  const previousWrapper = window.OptanonWrapper;
  window.OptanonWrapper = () => {
    if (typeof previousWrapper === 'function') previousWrapper();
    onOneTrustUpdate();
  };
  try {
    await loadScript(AUTO_BLOCK_URL, { type: 'text/javascript' });
    await loadScript(SDK_STUB_URL, {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': DOMAIN_SCRIPT,
      'data-document-language': 'true',
    });
  } catch (error) {
    // blocked or offline: consent stays declined (third-party media shows its notice)
    // eslint-disable-next-line no-console
    console.warn('OneTrust failed to load', error);
  }
}
