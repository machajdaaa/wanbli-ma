import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { formatPlural } from '../../core/i18n/format';
import { localeForLang } from '../../core/i18n/i18n.config';

/** `count | plural:'feathers'` → "1 pero", "2 pera", "5 per" (keys under `plural.<noun>`). */
@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(count: number | null | undefined, noun: string): string {
    if (count == null) return '';
    const locale = localeForLang(this.transloco.getActiveLang());
    return formatPlural(count, noun, locale, (key, params) => this.transloco.translate(key, params));
  }
}
