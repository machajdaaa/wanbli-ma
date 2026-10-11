import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileVm } from '../../core/models/view-models';
import { ProfileService } from '../../core/services/profile.service';
import { AvatarComponent } from '../../shared/design-system/avatar/avatar.component';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { TextInputComponent } from '../../shared/design-system/text-input/text-input.component';
import { ToastService } from '../../shared/design-system/toast/toast.service';

export const BIO_MAX_LENGTH = 150;

/**
 * Edit profile (UpravitProfil.dc.html): photo (upload not available yet),
 * first name + last name (the API keeps them separate), nickname with a hint,
 * bio up to 150 characters with a counter. Errors show under the fields;
 * server errors as a toast with retry.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  imports: [
    IonContent,
    ReactiveFormsModule,
    TranslocoPipe,
    AvatarComponent,
    BackButtonComponent,
    ButtonComponent,
    IconComponent,
    TextInputComponent,
  ],
})
export class ProfileEditPage {
  private profiles = inject(ProfileService);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);
  private navCtrl = inject(NavController);

  protected readonly bioMaxLength = BIO_MAX_LENGTH;
  protected readonly profile = signal<ProfileVm | null>(null);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    nickname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
    }),
    bio: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BIO_MAX_LENGTH)] }),
  });

  /** Re-evaluates field errors on every change. */
  private readonly formChanges = toSignal(this.form.valueChanges);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loadFailed.set(false);
    this.profiles.myProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.setValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          nickname: profile.person.nickname ?? '',
          bio: profile.bio ?? '',
        });
      },
      error: () => this.loadFailed.set(true),
    });
  }

  /** Error text for a field once the user touched it or tried to save. */
  protected errorFor(name: 'firstName' | 'lastName' | 'nickname' | 'bio'): string | null {
    this.formChanges();
    const control = this.form.controls[name];
    if (control.valid || !(control.touched || this.submitted())) return null;
    if (control.hasError('required')) return this.transloco.translate(`editProfile.errors.${name}Required`);
    if (control.hasError('minlength')) return this.transloco.translate('editProfile.errors.tooShort');
    return this.transloco.translate('editProfile.errors.tooLong');
  }

  protected photoUnavailable(): void {
    // No upload endpoint yet (docs/backend-requirements.md).
    this.toasts.show({ kind: 'error', message: this.transloco.translate('editProfile.photoUnavailable'), duration: 4000 });
  }

  protected save(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.profiles.updateMyProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toasts.success(this.transloco.translate('editProfile.saved'));
        this.navCtrl.back();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        const key = error.status === 409 ? 'editProfile.errors.nicknameTaken' : 'editProfile.saveFailed';
        this.toasts.error(this.transloco.translate(key), () => this.save());
      },
    });
  }
}
