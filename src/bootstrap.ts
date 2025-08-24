/**
 * Bootstrap do Angular Application
 * Este arquivo é carregado dinamicamente pelo main.ts
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppFunctionalComponent } from './app/app.component';
import { appFunctionalConfig } from './app/app.config';

console.log('Bootstrapping TaskFlow Functional Angular application...');

// Configuração adicional para Zone.js para evitar conflitos
(window as any).Zone = (window as any).Zone || {};

bootstrapApplication(AppFunctionalComponent, appFunctionalConfig)
  .then(() => {
    console.log('TaskFlow Functional Angular application bootstrapped successfully!');
    
    // Sinalizar que a aplicação está pronta
    window.dispatchEvent(new CustomEvent('taskflow-functional-ready', {
      detail: { component: 'taskflow-functional', status: 'ready' }
    }));
  })
  .catch(err => {
    console.error('Error bootstrapping TaskFlow Functional Angular application:', err);
  });
