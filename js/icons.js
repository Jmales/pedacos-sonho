/**
 * Tiny FA-compatible shim: turns <i class="fa-solid fa-leaf"> into an inline SVG.
 * Runs once on DOMContentLoaded so i18n can still inject HTML with fa-* classes.
 */
(function () {
  var paths = {
    leaf: 'M12 2C8 8 4 12 4 16a8 8 0 0 0 16 0c0-4-4-8-8-14zM12 22v-6',
    'cake-candles': 'M12 6v2M8 6v2M16 6v2M5 10h14v10H5V10zm2 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z',
    'champagne-glasses': 'M7 4h4l-1 8H8L7 4zm6 0h4l-1 8h-2l-1-8zM6 20h12M10 12v8M14 12v8',
    briefcase: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v12H4V7z',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20a6 6 0 0 1 12 0M15 20a5 5 0 0 1 6 0',
    check: 'M5 13l4 4L19 7',
    'arrow-right': 'M5 12h14M13 6l6 6-6 6',
    'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.4c.9.3 1.7.5 2.6.7A2 2 0 0 1 22 16.9z',
    envelope: 'M4 6h16v12H4V6zm0 0l8 7 8-7',
    'location-dot': 'M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z',
    whatsapp: 'M12 3a9 9 0 0 0-7.8 13.4L3 21l4.8-1.2A9 9 0 1 0 12 3zm5.1 12.7c-.2.6-1.2 1.1-1.9 1.2-.5.1-1.1.2-3.5-.7-3-1.2-4.9-4.2-5.1-4.4-.2-.2-1.5-2-1.5-3.8 0-1.8 1-2.7 1.3-3 .3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7 1 2.4 1.1 2.6.1.2.1.4 0 .6-.1.3-.2.4-.4.7-.2.2-.4.5-.2.8.2.4.9 1.5 2 2.4 1.4 1.1 2.5 1.5 2.9 1.7.3.1.6.1.8-.1.2-.2.9-1 1.1-1.3.2-.3.5-.3.8-.2.3.1 2 1 2.3 1.1.3.2.5.2.6.4.1.2.1 1.2-.1 1.8z',
    images: 'M4 5h16v14H4V5zm3 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-1 9 4-5 3 3 2-2 4 4H6z',
    'chevron-left': 'M15 6l-6 6 6 6',
    'chevron-right': 'M9 6l6 6-6 6',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v5l3 2',
    sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M6.9 17.1 5.5 18.5m12.2 0 1.4 1.4M6.9 6.9 5.5 5.5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z',
    'shield-halved': 'M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zm0 0v19',
    'rings-wedding': 'M8.5 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm7 0a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM8.5 14v5M15.5 14v5',
    paw: 'M8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 20c-3 0-5-2-5-4.5S10 12 12 12s5 1.5 5 3.5S15 20 12 20z',
    'house-chimney': 'M4 11l8-7 8 7v9H4v-9zm10-5v-3h3v5',
    'masks-theater': 'M7 8c0-2 2-4 5-4s5 2 5 4v5c0 2-2 3-5 3s-5-1-5-3V8zm-1 2H4m16 0h-2M9 11h.01M15 11h.01M9 14c.8.7 1.8 1 3 1s2.2-.3 3-1',
    'paper-plane': 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    spinner: 'M12 3a9 9 0 0 1 9 9',
  };

  function iconName(el) {
    var cls = el.className || '';
    var m = cls.match(/\bfa-([a-z0-9-]+)\b/g) || [];
    for (var i = 0; i < m.length; i++) {
      var name = m[i].slice(3);
      if (name !== 'solid' && name !== 'regular' && name !== 'brands' && name !== 'spin' && paths[name]) {
        return name;
      }
    }
    return null;
  }

  function toSvg(el) {
    var name = iconName(el);
    if (!name) return;
    var d = paths[name];
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', name === 'instagram' || name === 'whatsapp' ? '1.5' : '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', (el.className || '').replace(/\bfa-[a-z0-9-]+\b/g, '').trim() + ' pds-icon');
    if (name === 'instagram' || name === 'whatsapp' || name === 'leaf' || name === 'paw') {
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('stroke', 'none');
    }
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    if (name === 'instagram' || name === 'whatsapp') {
      path.setAttribute('fill', 'currentColor');
    }
    svg.appendChild(path);
    if (el.classList.contains('fa-spin')) svg.classList.add('pds-spin');
    el.replaceWith(svg);
  }

  function hydrate(root) {
    (root || document).querySelectorAll('i[class*="fa-"]').forEach(toSvg);
  }

  window.pdsIcons = { hydrate: hydrate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      hydrate();
    });
  } else {
    hydrate();
  }

  document.addEventListener('pds:langchange', function () {
    // i18n may re-inject fa-* HTML in CTAs
    setTimeout(function () {
      hydrate();
    }, 0);
  });
})();
