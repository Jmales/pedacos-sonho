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

  function loadGtag() {
    if (window.__pdsGtagLoaded) return;
    window.__pdsGtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });

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
    var t = copy[lang()];
    var banner = document.createElement('div');
    banner.id = 'pds-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.className =
      'fixed bottom-0 inset-x-0 z-[200] p-4 md:p-6 pointer-events-none';
    banner.innerHTML =
      '<div class="pointer-events-auto max-w-3xl mx-auto bg-dark text-gray-200 rounded-2xl shadow-2xl border border-white/10 p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">' +
      '<p class="text-xs md:text-sm leading-relaxed flex-grow m-0">' +
      t.text +
      ' <a href="privacidade.html" class="underline text-secondary hover:text-white transition">' +
      t.privacy +
      '</a>.</p>' +
      '<div class="flex gap-2 shrink-0 w-full sm:w-auto">' +
      '<button type="button" id="pds-cookie-reject" class="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold border border-gray-500 hover:border-white transition">' +
      t.reject +
      '</button>' +
      '<button type="button" id="pds-cookie-accept" class="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold bg-secondary text-white hover:opacity-90 transition">' +
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
