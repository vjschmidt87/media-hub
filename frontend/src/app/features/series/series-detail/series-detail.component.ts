import { Component, ChangeDetectionStrategy, inject, signal, Input, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '@core/i18n/translation.service';
import { SeriesService } from '@core/services/series.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { Series, Episode } from '@core/models/media.models';

interface SeasonGroup {
  season: number;
  episodes: Episode[];
}

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="series-page">
      <div class="container">
        <button class="back-btn" (click)="goBack()">{{ t.t('series.back') }}</button>

        @if (loading()) {
          <app-loading-spinner />
        } @else if (error()) {
          <app-error-message [message]="error()" (retry)="load()" />
        } @else if (series()) {
          <div class="series-layout">
            <aside class="series-aside">
              <div class="poster-wrapper">
                @if (series()!.posterUrl) {
                  <img [src]="series()!.posterUrl" [alt]="series()!.title" class="poster" />
                } @else {
                  <div class="poster-placeholder">🎬</div>
                }
              </div>
            </aside>

            <div class="series-main">
              <div class="series-meta">
                <span class="type-badge type-{{ series()!.type.toLowerCase() }}">{{ series()!.type }}</span>
                @if (series()!.year) {
                  <span class="year">{{ series()!.year }}</span>
                }
              </div>

              <h1 class="series-title">{{ series()!.title }}</h1>

              @if (series()!.genres?.length) {
                <div class="genres">
                  @for (genre of series()!.genres; track genre) {
                    <span class="genre-chip">{{ genre }}</span>
                  }
                </div>
              }

              @if (series()!.description) {
                <p class="description">{{ series()!.description }}</p>
              }

              <div class="watchlist-actions">
                @if (!inWatchlist()) {
                  <button class="btn btn-primary" (click)="addToWatchlist()">
                    + {{ t.t('series.addWatchlist') }}
                  </button>
                } @else {
                  <span class="in-watchlist-badge">✓ {{ t.t('series.inWatchlist') }}</span>
                }
              </div>

              <div class="episodes-section">
                <h2>{{ t.t('series.episodes') }}</h2>
                @for (group of seasonGroups(); track group.season) {
                  <div class="season-group">
                    <h3 class="season-header">{{ t.t('series.season') }} {{ group.season }}</h3>
                    <div class="episode-list">
                      @for (ep of group.episodes; track ep.id) {
                        <div class="episode-row">
                          <span class="ep-badge">S{{ pad(group.season) }}E{{ pad(ep.episodeNumber) }}</span>
                          <span class="ep-title">{{ ep.title }}</span>
                          @if (ep.durationMinutes) {
                            <span class="ep-duration">{{ ep.durationMinutes }}min</span>
                          }
                          <button class="btn btn-primary btn-sm" (click)="watchEpisode(ep, group.season)">
                            ▶ {{ t.t('series.watch') }}
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './series-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeriesDetailComponent implements OnInit {
  @Input() id!: string;

  readonly t = inject(TranslationService);
  private readonly seriesService = inject(SeriesService);
  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly series = signal<Series | null>(null);
  readonly inWatchlist = signal(false);

  readonly seasonGroups = computed<SeasonGroup[]>(() => {
    const s = this.series();
    if (!s?.episodes) return [];
    const groups = new Map<number, Episode[]>();
    s.episodes.forEach(ep => {
      const season = ep.seasonNumber ?? 1;
      if (!groups.has(season)) groups.set(season, []);
      groups.get(season)!.push(ep);
    });
    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([season, episodes]) => ({
        season,
        episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
      }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const numId = parseInt(this.id, 10);
    if (isNaN(numId)) {
      this.error.set('Invalid series ID.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.seriesService.getById(numId).subscribe({
      next: (s) => { this.series.set(s); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to load series.'); this.loading.set(false); },
    });
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  addToWatchlist(): void {
    const s = this.series();
    if (!s) return;
    this.watchlistService.addToWatchlist(s.id).subscribe({
      next: () => this.inWatchlist.set(true),
      error: () => {},
    });
  }

  watchEpisode(ep: Episode, season: number): void {
    const s = this.series();
    const epCode = `S${this.pad(season)}E${this.pad(ep.episodeNumber)}`;
    this.router.navigate(['/player'], {
      queryParams: {
        src: ep.sourceUrl,
        title: s?.title ?? '',
        episode: epCode,
      },
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
