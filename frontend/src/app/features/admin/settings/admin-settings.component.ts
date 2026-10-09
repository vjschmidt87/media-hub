import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '@core/i18n/translation.service';
import { AdminService } from '@core/services/admin.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { SearchSettings } from '@core/models/media.models';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <div class="container">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ t.t('admin.settings.title') }}</h1>
            <p class="page-subtitle">{{ t.t('admin.settings.subtitle') }}</p>
          </div>
        </div>

        @if (loading()) {
          <app-loading-spinner />
        } @else if (settings()) {
          <div class="settings-grid">
            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.quality') }}</h3>
              <div class="options-group">
                @for (q of qualities; track q) {
                  <label class="option-chip" [class.selected]="settings()!.preferredQuality === q">
                    <input type="radio" name="quality" [value]="q" [(ngModel)]="settings()!.preferredQuality" (change)="save()" hidden />
                    {{ q }}
                  </label>
                }
              </div>
            </div>

            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.audioLang') }}</h3>
              <div class="options-group">
                @for (lang of audioLangs; track lang.code) {
                  <label class="option-chip" [class.selected]="settings()!.audioLanguage === lang.code">
                    <input type="radio" name="audioLang" [value]="lang.code" [(ngModel)]="settings()!.audioLanguage" (change)="save()" hidden />
                    {{ lang.label }}
                  </label>
                }
              </div>
            </div>

            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.subtitleLang') }}</h3>
              <div class="options-group">
                @for (lang of subtitleLangs; track lang.code) {
                  <label class="option-chip" [class.selected]="settings()!.subtitleLanguage === lang.code">
                    <input type="radio" name="subLang" [value]="lang.code" [(ngModel)]="settings()!.subtitleLanguage" (change)="save()" hidden />
                    {{ lang.label }}
                  </label>
                }
              </div>
            </div>

            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.maxResults') }}</h3>
              <div class="range-wrapper">
                <input
                  type="range"
                  class="range-input"
                  min="5"
                  max="50"
                  step="5"
                  [(ngModel)]="settings()!.maxResults"
                  (change)="save()"
                />
                <span class="range-value">{{ settings()!.maxResults }}</span>
              </div>
            </div>

            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.safeSearch') }}</h3>
              <label class="toggle-label">
                <div class="toggle-switch" [class.on]="settings()!.safeSearch" (click)="toggleSafe()">
                  <div class="toggle-knob"></div>
                </div>
                <span class="toggle-text">
                  {{ settings()!.safeSearch ? t.t('admin.settings.safeOn') : t.t('admin.settings.safeOff') }}
                </span>
              </label>
            </div>

            <div class="settings-card">
              <h3 class="card-title">{{ t.t('admin.settings.searchTimeout') }}</h3>
              <div class="range-wrapper">
                <input
                  type="range"
                  class="range-input"
                  min="5"
                  max="60"
                  step="5"
                  [(ngModel)]="settings()!.searchTimeoutSeconds"
                  (change)="save()"
                />
                <span class="range-value">{{ settings()!.searchTimeoutSeconds }}s</span>
              </div>
            </div>
          </div>

          @if (saved()) {
            <div class="save-toast">✓ {{ t.t('admin.settings.saved') }}</div>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './admin-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly settings = signal<SearchSettings | null>(null);
  readonly saved = signal(false);

  readonly qualities = ['auto', '360p', '480p', '720p', '1080p', '4K'];
  readonly audioLangs = [
    { code: 'any', label: 'Any' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'es', label: 'Spanish' },
  ];
  readonly subtitleLangs = [
    { code: 'none', label: 'None' },
    { code: 'any', label: 'Any' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'es', label: 'Spanish' },
  ];

  ngOnInit(): void {
    this.adminService.getSettings().subscribe({
      next: (data) => { this.settings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    const s = this.settings();
    if (!s) return;
    this.adminService.updateSettings(s).subscribe({
      next: (updated) => {
        this.settings.set(updated);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2000);
      },
    });
  }

  toggleSafe(): void {
    const s = this.settings();
    if (!s) return;
    this.settings.set({ ...s, safeSearch: !s.safeSearch });
    this.save();
  }
}
