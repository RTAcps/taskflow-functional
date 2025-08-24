import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Report, ProjectMetrics, ProjectTrend } from '../../models/analytics.model';
import { TaskStatus } from '../../models/project.model';

@Component({
  selector: 'app-analytics-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="analytics-report-container" [ngClass]="{'standalone': isStandalone}">
      <section class="report-header" *ngIf="isStandalone">
        <h2>{{ report.config.name }}</h2>
        <p class="date">{{ report.generatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
      </section>

      <section class="metrics-section">
        <h3 *ngIf="isStandalone">Métricas do Projeto</h3>
        <h3 *ngIf="!isStandalone">Análise de Projetos</h3>
        <div class="metrics-grid">
          <div class="metric-card tasks-total" *ngIf="isStandalone">
            <span class="metric-label">Tarefas Totais</span>
            <span class="metric-value">{{ report.metrics.totalTasks }}</span>
          </div>
          <div class="metric-card tasks-completed" *ngIf="isStandalone">
            <span class="metric-label">Tarefas Concluídas</span>
            <span class="metric-value">{{ report.metrics.completedTasks }}</span>
          </div>
          <div class="metric-card projects-active">
            <span class="metric-label">Projetos Ativos</span>
            <span class="metric-value">{{ activeProjectsCount }}</span>
          </div>
          <div class="metric-card tasks-total">
            <span class="metric-label">Tarefas Totais</span>
            <span class="metric-value">{{ report.metrics.totalTasks }}</span>
          </div>
          <div class="metric-card completion-rate">
            <span class="metric-label">Taxa de Conclusão</span>
            <span class="metric-value">{{ report.metrics.completionRate }}%</span>
          </div>
          <div class="metric-card tasks-overdue">
            <span class="metric-label">Tarefas Atrasadas</span>
            <span class="metric-value">{{ report.metrics.overdueTasksCount }}</span>
          </div>
        </div>
      </section>

      <section class="trends-section" *ngIf="report.trends && report.trends.length > 0">
        <h3>Tendências</h3>
        <div class="trends-chart">
          <table class="trends-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Tarefas Concluídas</th>
                <th>Tarefas Adicionadas</th>
                <th>Tarefas Ativas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trend of report.trends">
                <td>{{ trend.period }}</td>
                <td>{{ trend.completedTasks }}</td>
                <td>{{ trend.addedTasks }}</td>
                <td>{{ trend.activeTasksCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="status-section" *ngIf="hasStatusDistribution()">
        <h3>Distribuição por Status</h3>
        <div class="status-distribution">
          <div *ngFor="let status of getStatusKeys()" class="status-item">
            <span class="status-label">{{ status }}</span>
            <div class="status-bar">
              <div 
                class="status-fill" 
                [ngStyle]="{ 'width': getStatusPercentage(status) + '%' }"
                [ngClass]="'status-' + status.toLowerCase()"
              ></div>
            </div>
            <span class="status-count">{{ getStatusCount(status) }}</span>
          </div>
        </div>
      </section>

      <section class="recommendations-section" *ngIf="report.recommendations && report.recommendations.length > 0">
        <h3>Recomendações</h3>
        <ul class="recommendations-list">
          <li *ngFor="let rec of report.recommendations">{{ rec }}</li>
        </ul>
      </section>

      <section class="recent-reports" *ngIf="isStandalone">
        <div class="section-header">
          <h3>Relatórios Recentes</h3>
          <a routerLink="/reports/new" class="btn-create">Novo Relatório</a>
        </div>
        
        <div class="reports-list">
          <div class="report-item">
            <span class="report-name">Análise de Sprint Q2 2025</span>
            <span class="report-date">15/07/2025</span>
            <a routerLink="/reports/1" class="view-link">Visualizar</a>
          </div>
          <div class="report-item">
            <span class="report-name">Produtividade da Equipe</span>
            <span class="report-date">02/08/2025</span>
            <a routerLink="/reports/2" class="view-link">Visualizar</a>
          </div>
          <div class="report-item">
            <span class="report-name">Análise de Desempenho</span>
            <span class="report-date">20/08/2025</span>
            <a routerLink="/reports/3" class="view-link">Visualizar</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .analytics-report-container {
      background-color: var(--surface-card);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .analytics-report-container.standalone {
      max-width: 1200px;
      margin: 0 auto;
    }

    .report-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .report-header h2 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .report-header .date {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    section {
      margin-bottom: 2rem;
    }

    section h3 {
      color: var(--text-color);
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .metric-card {
      background-color: var(--surface-section);
      border-radius: 10px;
      padding: 1.2rem;
      text-align: center;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    
    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }
    
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-400));
    }
    
    .metric-card.projects-active::before {
      background: linear-gradient(90deg, #3B82F6, #60A5FA);
    }
    
    .metric-card.tasks-total::before {
      background: linear-gradient(90deg, #8B5CF6, #A78BFA);
    }
    
    .metric-card.completion-rate::before {
      background: linear-gradient(90deg, #10B981, #34D399);
    }
    
    .metric-card.tasks-overdue::before {
      background: linear-gradient(90deg, #EF4444, #F87171);
    }
    
    .metric-card.projects-active .metric-value {
      background: linear-gradient(45deg, #3B82F6, #60A5FA);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .metric-card.tasks-total .metric-value {
      background: linear-gradient(45deg, #8B5CF6, #A78BFA);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .metric-card.completion-rate .metric-value {
      background: linear-gradient(45deg, #10B981, #34D399);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .metric-card.tasks-overdue .metric-value {
      background: linear-gradient(45deg, #EF4444, #F87171);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .metric-card.tasks-completed::before {
      background: linear-gradient(90deg, #10B981, #34D399);
    }
    
    .metric-card.tasks-completed .metric-value {
      background: linear-gradient(45deg, #10B981, #34D399);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .metric-label {
      display: block;
      color: var(--text-color-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
      letter-spacing: 0.5px;
    }

    .metric-value {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(45deg, var(--primary-color), var(--primary-600));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 0.5rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      letter-spacing: -0.5px;
    }

    .trends-chart {
      overflow-x: auto;
    }

    .trends-table {
      width: 100%;
      border-collapse: collapse;
    }

    .trends-table th, .trends-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--surface-border);
    }

    .trends-table th {
      background-color: var(--surface-section);
      color: var(--text-color);
      font-weight: 600;
    }

    .status-distribution {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-label {
      width: 100px;
      color: var(--text-color);
    }

    .status-bar {
      flex: 1;
      height: 16px;
      background-color: var(--surface-section);
      border-radius: 8px;
      overflow: hidden;
    }

    .status-fill {
      height: 100%;
      border-radius: 8px;
    }

    .status-count {
      width: 40px;
      text-align: right;
      color: var(--text-color-secondary);
    }

    .status-done {
      background-color: var(--success-color);
    }

    .status-in_progress {
      background-color: var(--info-color);
    }

    .status-todo {
      background-color: var(--warning-color);
    }

    .status-review {
      background-color: var(--primary-color);
    }

    .status-blocked {
      background-color: var(--error-color);
    }

    .recommendations-list {
      padding-left: 1.5rem;
    }

    .recommendations-list li {
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }
    
    /* Estilos para a seção de relatórios recentes */
    .recent-reports {
      margin-top: 2rem;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .btn-create {
      background-color: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    
    .btn-create:hover {
      background-color: var(--primary-600);
    }
    
    .reports-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .report-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: var(--surface-section);
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .report-item:hover {
      background-color: var(--surface-hover);
    }
    
    .report-name {
      font-weight: 500;
      color: var(--text-color);
    }
    
    .report-date {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }
    
    .view-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    
    .view-link:hover {
      color: var(--primary-600);
      text-decoration: underline;
    }
  `]
})
export class AnalyticsReportComponent {
  @Input() report!: Report;
  @Input() isStandalone: boolean = true;
  
  /**
   * Contagem de projetos ativos
   */
  get activeProjectsCount(): number {
    return this.report?.config?.projectIds?.length || 0;
  }

  /**
   * Verifica se o relatório tem dados de distribuição por status
   */
  hasStatusDistribution(): boolean {
    return this.report && 
           this.report.metrics && 
           this.report.metrics.tasksByStatus && 
           Object.keys(this.report.metrics.tasksByStatus).length > 0;
  }

  /**
   * Obtém as chaves do objeto de status
   */
  getStatusKeys(): string[] {
    if (!this.hasStatusDistribution()) return [];
    return Object.keys(this.report.metrics.tasksByStatus);
  }

  /**
   * Obtém o número de tarefas para um status específico
   */
  getStatusCount(status: string): number {
    if (!this.hasStatusDistribution()) return 0;
    
    // Convert the string status to a TaskStatus enum value
    const taskStatusKey = status as keyof typeof TaskStatus;
    const taskStatus = TaskStatus[taskStatusKey];
    
    return this.report.metrics.tasksByStatus[taskStatus] || 0;
  }

  /**
   * Calcula a porcentagem para um status específico
   */
  getStatusPercentage(status: string): number {
    if (!this.hasStatusDistribution() || this.report.metrics.totalTasks === 0) return 0;
    const count = this.getStatusCount(status);
    return Math.round((count / this.report.metrics.totalTasks) * 100);
  }
}
