import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '@core/i18n/translation.service';
import { AdminService } from '@core/services/admin.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { CrawlerSource } from '@core/models/media.models';

@Component({
  selector: 'app-admin-sources',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <div class="container">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ t.t('admin.sources.title') }}</h1>
            <p class="page-subtitle">{{ t.t('admin.sources.subtitle') }}</p>
          </div>
          <button class="btn btn-primary" (click)="showForm.set(true)">
            + {{ t.t('admin.sources.add') }}
          </button>
        </div>

        @if (showForm()) {
          <div class="add-form-card">
            <h3>{{ t.t('admin.sources.newSource') }}</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>{{ t.t('admin.sources.name') }}</label>
                <input class="form-input" type="text" [(ngModel)]="newName" [placeholder]="t.t('admin.sources.namePlaceholder')" />
              </div>
              <div class="form-group">
                <label>{{ t.t('admin.sources.url') }}</label>
                <input class="form-input" type="url" [(ngModel)]="newUrl" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label>{{ t.t('admin.sources.category') }}</label>
                <select class="form-input" [(ngModel)]="newCategory">
                  <option value="anime">Anime</option>
                  <option value="series">Series</option>
                  <option value="movies">Movies</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" (click)="cancelAdd()">{{ t.t('common.cancel') }}</button>
              <button class="btn btn-primary" (click)="addSource()" [disabled]="!newName || !newUrl">
                {{ t.t('admin.sources.save') }}
              </button>
            </div>
          </div>
        }

        @if (loading()) {
          <app-loading-spinner />
        } @else {
          <div class="sources-table">
            <div class="table-header">
              <span>{{ t.t('admin.sources.colName') }}</span>
              <span>{{ t.t('admin.sources.colUrl') }}</span>
              <span>{{ t.t('admin.sources.colCategory') }}</span>
              <span>{{ t.t('admin.sources.colStatus') }}</span>
              <span>{{ t.t('admin.sources.colActions') }}</span>
            </div>
            @for (source of sources(); track source.id) {
              <div class="table-row" [class.disabled]="!source.active">
                <span class="source-name">{{ source.name }}</span>
                <a class="source-url" [href]="source.url" target="_blank" rel="noopener">
                  {{ source.url }}
                </a>
                <span class="category-badge cat-{{ source.category }}">{{ source.category }}</span>
                <span class="status-toggle" (click)="toggleSource(source)">
                  <span class="toggle-indicator" [class.active]="source.active">
                    {{ source.active ? t.t('admin.sources.active') : t.t('admin.sources.inactive') }}
                  </span>
                </span>
                <div class="row-actions">
                  <button class="action-btn danger" (click)="removeSource(source.id)" title="Remove">✕</button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './admin-sources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSourcesComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly sources = signal<CrawlerSource[]>([]);
  readonly showForm = signal(false);

  newName = '';
  newUrl = '';
  newCategory = 'all';

  ngOnInit(): void {
    this.loadSources();
  }

  private loadSources(): void {
    this.loading.set(true);
    this.adminService.getSources().subscribe({
      next: (data) => { this.sources.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addSource(): void {
    if (!this.newName || !this.newUrl) return;
    this.adminService.addSource({ name: this.newName, url: this.newUrl, category: this.newCategory, active: true }).subscribe({
      next: (src) => {
        this.sources.update(list => [...list, src]);
        this.cancelAdd();
      },
    });
  }

  cancelAdd(): void {
    this.showForm.set(false);
    this.newName = '';
    this.newUrl = '';
    this.newCategory = 'all';
  }

  toggleSource(source: CrawlerSource): void {
    this.adminService.toggleSource(source.id, !source.active).subscribe({
      next: (updated) => {
        this.sources.update(list => list.map(s => s.id === updated.id ? updated : s));
      },
    });
  }

  removeSource(id: number): void {
    this.adminService.removeSource(id).subscribe({
      next: () => this.sources.update(list => list.filter(s => s.id !== id)),
    });
  }
}
