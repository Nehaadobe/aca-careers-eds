/* global OneTrust, dtrum */
/**
 * Blue Shield OneTrust wrapper (client file; www.blueshieldca.com/vendor/onetrust/onetrust.js).
 * Imported by scripts/consent.js before the OneTrust SDK loads, so the SDK finds
 * window.OptanonWrapper. Behavior kept from the client file:
 * - the custom "We use trusted partners" banner (en, es, zh, vi) with a Continue button,
 *   shown once per session after the OneTrust banner was closed,
 * - the CJA consent signal: the `analyticsConsentReady` event and session cookie, sent on
 *   Continue and on every OneTrust consent change; Dynatrace (dtrum) is enabled then too,
 * - window.openPreferenceCenter() for links that open the OneTrust preference center.
 * Change from the client file: the cookie domain is .blueshieldca.com / .bscal.com on those
 * sites and host-only everywhere else (aem.page, aem.live, localhost), where the browser
 * would reject a cookie for another domain.
 * The banner styles come from www.blueshieldca.com/vendor/onetrust/onetrust.css (consent.js).
 */

/* CJA Script (kept exactly as-is) */
const analyticsCustEvent = new CustomEvent('analyticsConsentReady', {
  detail: {
    timestamp: new Date().toISOString(),
  },
});

// Utility to read a specific cookie value
function checkOTCookie(cookieName) {
  const value = document.cookie.split('; ').find((row) => row.startsWith(`${cookieName}=`));
  return value ? value.split('=')[1] : null;
}

/**
 * Session cookie on the shared parent domain when the site runs on it, else host-only.
 * @param {string} nameValue e.g. `bannerCustShown=true`
 */
function setSessionCookie(nameValue) {
  const host = window.location.hostname;
  let domain = '';
  if (/(^|\.)blueshieldca\.com$/i.test(host)) domain = '; domain=.blueshieldca.com';
  else if (/(^|\.)bscal\.com$/i.test(host)) domain = '; domain=.bscal.com';
  document.cookie = `${nameValue}; path=/${domain}; SameSite=Lax`;
}

// Trap Tab key navigation within the banner
function trapCustomBannerFocus(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const btn = document.getElementById('continueBtn');
    if (btn) btn.focus();
  }
}

