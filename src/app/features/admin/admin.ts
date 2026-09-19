import { Component, inject } from '@angular/core';
import { FeaturePlaceholder } from '../../shared/components/feature-placeholder/feature-placeholder';
import { LucideShield } from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-admin',
  imports: [FeaturePlaceholder],
  template: `
    <app-feature-placeholder
      [icon]="icon"
      [title]="title()"
      [description]="description()"
    />
  `,
})
export class AdminComponent {
  protected readonly icon = LucideShield;
  private readonly languageService = inject(LanguageService);
  protected readonly title = this.languageService.translateSignal('admin.title');
  protected readonly description = this.languageService.translateSignal('admin.description');
}
