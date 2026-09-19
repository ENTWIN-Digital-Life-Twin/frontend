import { Component } from '@angular/core';
import { WellnessPage } from './wellness-page';

@Component({
  selector: 'app-wellness',
  imports: [WellnessPage],
  template: `<app-wellness-page />`,
})
export class WellnessComponent {}
