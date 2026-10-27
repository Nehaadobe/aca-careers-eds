/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for careers.blueshieldca.com.
 *
 * beforeTransform: walks template sections in reverse and inserts an <hr> before
 *   every non-first section (while parser targets still exist). Styled sections get
 *   a temporary data-excat-section-id marker on their <hr>; a styled first section
 *   gets a temporary marked <hr> that is removed again in afterTransform.
 * afterTransform: walks sections in reverse and inserts a Section Metadata block
 *   (style) at the end of each styled section, then removes the markers.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) { /* invalid selector - try next */ }
  }
  return null;
}

function findMarker(root, id) {
  return root.querySelector(`hr[${MARKER}="${id}"]`);
}

/*
 * Auto-sectioning for templates whose pages share one structure but differ in section
 * order (landing, content-page): the page header is the first section and every
 * non-empty direct child of div.page-body is a section. Styles come from the source:
 * a centered contentSection title -> "centered", the blue band -> "blue".
 * The template's sections[] still documents the representative page.
 */
const AUTO_TEMPLATES = ['landing', 'content-page'];
const AUTO_STYLE_RULES = [
  { style: 'light-blue', match: '.simplebox' },
  // only a centered contentSection that actually has a title is centered (the class alone is not enough)
  { style: 'centered', match: '.contentSection__centerTitle .contentSection-title, .simplebox.align-center, .page-narrowContent' },
  { style: 'blue', match: '.contentSection_blue, .ipr_textBanner' },
];

function hasContent(el) {
  return el.textContent.trim().length > 0 || !!el.querySelector('img, picture, iframe, video, a[href]');
}

// true when el is itself a block instance of the template (a parser will replace it whole)
function isBlockInstance(el, template) {
  const sels = ((template && template.blocks) || []).flatMap((b) => b.instances || []);
  return sels.some((sel) => { try { return el.matches(sel); } catch (e) { return false; } });
}

function autoSections(root, template) {
  const page = root.querySelector('#site_content > div.page') || root.querySelector('div.page');
  if (!page) return [];
  const list = [];
  const header = page.querySelector(':scope > div.page-header');
  if (header) list.push({ el: header, style: null });
  const body = page.querySelector(':scope > div.page-body');
  if (body) {
    // a div.container that wraps several content bands (e.g. white_text + contentSection)
    // is split into one section per band
    const bands = [];
    [...body.children].filter(hasContent).forEach((el) => {
      const kids = [...el.children].filter(hasContent);
      if (el.matches('div.container') && kids.length > 1 && !isBlockInstance(el, template)) bands.push(...kids);
      else bands.push(el);
    });
    bands.forEach((el) => {
      const styles = AUTO_STYLE_RULES
        .filter((r) => el.matches(r.match) || el.querySelector(r.match))
        .map((r) => r.style);
      list.push({ el, style: styles.length ? styles.join(', ') : null });
    });
  }
  return list;
}

function transformAuto(hookName, element, doc, template) {
  if (hookName === 'beforeTransform') {
    const list = autoSections(element, template);
    list.forEach(({ el, style }, i) => {
      if (i === 0 && !style) return;
      const hr = doc.createElement('hr');
      if (style) {
        hr.setAttribute(MARKER, `auto-${i}`);
        hr.setAttribute('data-excat-style', style);
      }
      if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
      el.before(hr);
    });
  }
  if (hookName === 'afterTransform') {
    element.querySelectorAll(`hr[${MARKER}^="auto-"]`).forEach((marker) => {
      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: marker.getAttribute('data-excat-style') },
      });
      let cursor = marker.nextElementSibling;
      let last = marker;
      while (cursor && cursor.tagName !== 'HR') {
        last = cursor;
        cursor = cursor.nextElementSibling;
      }
      last.after(meta);
      marker.removeAttribute(MARKER);
      marker.removeAttribute('data-excat-style');
    });
    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
  }
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || payload.document;
  const templateName = payload && payload.template && payload.template.name;
  if (AUTO_TEMPLATES.includes(templateName)) {
    transformAuto(hookName, element, doc, payload.template);
    return;
  }
  const sections = payload && payload.template && payload.template.sections;
  if (!Array.isArray(sections) || sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      const styled = !!section.style;
      if (i === 0 && !styled) continue;
      const hr = doc.createElement('hr');
      if (styled) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      const el = findSectionElement(element, section);
      const marker = findMarker(element, section.id);

      if (el) {
        el.after(meta);
      } else if (marker) {
        // Section element was replaced by a parser: place metadata at the end of the
        // section, i.e. before the next section break (or at the end of the parent).
        let cursor = marker.nextElementSibling;
        let last = marker;
        while (cursor && cursor.tagName !== 'HR') {
          last = cursor;
          cursor = cursor.nextElementSibling;
        }
        last.after(meta);
      }

      if (marker) marker.removeAttribute(MARKER);
    }

    // Remove the temporary first-section break so it does not open an empty section.
    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
