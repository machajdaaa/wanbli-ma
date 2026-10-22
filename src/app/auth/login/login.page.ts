import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { TextInputComponent } from '../../shared/design-system/text-input/text-input.component';
import { ToastService } from '../../shared/design-system/toast/toast.service';

/**
 * Login (Prihlaseni.dc.html): eagle, "Vítej zpátky!", nickname + password
 * with reveal, "Zapomněl/a jsi heslo?" (info page for now), link to
 * registration. Wrong credentials show under the password field; other
 * failures as a toast with retry. The API logs in by nickname only, so the
 * field says "Přezdívka" (redesign-plan §4.11).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [IonContent, ReactiveFormsModule, RouterLink, TranslocoPipe, ButtonComponent, TextInputComponent],
})
export class LoginPage {
  private auth = inject(AuthService);
  private navCtrl = inject(NavController);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);

  protected readonly form = new FormGroup({
    nickname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly credentialsError = signal(false);
  private readonly formChanges = toSignal(this.form.valueChanges);

  constructor() {
    // Typing again clears the "wrong credentials" message.
    this.form.valueChanges.subscribe(() => this.credentialsError.set(false));
  }

  protected errorFor(name: 'nickname' | 'password'): string | null {
    this.formChanges();
    if (name === 'password' && this.credentialsError()) return this.transloco.translate('auth.errors.credentials');
    const control = this.form.controls[name];
    if (control.valid || !(control.touched || this.submitted())) return null;
    return this.transloco.translate(`auth.errors.${name}Required`);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    const { nickname, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.login(nickname.trim(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.navCtrl.navigateRoot('/nav/home');
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        if (error.status === 400 || error.status === 401) {
          this.credentialsError.set(true);
        } else {
          this.toasts.error(this.transloco.translate('auth.errors.network'), () => this.submit());
        }
      },
    });
  }
}
