import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconDef, IconName, IconShape } from './icons';

/**
 * Inline SVG icon from the design's icon set. Decorative by default
 * (aria-hidden) — the surrounding button/link carries the accessible name.
 * Color follows `currentColor`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-icon',
  host: {
    class: 'inline-flex shrink-0',
    'aria-hidden': 'true',
  },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="def().viewBox ?? '0 0 24 24'"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (shape of def().shapes; track $index) {
        @switch (shape.tag) {
          @case ('path') {
            <svg:path
              [attr.d]="shape.d"
              [attr.fill]="fillOf(shape)"
              [attr.stroke]="strokeOf(shape)"
              [attr.stroke-width]="strokeWidthOf(shape)"
            />
          }
          @case ('circle') {
            <svg:circle
              [attr.cx]="shape.cx"
              [attr.cy]="shape.cy"
              [attr.r]="shape.r"
              [attr.fill]="fillOf(shape)"
              [attr.stroke]="strokeOf(shape)"
              [attr.stroke-width]="strokeWidthOf(shape)"
            />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="shape.x"
              [attr.y]="shape.y"
              [attr.width]="shape.width"
              [attr.height]="shape.height"
              [attr.rx]="shape.rx"
              [attr.fill]="fillOf(shape)"
              [attr.stroke]="strokeOf(shape)"
              [attr.stroke-width]="strokeWidthOf(shape)"
            />
          }
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  /** Stroke width for outline shapes (design: 2, 2.5 in small badges). */
  readonly strokeWidth = input(2);

  protected readonly def = computed<IconDef>(() => ICONS[this.name()]);

  private paintOf(shape: IconShape): 'stroke' | 'fill' | 'both' {
    return shape.paint ?? (this.def().filled ? 'fill' : 'stroke');
  }

  protected fillOf(shape: IconShape): string {
    return this.paintOf(shape) === 'stroke' ? 'none' : 'currentColor';
  }

  protected strokeOf(shape: IconShape): string | null {
    if (this.paintOf(shape) === 'fill') return null;
    return shape.accent ? 'var(--app-icon-accent, var(--wanbli-color-primary-subtle))' : 'currentColor';
  }

  protected strokeWidthOf(shape: IconShape): number | null {
    return this.paintOf(shape) === 'fill' ? null : (shape.strokeWidth ?? this.strokeWidth());
  }
}