// Hide the custom banner and set a session cookie to prevent re-showing
function hideOTCustomBanner() {
  const overlay = document.getElementById('onetrust-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  document.removeEventListener('keydown', trapCustomBannerFocus); // Remove focus trap

  // Set session cookie to mark banner as shown
  setSessionCookie('bannerCustShown=true');
}

function openPreferenceCenter() {
  if (typeof OneTrust !== 'undefined' && typeof OneTrust.ToggleInfoDisplay === 'function') {
    OneTrust.ToggleInfoDisplay();
  } else {
    // eslint-disable-next-line no-console
    console.warn('OneTrust is not loaded yet.');
  }
}

/* ---------- translations block (unchanged text) ---------- */
const translations = {
  en: {
    title: 'We use trusted partners to improve your experience',
    text1:
      'We use third-party service providers to help us operate and manage this website. By clicking Continue, you agree to the collection by and disclosure to third parties of your navigation and use activity on this website.',
    text2:
      "We also use cookies and other tracking technologies to enhance your experience through analyzing our website performance and traffic. By continuing to use our website or mobile application, you understand our use of cookies as described on the <strong class='custom-privacy-label'>Privacy & security</strong> page found at the bottom of this webpage. You can change your cookie settings by selecting <strong class='custom-privacy-label'>Cookie preferences.</strong>",
    button1: 'Continue',
  },
  es: {
    title: 'Recurrimos a socios de confianza para mejorar su experiencia',
    text1:
      'Recurrimos a proveedores de servicios externos para ayudarnos a operar y administrar esta página web. Al hacer clic en Continuar, usted está de acuerdo con la recopilación y divulgación a terceros de su actividad de navegación y uso de esta página web.',
    text2:
      "También usamos cookies y otras tecnologías de seguimiento para mejorar su experiencia al analizar el rendimiento y el tráfico de nuestra página web. Al continuar usando nuestra página web o aplicación móvil, usted está de acuerdo con nuestro uso de cookies tal como se describe en la página <strong class='custom-privacy-label'>Privacidad y seguridad</strong> que se encuentra en la parte inferior de esta página web. Puede cambiar la configuración de cookies en <strong class='custom-privacy-label'>Preferencias de cookies.</strong>",
    button1: 'continuar',
  },
  zh: {
    title: '我们使用值得信赖的合作伙伴来改善您的体验',
    text1:
      '我们使用第三方服务提供商来帮助我们运营和管理本网站。点击“继续”，即表示您同意第三方收集并向第三方披露您在本网站上的浏览和使用活动。',
    text2:
      "我们还使用 Cookie 和其他跟踪技术，通过分析我们网站的性能和流量来提升您的体验。继续使用我们的网站或移动应用，即表示您理解我们在本网页底部的 <strong class='custom-privacy-label'>隐私与安全</strong> 页面所述的 Cookie 使用方式。您可以通过选择 <strong class='custom-privacy-label'>Cookie 偏好</strong> 来更改 Cookie 设置。",
    button1: '继续',
  },
  vi: {
    title: 'Chúng tôi sử dụng các đối tác đáng tin cậy để cải thiện trải nghiệm của bạn',
    text1:
      'Chúng tôi sử dụng các nhà cung cấp dịch vụ bên thứ ba để giúp vận hành và quản lý trang web này. Bằng cách nhấp Tiếp tục, bạn đồng ý cho phép thu thập và tiết lộ cho bên thứ ba hoạt động điều hướng và sử dụng của bạn trên trang web này.',
    text2:
      "Chúng tôi cũng sử dụng cookie và các công nghệ theo dõi khác để nâng cao trải nghiệm của bạn thông qua việc phân tích hiệu suất và lưu lượng truy cập trang web. Khi tiếp tục sử dụng trang web hoặc ứng dụng di động của chúng tôi, bạn hiểu việc chúng tôi sử dụng cookie như mô tả trên trang <strong class='custom-privacy-label'>Quyền riêng tư & bảo mật</strong> ở cuối trang này. Bạn có thể thay đổi cài đặt cookie bằng cách chọn <strong class='custom-privacy-label'>Tùy chọn cookie.</strong>",
    button1: 'Tiếp tục',
  },
};

/* ---------- analytics consent (unchanged behavior) ---------- */
function setAnalyticsConsentCookie() {
  window.dispatchEvent(analyticsCustEvent);

  if (!checkOTCookie('analyticsConsentReady')) {
    setSessionCookie('analyticsConsentReady=true'); // session cookie
  }

  if (typeof dtrum !== 'undefined' && typeof dtrum.enable === 'function') {
    dtrum.enable();
    // eslint-disable-next-line no-console
    console.log(`analyticsConsentReady ::${dtrum.enable}`);
  } else {
    // eslint-disable-next-line no-console
    console.log('Dynatrace not available');
  }
}

/* ---------- banner creation (unchanged behavior) ---------- */
function showOTCustomBanner() {
  const languageSelected = document.documentElement.lang || 'en';
  const languageTrans = translations[languageSelected] || translations.en;

  const onetrustOverlay = document.createElement('div');
  onetrustOverlay.id = 'onetrust-overlay';

  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'onetrust-banner';
  banner.setAttribute('tabindex', '0');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'true');
  banner.setAttribute('aria-describedby', 'banner-heading banner-text1 banner-text2');

  // Heading
  const heading = document.createElement('h2');
  heading.id = 'banner-heading';
  heading.textContent = languageTrans.title;
  banner.appendChild(heading);

  // Paragraph 1
  const p1 = document.createElement('p');
  p1.id = 'banner-text1';
  p1.innerHTML = languageTrans.text1 || '';
  banner.appendChild(p1);

  // Paragraph 2
  const p2 = document.createElement('p');
  p2.id = 'banner-text2';
  p2.innerHTML = languageTrans.text2 || '';
  banner.appendChild(p2);

  // Buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'ot-banner-buttons';

  // Continue Button
  const continueBtn = document.createElement('button');
  continueBtn.className = 'onetrust-btn onetrust-continue-btn';
  continueBtn.id = 'continueBtn';
  continueBtn.textContent = languageTrans.button1;
  continueBtn.onclick = function onContinueClick() {
    hideOTCustomBanner();
    setAnalyticsConsentCookie();
  };
  buttonContainer.appendChild(continueBtn);

  // Append everything
  banner.appendChild(buttonContainer);
  onetrustOverlay.appendChild(banner);
  document.body.appendChild(onetrustOverlay);

  // Show banner
  onetrustOverlay.style.display = 'block';

  // Set focus and enable focus trap
  banner.focus();
  document.addEventListener('keydown', trapCustomBannerFocus);
}

/* ---------- OneTrust entry point (kept) ---------- */
// Entry point triggered by OneTrust when consent logic is ready
function OptanonWrapper() {
  // If banner has already been shown in this session or consent was previously closed, hide it
  if (checkOTCookie('bannerCustShown') || !checkOTCookie('OptanonAlertBoxClosed')) {
    hideOTCustomBanner();
  } else {
    // Otherwise, show the custom banner
    showOTCustomBanner();
  }

  if (window.OneTrust && typeof OneTrust !== 'undefined' && OneTrust.OnConsentChanged) {
    OneTrust.OnConsentChanged(() => {
      setAnalyticsConsentCookie();
    });
  }
}

// Hide banner when consent is applied (e.g., user clicks Continue or saves preferences)
window.addEventListener('OTConsentApplied', () => {
  hideOTCustomBanner();
});

// Expose for external use
window.OptanonWrapper = OptanonWrapper;
window.openPreferenceCenter = openPreferenceCenter;
