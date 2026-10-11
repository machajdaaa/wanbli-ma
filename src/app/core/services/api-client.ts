import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { ApiConfiguration } from '../api/generated/api-configuration';
import { StrictHttpResponse } from '../api/generated/strict-http-response';

type ApiFn<P, R> = (http: HttpClient, rootUrl: string, params: P, context?: HttpContext) => Observable<StrictHttpResponse<R>>;

interface Paged<T> {
  items: T[];
  page: number;
  hasNextPage?: boolean;
  totalPages: number;
}

/**
 * Thin Observable wrapper over the generated `fn/*` functions (the generated
 * `Api` class is Promise-based). Only services in core/services use it.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  call<P, R>(fn: ApiFn<P, R>, params: P): Observable<R> {
    return fn(this.http, this.config.rootUrl, params).pipe(map((response) => response.body));
  }

  /** Follows `Page` until the last page and concatenates all items. */
  allPages<P extends { Page?: number; PageSize?: number }, T>(
    fn: ApiFn<P, Paged<T>>,
    params: P,
    pageSize = 100,
  ): Observable<T[]> {
    const fetchPage = (page: number) => this.call(fn, { ...params, Page: page, PageSize: pageSize });
    return fetchPage(1).pipe(
      expand((res) => (res.hasNextPage ?? res.page < res.totalPages) ? fetchPage(res.page + 1) : EMPTY),
      reduce<Paged<T>, T[]>((all, res) => all.concat(res.items), []),
    );
  }
}
