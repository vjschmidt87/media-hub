import { Component, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p class="spinner-text">{{ message || t.t('loading.default') }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      gap: 1rem;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .spinner-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  readonly t = inject(TranslationService);
}
