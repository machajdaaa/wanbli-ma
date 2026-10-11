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
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { PostMenuSheetComponent } from '../../shared/components/post-menu-sheet/post-menu-sheet.component';
import { PostCardVm } from '../../core/models/view-models';
import { POST_FEATHER_SAMPLES } from '../../core/mocks/posts.mock';

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
    PostCardComponent,
    PostMenuSheetComponent,
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

  // KartaPera.dc.html variants: GC + time + 1 photo, two metrics + 2 photos,
  // no metric ("Splněno") + liked, count + 5 photos, own post.
  protected readonly postVariants: { label: string; post: PostCardVm }[] = [
    { label: 'Grand challenge · čas · 1 fotka', post: this.samplePost(0, 'Tereza Svobodová', 0, 1, 24, false, false, 'Choltice, Pardubický kraj') },
    { label: 'Vzdálenost + čas · 2 fotky', post: this.samplePost(1, 'Matěj Dvořák', 2, 2, 17, false, false, 'Holice, Pardubický kraj') },
    { label: 'Bez výkonu · Splněno · olajkováno', post: this.samplePost(2, 'Anežka Kučerová', 30, 0, 12, true, false, null) },
    { label: 'Počet · 3+ fotky', post: this.samplePost(3, 'Eliška Černá', 50, 5, 31, false, false, 'Heřmanův Městec, Pardubický kraj') },
    { label: 'Vlastní příspěvek', post: this.samplePost(7, 'Jakub Novák', 26, 1, 14, false, true, null) },
  ];
  protected readonly menuPost = signal<PostCardVm | null>(null);

  private samplePost(
    sample: number,
    name: string,
    hoursAgo: number,
    photos: number,
    likes: number,
    liked: boolean,
    own: boolean,
    place: string | null,
  ): PostCardVm {
    const s = POST_FEATHER_SAMPLES[sample];
    return {
      id: -100 - sample,
      author: { id: sample + 1, name, nickname: null, avatarUrl: null, isMe: own },
      place,
      createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
      feather: s.feather,
      isGrandChallenge: s.isGrandChallenge,
      metrics: s.metrics,
      photos: Array.from({ length: photos }, () => ({ url: null })),
      content: null,
      likeCount: likes,
      likedByMe: liked,
      isOwn: own,
    };
  }

  protected showSuccessToast(): void {
    this.toasts.success('Profil je uložený');
  }

  protected showErrorToast(): void {
    this.toasts.error('Nepovedlo se to uložit', () => this.showSuccessToast());
  }
}
