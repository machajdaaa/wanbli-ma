import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonInput,
  IonButton,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: 'login.page.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonInput, IonButton,
  ],
})
export class LoginPage {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  isSubmitting = signal(false);

  form = new FormGroup({
    nickname: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

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
        await this.navCtrl.navigateRoot('/tabs');
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
}
