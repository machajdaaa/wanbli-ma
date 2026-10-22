import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

/**
 * Settings section (Main.dc.html → Řádek nastavení, Nastaveni): overline
 * title above a white rounded card; rows are projected and separated by a
 * subtle 1 px line.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-group',
  host: { class: 'flex flex-col gap-2' },
  template: `
    @if (title()) {
      <h2 [id]="titleId" class="px-1 type-overline text-text-muted">{{ title() }}</h2>
    }
    <div
      role="list"
      [attr.aria-labelledby]="title() ? titleId : null"
      class="flex flex-col overflow-hidden rounded-16 border border-border bg-surface-raised
             [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-border-subtle"
    >
      <ng-content />
    </div>
  `,
})
export class SettingsGroupComponent {
  readonly title = input<string | null>(null);
  protected readonly titleId = `settings-group-${nextId++}`;
}
