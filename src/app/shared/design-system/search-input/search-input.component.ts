import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/**
 * Search field (Main.dc.html → Hledání, Hledani, VyhledaniPera): magnifier,
 * clear "×" once there's a value. The label is visually hidden — the
 * placeholder is the visible hint, the label is for screen readers.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-search-input',
  imports: [TranslocoPipe, IconComponent],
  host: { class: 'block' },
  template: `
    <div
      class="flex h-12 items-center gap-2.5 rounded-12 border border-border bg-surface-raised pl-[14px] text-text-muted
             focus-within:border-primary focus-within:shadow-[var(--wanbli-shadow-focus),inset_0_0_0_1px_var(--wanbli-color-primary)]"
    >
      <app-icon name="search" [size]="20" />
      <label [for]="inputId" class="sr-only">{{ label() }}</label>
      <input
        #field
        [id]="inputId"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        class="h-full min-w-0 flex-1 border-0 bg-transparent text-text type-body-l outline-none placeholder:text-text-muted
               [&::-webkit-search-cancel-button]:hidden"
        [value]="value()"
        [attr.placeholder]="placeholder()"
        (input)="value.set($any($event.target).value)"
      />
      @if (value()) {
        <button
          type="button"
          class="flex size-11 shrink-0 items-center justify-center rounded-12 text-text-muted"
          [attr.aria-label]="'ds.search.clear' | transloco"
          (click)="clear()"
        >
          <app-icon name="close" [size]="20" />
        </button>
      } @else {
        <span class="w-1.5"></span>
      }
    </div>
  `,
})
export class SearchInputComponent {
  readonly inputId = `search-input-${nextId++}`;

  readonly label = input.required<string>();
  readonly placeholder = input<string | null>(null);
  readonly value = model('');

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(): void {
    this.field().nativeElement.focus();
  }

  protected clear(): void {
    this.value.set('');
    this.focus();
  }
}
