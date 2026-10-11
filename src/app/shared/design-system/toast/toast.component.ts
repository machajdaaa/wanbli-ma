import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';
import { ActiveToast, ToastKind, ToastService } from './toast.service';

/** Visual toast: dark pill, status dot, message, action button. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toast',
  imports: [TranslocoPipe, IconComponent],
  host: { class: 'block' },
  template: `
    <div
      class="flex min-h-[52px] w-full items-center gap-3 rounded-16 bg-forest-900 py-2 pr-2 pl-[14px] text-white shadow-toast"
    >
      @if (kind() === 'success') {
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-success">
          <app-icon name="check" [size]="14" [strokeWidth]="3" />
        </span>
      } @else {
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger font-text text-[0.9375rem] font-extrabold leading-none"
          aria-hidden="true"
          >!</span
        >
      }
      <span class="flex-1 font-text text-[0.875rem] font-medium leading-5">{{ message() }}</span>
      <button
        type="button"
        class="h-11 shrink-0 rounded-[10px] bg-on-dark-subtle px-3 font-text text-[0.875rem] font-semibold leading-5 text-white"
        (click)="pressed.emit()"
      >
        {{ actionLabel() ?? ((kind() === 'error' && hasAction() ? 'common.retry' : 'common.ok') | transloco) }}
      </button>
    </div>
  `,
})
export class ToastComponent {
  readonly kind = input.required<ToastKind>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly hasAction = input(false);
  readonly pressed = output<void>();
}

/**
 * Renders the ToastService's current toast above the floating navbar.
 * role=status for success, role=alert for errors, so screen readers announce it.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toast-host',
  imports: [ToastComponent],
  host: {
    class:
      'pointer-events-none fixed inset-x-4 z-[30] mx-auto max-w-[358px] ' +
      'bottom-[calc(var(--wanbli-size-navbar-area)+var(--ion-safe-area-bottom,0px)+var(--wanbli-space-2))]',
  },
  template: `
    <div aria-live="polite" aria-atomic="true">
      @if (toasts.current(); as toast) {
        <app-toast
          class="pointer-events-auto"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
          [kind]="toast.kind"
          [message]="toast.message"
          [actionLabel]="toast.actionLabel ?? null"
          [hasAction]="!!toast.action"
          (pressed)="onPressed(toast)"
        />
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);

  protected onPressed(toast: ActiveToast): void {
    this.toasts.dismiss(toast.id);
    toast.action?.();
  }
}
