import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResult } from '@core/models/media.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/search`;

  search(query: string, type?: string): Observable<SearchResult[]> {
    let params = new HttpParams().set('q', query);
    if (type && type !== 'all') params = params.set('type', type);
    return this.http.get<SearchResult[]>(this.base, { params });
  }
}
