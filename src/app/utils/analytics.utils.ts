/**
 * Funções utilitárias puras para análises
 * Implementa o paradigma funcional com foco em composição de funções e imutabilidade
 */
import { Project, Task, TaskStatus } from '../models/project.model';
import { 
  MemberPerformance, 
  ProjectMetrics, 
  ProjectTrend,
  ReportConfig,
  ReportFilters 
} from '../models/analytics.model';
import { daysBetween, getPeriodKey } from './date.utils';

/**
 * Calcula a taxa de conclusão
 * @param completed Número de itens concluídos
 * @param total Número total de itens
 * @returns Porcentagem de conclusão (0-100)
 */
export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Filtra tarefas com base nos filtros fornecidos
 * @param tasks Lista de tarefas a filtrar
 * @param filters Filtros a aplicar
 * @returns Nova lista de tarefas filtradas
 */
export const filterTasks = (tasks: ReadonlyArray<Task>, filters?: ReportFilters): ReadonlyArray<Task> => {
  if (!filters) return tasks;
  
  return tasks.filter(task => {
    // Filtrar por status
    if (filters.statuses && filters.statuses.length > 0 && 
        !filters.statuses.includes(task.status)) {
      return false;
    }
    
    // Filtrar por prioridade
    if (filters.priorities && filters.priorities.length > 0 && 
        !filters.priorities.includes(task.priority)) {
      return false;
    }
    
    // Filtrar por membros
    if (filters.members && filters.members.length > 0 && 
        (!task.assignee || !filters.members.includes(task.assignee.id))) {
      return false;
    }
    
    // Filtrar por tags
    if (filters.tags && filters.tags.length > 0 && 
        !task.tags.some(tag => filters.tags!.includes(tag))) {
      return false;
    }
    
    return true;
  });
};

/**
 * Calcula métricas para um conjunto de projetos
 * @param projects Lista de projetos para analisar
 * @param filters Filtros opcionais para as tarefas
 * @returns Objeto de métricas calculadas
 */
export const calculateProjectMetrics = (
  projects: ReadonlyArray<Project>, 
  filters?: ReportFilters
): ProjectMetrics => {
  // Extrair todas as tarefas dos projetos
  const allTasks = projects.flatMap(p => p.tasks);
  
  // Aplicar filtros se fornecidos
  const filteredTasks = filterTasks(allTasks, filters);
  
  // Contar tarefas por status
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);
  
  // Contar tarefas por prioridade
  const tasksByPriority = filteredTasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Tarefas concluídas
  const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.DONE);
  
  // Calcular tarefas atrasadas (com prazo no passado e não concluídas)
  const now = new Date();
  const overdueTasks = filteredTasks.filter(t => 
    t.status !== TaskStatus.DONE && 
    t.dueDate && 
    t.dueDate < now
  );
  
  // Calcular média de dias para conclusão
  const completedTasksWithDates = completedTasks.filter(t => t.dueDate);
  let averageDaysToCompletion: number | undefined = undefined;
  
  if (completedTasksWithDates.length > 0) {
    const totalDays = completedTasksWithDates.reduce((sum, task) => {
      return sum + daysBetween(task.createdDate, task.dueDate!);
    }, 0);
    averageDaysToCompletion = Math.round(totalDays / completedTasksWithDates.length);
  }
  
  // Calcular desempenho dos membros
  const memberPerformanceMap = new Map<string, MemberPerformance>();
  
  filteredTasks.forEach(task => {
    if (!task.assignee) return;
    
    const memberId = task.assignee.id;
    let memberData = memberPerformanceMap.get(memberId);
    
    if (!memberData) {
      memberData = {
        memberId,
        memberName: task.assignee.name,
        tasksAssigned: 0,
        tasksCompleted: 0,
        completionRate: 0
      };
    }
    
    memberData = {
      ...memberData,
      tasksAssigned: memberData.tasksAssigned + 1,
      tasksCompleted: task.status === TaskStatus.DONE 
        ? memberData.tasksCompleted + 1 
        : memberData.tasksCompleted
    };
    
    memberPerformanceMap.set(memberId, memberData);
  });
  
  // Calcular taxa de conclusão para cada membro
  const memberPerformance: MemberPerformance[] = Array.from(memberPerformanceMap.values())
    .map(member => ({
      ...member,
      completionRate: calculateCompletionRate(member.tasksCompleted, member.tasksAssigned)
    }));
  
  return {
    totalTasks: filteredTasks.length,
    completedTasks: completedTasks.length,
    completionRate: calculateCompletionRate(completedTasks.length, filteredTasks.length),
    tasksByStatus,
    tasksByPriority,
    averageDaysToCompletion,
    overdueTasksCount: overdueTasks.length,
    memberPerformance
  };
};

