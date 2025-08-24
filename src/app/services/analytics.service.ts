import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { Project } from '../models/project.model';
import { Report, ReportConfig } from '../models/analytics.model';
import { StorageService } from './storage.service';
import { calculateProjectMetrics, calculateProjectTrends } from '../utils/analytics.utils';
import { formatPeriod } from '../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly REPORTS_KEY = 'taskflow_reports';

  constructor(private readonly storageService: StorageService) {}

  /**
   * Gera um relatório com base na configuração fornecida
   * Demonstra composição funcional utilizando funções puras dos utilitários
   * 
   * @param config Configuração do relatório a ser gerado
   * @returns Observable com o relatório gerado
   */
  generateReport(config: ReportConfig): Observable<Report> {
    // Carregar projetos do storage
    const allProjects = this.storageService.loadProjects();
    
    // Filtrar projetos com base nos IDs da configuração
    const projectsToAnalyze = config.projectIds.length > 0
      ? allProjects.filter(p => config.projectIds.includes(p.id))
      : allProjects;
    
    // Utilizar funções puras para calcular métricas e tendências
    const metrics = calculateProjectMetrics(projectsToAnalyze, config.filters);
    const trends = calculateProjectTrends(projectsToAnalyze, config);
    
    // Transformar os dados de tendência para incluir rótulos legíveis
    const trendsWithFormattedPeriods = trends.map(trend => ({
      ...trend,
      period: formatPeriod(trend.period, config.groupBy || 'week')
    }));
    
    // Gerar recomendações automaticamente
    const recommendations = this.generateRecommendations(metrics, trendsWithFormattedPeriods);
    
    // Criar o relatório final
    const report: Report = {
      id: crypto.randomUUID(),
      config,
      generatedAt: new Date(),
      metrics,
      trends: trendsWithFormattedPeriods,
      recommendations
    };
    
    // Salvar o relatório
    this.saveReport(report);
    
    return of(report);
  }
  
  /**
   * Carrega todos os relatórios salvos
   * @returns Observable com array de relatórios
   */
  getReports(): Observable<ReadonlyArray<Report>> {
    try {
      const reportsJSON = localStorage.getItem(this.REPORTS_KEY);
      const reports = reportsJSON ? JSON.parse(reportsJSON) as Report[] : [];
      
      // Converter strings de data para objetos Date
      const parsedReports = reports.map(report => ({
        ...report,
        generatedAt: new Date(report.generatedAt),
        config: {
          ...report.config,
          dateRange: report.config.dateRange 
            ? {
                start: new Date(report.config.dateRange.start),
                end: new Date(report.config.dateRange.end)
              }
            : undefined
        }
      }));
      
      return of(parsedReports);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      return of([]);
    }
  }
  
  /**
   * Obtém um relatório específico pelo ID
   * @param id ID do relatório
   * @returns Observable com o relatório ou undefined
   */
  getReportById(id: string): Observable<Report | undefined> {
    return this.getReports().pipe(
      map(reports => reports.find(r => r.id === id))
    );
  }
  
  /**
   * Salva um relatório
   * @param report Relatório a ser salvo
   */
  private saveReport(report: Report): void {
    try {
      this.getReports().subscribe(reports => {
        // Verificar se o relatório já existe
        const existingIndex = reports.findIndex(r => r.id === report.id);
        
        let updatedReports: Report[];
        if (existingIndex >= 0) {
          // Substituir relatório existente
          updatedReports = [
            ...reports.slice(0, existingIndex),
            report,
            ...reports.slice(existingIndex + 1)
          ];
        } else {
          // Adicionar novo relatório
          updatedReports = [...reports, report];
        }
        
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
      });
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  }
  
  /**
   * Exclui um relatório
   * @param id ID do relatório a ser excluído
   * @returns Observable indicando se a operação foi bem-sucedida
   */
  deleteReport(id: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      try {
        this.getReports().subscribe(reports => {
          const updatedReports = reports.filter(r => r.id !== id);
          localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
          subscriber.next(true);
          subscriber.complete();
        });
      } catch (error) {
        console.error('Erro ao excluir relatório:', error);
        subscriber.next(false);
        subscriber.complete();
      }
    });
  }
  
  /**
   * Gera recomendações automáticas com base nas métricas
   * Exemplo de composição funcional
   * 
   * @param metrics Métricas calculadas
   * @param trends Tendências calculadas
   * @returns Array de recomendações
   */
  private generateRecommendations(
    metrics: ReturnType<typeof calculateProjectMetrics>,
    trends: ReturnType<typeof calculateProjectTrends>
  ): string[] {
    const recommendations: string[] = [];
    
    // Verificar taxa de conclusão
    if (metrics.completionRate < 30) {
      recommendations.push(
        'A taxa de conclusão está abaixo de 30%. Considere revisar os prazos ou redistribuir tarefas.'
      );
    }
    
    // Verificar tarefas atrasadas
    if (metrics.overdueTasksCount > 0) {
      const percentage = Math.round((metrics.overdueTasksCount / metrics.totalTasks) * 100);
      recommendations.push(
        `${metrics.overdueTasksCount} tarefas (${percentage}%) estão atrasadas. Priorize-as para evitar atrasos no projeto.`
      );
    }
    
    // Verificar tendência de progresso
    if (trends.length >= 2) {
      const lastTrend = trends[trends.length - 1];
      const prevTrend = trends[trends.length - 2];
      
      if (lastTrend.completedTasks < prevTrend.completedTasks) {
        recommendations.push(
          'O ritmo de conclusão diminuiu no último período. Verifique possíveis bloqueadores.'
        );
      }
      
      if (lastTrend.addedTasks > lastTrend.completedTasks * 2) {
        recommendations.push(
          'Estão sendo adicionadas mais tarefas do que concluídas. Considere reduzir o escopo ou aumentar a capacidade da equipe.'
        );
      }
    }
    
    // Analisar desempenho da equipe
    const lowPerformers = metrics.memberPerformance.filter(m => m.completionRate < 40);
    if (lowPerformers.length > 0) {
      recommendations.push(
        `${lowPerformers.length} membros da equipe têm taxa de conclusão abaixo de 40%. Verifique se precisam de suporte.`
      );
    }
    
    return recommendations;
  }
}
