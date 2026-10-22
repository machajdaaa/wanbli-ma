import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiClient } from './api-client';
import { likePost$Json } from '../api/generated/fn/likes/like-post-json';
import { unlikePost } from '../api/generated/fn/likes/unlike-post';
import { deletePost } from '../api/generated/fn/posts/delete-post';

/**
 * Post actions: pírko (like) and delete.
 *
 * MOCK(likedByMe): the API doesn't say whether the current user already liked
 * a post, so liked state is remembered here for the session (redesign-plan R4).
 */
@Injectable({ providedIn: 'root' })
export class PostService {
  private api = inject(ApiClient);

  readonly #likedIds = signal<ReadonlySet<number>>(new Set());
  readonly likedIds = this.#likedIds.asReadonly();

  isLiked(postId: number): boolean {
    return this.#likedIds().has(postId);
  }

  /**
   * Likes the post. A 400/409 means "already liked" (state we couldn't know),
   * which counts as success.
   */
  like(postId: number): Observable<void> {
    this.setLiked(postId, true);
    return this.api.call(likePost$Json, { id: postId }).pipe(
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 || error.status === 409) return of(undefined);
        this.setLiked(postId, false);
        return throwError(() => error);
      }),
    );
  }

  unlike(postId: number): Observable<void> {
    this.setLiked(postId, false);
    return this.api.call(unlikePost, { id: postId }).pipe(
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) return of(undefined);
        this.setLiked(postId, true);
        return throwError(() => error);
      }),
    );
  }

  delete(postId: number): Observable<void> {
    return this.api.call(deletePost, { id: postId }).pipe(
      map(() => undefined),
      tap(() => this.setLiked(postId, false)),
    );
  }

  private setLiked(postId: number, liked: boolean): void {
    this.#likedIds.update((ids) => {
      const next = new Set(ids);
      if (liked) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }
}
