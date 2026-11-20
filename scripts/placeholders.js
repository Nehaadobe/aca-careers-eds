/**
 * Interface text from the site's placeholders sheet in Document Authoring
 * (`/placeholders/global`, columns `Key` and `Value`), with the text in the code as the default.
 *
 * Keys are `Area.Name` (e.g. `Share.Label`) and case-insensitive; a missing sheet, key or empty
 * value uses the default. `{name}` in a value is replaced from `values` (e.g. `Page {page}`).
 *
 *   const ph = await loadPlaceholders();
 *   label.textContent = placeholder(ph, 'Share.Label', 'Share');
 *   // or, without waiting (text is set now and updated when the sheet arrives):
 *   applyPlaceholder('Video.Play', 'Play video', {}, (text) => { button.ariaLabel = text; });
 */

export const PLACEHOLDERS_PATH = '/placeholders/global.json';

let placeholdersPromise;
let placeholdersMap;

const normalize = (key) => String(key ?? '').trim().toLowerCase();

/** Rows of a DA sheet JSON (single or multi-sheet). */
function sheetRows(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
}

/**
 * Loads the placeholders sheet once per page.
 * @returns {Promise<Map<string, string>>} lower-case key -> text (empty map when unavailable)
 */
export function loadPlaceholders() {
  if (!placeholdersPromise) {
    placeholdersPromise = fetch(PLACEHOLDERS_PATH)
      .then((resp) => (resp.ok ? resp.json() : {}))
      .then((json) => new Map(sheetRows(json)
        .map((row) => [normalize(row.Key ?? row.key), String(row.Value ?? row.value ?? row.Text ?? row.text ?? '').trim()])
        .filter(([key, value]) => key && value)))
      .catch(() => new Map())
      .then((map) => {
        placeholdersMap = map;
        return map;
      });
  }
  return placeholdersPromise;
}

/** Replaces `{name}` with values[name]; unknown names stay as they are. */
export function formatText(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));
}

/**
 * The text for a key: the sheet value when there is one, otherwise the default.
 * @param {Map<string, string>|undefined} map from loadPlaceholders (undefined = not loaded yet)
 * @param {string} key `Area.Name`
 * @param {string} fallback default text (the text in the code)
 * @param {object} [values] `{name}` replacements
 * @returns {string}
 */
export function placeholder(map, key, fallback, values) {
  const text = (map || placeholdersMap)?.get(normalize(key)) ?? fallback;
  return formatText(text, values);
}

/**
 * Sets text without waiting for the sheet: `apply` runs now with the loaded value (or the default),
 * and again when the sheet arrives if it changes the text.
 * @param {string} key
 * @param {string} fallback
 * @param {object} values
 * @param {(text: string) => void} apply
 */
export function applyPlaceholder(key, fallback, values, apply) {
  const now = placeholder(undefined, key, fallback, values);
  apply(now);
  if (!placeholdersMap) {
    loadPlaceholders().then((map) => {
      const text = placeholder(map, key, fallback, values);
      if (text !== now) apply(text);
    });
  }
}
