import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Loading placeholders shaped like a post card or a list row (not in the
 * design; derived from PostCard / list rows). Hidden from screen readers —
 * the page marks its loading region with aria-busy instead.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-skeleton',
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    @if (variant() === 'post-card') {
      <div class="flex flex-col gap-3.5 rounded-16 border border-border bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-12 bg-track bone"></div>
          <div class="flex flex-1 flex-col gap-1.5">
            <div class="h-3.5 w-2/5 rounded-full bg-track bone"></div>
            <div class="h-3 w-3/5 rounded-full bg-track bone"></div>
          </div>
        </div>
        <div class="h-7 w-1/2 rounded-8 bg-track bone"></div>
        <div class="h-6 w-3/4 rounded-full bg-track bone"></div>
        <div class="h-[180px] rounded-12 bg-track bone"></div>
      </div>
    } @else {
      <div class="flex min-h-16 items-center gap-3 py-2">
        <div class="size-10 shrink-0 rounded-12 bg-track bone"></div>
        <div class="flex flex-1 flex-col gap-1.5">
          <div class="h-3.5 w-1/2 rounded-full bg-track bone"></div>
          <div class="h-3 w-1/3 rounded-full bg-track bone"></div>
        </div>
      </div>
    }
  `,
  styles: `
    .bone {
      animation: bone-pulse 1.4s ease-in-out infinite;
    }
    @keyframes bone-pulse {
      50% {
        opacity: 0.55;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .bone {
        animation: none;
      }
    }
  `,
})
export class SkeletonComponent {
  readonly variant = input<'post-card' | 'list-row'>('post-card');
}
