import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { EagleFeatherService, PostFeatherVm } from './eagle-feather.service';
import { PeopleService } from './people.service';
import { PostService } from './post.service';
import { toPerson } from './mappers';
import { HomeFeedMode, PageVm, PhotoVm, PostCardVm } from '../models/view-models';
import { PagedResponseOfPostResponse, PostResponse } from '../api/generated/models';
import { getFeed$Json } from '../api/generated/fn/feed/get-feed-json';
import { getOrganisationFeed$Json } from '../api/generated/fn/organisations/get-organisation-feed-json';
import { getUserPosts$Json } from '../api/generated/fn/users/get-user-posts-json';
import { postFeatherSample } from '../mocks/posts.mock';

export const FEED_PAGE_SIZE = 20;

/** Post feeds (home, group, profile) as PostCardVm pages. */
@Injectable({ providedIn: 'root' })
export class FeedService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);
  private feathers = inject(EagleFeatherService);
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
    return this.toPage(this.api.call(getFeed$Json, { Page: page, PageSize: FEED_PAGE_SIZE }));
  }

  groupFeed(groupId: number, page: number): Observable<PageVm<PostCardVm>> {
    return this.toPage(this.api.call(getOrganisationFeed$Json, { id: groupId, Page: page, PageSize: FEED_PAGE_SIZE }));
  }

  /** Posts of one user, newest first (my profile, someone else's profile). */
  userPosts(userId: number, page: number): Observable<PageVm<PostCardVm>> {
    return this.toPage(this.api.call(getUserPosts$Json, { id: userId, Page: page, PageSize: FEED_PAGE_SIZE }));
  }

  private toPage(request: Observable<PagedResponseOfPostResponse>): Observable<PageVm<PostCardVm>> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        request.pipe(
          switchMap((res) =>
            (res.items.length
              ? this.feathers.postFeathers(
                  res.items.map((p) => ({ authorId: p.author.id, userEagleFeatherId: p.userEagleFeatherId })),
                )
              : of(new Map<number, PostFeatherVm>())
            ).pipe(
              map((feathers) => ({
                items: res.items.map((post) => this.toPostCard(post, me.id, feathers.get(post.userEagleFeatherId))),
                page: res.page,
                hasNextPage: res.hasNextPage ?? res.page < res.totalPages,
              })),
            ),
          ),
        ),
      ),
    );
  }

  private toPostCard(post: PostResponse, meId: number, resolved: PostFeatherVm | undefined): PostCardVm {
    // MOCK(post feather): a sample only when the author's feather record can't
    // be read — see posts.mock.ts. MOCK(metrics): results aren't stored yet; a
    // sample result next to a real feather would be invented, so it shows "Splněno".
    const { feather, isGrandChallenge, metrics } = resolved ? { ...resolved, metrics: [] } : postFeatherSample(post.id);
    // Only the real image — no placeholder tiles that would suggest photos the post doesn't have.
    const photos: PhotoVm[] = post.imageUrl ? [{ url: post.imageUrl }] : [];
    return {
      id: post.id,
      author: toPerson(post.author, meId),
      place: null, // not in the API; hidden rather than invented (redesign-plan R5)
      createdAt: post.createdAt,
      feather,
      isGrandChallenge,
      metrics,
      photos,
      content: post.content?.trim() || null,
      likeCount: post.likeCount,
      likedByMe: this.posts.isLiked(post.id),
      isOwn: post.author.id === meId,
    };
  }
}
