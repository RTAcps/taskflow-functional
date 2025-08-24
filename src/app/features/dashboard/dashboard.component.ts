import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/project.model';
import { StorageService } from '../../services/storage.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ProjectMetrics, Report } from '../../models/analytics.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Análise de Projetos</h1>
        <p>Visão geral e análise baseada em dados do progresso dos projetos</p>
      </header>

      <section class="metrics-cards">
        <div class="card">
          <h3>Projetos Ativos</h3>
          <div class="metric">{{ (metrics$ | async)?.activeProjects || 0 }}</div>
        </div>
        
        <div class="card">
          <h3>Tarefas Totais</h3>
          <div class="metric">{{ (metrics$ | async)?.totalTasks || 0 }}</div>
        </div>
        
        <div class="card">
          <h3>Taxa de Conclusão</h3>
          <div class="metric">{{ (metrics$ | async)?.completionRate || 0 }}%</div>
        </div>
        
        <div class="card">
          <h3>Tarefas Atrasadas</h3>
          <div class="metric">{{ (metrics$ | async)?.overdueTasks || 0 }}</div>
        </div>
      </section>

      <section class="recent-reports">
        <div class="section-header">
          <h2>Relatórios Recentes</h2>
          <a routerLink="/reports/new" class="btn-create">Novo Relatório</a>
        </div>
        
        <div class="reports-list">
          <div *ngIf="(reports$ | async)?.length === 0" class="empty-state">
            <p>Nenhum relatório encontrado. Crie seu primeiro relatório para ver análises detalhadas.</p>
          </div>
          
          <div *ngFor="let report of (reports$ | async)" class="report-card">
            <h3>{{ report.config.name }}</h3>
            <p class="date">Gerado em: {{ report.generatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
            <div class="metrics-summary">
              <div class="metric-item">
                <span class="label">Tarefas:</span>
                <span class="value">{{ report.metrics.totalTasks }}</span>
              </div>
              <div class="metric-item">
                <span class="label">Concluídas:</span>
                <span class="value">{{ report.metrics.completedTasks }}</span>
              </div>
              <div class="metric-item">
                <span class="label">Taxa:</span>
                <span class="value">{{ report.metrics.completionRate }}%</span>
              </div>
            </div>
            <div class="actions">
              <a [routerLink]="['/reports', report.id]" class="btn-view">Ver Detalhes</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      margin-bottom: 2rem;
    }
    
    .dashboard-header h1 {
      font-size: 2rem;
      color: var(--primary-color, #3B82F6);
      margin-bottom: 0.5rem;
    }
    
    .dashboard-header p {
      color: var(--text-color-secondary, #6c757d);
      font-size: 1.1rem;
    }
    
    .metrics-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .card {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      text-align: center;
    }
    
    .card h3 {
      color: var(--text-color-secondary, #6c757d);
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }
    
    .metric {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary-color, #3B82F6);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .section-header h2 {
      font-size: 1.5rem;
      color: var(--text-color, #495057);
    }
    
    .btn-create {
      background-color: var(--primary-color, #3B82F6);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
    }
    
    .reports-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .report-card {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .report-card h3 {
      color: var(--text-color, #495057);
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    .date {
      color: var(--text-color-secondary, #6c757d);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    
    .metrics-summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .label {
      font-size: 0.75rem;
      color: var(--text-color-secondary, #6c757d);
    }
    
    .value {
      font-weight: 600;
      color: var(--text-color, #495057);
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-view {
      color: var(--primary-color, #3B82F6);
      text-decoration: none;
      font-weight: 500;
    }
    
    .empty-state {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      grid-column: 1 / -1;
      color: var(--text-color-secondary, #6c757d);
    }
  `]
})
export class DashboardComponent implements OnInit {
  projects$!: Observable<ReadonlyArray<Project>>;
  reports$!: Observable<ReadonlyArray<Report>>;
  metrics$!: Observable<{
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
  }>;

  constructor(
    private readonly storageService: StorageService,
    private readonly analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    // Carregar projetos
    const projects = this.storageService.loadProjects();
    this.projects$ = of(projects);
    
    // Carregar relatórios recentes (últimos 5)
    this.reports$ = this.analyticsService.getReports().pipe(
      map(reports => [...reports].sort((a, b) => 
        b.generatedAt.getTime() - a.generatedAt.getTime()).slice(0, 5)
      )
    );
    
    // Calcular métricas gerais
    this.metrics$ = this.projects$.pipe(
      map(projects => this.calculateDashboardMetrics(projects))
    );
  }
  
  /**
   * Calcula métricas gerais para o dashboard
   * Exemplo de função pura que recebe dados e retorna um novo objeto calculado
   */
  private calculateDashboardMetrics(projects: ReadonlyArray<Project>) {
    // Contar projetos ativos
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    
    // Extrair todas as tarefas
    const allTasks = projects.flatMap(p => p.tasks);
    
    // Contar tarefas concluídas
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
    
    // Calcular taxa de conclusão
    const completionRate = allTasks.length > 0
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;
    
    // Contar tarefas atrasadas
    const now = new Date();
    const overdueTasks = allTasks.filter(t => 
      t.status !== 'DONE' && t.dueDate && t.dueDate < now
    ).length;
    
    return {
      activeProjects,
      totalTasks: allTasks.length,
      completedTasks,
      completionRate,
      overdueTasks
    };
  }
}

// Helper para importar
function of<T>(value: T): Observable<T> {
  return new Observable<T>(subscriber => {
    subscriber.next(value);
    subscriber.complete();
  });
}
