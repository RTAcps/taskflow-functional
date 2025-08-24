import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { Project, ProjectStatus, TaskPriority, TaskStatus } from '../../models/project.model';
import { ReportConfig } from '../../models/analytics.model';
import { StorageService } from '../../services/storage.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="report-form-container">
      <header class="form-header">
        <h1>Novo Relatório</h1>
        <p>Configure os parâmetros para gerar um novo relatório de análise</p>
      </header>

      <form [formGroup]="reportForm" (ngSubmit)="onSubmit()" class="report-form">
        <div class="form-section">
          <h2>Informações Básicas</h2>
          
          <div class="form-field">
            <label for="reportName">Nome do Relatório</label>
            <input 
              type="text" 
              id="reportName" 
              formControlName="name"
              placeholder="Ex: Análise Mensal de Projetos"
            >
            <div *ngIf="reportForm.get('name')?.invalid && reportForm.get('name')?.touched" class="error-message">
              Nome do relatório é obrigatório
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Projetos</h2>
          <p class="section-description">Selecione os projetos para incluir neste relatório</p>
          
          <div class="projects-list" formArrayName="projectIds">
            <div *ngIf="(projects$ | async)?.length === 0" class="empty-state">
              <p>Nenhum projeto disponível para análise.</p>
            </div>

            <div *ngFor="let project of projects$ | async; let i = index" class="project-item">
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  [formControlName]="i"
                >
                <span class="checkbox-label">{{ project.name }}</span>
                <span class="project-status" [class]="'status-' + project.status.toLowerCase()">{{ project.status }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Período de Análise</h2>
          
          <div class="form-row">
            <div class="form-field">
              <label for="startDate">Data Inicial</label>
              <input 
                type="date" 
                id="startDate" 
                formControlName="startDate"
              >
            </div>

            <div class="form-field">
              <label for="endDate">Data Final</label>
              <input 
                type="date" 
                id="endDate" 
                formControlName="endDate"
              >
            </div>
          </div>
          
          <div *ngIf="dateRangeInvalid()" class="error-message">
            A data final deve ser posterior à data inicial
          </div>
        </div>

        <div class="form-section">
          <h2>Métricas e Agrupamento</h2>
          
          <div class="form-field">
            <label>Métricas a Incluir</label>
            <div class="checkboxes-group" formArrayName="metrics">
              <label class="checkbox-container" *ngFor="let metric of availableMetrics; let i = index">
                <input 
                  type="checkbox" 
                  [formControlName]="i"
                >
                <span class="checkbox-label">{{ metric.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-field">
            <label for="groupBy">Agrupar por</label>
            <select id="groupBy" formControlName="groupBy">
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>
        </div>
        
        <div class="form-section">
          <h2>Filtros</h2>
          
          <div class="form-row">
            <div class="form-field">
              <label>Status de Tarefa</label>
              <div class="checkboxes-group" formGroupName="filters">
                <div formArrayName="statuses">
                  <label class="checkbox-container" *ngFor="let status of taskStatuses; let i = index">
                    <input 
                      type="checkbox" 
                      [formControlName]="i"
                    >
                    <span class="checkbox-label">{{ status }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-field">
              <label>Prioridades</label>
              <div class="checkboxes-group" formGroupName="filters">
                <div formArrayName="priorities">
                  <label class="checkbox-container" *ngFor="let priority of taskPriorities; let i = index">
                    <input 
                      type="checkbox" 
                      [formControlName]="i"
                    >
                    <span class="checkbox-label">{{ priority }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="reportForm.invalid || submitting">
            {{ submitting ? 'Gerando...' : 'Gerar Relatório' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .report-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .form-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .form-header h1 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .form-section {
      background-color: var(--surface-card);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .form-section h2 {
      color: var(--text-color);
      font-size: 1.25rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .section-description {
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-row .form-field {
      flex: 1;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-color);
      font-weight: 500;
    }

    input[type="text"],
    input[type="date"],
    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      background-color: var(--surface-overlay);
      color: var(--text-color);
      font-size: 1rem;
    }

    .projects-list {
      margin-bottom: 1rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .project-item {
      padding: 0.75rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox-label {
      margin-left: 0.5rem;
    }

    .project-status {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-active {
      background-color: var(--success-color);
      color: white;
    }

    .status-completed {
      background-color: var(--info-color);
      color: white;
    }

    .status-on_hold {
      background-color: var(--warning-color);
      color: white;
    }

    .status-cancelled {
      background-color: var(--error-color);
      color: white;
    }

    .checkboxes-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--text-color);
      border: 1px solid var(--surface-border);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-secondary);
    }
  `]
})
export class ReportFormComponent implements OnInit {
  reportForm!: FormGroup;
  projects$!: Observable<ReadonlyArray<Project>>;
  submitting = false;

  // Using TypeScript enums for consistency with our models
  taskStatuses = Object.values(TaskStatus);
  taskPriorities = Object.values(TaskPriority);
  
  // Available metrics for reports
  availableMetrics = [
    { id: 'completion', label: 'Taxa de Conclusão' },
    { id: 'timeline', label: 'Progresso ao Longo do Tempo' },
    { id: 'status', label: 'Distribuição por Status' },
    { id: 'priority', label: 'Distribuição por Prioridade' },
    { id: 'performance', label: 'Desempenho da Equipe' }
  ];

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
  }

  /**
   * Initialize the form using FormBuilder
   * This showcases reactive forms with validation
   */
  private initForm(): void {
    // Get current date and 30 days ago for default date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const todayStr = this.formatDateForInput(today);
    const thirtyDaysAgoStr = this.formatDateForInput(thirtyDaysAgo);

    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      projectIds: this.fb.array([]),
      startDate: [thirtyDaysAgoStr],
      endDate: [todayStr],
      groupBy: ['week'],
      metrics: this.fb.array(this.availableMetrics.map(() => false)),
      filters: this.fb.group({
        statuses: this.fb.array(this.taskStatuses.map(() => true)),
        priorities: this.fb.array(this.taskPriorities.map(() => true))
      })
    });
  }

  /**
   * Load projects and set up checkboxes
   * Using observable for projects to follow reactive pattern
   */
  private loadProjects(): void {
    const projects = this.storageService.loadProjects();
    
    this.projects$ = of(projects).pipe(
      map((projectsList: ReadonlyArray<Project>) => {
        // Set up form array for project checkboxes
        const projectCheckboxes = this.reportForm.get('projectIds') as FormArray;
        
        // Clear existing checkboxes
        while (projectCheckboxes.length) {
          projectCheckboxes.removeAt(0);
        }
        
        // Add checkbox for each project
        projectsList.forEach(() => {
          projectCheckboxes.push(this.fb.control(false));
        });
        
        return projectsList;
      })
    );
  }
  
  /**
   * Check if date range is valid
   */
  dateRangeInvalid(): boolean {
    const start = this.reportForm.get('startDate')?.value;
    const end = this.reportForm.get('endDate')?.value;
    
    if (!start || !end) return false;
    
    return new Date(start) >= new Date(end);
  }
  
  /**
   * Format date for input field
   * Pure function for formatting
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Submit handler for form
   * Creates ReportConfig from form values and generates report
   */
  onSubmit(): void {
    if (this.reportForm.invalid || this.dateRangeInvalid()) {
      return;
    }
    
    this.submitting = true;
    
    // Extract form values
    const formValues = this.reportForm.value;
    
    // Build project IDs array from checkboxes
    let projectIds: string[] = [];
    this.projects$.subscribe(projects => {
      projectIds = projects
        .filter((_, i) => formValues.projectIds[i])
        .map(p => p.id);
      
      // Build metrics array from checkboxes
      const metrics = this.availableMetrics
        .filter((_, i) => formValues.metrics[i])
        .map(m => m.id);
      
      // Build status filter array from checkboxes
      const statuses = this.taskStatuses
        .filter((_, i) => formValues.filters.statuses[i]);
      
      // Build priority filter array from checkboxes
      const priorities = this.taskPriorities
        .filter((_, i) => formValues.filters.priorities[i]);
      
      // Create the report config
      const reportConfig: ReportConfig = {
        id: crypto.randomUUID(),
        name: formValues.name,
        projectIds,
        metrics,
        dateRange: {
          start: new Date(formValues.startDate),
          end: new Date(formValues.endDate)
        },
        groupBy: formValues.groupBy,
        filters: {
          statuses,
          priorities
        }
      };
      
      // Generate the report
      this.analyticsService.generateReport(reportConfig).subscribe({
        next: (report) => {
          this.submitting = false;
          this.router.navigate(['/reports', report.id]);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Error generating report:', err);
          // In a real application, add error handling and user feedback
        }
      });
    });
  }
  
  /**
   * Cancel form and navigate back
   */
  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
