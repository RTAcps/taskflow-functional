import { bootstrapApplication } from '@angular/platform-browser';
import { AppFunctionalComponent } from './app/app.component';
import { appFunctionalConfig } from './app/app.config';

bootstrapApplication(AppFunctionalComponent, appFunctionalConfig)
  .catch(err => console.error(err));
