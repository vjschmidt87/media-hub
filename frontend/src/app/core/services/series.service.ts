import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Series } from '@core/models/media.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/series`;

  getById(id: number): Observable<Series> {
    return this.http.get<Series>(`${this.base}/${id}`);
  }
}
