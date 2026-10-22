import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { PersonRowVm } from '../../core/models/view-models';
import { AuthService } from '../../core/services/auth.service';
import { PeopleService } from '../../core/services/people.service';
import { normalizeSearch } from '../../core/services/mappers';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button.component';
import { AvatarComponent } from '../../shared/design-system/avatar/avatar.component';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { SearchInputComponent } from '../../shared/design-system/search-input/search-input.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';
import { PluralPipe } from '../../shared/pipes/plural.pipe';

type Status = 'loading' | 'error' | 'ready';

/**
 * People search (Hledani.dc.html): search field and "Návrhy ze tvé skupiny"
 * with Sledovat / Sleduješ. There's no user search endpoint yet, so search
 * filters the members of the user's own group on the client.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-people-search',
  templateUrl: './people-search.page.html',
  imports: [
    IonContent,
    RouterLink,
    TranslocoPipe,
    FollowButtonComponent,
    AvatarComponent,
    BackButtonComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SearchInputComponent,
    SkeletonComponent,
    PluralPipe,
  ],
})
export class PeopleSearchPage {
  private people = inject(PeopleService);
  private auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly status = signal<Status>('loading');
  protected readonly members = signal<PersonRowVm[]>([]);
  protected readonly hasGroup = computed(() => this.auth.currentUser()?.organisationId != null);

  protected readonly results = computed(() => {
    const q = normalizeSearch(this.query());
    if (!q) return this.members();
    return this.members().filter(
      (r) => normalizeSearch(r.person.name).includes(q) || normalizeSearch(r.person.nickname ?? '').includes(q),
    );
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.people.groupSuggestions().subscribe({
      next: (rows) => {
        this.members.set(rows);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
