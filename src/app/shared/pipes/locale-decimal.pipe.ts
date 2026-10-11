import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { formatNumber } from '../../core/i18n/format';
import { localeForLang } from '../../core/i18n/i18n.config';

/** `11.25 | decimal` → "11,25"; `1234 | decimal` → "1 234". Follows the active UI language. */
@Pipe({ name: 'decimal' })
export class LocaleDecimalPipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(value: number | null | undefined, maxFractionDigits = 2): string {
    if (value == null) return '';
    return formatNumber(value, localeForLang(this.transloco.getActiveLang()), maxFractionDigits);
  }
}
