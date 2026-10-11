import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import { PostCardVm, ProfileVm } from '../../core/models/view-models';
import { FeedService } from '../../core/services/feed.service';
import { ProfileService } from '../../core/services/profile.service';
import { CollectionProgressComponent } from '../../shared/components/collection-progress/collection-progress.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { PostMenuSheetComponent } from '../../shared/components/post-menu-sheet/post-menu-sheet.component';
import { ProfileHeaderComponent } from '../../shared/components/profile-header/profile-header.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';

type Status = 'loading' | 'error' | 'ready';

/**
 * My profile (Profil.dc.html): settings gear, header with stats, "Upravit
 * profil", "Moje sbírka" per light and "Moje příspěvky". Reloads on every
 * enter so edits made on /profile/edit show up.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    RouterLink,
    TranslocoPipe,
    CollectionProgressComponent,
    PostCardComponent,
    PostMenuSheetComponent,
    ProfileHeaderComponent,
    ButtonComponent,
    IconComponent,
    SkeletonComponent,
  ],
})
export class ProfilePage {
  private profiles = inject(ProfileService);
  private feed = inject(FeedService);

  protected readonly status = signal<Status>('loading');
  protected readonly profile = signal<ProfileVm | null>(null);
  protected readonly posts = signal<PostCardVm[]>([]);
  protected readonly menuPost = signal<PostCardVm | null>(null);

  ionViewWillEnter(): void {
    this.load();
  }

  protected load(onDone?: () => void): void {
    if (!this.profile()) this.status.set('loading');
    this.profiles
      .myProfile()
      .pipe(
        switchMap((profile) => {
          this.profile.set(profile);
          this.status.set('ready');
          return this.feed.userPosts(profile.person);
        }),
      )
      .subscribe({
        next: (page) => {
          this.posts.set(page.items);
          onDone?.();
        },
        error: () => {
          if (!this.profile()) this.status.set('error');
          onDone?.();
        },
      });
  }

  protected onRefresh(event: RefresherCustomEvent): void {
    this.load(() => event.target.complete());
  }

  protected removePost(post: PostCardVm): void {
    this.posts.update((posts) => posts.filter((p) => p.id !== post.id));
  }
}
