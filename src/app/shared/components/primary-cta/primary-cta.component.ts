import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-primary-cta',
  standalone: true,
  templateUrl: 'primary-cta.component.html',
  styleUrl: 'primary-cta.component.scss',
})
export class PrimaryCtaComponent {
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  label = input('');

  clicked = output<void>();

  handleClick(): void {
    if (this.disabled()) return;
    this.clicked.emit();
  }
}
