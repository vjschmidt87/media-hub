import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface StreamResolveResponse {
  streamUrl: string;
  originalUrl: string;
  resolved: boolean;
}

@Injectable({ providedIn: 'root' })
export class StreamService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/stream`;

  resolve(url: string): Observable<StreamResolveResponse> {
    return this.http.get<StreamResolveResponse>(`${this.base}/resolve`, {
      params: { url },
    });
  }
}
