import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

/**
 * Serviço para carregar e salvar projetos no localStorage
 * Este serviço utiliza métodos imutáveis para manipular dados
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PROJECTS_KEY = 'taskflow_projects';
  
  /**
   * Carrega projetos do localStorage
   * @returns Array de projetos, ou array vazio se nenhum for encontrado
   */
  loadProjects(): ReadonlyArray<Project> {
    try {
      const projectsJSON = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJSON) return [];
      
      const projects = JSON.parse(projectsJSON) as Project[];
      
      // Converter strings de data para objetos Date
      return projects.map(project => ({
        ...project,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        tasks: project.tasks.map(task => ({
          ...task,
          createdDate: new Date(task.createdDate),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      }));
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      return [];
    }
  }
  
  /**
   * Salva projetos no localStorage
   * @param projects Array de projetos a serem salvos
   * @returns true se a operação foi bem-sucedida, false caso contrário
   */
  saveProjects(projects: ReadonlyArray<Project>): boolean {
    try {
      const projectsJSON = JSON.stringify(projects);
      localStorage.setItem(this.PROJECTS_KEY, projectsJSON);
      return true;
    } catch (error) {
      console.error('Erro ao salvar projetos:', error);
      return false;
    }
  }
}
