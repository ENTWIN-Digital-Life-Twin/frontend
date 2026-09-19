import { Component } from '@angular/core';
import { NutritionPage } from './nutrition-page';

@Component({
  selector: 'app-nutrition',
  imports: [NutritionPage],
  template: `<app-nutrition-page />`,
})
export class NutritionComponent {}
