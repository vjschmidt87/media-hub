import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrawlerSource, SearchSettings } from '@core/models/media.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  getSources(): Observable<CrawlerSource[]> {
    return this.http.get<CrawlerSource[]>(`${this.base}/sources`);
  }

  addSource(source: Omit<CrawlerSource, 'id'>): Observable<CrawlerSource> {
    return this.http.post<CrawlerSource>(`${this.base}/sources`, source);
  }

  toggleSource(id: number, active: boolean): Observable<CrawlerSource> {
    return this.http.patch<CrawlerSource>(`${this.base}/sources/${id}`, { active });
  }

  removeSource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/sources/${id}`);
  }

  getSettings(): Observable<SearchSettings> {
    return this.http.get<SearchSettings>(`${this.base}/settings`);
  }

  updateSettings(settings: SearchSettings): Observable<SearchSettings> {
    return this.http.put<SearchSettings>(`${this.base}/settings`, settings);
  }
}
