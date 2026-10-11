import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface ToastOptions {
  kind: ToastKind;
  message: string;
  /** Button label; defaults to "OK" for success and "Zkusit znovu" for errors with `action`. */
  actionLabel?: string;
  /** Called when the button is pressed (e.g. retry). The toast closes either way. */
  action?: () => void;
  /** ms before auto-dismiss; 0 = stay until the button is pressed. */
  duration?: number;
}

export interface ActiveToast extends ToastOptions {
  id: number;
}

const DEFAULT_DURATION: Record<ToastKind, number> = { success: 3000, error: 6000 };

/**
 * App-wide toast (Main.dc.html → Toast). One at a time; a new toast replaces
 * the current one. Rendered by <app-toast-host> in AppComponent.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ActiveToast | null>(null);

  private nextId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(options: ToastOptions): void {
    this.clearTimer();
    const toast: ActiveToast = { ...options, id: this.nextId++ };
    this.current.set(toast);
    const duration = options.duration ?? DEFAULT_DURATION[options.kind];
    if (duration > 0) {
      this.timer = setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string): void {
    this.show({ kind: 'success', message });
  }

  error(message: string, retry?: () => void): void {
    this.show({ kind: 'error', message, action: retry, duration: retry ? 0 : undefined });
  }

  dismiss(id?: number): void {
    if (id != null && this.current()?.id !== id) return;
    this.clearTimer();
    this.current.set(null);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
