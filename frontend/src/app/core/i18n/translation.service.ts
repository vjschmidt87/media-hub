import { Injectable, signal } from '@angular/core';
import { EN } from './en';
import { PT_BR } from './pt-br';

export type Lang = 'en' | 'pt-br';

const STORAGE_KEY = 'media-hub-lang';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: EN,
  'pt-br': PT_BR,
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly lang = signal<Lang>(this.loadLang());

  readonly currentLang = this.lang.asReadonly();

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[this.lang()];
    let value = dict[key] ?? EN[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  }

  private loadLang(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt-br' || stored === 'en') {
      return stored;
    }
    return 'en';
  }
}
