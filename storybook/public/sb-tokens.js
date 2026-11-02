/**
 * Design token view for the Foundations stories. Reads the token list and its groups (the
 * comments in styles/brand.css), then shows each token's value as resolved on this page,
 * so the "Brand" toolbar shows the Blue Shield defaults or a theme's overrides.
 */
const VIEWS = {
  colors: ['page', 'text', 'link', 'primary', 'band', 'accent', 'border', 'media', 'third-party', 'header', 'button', 'ring'],
  type: ['font', 'body size', 'heading'],
  space: ['spacing', 'shape', 'shadow', 'motion', 'width'],
};

/**
 * @param {string} css brand.css source
 * @returns {{group: string, names: string[]}[]} token groups in file order
 */
function parseTokens(css) {
  const groups = [];
  let current = null;
  let depth = 0;
  css.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.endsWith('{')) depth += 1;
    const comment = trimmed.match(/^\/\*\s*([^*]+?)(?::.*)?\s*\*\/$/) || trimmed.match(/^\/\*\s*([^*]+)$/);
    if (comment && depth > 0) {
      current = { group: comment[1].replace(/[:(].*$/, '').trim(), names: [] };
      groups.push(current);
    }
    const token = trimmed.match(/^(--[a-z0-9-]+)\s*:/);
    if (token && depth > 0) {
      if (!current) {
        current = { group: 'general', names: [] };
        groups.push(current);
      }
      if (!groups.some((g) => g.names.includes(token[1]))) current.names.push(token[1]);
    }
    if (trimmed.startsWith('}')) depth = Math.max(0, depth - 1);
  });
  return groups.filter((g) => g.names.length);
}

function preview(name) {
  const box = document.createElement('div');
  const v = `var(${name})`;
  if (/font-size|line-height/.test(name)) {
    box.textContent = 'Aa';
    box.style.cssText = `font-size:${v};line-height:1.1;font-weight:600;`;
  } else if (/^--font-/.test(name)) {
    box.textContent = 'Find your next role';
    box.style.cssText = `font-family:${v};font-size:20px;`;
  } else if (/shadow/.test(name)) {
    box.style.cssText = `width:72px;height:40px;border-radius:8px;background:#fff;box-shadow:${v};`;
  } else if (/radius/.test(name)) {
    box.style.cssText = `width:72px;height:40px;border-radius:${v};background:var(--color-primary);`;
  } else if (/spacing|padding|width|height|gap/.test(name)) {
    box.style.cssText = `width:min(${v}, 100%);max-width:240px;height:12px;background:var(--color-primary);`;
  } else if (/tracking|transform|transition|scheme|icon/.test(name)) {
    box.textContent = '—';
  } else {
    box.style.cssText = `width:72px;height:40px;border-radius:6px;border:1px solid #8888;background:${v};`;
  }
  return box;
}

export default async function renderTokens(main, view) {
  const css = await (await fetch('/styles/brand.css')).text();
  const keywords = VIEWS[view] || VIEWS.colors;
  const groups = parseTokens(css)
    .filter((g) => keywords.some((k) => g.group.toLowerCase().includes(k)));

  const section = document.createElement('div');
  // not a <div>: the site would treat a classed div in a section as a block
  const wrapper = document.createElement('article');
  wrapper.className = 'sb-tokens';
  wrapper.style.cssText = 'padding:24px 0;';
  const valueCells = [];
  groups.forEach(({ group, names }) => {
    const h = document.createElement('h3');
    h.textContent = group.charAt(0).toUpperCase() + group.slice(1);
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;margin:0 0 32px;font-size:14px;';
    names.forEach((name) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #8884';
      const tdName = document.createElement('td');
      tdName.innerHTML = `<code>${name}</code>`;
      const tdValue = document.createElement('td');
      tdValue.style.cssText = 'font-family:monospace;font-size:12px;word-break:break-all;';
      valueCells.push([tdValue, name]);
      const tdPreview = document.createElement('td');
      tdPreview.append(preview(name));
      [tdName, tdValue, tdPreview].forEach((td) => {
        td.style.padding = '8px 12px 8px 0';
        td.style.verticalAlign = 'middle';
      });
      tdName.style.width = '34%';
      tdValue.style.width = '38%';
      tr.append(tdName, tdValue, tdPreview);
      table.append(tr);
    });
    wrapper.append(h, table);
  });
  section.append(wrapper);
  main.append(section);

  // values are read once the theme has loaded (the site adds `appear` to body then)
  const fill = () => {
    const style = getComputedStyle(document.body);
    valueCells.forEach(([td, name]) => {
      const value = style.getPropertyValue(name).trim() || '(not set)';
      const text = document.createElement('span');
      text.textContent = value;
      text.title = value;
      // long values (gradients) stay readable in three lines; the full value is in the tooltip
      text.style.cssText = 'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;';
      td.replaceChildren(text);
    });
  };
  const waitForTheme = () => (document.body.classList.contains('appear') ? fill() : setTimeout(waitForTheme, 50));
  waitForTheme();
}
