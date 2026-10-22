import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Gender } from '../../core/api/enums';
import { AuthService } from '../../core/services/auth.service';
import { REGISTRATION_GROUPS_MOCK } from '../../core/mocks/registration.mock';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { SegmentedControlComponent } from '../../shared/design-system/segmented-control/segmented-control.component';
import { TextInputComponent } from '../../shared/design-system/text-input/text-input.component';
import { ToastService } from '../../shared/design-system/toast/toast.service';

export const PASSWORD_MIN_LENGTH = 8;
const PARENT_CONSENT_AGE = 15;

type GenderOption = 'male' | 'female' | 'unknown';
const GENDER_VALUES: Record<GenderOption, Gender> = { male: Gender.Male, female: Gender.Female, unknown: Gender.Unknown };

type Field = 'firstName' | 'lastName' | 'nickname' | 'email' | 'birthDate' | 'password' | 'terms';

/** Age in full years on `today`. */
export function ageOn(birthDate: string, today = new Date()): number | null {
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  let age = today.getFullYear() - date.getFullYear();
  const beforeBirthday =
    today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) age--;
  return age;
}

function pastDate(control: AbstractControl): ValidationErrors | null {
  const age = control.value ? ageOn(control.value) : null;
  return age === null || age < 0 || age > 120 ? { date: true } : null;
}

/**
 * Registration (Registrace.dc.html). Sends every field RegisterRequest needs:
 * first and last name separately, nickname, e-mail, birth date (native date
 * picker), gender (segmented choice) and password (also used as
 * passwordConfirm — the design has one field with reveal). The group picker
 * and the terms checkbox are shown as designed but not sent (no API);
 * under-15s get a note about parental consent, which the API can't do yet.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  templateUrl: './register.page.html',
  imports: [
    IonContent,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    BackButtonComponent,
    ButtonComponent,
    IconComponent,
    SegmentedControlComponent,
    TextInputComponent,
  ],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private navCtrl = inject(NavController);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);

  protected readonly groups = REGISTRATION_GROUPS_MOCK;
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly passwordMinLength = PASSWORD_MIN_LENGTH;

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    nickname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
    }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    birthDate: new FormControl('', { nonNullable: true, validators: [Validators.required, pastDate] }),
    gender: new FormControl<GenderOption>('unknown', { nonNullable: true }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
    }),
    group: new FormControl(REGISTRATION_GROUPS_MOCK[0], { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  /** Field errors returned by the server (ProblemDetails `errors`). */
  protected readonly serverErrors = signal<Partial<Record<Field, string>>>({});
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly gender = computed(() => this.formValue().gender ?? 'unknown');
  protected readonly passwordLongEnough = computed(() => (this.formValue().password ?? '').length >= PASSWORD_MIN_LENGTH);
  protected readonly underParentAge = computed(() => {
    const birthDate = this.formValue().birthDate;
    const age = birthDate ? ageOn(birthDate) : null;
    return age !== null && age >= 0 && age < PARENT_CONSENT_AGE;
  });
  protected readonly genderOptions = computed(() => [
    { value: 'male' as GenderOption, label: this.transloco.translate('auth.genderMale') },
    { value: 'female' as GenderOption, label: this.transloco.translate('auth.genderFemale') },
    { value: 'unknown' as GenderOption, label: this.transloco.translate('auth.genderUnknown') },
  ]);

  constructor() {
    // Server-side field errors are stale as soon as the user edits the form.
    this.form.valueChanges.subscribe(() => {
      if (Object.keys(this.serverErrors()).length) this.serverErrors.set({});
    });
  }

  protected setGender(value: GenderOption): void {
    this.form.controls.gender.setValue(value);
  }

  protected errorFor(name: Field): string | null {
    this.formValue();
    const server = this.serverErrors()[name];
    if (server) return server;
    const control = this.form.controls[name];
    if (control.valid || !(control.touched || this.submitted())) return null;
    if (control.hasError('required')) return this.transloco.translate(`auth.errors.${name}Required`);
    if (control.hasError('requiredTrue')) return this.transloco.translate('auth.errors.termsRequired');
    if (control.hasError('email')) return this.transloco.translate('auth.errors.email');
    if (control.hasError('date')) return this.transloco.translate('auth.errors.birthDate');
    if (control.hasError('minlength')) {
      return name === 'password'
        ? this.transloco.translate('auth.passwordHint', { count: PASSWORD_MIN_LENGTH })
        : this.transloco.translate('editProfile.errors.tooShort');
    }
    return this.transloco.translate('editProfile.errors.tooLong');
  }

  protected submit(): void {
    this.submitted.set(true);
    this.serverErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.auth
      .register({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        nickname: v.nickname.trim(),
        email: v.email.trim(),
        birthDate: v.birthDate,
        gender: GENDER_VALUES[v.gender],
        password: v.password,
        passwordConfirm: v.password,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.navCtrl.navigateRoot('/nav/home');
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          const fieldErrors = this.mapServerErrors(error);
          if (Object.keys(fieldErrors).length) {
            this.serverErrors.set(fieldErrors);
          } else {
            this.toasts.error(this.transloco.translate('auth.errors.registerFailed'), () => this.submit());
          }
        },
      });
  }

  /** ASP.NET validation problems: `{ errors: { Nickname: ["..."] } }` → field messages. */
  private mapServerErrors(error: HttpErrorResponse): Partial<Record<Field, string>> {
    const errors = (error.error as { errors?: Record<string, string[]> } | null)?.errors;
    if (error.status === 409) return { nickname: this.transloco.translate('editProfile.errors.nicknameTaken') };
    if (!errors) return {};
    const result: Partial<Record<Field, string>> = {};
    for (const [key, messages] of Object.entries(errors)) {
      const field = (key.charAt(0).toLowerCase() + key.slice(1)).replace('passwordConfirm', 'password') as Field;
      // Server texts aren't localized — show our own message on the field.
      if (field in this.form.controls && messages?.length) result[field] = this.transloco.translate('auth.errors.serverField');
    }
    return result;
  }
}
