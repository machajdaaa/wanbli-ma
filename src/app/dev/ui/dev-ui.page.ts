import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AvatarComponent, AvatarSize } from '../../shared/design-system/avatar/avatar.component';
import { BadgeComponent, BadgeVariant } from '../../shared/design-system/badge/badge.component';
import { BottomSheetComponent } from '../../shared/design-system/bottom-sheet/bottom-sheet.component';
import { ButtonComponent, ButtonVariant } from '../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { ICONS, IconName } from '../../shared/design-system/icon/icons';
import { LightTagComponent } from '../../shared/design-system/light-tag/light-tag.component';
import { LIGHTS } from '../../shared/design-system/lights';
import { ProgressBarComponent } from '../../shared/design-system/progress-bar/progress-bar.component';
import { SearchInputComponent } from '../../shared/design-system/search-input/search-input.component';
import { SegmentedControlComponent } from '../../shared/design-system/segmented-control/segmented-control.component';
import { SettingsGroupComponent } from '../../shared/design-system/settings/settings-group.component';
import { SettingsRowComponent } from '../../shared/design-system/settings/settings-row.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';
import { TextInputComponent } from '../../shared/design-system/text-input/text-input.component';
import { ToastComponent } from '../../shared/design-system/toast/toast.component';
import { ToastService } from '../../shared/design-system/toast/toast.service';
import { ToggleComponent } from '../../shared/design-system/toggle/toggle.component';

/**
 * Design-system catalog — every component in every state on one page, to
 * compare against design/screens/Main.dc.html at 390 px. Only routed in
 * non-production builds (see app.routes.ts). Sample texts are inline on
 * purpose: this page is a dev tool, not part of the product UI.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dev-ui',
  imports: [
    IonContent,
    FormsModule,
    AvatarComponent,
    BadgeComponent,
    BottomSheetComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    LightTagComponent,
    ProgressBarComponent,
    SearchInputComponent,
    SegmentedControlComponent,
    SettingsGroupComponent,
    SettingsRowComponent,
    SkeletonComponent,
    TextInputComponent,
    ToastComponent,
    ToggleComponent,
  ],
  templateUrl: './dev-ui.page.html',
})
export class DevUiPage {
  private toasts = inject(ToastService);

  protected readonly variants: ButtonVariant[] = ['primary', 'secondary', 'text', 'destructive'];
  protected readonly variantNames: Record<ButtonVariant, string> = {
    primary: 'Primární',
    secondary: 'Sekundární',
    text: 'Textové',
    destructive: 'Destruktivní',
  };
  protected readonly variantLabels: Record<ButtonVariant, string> = {
    primary: 'Sledovat',
    secondary: 'Upravit profil',
    text: 'Více',
    destructive: 'Odhlásit se',
  };
  protected readonly badges: BadgeVariant[] = [
    'grand-challenge',
    'done',
    'announcement',
    'leader',
    'you',
    'deed-done',
    'deed-todo',
    'gc-done',
    'gc-todo',
  ];
  protected readonly avatarSizes: AvatarSize[] = [32, 40, 56, 96];
  protected readonly lights = LIGHTS;
  protected readonly lightSamples = ['Atletika – běhy', 'Historie', 'Uzly a lana', 'Turistika'];
  protected readonly iconNames = Object.keys(ICONS) as IconName[];
  protected readonly typeScale = [
    { cls: 'type-display', name: 'Display · Baloo 2 32/800', sample: 'Orlí pera' },
    { cls: 'type-h1', name: 'H1 · Baloo 2 26/800', sample: 'Ahoj, Jakube!' },
    { cls: 'type-h2', name: 'H2 · Baloo 2 22/700', sample: 'Běh na 100 m' },
    { cls: 'type-h3', name: 'H3 · Baloo 2 18/700', sample: '1. světlo' },
    { cls: 'type-metric', name: 'Metric · Baloo 2 32/800', sample: '11,25 s' },
    { cls: 'type-body-l', name: 'Body L · Inter 16/400', sample: 'Splnil jsi 3 pera z Atletiky.' },
    { cls: 'type-body', name: 'Body · Inter 14/400', sample: 'Noc s Andersenem začíná v knihovně.' },
    { cls: 'type-label', name: 'Label · Inter 14/600', sample: 'Upravit profil' },
    { cls: 'type-caption text-text-muted', name: 'Caption · Inter 12/500', sample: 'Choltice, Pardubický kraj · dnes 9:00' },
    { cls: 'type-overline text-text-muted', name: 'Overline · Inter 12/600', sample: 'Moje sbírka' },
  ];

  protected readonly name = signal('Jakub Novák');
  protected readonly nickname = signal('Orel');
  protected readonly bio = signal('Běhám, stopuju a sbírám pera z atletiky. Letos chci mít celé 1. světlo.');
  protected readonly password = signal('sovaVnoci42');
  protected readonly query = signal('běh');
  protected readonly groupTab = signal('posts');
  protected readonly gender = signal('m');
  protected readonly toggleOn = signal(true);
  protected readonly toggleOff = signal(false);
  protected readonly notifications = signal(true);
  protected readonly sheetOpen = signal(false);

  protected showSuccessToast(): void {
    this.toasts.success('Profil je uložený');
  }

  protected showErrorToast(): void {
    this.toasts.error('Nepovedlo se to uložit', () => this.showSuccessToast());
  }
}
