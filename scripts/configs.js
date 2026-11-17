/**
 * Per-site settings from the site's `/configs` sheet (in Document Authoring: a sheet named
 * `configs` at the site root with the columns `key` and `value`). Each site (Blue Shield,
 * Stellarus, Ascendiun, Stage) can set its own values without a code change; a missing sheet
 * or key uses the default.
 *
 * The sheet is published like any page, so it holds public values only (IDs, URLs), never secrets.
 * Keys used today (scripts/consent.js): `onetrust-id`, `onetrust-id-test`, `launch-url`,
 * `launch-url-staging`.
 */

const CONFIG_PATH = '/configs.json';

let configsPromise;

/** Fetches the sheet once per page; any failure (no sheet: 404) gives no values. */
async function fetchConfigs() {
  try {
    const resp = await fetch(CONFIG_PATH);
    if (!resp.ok) return {};
    const json = await resp.json();
    return Object.fromEntries((json.data || [])
      .map((row) => [String(row.key ?? row.Key ?? '').trim().toLowerCase(), String(row.value ?? row.Value ?? '').trim()])
      .filter(([key, value]) => key && value));
  } catch {
    return {};
  }
}

/**
 * A value from the site's `/configs` sheet.
 * @param {string} key e.g. 'launch-url'
 * @param {string} [fallback] used when the sheet or the key is missing (or `validate` rejects it)
 * @param {(value: string) => boolean} [validate] accepts or rejects the authored value
 * @returns {Promise<string>}
 */
export default async function getConfigValue(key, fallback = '', validate = () => true) {
  configsPromise = configsPromise || fetchConfigs();
  const value = (await configsPromise)[key.toLowerCase()];
  if (value && validate(value)) return value;
  if (value) {
    // eslint-disable-next-line no-console
    console.warn(`configs: ignored an invalid value for "${key}"`);
  }
  return fallback;
}
