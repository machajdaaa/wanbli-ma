import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';
import { ToggleComponent } from '../toggle/toggle.component';

export type SettingsRowKind = 'nav' | 'toggle' | 'static' | 'destructive';

let nextId = 0;

/**
 * One 56 px settings row: navigation (link or button, chevron, optional value),
 * toggle, static value (app version) or destructive action (log out).
 * `disabled` greys the row out; with `soon` it shows a "Brzy" chip instead
 * of the chevron/toggle — for features the backend doesn't support yet.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-row',
  imports: [NgTemplateOutlet, RouterLink, TranslocoPipe, IconComponent, ToggleComponent],
  host: { role: 'listitem', class: 'block' },
  template: `
    <ng-template #body>
      @if (icon(); as icon) {
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
          [class]="kind() === 'destructive' ? 'bg-danger-surface' : 'bg-surface'"
        >
          <app-icon [name]="icon" [size]="18" />
        </span>
      }
      @if (kind() === 'toggle') {
        <label [id]="labelId" [for]="toggleId" class="flex-1 text-left" [class]="labelClasses()">{{ label() }}</label>
      } @else {
        <span class="flex-1 text-left" [class]="labelClasses()">{{ label() }}</span>
      }
      @if (value()) {
        <span class="type-body text-text-muted">{{ value() }}</span>
      }
      @if (soon()) {
        <span class="rounded-8 bg-surface px-2 py-0.5 type-caption text-text-muted">{{ 'common.soon' | transloco }}</span>
      } @else if (kind() === 'toggle') {
        <app-toggle [(checked)]="checked" [inputId]="toggleId" [labelledBy]="labelId" [disabled]="disabled()" />
      } @else if (kind() === 'nav') {
        <app-icon name="chevron-right" [size]="20" class="text-icon-inactive" />
      }
    </ng-template>

    @if (interactive()) {
      @if (link(); as link) {
        <a [routerLink]="link" [class]="rowClasses()">
          <ng-container [ngTemplateOutlet]="body" />
        </a>
      } @else {
        <button type="button" [class]="rowClasses() + ' w-full'" (click)="pressed.emit()">
          <ng-container [ngTemplateOutlet]="body" />
        </button>
      }
    } @else {
      <div [class]="rowClasses()" [attr.aria-disabled]="disabled() || null">
        <ng-container [ngTemplateOutlet]="body" />
      </div>
    }
  `,
})
export class SettingsRowComponent {
  readonly label = input.required<string>();
  readonly kind = input<SettingsRowKind>('nav');
  readonly icon = input<IconName | null>(null);
  readonly value = input<string | null>(null);
  readonly link = input<string | unknown[] | null>(null);
  readonly disabled = input(false);
  readonly soon = input(false);
  readonly checked = model(false);

  /** Click on a nav (without `link`) or destructive row. */
  readonly pressed = output<void>();

  protected readonly toggleId = `settings-toggle-${nextId}`;
  protected readonly labelId = `settings-label-${nextId++}`;

  protected readonly interactive = computed(
    () => !this.disabled() && !this.soon() && (this.kind() === 'nav' || this.kind() === 'destructive'),
  );

  protected readonly rowClasses = computed(() => {
    const color =
      this.disabled() || this.soon() ? 'text-text-disabled' : this.kind() === 'destructive' ? 'text-danger' : 'text-text';
    const padding = this.icon() ? 'pl-[14px] pr-3' : 'pl-[14px] pr-[14px]';
    return `flex min-h-14 items-center gap-3 ${padding} no-underline ${color} active:bg-surface`;
  });

  protected readonly labelClasses = computed(() =>
    this.kind() === 'destructive'
      ? 'font-text text-[1rem] font-semibold leading-[22px]'
      : 'font-text text-[1rem] font-medium leading-[22px]',
  );
}