/**
 * Calcula tendências para um período
 * @param projects Lista de projetos para analisar
 * @param config Configuração do relatório
 * @returns Array de tendências por período
 */
export const calculateProjectTrends = (
  projects: ReadonlyArray<Project>, 
  config: ReportConfig
): ReadonlyArray<ProjectTrend> => {
  // Definir período de análise
  const startDate = config.dateRange?.start || new Date(0); // Época se não fornecido
  const endDate = config.dateRange?.end || new Date(); // Atual se não fornecido
  const groupBy = config.groupBy || 'week'; // Agrupar por semana por padrão
  
  // Extrair tarefas dos projetos
  const allTasks = projects.flatMap(p => p.tasks);
  
  // Aplicar filtros se fornecidos
  const filteredTasks = filterTasks(allTasks, config.filters);
  
  // Agrupar tarefas por período
  const tasksByPeriod = new Map<string, { 
    added: Task[], 
    completed: Task[] 
  }>();
  
  // Inicializar períodos entre startDate e endDate
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const periodKey = getPeriodKey(currentDate, groupBy);
    if (!tasksByPeriod.has(periodKey)) {
      tasksByPeriod.set(periodKey, { added: [], completed: [] });
    }
    
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Agrupar tarefas adicionadas por período
  filteredTasks.forEach(task => {
    const createdPeriod = getPeriodKey(task.createdDate, groupBy);
    if (!tasksByPeriod.has(createdPeriod)) {
      tasksByPeriod.set(createdPeriod, { added: [], completed: [] });
    }
    
    const periodData = tasksByPeriod.get(createdPeriod)!;
    periodData.added.push(task);
    
    // Se a tarefa foi concluída
    if (task.status === TaskStatus.DONE && task.dueDate) {
      const completedPeriod = getPeriodKey(task.dueDate, groupBy);
      if (!tasksByPeriod.has(completedPeriod)) {
        tasksByPeriod.set(completedPeriod, { added: [], completed: [] });
      }
      
      const completedPeriodData = tasksByPeriod.get(completedPeriod)!;
      completedPeriodData.completed.push(task);
    }
  });
  
  // Converter mapa em array ordenado por período
  const sortedPeriods = Array.from(tasksByPeriod.keys()).sort();
  let cumulativeCompletion = 0;
  
  return sortedPeriods.map(period => {
    const { added, completed } = tasksByPeriod.get(period)!;
    cumulativeCompletion += completed.length;
    
    // Contar tarefas ativas neste período
    const activeTasksCount = filteredTasks.filter(task => {
      const createdInOrBeforePeriod = getPeriodKey(task.createdDate, groupBy) <= period;
      const notCompletedOrCompletedAfter = 
        task.status !== TaskStatus.DONE || 
        (task.dueDate && getPeriodKey(task.dueDate, groupBy) > period);
      return createdInOrBeforePeriod && notCompletedOrCompletedAfter;
    }).length;
    
    return {
      period,
      completedTasks: completed.length,
      addedTasks: added.length,
      activeTasksCount,
      cumulativeCompletion
    };
  });
};
