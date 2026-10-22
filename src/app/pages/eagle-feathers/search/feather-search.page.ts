import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { FeatherRowVm } from '../../../core/models/view-models';
import { EagleFeatherService } from '../../../core/services/eagle-feather.service';
import { normalizeSearch } from '../../../core/services/mappers';
import { BackButtonComponent } from '../../../shared/design-system/back-button/back-button.component';
import { BadgeComponent } from '../../../shared/design-system/badge/badge.component';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { IconComponent } from '../../../shared/design-system/icon/icon.component';
import { LIGHT_STYLES } from '../../../shared/design-system/lights';
import { SearchInputComponent } from '../../../shared/design-system/search-input/search-input.component';
import { PluralPipe } from '../../../shared/pipes/plural.pipe';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'results'; results: FeatherRowVm[] };

/** Quick suggestions from the design. */
const CHIPS = ['běh', 'čaj', 'foto', 'hvězdy'];

/**
 * Feather search (VyhledaniPera.dc.html): by name without diacritics or by
 * code ("4A1"), quick chips, states idle / results / nothing found.
 * Searches the cached catalog on the client (no search endpoint yet).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feather-search',
  templateUrl: './feather-search.page.html',
  imports: [
    IonContent,
    RouterLink,
    TranslocoPipe,
    BackButtonComponent,
    BadgeComponent,
    ButtonComponent,
    IconComponent,
    SearchInputComponent,
    PluralPipe,
  ],
})
export class FeatherSearchPage {
  private feathers = inject(EagleFeatherService);

  protected readonly query = signal('');
  protected readonly chips = CHIPS.map((label) => ({ label, key: normalizeSearch(label) }));
  protected readonly styles = LIGHT_STYLES;
  private readonly retry = signal(0);

  protected readonly state = toSignal(
    toObservable(computed(() => ({ q: this.query(), retry: this.retry() }))).pipe(
      debounceTime(150),
      distinctUntilChanged((a, b) => a.q === b.q && a.retry === b.retry),
      switchMap(({ q }) =>
        !normalizeSearch(q)
          ? of<SearchState>({ kind: 'idle' })
          : this.feathers.search(q).pipe(
              map((results): SearchState => ({ kind: 'results', results })),
              startWith<SearchState>({ kind: 'loading' }),
              catchError(() => of<SearchState>({ kind: 'error' })),
            ),
      ),
    ),
    { initialValue: { kind: 'idle' } as SearchState },
  );

  protected readonly normalizedQuery = computed(() => normalizeSearch(this.query()));
  protected readonly results = computed(() => {
    const state = this.state();
    return state.kind === 'results' ? state.results : [];
  });

  protected pickChip(chip: string): void {
    this.query.set(chip);
  }

  protected retrySearch(): void {
    this.retry.update((n) => n + 1);
  }
}
