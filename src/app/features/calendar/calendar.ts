import { Component } from '@angular/core';
import { CalendarPage } from './calendar-page';

@Component({
  selector: 'app-calendar',
  imports: [CalendarPage],
  template: ` <app-calendar-page /> `,
})
export class CalendarComponent {}
