import { I18nContext } from 'nestjs-i18n';
import { MessagesEnum } from './messages.enum';

/**
 * Helper to get translated message for a given MessagesEnum key.
 * It uses the current request i18n context (I18nContext.current()).
 * If no i18n context is available, returns the key string.
 */
export function getMessage(
  key: MessagesEnum,
  args?: Record<string, any>,
): string {
  try {
    const i18n = I18nContext.current();
    if (i18n) {
      // nestjs-i18n's t() can return string | object depending on usage; cast to string
      const translated = i18n.t(key as unknown as string, args) as unknown;
      if (typeof translated === 'string') return translated;
      // If translation returned an object, stringify as fallback
      return JSON.stringify(translated);
    }
  } catch {
    // ignore and fallback to key
  }

  return key as string;
}
