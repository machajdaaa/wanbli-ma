import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { formatRelativeTime } from '../../core/i18n/format';
import { localeForLang } from '../../core/i18n/i18n.config';

/** `post.createdAt | relativeTime` → "dnes 9:00", "včera 17:40", "4. 10. 14:30". */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(value: Date | string | number | null | undefined): string {
    if (value == null) return '';
    const locale = localeForLang(this.transloco.getActiveLang());
    return formatRelativeTime(value, locale, (key, params) => this.transloco.translate(key, params));
  }
}
