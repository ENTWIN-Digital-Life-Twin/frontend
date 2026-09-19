import { Component } from '@angular/core';
import { SportPage } from './sport-page';

@Component({
  selector: 'app-sport',
  imports: [SportPage],
  template: `<app-sport-page />`,
})
export class SportComponent {}
