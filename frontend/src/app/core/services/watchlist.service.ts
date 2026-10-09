import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WatchlistEntry, WatchStatus } from '@core/models/media.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/watchlist`;

  getWatchlist(): Observable<WatchlistEntry[]> {
    return this.http.get<WatchlistEntry[]>(this.base);
  }

  addToWatchlist(seriesId: number): Observable<WatchlistEntry> {
    return this.http.post<WatchlistEntry>(this.base, { seriesId });
  }

  updateStatus(id: number, status: WatchStatus): Observable<WatchlistEntry> {
    return this.http.patch<WatchlistEntry>(`${this.base}/${id}`, { status });
  }

  removeFromWatchlist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
