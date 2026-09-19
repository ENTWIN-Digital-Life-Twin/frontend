import { Component } from '@angular/core';
import { ProfilePage } from './profile-page';

@Component({
  selector: 'app-profile',
  imports: [ProfilePage],
  template: `<app-profile-page />`,
})
export class ProfileComponent {}
