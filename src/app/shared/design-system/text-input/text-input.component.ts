import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

export type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'date';

const FIELD =
  'w-full rounded-12 bg-surface-raised text-text type-body-l outline-none ' +
  'placeholder:text-text-disabled transition-[border-color,box-shadow] duration-100 ' +
  'disabled:bg-surface-disabled disabled:text-text-disabled';

/**
 * Text field from Main.dc.html → Input: label above the field, focus ring,
 * error with message, hint, character counter, password reveal, multiline.
 * Native <input>/<textarea>, works with reactive forms (ControlValueAccessor).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-text-input',
  imports: [TranslocoPipe, IconComponent],
  host: { class: 'flex flex-col gap-1.5' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-baseline justify-between gap-2">
      <label [for]="inputId" class="type-label text-text">{{ label() }}</label>
      @if (maxLength() && showCounter()) {
        <span class="type-caption text-text-muted" aria-hidden="true">{{ value().length }}/{{ maxLength() }}</span>
      }
    </div>

    <div class="relative">
      @if (multiline()) {
        <textarea
          [id]="inputId"
          [rows]="rows()"
          [class]="fieldClasses() + ' resize-none py-3'"
          [value]="value()"
          [disabled]="disabled()"
          [attr.placeholder]="placeholder()"
          [attr.maxlength]="maxLength()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy()"
          (input)="handleInput($event)"
          (blur)="onTouched()"
        ></textarea>
      } @else {
        <input
          [id]="inputId"
          [type]="effectiveType()"
          [class]="fieldClasses() + ' h-12' + (type() === 'password' ? ' !pr-12' : '')"
          [value]="value()"
          [disabled]="disabled()"
          [attr.placeholder]="placeholder()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputMode()"
          [attr.maxlength]="maxLength()"
          [attr.min]="min()"
          [attr.max]="max()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy()"
          (input)="handleInput($event)"
          (blur)="onTouched()"
        />
        @if (type() === 'password') {
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-12 text-text-muted"
            [attr.aria-label]="(revealed() ? 'ds.input.hidePassword' : 'ds.input.showPassword') | transloco"
            [attr.aria-pressed]="revealed()"
            (click)="revealed.set(!revealed())"
          >
            <app-icon [name]="revealed() ? 'eye-off' : 'eye'" [size]="22" />
          </button>
        }
      }
    </div>

    @if (error()) {
      <span [id]="inputId + '-error'" class="type-caption text-danger">{{ error() }}</span>
    } @else if (hint()) {
      <span
        [id]="inputId + '-hint'"
        class="inline-flex items-center gap-1.5 type-caption"
        [class]="hintSuccess() ? 'text-success-text' : 'text-text-muted'"
      >
        @if (hintSuccess()) {
          <app-icon name="check" [size]="14" [strokeWidth]="2.5" />
        }
        {{ hint() }}
      </span>
    }
  `,
})
export class TextInputComponent implements ControlValueAccessor {
  readonly inputId = `text-input-${nextId++}`;

  readonly label = input.required<string>();
  readonly type = input<TextInputType>('text');
  readonly autocomplete = input<string>('off');
  readonly inputMode = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly hint = input<string | null>(null);
  /** Hint met (e.g. "Aspoň 8 znaků" once the password is long enough): green with a check. */
  readonly hintSuccess = input(false);
  /** min / max for type="date" ("YYYY-MM-DD"). */
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  /** Error message; when set the field is marked invalid. */
  readonly error = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  /** Show "71/150" next to the label (needs maxLength). */
  readonly showCounter = input(false);
  readonly multiline = input(false);
  readonly rows = input(3);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly revealed = signal(false);

  protected readonly effectiveType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type(),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) return `${this.inputId}-error`;
    if (this.hint()) return `${this.inputId}-hint`;
    return null;
  });

  protected readonly fieldClasses = computed(() =>
    this.error()
      ? `${FIELD} border-2 border-danger px-[13px]`
      : `${FIELD} border border-border px-[14px] focus:border-primary focus:shadow-[var(--wanbli-shadow-focus),inset_0_0_0_1px_var(--wanbli-color-primary)]`,
  );

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
