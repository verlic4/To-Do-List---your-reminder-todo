import { Task, TaskStatus } from '@prisma/client'
export type { Task, TaskStatus }


export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
}

export interface TaskFilters {
  status?: TaskStatus
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  orderBy?: 'asc' | 'desc'
}