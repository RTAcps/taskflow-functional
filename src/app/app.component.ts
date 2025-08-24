import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-functional-root',
  template: `
    <div class="app-container" [class.dark-theme]="isDarkTheme">
      <header class="app-header" *ngIf="isStandalone">
        <h1 class="app-title">📊 Análise de Projetos</h1>
        <p class="app-description">Relatórios e análises de performance de projetos e tarefas</p>
      </header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .app-container {
      height: 100%;
      background-color: var(--surface-ground, #F8F9FA);
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: var(--surface-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .app-title {
      color: var(--primary-color, #3B82F6);
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .app-description {
      color: var(--text-color-secondary, #6c757d);
      margin: 0;
    }
    
    .app-content {
      flex: 1;
      padding: 0 1rem 1rem;
      overflow-y: auto;
    }
  `],
  imports: [CommonModule, RouterOutlet, RouterModule],
  standalone: true
})
export class AppFunctionalComponent implements OnInit, OnDestroy {
  title = 'taskflow-functional';
  isStandalone = true;
  isDarkTheme = false;
  private themeSubscription?: Subscription;

  ngOnInit() {
    this.isStandalone = window.location.port === '4203';
    console.log('TaskFlow Functional running in standalone mode:', this.isStandalone);
    
    // Detectar tema da shell
    this.detectTheme();
    
    // Ouvir mudanças de tema
    window.addEventListener('shell-theme-change', this.handleThemeChange.bind(this) as EventListener);
  }
  
  ngOnDestroy() {
    // Remover listeners ao destruir
    window.removeEventListener('shell-theme-change', this.handleThemeChange.bind(this) as EventListener);
    
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
  
  /**
   * Detecta o tema atual
   * Função pura que não modifica estado global
   */
  private detectTheme(): void {
    try {
      // Verificar se a shell expôs uma função para obter o tema atual
      if (typeof (window as any).getShellTheme === 'function') {
        const shellTheme = (window as any).getShellTheme();
        this.setTheme(shellTheme === 'dark');
        return;
      }
      
      // Verificar se a shell definiu uma propriedade no window
      if ((window as any).shellTheme) {
        this.setTheme((window as any).shellTheme === 'dark');
        return;
      }
      
      // Verificar se há uma classe no body definida pela shell
      const bodyClasses = document.body.classList;
      if (bodyClasses.contains('dark-theme')) {
        this.setTheme(true);
        return;
      }
      
      // Verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark);
    } catch (error) {
      console.error('Error detecting theme:', error);
    }
  }
  
  /**
   * Manipula evento de mudança de tema
   */
  private handleThemeChange(event: CustomEvent): void {
    if (event.detail && event.detail.theme) {
      this.setTheme(event.detail.theme === 'dark');
    }
  }
  
  /**
   * Define o tema atual e aplica classes CSS
   */
  private setTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    
    // Aplicar classe no body
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    console.log('Theme set to:', isDark ? 'dark' : 'light');
  }
}
