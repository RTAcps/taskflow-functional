/**
 * Modelos específicos para análises e relatórios
 * Usando interface para tipagem estrita e imutabilidade
 */

import { TaskPriority, TaskStatus } from './project.model';

/**
 * Representa métricas gerais de um projeto
 */
export interface ProjectMetrics {
    readonly totalTasks: number;
    readonly completedTasks: number;
    readonly completionRate: number; // porcentagem de tarefas completas
    readonly tasksByStatus: Record<TaskStatus, number>;
    readonly tasksByPriority: Record<TaskPriority, number>;
    readonly averageDaysToCompletion?: number; // média de dias para concluir tarefas
    readonly overdueTasksCount: number; // tarefas atrasadas
    readonly memberPerformance: ReadonlyArray<MemberPerformance>;
}

/**
 * Representa o desempenho de um membro da equipe
 */
export interface MemberPerformance {
    readonly memberId: string;
    readonly memberName: string;
    readonly tasksAssigned: number;
    readonly tasksCompleted: number;
    readonly completionRate: number;
    readonly averageCompletionTime?: number; // em dias
}

/**
 * Representa uma tendência de progresso ao longo do tempo
 */
export interface ProjectTrend {
    readonly period: string; // ex: "Semana 1", "Agosto", etc.
    readonly completedTasks: number;
    readonly addedTasks: number;
    readonly activeTasksCount: number;
    readonly cumulativeCompletion: number; // total acumulado de tarefas concluídas
}

/**
 * Configuração de um relatório
 */
export interface ReportConfig {
    readonly id: string;
    readonly name: string;
    readonly projectIds: ReadonlyArray<string>;
    readonly metrics: ReadonlyArray<string>; // quais métricas incluir
    readonly dateRange?: {
        readonly start: Date;
        readonly end: Date;
    };
    readonly groupBy?: 'day' | 'week' | 'month';
    readonly filters?: ReportFilters;
}

/**
 * Filtros para relatórios
 */
export interface ReportFilters {
    readonly statuses?: ReadonlyArray<TaskStatus>;
    readonly priorities?: ReadonlyArray<TaskPriority>;
    readonly members?: ReadonlyArray<string>; // member IDs
    readonly tags?: ReadonlyArray<string>;
}

/**
 * Resultado de um relatório gerado
 */
export interface Report {
    readonly id: string;
    readonly config: ReportConfig;
    readonly generatedAt: Date;
    readonly metrics: ProjectMetrics;
    readonly trends: ReadonlyArray<ProjectTrend>;
    readonly recommendations?: ReadonlyArray<string>;
}
