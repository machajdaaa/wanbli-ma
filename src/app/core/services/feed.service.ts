import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfiguration } from '../api/generated/api-configuration';
import { getFeed$Json, GetFeed$Json$Params } from '../api/generated/fn/feed/get-feed-json';
import { PagedResponseOfPostResponse } from '../api/generated/models';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  getFeed(params?: GetFeed$Json$Params): Observable<PagedResponseOfPostResponse> {
    return getFeed$Json(this.http, this.apiConfig.rootUrl, params).pipe(
      map((response) => response.body)
    );
  }
}
