import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import { PostCardVm, ProfileVm } from '../../core/models/view-models';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';
import { ProfileService } from '../../core/services/profile.service';
import { CollectionProgressComponent } from '../../shared/components/collection-progress/collection-progress.component';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { PostMenuSheetComponent } from '../../shared/components/post-menu-sheet/post-menu-sheet.component';
import { ProfileHeaderComponent } from '../../shared/components/profile-header/profile-header.component';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';

type Status = 'loading' | 'error' | 'ready';

/**
 * Someone else's profile (CiziProfil.dc.html): same structure as my profile,
 * with Sledovat / Sleduješ instead of "Upravit profil" and no settings.
 * Opening my own id redirects to the Profile tab.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  imports: [
    IonContent,
    TranslocoPipe,
    CollectionProgressComponent,
    FollowButtonComponent,
    PostCardComponent,
    PostMenuSheetComponent,
    ProfileHeaderComponent,
    BackButtonComponent,
    ButtonComponent,
    SkeletonComponent,
  ],
})
export class UserProfilePage {
  private profiles = inject(ProfileService);
  private feed = inject(FeedService);
  private auth = inject(AuthService);
  private navCtrl = inject(NavController);
  private params = inject(ActivatedRoute).snapshot.paramMap;

  protected readonly status = signal<Status>('loading');
  protected readonly profile = signal<ProfileVm | null>(null);
  protected readonly posts = signal<PostCardVm[]>([]);
  protected readonly menuPost = signal<PostCardVm | null>(null);
  protected readonly userId = Number(this.params.get('id'));

  constructor() {
    this.load();
  }

  protected load(): void {
    if (!Number.isInteger(this.userId) || this.userId <= 0) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    this.auth.ensureCurrentUser().subscribe({
      next: (me) => {
        if (me.id === this.userId) {
          this.navCtrl.navigateRoot('/nav/profile');
          return;
        }
        this.loadProfile();
      },
      error: () => this.status.set('error'),
    });
  }

  /** Keeps the follower counter in sync with the follow button. */
  protected onFollowChanged(following: boolean): void {
    this.profile.update((p) =>
      p ? { ...p, stats: { ...p.stats, followers: Math.max(0, p.stats.followers + (following ? 1 : -1)) } } : p,
    );
  }

  protected removePost(post: PostCardVm): void {
    this.posts.update((posts) => posts.filter((p) => p.id !== post.id));
  }

  private loadProfile(): void {
    this.profiles
      .userProfile(this.userId)
      .pipe(
        switchMap((profile) => {
          this.profile.set(profile);
          this.status.set('ready');
          return this.feed.userPosts(profile.person);
        }),
      )
      .subscribe({
        next: (page) => this.posts.set(page.items),
        error: () => {
          if (!this.profile()) this.status.set('error');
        },
      });
  }
}
