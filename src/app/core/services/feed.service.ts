import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { PeopleService } from './people.service';
import { PostService } from './post.service';
import { toPerson } from './mappers';
import { HomeFeedMode, PageVm, PersonVm, PhotoVm, PostCardVm } from '../models/view-models';
import { PagedResponseOfPostResponse, PostResponse } from '../api/generated/models';
import { getFeed$Json, GetFeed$Json$Params } from '../api/generated/fn/feed/get-feed-json';
import { getOrganisationFeed$Json } from '../api/generated/fn/organisations/get-organisation-feed-json';
import { POST_FEATHER_SAMPLES, postFeatherSample } from '../mocks/posts.mock';

export const FEED_PAGE_SIZE = 20;

/** Post feeds (home, group, profile) as PostCardVm pages. */
@Injectable({ providedIn: 'root' })
export class FeedService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);
  private people = inject(PeopleService);
  private posts = inject(PostService);

  /**
   * "following" when the user follows someone, otherwise "league" — the feed
   * then shows posts from the whole League (state 1b). Whether /api/feed
   * actually returns League posts for such users is unconfirmed
   * (docs/backend-requirements.md).
   */
  homeFeedMode(): Observable<HomeFeedMode> {
    return this.people.loadFollowing().pipe(map((ids) => (ids.size > 0 ? 'following' : 'league')));
  }

  homeFeed(page: number): Observable<PageVm<PostCardVm>> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        this.api
          .call(getFeed$Json, { Page: page, PageSize: FEED_PAGE_SIZE })
          .pipe(map((res) => this.toPage(res, me.id))),
      ),
    );
  }

  groupFeed(groupId: number, page: number): Observable<PageVm<PostCardVm>> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        this.api
          .call(getOrganisationFeed$Json, { id: groupId, Page: page, PageSize: FEED_PAGE_SIZE })
          .pipe(map((res) => this.toPage(res, me.id))),
      ),
    );
  }

  /**
   * MOCK(user posts): there's no "posts of user X" endpoint
   * (proposed GET /api/users/{id}/posts). Returns sample posts for the person.
   */
  userPosts(author: PersonVm): Observable<PageVm<PostCardVm>> {
    return this.auth.ensureCurrentUser().pipe(
      map((me) => ({
        page: 1,
        hasNextPage: false,
        items: [7, 2].map((sampleIndex, i) => {
          const sample = POST_FEATHER_SAMPLES[(author.id + sampleIndex) % POST_FEATHER_SAMPLES.length];
          const id = -(author.id * 10 + i + 1);
          return {
            id,
            author,
            place: null,
            createdAt: new Date(Date.now() - (i + 1) * 26 * 3600 * 1000).toISOString(),
            feather: sample.feather,
            isGrandChallenge: sample.isGrandChallenge,
            metrics: sample.metrics,
            photos: Array.from({ length: sample.photos }, () => ({ url: null })),
            content: null,
            likeCount: 8 + ((author.id + i) % 9),
            likedByMe: this.posts.isLiked(id),
            isOwn: author.id === me.id,
          };
        }),
      })),
    );
  }

  /** @deprecated Raw API page for the legacy HomePage; removed when Home moves to PostCard (phase 4). */
  getFeed(params?: GetFeed$Json$Params): Observable<PagedResponseOfPostResponse> {
    return this.api.call(getFeed$Json, params ?? {});
  }

  private toPage(res: PagedResponseOfPostResponse, meId: number): PageVm<PostCardVm> {
    return {
      items: res.items.map((post) => this.toPostCard(post, meId)),
      page: res.page,
      hasNextPage: res.hasNextPage ?? res.page < res.totalPages,
    };
  }

  private toPostCard(post: PostResponse, meId: number): PostCardVm {
    const sample = postFeatherSample(post.id); // MOCK(post feather) — see posts.mock.ts
    // Only the real image — no placeholder tiles that would suggest photos the post doesn't have.
    const photos: PhotoVm[] = post.imageUrl ? [{ url: post.imageUrl }] : [];
    return {
      id: post.id,
      author: toPerson(post.author, meId),
      place: null, // not in the API; hidden rather than invented (redesign-plan R5)
      createdAt: post.createdAt,
      feather: sample.feather,
      isGrandChallenge: sample.isGrandChallenge,
      metrics: sample.metrics,
      photos,
      content: post.content?.trim() || null,
      likeCount: post.likeCount,
      likedByMe: this.posts.isLiked(post.id),
      isOwn: post.author.id === meId,
    };
  }
}
