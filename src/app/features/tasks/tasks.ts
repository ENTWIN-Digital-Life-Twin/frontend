import { Component } from '@angular/core';
import { TasksPage } from './tasks-page';

@Component({
  selector: 'app-tasks',
  imports: [TasksPage],
  template: `<app-tasks-page />`,
})
export class TasksComponent {}
