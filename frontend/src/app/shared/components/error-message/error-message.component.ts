import { Component, ChangeDetectionStrategy, inject, Input, Output, EventEmitter } from '@angular/core';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="error-container">
      <span class="error-icon">⚠️</span>
      <div class="error-content">
        <h3>{{ t.t('error.title') }}</h3>
        <p>{{ message || t.t('error.default') }}</p>
        @if (showRetry) {
          <button class="retry-btn" (click)="retry.emit()">{{ t.t('error.tryAgain') }}</button>
        }
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin: 1.5rem 0;
    }
    .error-icon { font-size: 1.5rem; }
    .error-content h3 { margin: 0 0 0.25rem; font-size: 0.9375rem; color: #991b1b; }
    .error-content p { margin: 0; font-size: 0.875rem; color: #991b1b; }
    .retry-btn {
      margin-top: 0.75rem;
      padding: 0.375rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .retry-btn:hover { background: #dc2626; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  @Input() message?: string;
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
  readonly t = inject(TranslationService);
}
