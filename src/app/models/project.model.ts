/**
 * Modelos para representar projetos e tarefas
 * Esses modelos serão usados para compatibilidade com os dados fornecidos por outros MFEs
 */

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE',
    BACKLOG = 'BACKLOG'
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED'
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: TeamMember;
    createdDate: Date;
    dueDate?: Date;
    tags: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate?: Date;
    createdBy: string;
    tasks: Task[];
    members: TeamMember[];
}
