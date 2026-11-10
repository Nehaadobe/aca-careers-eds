import { loadCSS, loadScript } from './aem.js';

/**
 * Consent (OneTrust) and analytics (Adobe Launch for CJA), kept off the critical path as the
 * aem.live performance guidance asks for third-party tools (FAQ, "Keeping it 100"):
 * - initConsent: OneTrust (OtAutoBlock.js, then the SDK stub, which pulls in the banner),
 *   started by scripts.js after the page has loaded (end of loadLazy), not before LCP;
 * - loadAnalytics: Adobe Launch, started by scripts.js in the delayed phase (3s after load),
 *   after OneTrust and only where OneTrust runs (Blue Shield and Ascendiun; not Stellarus).
 * Loading Launch late loses no consent: its OneTrust rule opts in when the
 * `analyticsConsentReady` cookie (scripts/onetrust.js) exists and otherwise waits for the
 * `analyticsConsentReady` event.
 *
 * The OneTrust domain script is the production one on *.aem.live and *.blueshieldca.com, and
 * the `-test` one elsewhere (aem.page previews, localhost), as in the client snippet.
 *
 * OneTrust calls window.OptanonWrapper when it is ready and after every consent change; each
 * call also publishes the state for consent-aware code (e.g. the embed block):
 * - `window.consentState = { managed, consented, groups }` for code that runs later,
 * - a `consent.update` event on window with the same object as `detail`.
 * `consented` means the categories in CONSENT_GROUPS are active. When the page does not use
 * OneTrust (`managed: false`), there is no consent gate on the page, so `consented` is true.
 *
 * CSP (head.html): `script-src 'nonce-aem' 'strict-dynamic'` allows scripts that a trusted
 * (nonced) script inserts, so these dynamically created scripts need no nonce. The client
 * snippet's document.write would be blocked by that policy, so the scripts are inserted
 * with loadScript instead.
 */

const BASE_DOMAIN_SCRIPT = '019878d6-0d4b-7b81-b399-94a1c6d2e133';
const IS_PROD = window.location.hostname.endsWith('.aem.live')
  || /(^|\.)blueshieldca\.com$/i.test(window.location.hostname);
const DOMAIN_SCRIPT = IS_PROD ? BASE_DOMAIN_SCRIPT : `${BASE_DOMAIN_SCRIPT}-test`;
const AUTO_BLOCK_URL = `https://cdn.cookielaw.org/consent/${DOMAIN_SCRIPT}/OtAutoBlock.js`;
const SDK_STUB_URL = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
/** Banner styles maintained by Blue Shield (the custom "trusted partners" banner). */
const BANNER_CSS_URL = 'https://www.blueshieldca.com/vendor/onetrust/onetrust.css';
/** Adobe Launch (CJA) production library. */
const LAUNCH_URL = 'https://assets.adobedtm.com/4292fae30116/d60ed27415b5/launch-93c4e2f28128.min.js';

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

/** Settles once OneTrust has started (or was skipped); resolves to whether it runs. */
let consentStarted;

/**
 * Starts consent management (OneTrust) for the page.
 * @param {{enabled: boolean}} options `enabled: false` skips OneTrust (and so Launch)
 * @returns {Promise<boolean>} whether OneTrust runs on the page
 */
async function startConsent({ enabled }) {
  if (!enabled) {
    publish({ managed: false, consented: true, groups: [] });
    return false;
  }
  // Blue Shield OneTrust wrapper: defines window.OptanonWrapper before the SDK loads
  await import('./onetrust.js');
  // the Blue Shield wrapper first, then the consent state for this site's blocks
  const brandWrapper = window.OptanonWrapper;
  window.OptanonWrapper = () => {
    if (typeof brandWrapper === 'function') brandWrapper();
    onOneTrustUpdate();
  };
  loadCSS(BANNER_CSS_URL);
  loadCSS(`${window.hlx.codeBasePath}/styles/onetrust.css`);
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
  return true;
}

/**
 * Starts consent management (OneTrust) once per page.
 * @param {{enabled: boolean}} options
 * @returns {Promise<boolean>} whether OneTrust runs on the page
 */
export default function initConsent(options) {
  consentStarted = consentStarted || startConsent(options);
  return consentStarted;
}

/** Loads Adobe Launch (CJA) after OneTrust, on pages where OneTrust runs. */
export async function loadAnalytics() {
  if (!consentStarted || !(await consentStarted)) return;
  try {
    await loadScript(LAUNCH_URL, { async: '' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Adobe Launch failed to load', error);
  }
}
