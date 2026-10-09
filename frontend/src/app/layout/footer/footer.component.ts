import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>{{ t.t('footer.text') }}</p>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      padding: 1rem 1.5rem;
      text-align: center;

      p {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly t = inject(TranslationService);
}
