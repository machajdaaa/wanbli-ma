import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NavController } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { Gender } from '../../core/api/enums';
import { TextInputComponent } from '../../shared/design-system/text-input/text-input.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordConfirm = control.get('passwordConfirm')?.value;
  return password === passwordConfirm ? null : { passwordsMismatch: true };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrl: 'login.page.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    TextInputComponent, ButtonComponent,
  ],
})
export class LoginPage {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  readonly Gender = Gender;

  isSubmitting = signal(false);
  mode = signal<'login' | 'register'>('login');

  form = new FormGroup({
    nickname: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  registerForm = new FormGroup(
    {
      nickname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      birthDate: new FormControl('', Validators.required),
      gender: new FormControl<Gender | null>(null, Validators.required),
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', Validators.required),
    },
    { validators: passwordsMatch }
  );

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const { nickname, password } = this.form.value;

    this.authService.login(nickname!, password!).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isSubmitting.set(false);
        await this.navCtrl.navigateRoot('/nav');
      },
      error: async (err) => {
        await loading.dismiss();
        this.isSubmitting.set(false);
        const alert = await this.alertCtrl.create({
          header: 'Přihlášení selhalo',
          message: err?.error?.message ?? 'Neplatné přihlašovací údaje.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  async onRegisterSubmit(): Promise<void> {
    if (this.registerForm.invalid) return;

    this.isSubmitting.set(true);
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const {
      nickname,
      email,
      firstName,
      lastName,
      birthDate,
      gender,
      password,
      passwordConfirm,
    } = this.registerForm.value;

    this.authService
      .register({
        nickname: nickname!,
        email: email!,
        firstName: firstName!,
        lastName: lastName!,
        birthDate: birthDate!,
        gender: gender!,
        password: password!,
        passwordConfirm: passwordConfirm!,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss();
          this.isSubmitting.set(false);
          await this.navCtrl.navigateRoot('/nav');
        },
        error: async (err) => {
          await loading.dismiss();
          this.isSubmitting.set(false);
          const alert = await this.alertCtrl.create({
            header: 'Registrace selhala',
            message: err?.error?.message ?? 'Zkontrolujte zadané údaje.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
  }
}
