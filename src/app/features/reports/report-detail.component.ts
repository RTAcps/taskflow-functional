import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, switchMap, map, of, catchError } from 'rxjs';
import { Report } from '../../models/analytics.model';
import { AnalyticsService } from '../../services/analytics.service';
import { formatDate } from '../../utils/date.utils';
import { AnalyticsReportComponent } from './analytics-report.component';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AnalyticsReportComponent],
  template: `
    <div class="report-container">
      <div class="report-header">
        <div class="back-button">
          <a routerLink="/dashboard" class="btn-back">&larr; Voltar para Dashboard</a>
        </div>
        <h1>Relatório de Análise</h1>
        <p class="date" *ngIf="report$ | async as report">Gerado em: {{ report.generatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Carregando relatório...</p>
      </div>

      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
        <button (click)="navigateToDashboard()" class="btn-primary">Voltar ao Dashboard</button>
      </div>

      <ng-container *ngIf="report$ | async as reportData">
        <!-- We need to cast the report in the component class -->
        <app-analytics-report [report]="reportData"></app-analytics-report>
        
        <section class="actions-section">
          <button (click)="downloadReport(reportData)" class="btn-primary">Baixar Relatório</button>
          <button (click)="deleteReport(reportData)" class="btn-secondary">Excluir Relatório</button>
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .report-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .report-header {
      margin-bottom: 2rem;
    }

    .back-button {
      margin-bottom: 1rem;
    }

    .btn-back {
      color: var(--primary-color, #3B82F6);
      text-decoration: none;
      font-weight: 500;
    }

    h1 {
      color: var(--text-color, #495057);
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .date {
      color: var(--text-color-secondary, #6c757d);
      font-size: 0.9rem;
    }

    section {
      margin-bottom: 2.5rem;
    }

    h2 {
      color: var(--text-color, #495057);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border, #dee2e6);
      padding-bottom: 0.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      text-align: center;
    }

    .metric-card h3 {
      color: var(--text-color-secondary, #6c757d);
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }

    .value {
      font-size: 1.75rem;
      font-weight: bold;
      color: var(--primary-color, #3B82F6);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .status-card {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      text-align: center;
    }

    .status-card h3 {
      color: var(--text-color-secondary, #6c757d);
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .trends-table-container,
    .performance-table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--surface-border, #dee2e6);
    }

    th {
      color: var(--text-color, #495057);
      font-weight: 600;
      background-color: var(--surface-section, #f8f9fa);
    }

    td {
      color: var(--text-color, #495057);
    }

    .recommendations-list {
      background-color: var(--surface-card, #ffffff);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin: 0;
      list-style-position: inside;
    }

    .recommendations-list li {
      margin-bottom: 0.75rem;
      line-height: 1.5;
      color: var(--text-color, #495057);
    }

    .recommendations-list li:last-child {
      margin-bottom: 0;
    }

    .actions-section {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-download {
      background-color: var(--primary-color, #3B82F6);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-delete {
      background-color: var(--surface-card, #ffffff);
      color: #dc3545;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 1px solid #dc3545;
      font-weight: 500;
      cursor: pointer;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-secondary, #6c757d);
    }

    .error-message {
      background-color: #fff5f5;
      border: 1px solid #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      margin: 2rem 0;
    }

    .btn-primary {
      background-color: var(--primary-color, #3B82F6);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
    }
  `]
})
export class ReportDetailComponent implements OnInit {
  report$!: Observable<Report | undefined>;
  loading = true;
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('id');
    if (!reportId) {
      this.error = 'ID do relatório não fornecido';
      this.loading = false;
      return;
    }

    this.report$ = this.analyticsService.getReportById(reportId).pipe(
      map(report => {
        if (!report) {
          throw new Error('Relatório não encontrado');
        }
        return report;
      }),
      catchError(err => {
        this.error = err.message || 'Erro ao carregar relatório';
        this.loading = false;
        return of(null as unknown as Report);
      })
    );

    this.report$.subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Erro ao carregar relatório';
        this.loading = false;
      }
    });
  }

  /**
   * Formata o status da tarefa para exibição
   * @param status String do enum TaskStatus
   * @returns Versão formatada para exibição
   */
  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'TODO': 'A Fazer',
      'IN_PROGRESS': 'Em Progresso',
      'REVIEW': 'Em Revisão',
      'DONE': 'Concluído',
      'BACKLOG': 'Backlog'
    };
    return statusMap[status] || status;
  }

  /**
   * Converte o objeto de status para array para iterar no template
   */
  getStatusEntries(report: Report): [string, number][] {
    return Object.entries(report.metrics.tasksByStatus);
  }

  /**
   * Baixa o relatório como arquivo JSON
   */
  downloadReport(report: any): void {
    try {
      if (!report || !report.id) {
        alert('Relatório inválido');
        return;
      }
      
      // Formatar datas para string
      const formattedReport = {
        ...report,
        generatedAt: formatDate(new Date(report.generatedAt)),
        config: {
          ...report.config,
          dateRange: report.config.dateRange ? {
            start: formatDate(new Date(report.config.dateRange.start)),
            end: formatDate(new Date(report.config.dateRange.end))
          } : undefined
        }
      };
      
      // Criar blob e link para download
      const reportJson = JSON.stringify(formattedReport, null, 2);
      const blob = new Blob([reportJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${report.id}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      alert('Erro ao baixar relatório');
    }
  }

  /**
   * Exclui o relatório atual
   */
  deleteReport(report: any): void {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      const reportId = report.id;
      this.analyticsService.deleteReport(reportId).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            alert('Erro ao excluir relatório');
          }
        },
        error: () => alert('Erro ao excluir relatório')
      });
    }
  }

  /**
   * Navega de volta para o dashboard
   */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
