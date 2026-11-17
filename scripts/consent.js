import { loadCSS, loadScript } from './aem.js';
import getConfigValue from './configs.js';

/**
 * Consent (OneTrust) and analytics (Adobe Launch for CJA), kept off the critical path as the
 * aem.live performance guidance asks for third-party tools (FAQ, "Keeping it 100"):
 * - initConsent: OneTrust (OtAutoBlock.js, then the SDK stub, which pulls in the banner),
 *   started by scripts.js after the page has loaded (end of loadLazy), not before LCP;
 * - loadAnalytics: Adobe Launch, started by scripts.js in the delayed phase (3s after load),
 *   after OneTrust and only where OneTrust runs (Blue Shield and Ascendiun; not Stellarus).
 *   Page metadata `analytics` (off | on | staging) turns it off or picks the Launch library.
 * Loading Launch late loses no consent: its OneTrust rule opts in when the
 * `analyticsConsentReady` cookie (scripts/onetrust.js) exists and otherwise waits for the
 * `analyticsConsentReady` event.
 *
 * The OneTrust domain script is the production one on *.aem.live and *.blueshieldca.com, and
 * the `-test` one elsewhere (aem.page previews, localhost), as in the client snippet.
 * Each site's `/configs` sheet (scripts/configs.js) may set its own OneTrust ID (`onetrust-id`,
 * `onetrust-id-test`) and Launch libraries (`launch-url`, `launch-url-staging`); only values in
 * the expected format are used (an author cannot point the page at another script host).
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
const SDK_STUB_URL = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
/** Banner styles maintained by Blue Shield (the custom "trusted partners" banner). */
const BANNER_CSS_URL = 'https://www.blueshieldca.com/vendor/onetrust/onetrust.css';
/** Adobe Launch (CJA) production library, and its Staging environment library. */
const LAUNCH_URL = 'https://assets.adobedtm.com/4292fae30116/d60ed27415b5/launch-93c4e2f28128.min.js';

/** `/configs` values must look like these: a OneTrust domain-script ID, a Launch library. */
const ONETRUST_ID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}(-test)?$/i;
const isOneTrustId = (value) => ONETRUST_ID.test(value);
const isLaunchUrl = (value) => /^https:\/\/assets\.adobedtm\.com\/[\w/-]+\.min\.js$/.test(value);

/** The OneTrust domain script for this site and host (production or `-test`). */
async function getDomainScript() {
  const id = await getConfigValue('onetrust-id', BASE_DOMAIN_SCRIPT, isOneTrustId);
  if (IS_PROD) return id;
  return getConfigValue('onetrust-id-test', id.endsWith('-test') ? id : `${id}-test`, isOneTrustId);
}

/** The Launch library for this site: production, or the Staging environment library. */
async function getLaunchUrl(mode) {
  const prod = await getConfigValue('launch-url', LAUNCH_URL, isLaunchUrl);
  if (mode !== 'staging') return prod;
  return getConfigValue('launch-url-staging', prod.replace(/\.min\.js$/, '-staging.min.js'), isLaunchUrl);
}

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
    const domainScript = await getDomainScript();
    await loadScript(`https://cdn.cookielaw.org/consent/${domainScript}/OtAutoBlock.js`, { type: 'text/javascript' });
    await loadScript(SDK_STUB_URL, {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': domainScript,
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

/**
 * Loads Adobe Launch (CJA) after OneTrust, on pages where OneTrust runs.
 * @param {{mode?: string}} [options] page metadata `analytics`: `off` loads nothing, `staging`
 *   the Launch Staging library, anything else (`on`, empty) the production library
 */
export async function loadAnalytics({ mode = '' } = {}) {
  if (mode === 'off') return;
  if (!consentStarted || !(await consentStarted)) return;
  try {
    await loadScript(await getLaunchUrl(mode), { async: '' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Adobe Launch failed to load', error);
  }
}
