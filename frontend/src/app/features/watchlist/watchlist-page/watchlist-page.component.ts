import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '@core/i18n/translation.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { WatchlistEntry, WatchStatus } from '@core/models/media.models';

@Component({
  selector: 'app-watchlist-page',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="watchlist-page">
      <div class="container">
        <h1 class="page-title">{{ t.t('watchlist.title') }}</h1>

        @if (loading()) {
          <app-loading-spinner />
        } @else if (entries().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📋</span>
            <h2>{{ t.t('watchlist.empty') }}</h2>
            <p>{{ t.t('watchlist.emptyHint') }}</p>
            <button class="btn btn-primary" (click)="router.navigate(['/search'])">
              {{ t.t('watchlist.goSearch') }}
            </button>
          </div>
        } @else {
          <div class="watchlist-grid">
            @for (entry of entries(); track entry.id) {
              <div class="entry-card">
                <div class="entry-poster">
                  @if (entry.posterUrl) {
                    <img [src]="entry.posterUrl" [alt]="entry.seriesTitle" />
                  } @else {
                    <div class="poster-placeholder">🎬</div>
                  }
                </div>

                <div class="entry-info">
                  <h3 class="entry-title">{{ entry.seriesTitle }}</h3>

                  <span class="status-badge status-{{ entry.status.toLowerCase() }}">
                    {{ getStatusLabel(entry.status) }}
                  </span>

                  <div class="progress-section">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="getProgress(entry)"></div>
                    </div>
                    <p class="progress-text">
                      {{ t.t('watchlist.episodes', { watched: entry.episodesWatched, total: entry.totalEpisodes || '?' }) }}
                    </p>
                  </div>

                  <div class="entry-actions">
                    <select
                      class="status-select"
                      [value]="entry.status"
                      (change)="changeStatus(entry, $any($event.target).value)"
                    >
                      <option value="PLAN_TO_WATCH">{{ t.t('watchlist.statusPlan') }}</option>
                      <option value="WATCHING">{{ t.t('watchlist.statusWatching') }}</option>
                      <option value="COMPLETED">{{ t.t('watchlist.statusCompleted') }}</option>
                    </select>

                    <button class="btn btn-danger btn-sm" (click)="remove(entry)">
                      {{ t.t('watchlist.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './watchlist-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistPageComponent implements OnInit {
  readonly t = inject(TranslationService);
  readonly router = inject(Router);
  private readonly watchlistService = inject(WatchlistService);

  readonly loading = signal(true);
  readonly entries = signal<WatchlistEntry[]>([]);

  ngOnInit(): void {
    this.watchlistService.getWatchlist().subscribe({
      next: (data) => { this.entries.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getStatusLabel(status: WatchStatus): string {
    const map: Record<WatchStatus, string> = {
      PLAN_TO_WATCH: this.t.t('watchlist.statusPlan'),
      WATCHING: this.t.t('watchlist.statusWatching'),
      COMPLETED: this.t.t('watchlist.statusCompleted'),
    };
    return map[status] ?? status;
  }

  getProgress(entry: WatchlistEntry): number {
    if (!entry.totalEpisodes) return 0;
    return Math.min(100, (entry.episodesWatched / entry.totalEpisodes) * 100);
  }

  changeStatus(entry: WatchlistEntry, status: WatchStatus): void {
    this.watchlistService.updateStatus(entry.id, status).subscribe({
      next: (updated) => {
        this.entries.update(list => list.map(e => e.id === updated.id ? updated : e));
      },
    });
  }

  remove(entry: WatchlistEntry): void {
    this.watchlistService.removeFromWatchlist(entry.id).subscribe({
      next: () => this.entries.update(list => list.filter(e => e.id !== entry.id)),
    });
  }
}
