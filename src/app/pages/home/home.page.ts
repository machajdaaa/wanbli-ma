import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { IonContent, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import {DailyChallengeCardComponent} from "../../shared/components/daily-challenge-card/daily-challenge-card.component";
import {ActivityCardComponent} from "../../shared/components/activity-card/activity-card.component";
import { FeedService } from '../../core/services/feed.service';
import { PostResponse } from '../../core/api/generated/models';

const PAGE_SIZE = 30;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonInfiniteScroll, IonInfiniteScrollContent, DailyChallengeCardComponent, ActivityCardComponent],
})
export class HomePage {
  private feedService = inject(FeedService);

  readonly posts = signal<PostResponse[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly hasNextPage = signal(true);

  private nextPage = 1;

  constructor() {
    this.loadNextPage();
  }

  onIonInfinite(event: InfiniteScrollCustomEvent): void {
    this.loadNextPage(() => event.target.complete());
  }

  private loadNextPage(onDone?: () => void): void {
    this.feedService.getFeed({ Page: this.nextPage, PageSize: PAGE_SIZE }).subscribe({
      next: (page) => {
        this.posts.update((current) => [...current, ...page.items]);
        this.hasNextPage.set(page.hasNextPage ?? false);
        this.nextPage++;
        this.isLoading.set(false);
        onDone?.();
      },
      error: () => {
        // Only the very first page failing counts as a hard error for the
        // whole feed. A later page failing (e.g. one bad request mid-scroll)
        // just stops this attempt — scrolling again retries the same page.
        if (this.posts().length === 0) {
          this.hasError.set(true);
        }
        this.isLoading.set(false);
        onDone?.();
      },
    });
  }
}
