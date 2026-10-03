import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-button',
  standalone: true,
  imports: [IonButton],
  templateUrl: 'button.component.html',
  styleUrl: 'button.component.scss',
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  label = input('');

  clicked = output<void>();

  handleClick(): void {
    if (this.disabled()) return;
    this.clicked.emit();
  }
}
