import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '@core/i18n/translation.service';
import { SearchService } from '@core/services/search.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { SearchResult } from '@core/models/media.models';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="search-page">
      <div class="search-hero">
        <h1>{{ t.t('search.title') }}</h1>
        <div class="search-bar">
          <input
            class="search-input"
            type="text"
            [(ngModel)]="query"
            [placeholder]="t.t('search.placeholder')"
            (keydown.enter)="doSearch()"
          />
          <button class="btn btn-primary search-btn" (click)="doSearch()" [disabled]="loading()">
            🔍
          </button>
        </div>

        <div class="filter-chips">
          @for (f of filters; track f.value) {
            <button
              class="chip"
              [class.active]="activeType() === f.value"
              (click)="activeType.set(f.value)"
            >
              {{ t.t(f.labelKey) }}
            </button>
          }
        </div>
      </div>

      <div class="search-content container">
        @if (loading()) {
          <app-loading-spinner [message]="t.t('search.loading')" />
        } @else if (error()) {
          <app-error-message [message]="error()" (retry)="doSearch()" />
        } @else if (hasSearched() && filteredResults().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🎬</span>
            <h2>{{ t.t('search.noResults') }}</h2>
            <p>{{ t.t('search.noResultsHint') }}</p>
          </div>
        } @else if (filteredResults().length > 0) {
          <p class="results-count">{{ t.t('search.results', { count: filteredResults().length }) }}</p>
          <div class="results-grid">
            @for (result of filteredResults(); track result.id) {
              <div class="result-card" (click)="openResult(result)">
                <div class="result-poster">
                  @if (result.posterUrl) {
                    <img [src]="result.posterUrl" [alt]="result.title" />
                  } @else {
                    <div class="poster-placeholder">🎬</div>
                  }
                  <span class="type-badge" [class]="'type-' + result.type.toLowerCase()">{{ result.type }}</span>
                </div>
                <div class="result-info">
                  <h3 class="result-title">{{ result.title }}</h3>
                  @if (result.year) {
                    <p class="result-year">{{ result.year }}</p>
                  }
                  <span class="source-badge">{{ result.sourceName }}</span>
                  <button class="btn btn-primary btn-sm view-btn" (click)="openResult(result); $event.stopPropagation()">
                    {{ t.t('search.viewDetails') }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './search-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent {
  readonly t = inject(TranslationService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  query = '';
  readonly loading = signal(false);
  readonly error = signal('');
  readonly hasSearched = signal(false);
  readonly results = signal<SearchResult[]>([]);
  readonly activeType = signal<string>('all');

  readonly filteredResults = computed(() => {
    const type = this.activeType();
    if (type === 'all') return this.results();
    return this.results().filter(r => r.type === type);
  });

  readonly filters = [
    { value: 'all', labelKey: 'search.filterAll' },
    { value: 'anime', labelKey: 'search.filterAnime' },
    { value: 'series', labelKey: 'search.filterSeries' },
    { value: 'movies', labelKey: 'search.filterMovie' },
  ];

  doSearch(): void {
    if (!this.query.trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.hasSearched.set(true);

    const type = this.activeType() !== 'all' ? this.activeType() : undefined;

    this.searchService.search(this.query.trim(), type).subscribe({
      next: (results) => {
        this.results.set(results);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Search failed.');
        this.loading.set(false);
      },
    });
  }

  openResult(result: SearchResult): void {
    this.router.navigate(['/series', result.id]);
  }
}
