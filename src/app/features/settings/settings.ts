import { Component } from '@angular/core';
import { SettingsPage } from './settings-page';

@Component({
  selector: 'app-settings',
  imports: [SettingsPage],
  template: `<app-settings-page />`,
})
export class SettingsComponent {}
