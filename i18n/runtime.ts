import { pt, type MessageKey, type Messages } from './pt';
import { en } from './en';

export type Lang = 'pt' | 'en';

const dictionaries: Record<Lang, Messages> = { pt, en };

const STORAGE_KEY = 'pds_lang';

function t(dict: Messages, key: string | null): string | null {
  if (!key) return null;
  if (key in dict) return dict[key as MessageKey];
  console.warn(`[i18n] Missing key: ${key}`);
  return null;
}

let currentLang: Lang = 'pt';

export function getLang(): Lang {
  return currentLang;
}

export function translate(key: string): string {
  const dict = dictionaries[currentLang] ?? dictionaries.pt;
  return t(dict, key) ?? key;
}

export function setLanguage(lang: Lang): void {
  currentLang = lang;
  const dict = dictionaries[lang] ?? dictionaries.pt;
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-PT';

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const value = t(dict, el.getAttribute('data-i18n'));
    if (value == null) return;

    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, value);
      return;
    }
    el.innerHTML = value;
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-alt]').forEach((el) => {
    const value = t(dict, el.getAttribute('data-i18n-alt'));
    if (value != null) el.setAttribute('alt', value);
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = (btn as HTMLElement).dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.classList.toggle('text-gray-500', !active);
  });

  localStorage.setItem(STORAGE_KEY, lang);
  document.dispatchEvent(new CustomEvent('pds:langchange', { detail: { lang } }));
}

export function initI18n(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  const lang: Lang = saved === 'en' ? 'en' : 'pt';

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = (btn as HTMLElement).dataset.lang === 'en' ? 'en' : 'pt';
      setLanguage(next);
    });
  });

  setLanguage(lang);

  window.pdsI18n = { t: translate, getLang, setLanguage };
}

declare global {
  interface Window {
    pdsI18n: {
      t: (key: string) => string;
      getLang: () => Lang;
      setLanguage: (lang: Lang) => void;
    };
  }
}
