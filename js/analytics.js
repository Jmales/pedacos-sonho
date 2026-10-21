(function () {
  var GA_ID = 'G-MXRFSDQ2DP';
  var CONSENT_KEY = 'pds_analytics';
  var LANG_KEY = 'pds_lang';

  var copy = {
    pt: {
      text: 'Utilizamos o Google Analytics para perceber como o site é usado (páginas visitadas). Pode aceitar ou recusar.',
      accept: 'Aceitar',
      reject: 'Recusar',
      privacy: 'Política de Privacidade',
    },
    en: {
      text: 'We use Google Analytics to understand how the site is used (pages visited). You can accept or decline.',
      accept: 'Accept',
      reject: 'Decline',
      privacy: 'Privacy Policy',
    },
  };

  function lang() {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pt';
  }

  function ensureStyles() {
    if (document.getElementById('pds-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'pds-cookie-styles';
    style.textContent =
      '#pds-cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:200;padding:12px;pointer-events:none;box-sizing:border-box;}' +
      '#pds-cookie-banner .pds-cookie-card{pointer-events:auto;max-width:42rem;margin:0 auto;background:#3A3A3A;color:#e5e7eb;border-radius:1rem;box-shadow:0 20px 40px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);padding:14px 16px;display:flex;flex-direction:column;gap:12px;font-family:Poppins,sans-serif;}' +
      '#pds-cookie-banner .pds-cookie-card p{margin:0;font-size:12px;line-height:1.5;flex:1;}' +
      '#pds-cookie-banner .pds-cookie-card a{color:#DDA75F;text-decoration:underline;}' +
      '#pds-cookie-banner .pds-cookie-card a:hover{color:#fff;}' +
      '#pds-cookie-banner .pds-cookie-actions{display:flex;gap:8px;width:100%;}' +
      '#pds-cookie-banner button{flex:1;padding:10px 14px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;line-height:1.2;}' +
      '#pds-cookie-banner #pds-cookie-reject{background:transparent;color:#e5e7eb;border:1px solid #6b7280;}' +
      '#pds-cookie-banner #pds-cookie-reject:hover{border-color:#fff;}' +
      '#pds-cookie-banner #pds-cookie-accept{background:#DDA75F;color:#fff;border:1px solid #DDA75F;}' +
      '#pds-cookie-banner #pds-cookie-accept:hover{opacity:.9;}' +
      '@media (min-width:640px){' +
      '#pds-cookie-banner{padding:20px;}' +
      '#pds-cookie-banner .pds-cookie-card{flex-direction:row;align-items:center;padding:16px 20px;}' +
      '#pds-cookie-banner .pds-cookie-card p{font-size:13px;}' +
      '#pds-cookie-banner .pds-cookie-actions{width:auto;flex-shrink:0;}' +
      '#pds-cookie-banner button{flex:none;min-width:6.5rem;}' +
      '}';
    document.head.appendChild(style);
  }

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  window.pdsTrack = track;

  function bindConversionClicks() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('click_phone');
      });
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('click_email');
      });
    });
    document.querySelectorAll('a[href*="wa.me"], a[data-track="whatsapp"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('click_whatsapp');
      });
    });
    document.querySelectorAll('a[href="reservas.html"], a[href*="/reservas"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('select_content', { content_type: 'reservas_cta', item_id: a.getAttribute('href') });
      });
    });
  }

  function loadGtag() {
    if (window.__pdsGtagLoaded) return;
    window.__pdsGtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function hideBanner() {
    var el = document.getElementById('pds-cookie-banner');
    if (el) el.remove();
  }

  function showBanner() {
    if (document.getElementById('pds-cookie-banner')) return;
    ensureStyles();
    var t = copy[lang()];
    var banner = document.createElement('div');
    banner.id = 'pds-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<div class="pds-cookie-card">' +
      '<p>' +
      t.text +
      ' <a href="privacidade.html">' +
      t.privacy +
      '</a>.</p>' +
      '<div class="pds-cookie-actions">' +
      '<button type="button" id="pds-cookie-reject">' +
      t.reject +
      '</button>' +
      '<button type="button" id="pds-cookie-accept">' +
      t.accept +
      '</button>' +
      '</div></div>';
    document.body.appendChild(banner);

    document.getElementById('pds-cookie-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'granted');
      hideBanner();
      loadGtag();
    });
    document.getElementById('pds-cookie-reject').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'denied');
      hideBanner();
    });
  }

  function init() {
    bindConversionClicks();
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'granted') {
      loadGtag();
      return;
    }
    if (consent === 'denied') return;
    showBanner();
  }

  document.addEventListener('pds:langchange', function () {
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent) return;
    hideBanner();
    showBanner();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
