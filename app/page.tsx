'use client'

import { useState, useEffect } from 'react'
import { Trash2, Check, Plus, Loader2, OctagonXIcon, Edit} from 'lucide-react'

interface Task {
  id: number  
  title: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  deleted_at: string | null
}

type TaskStatus = 'PENDING' | 'COMPLETED'

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [editId, setEditId] = useState<number | null>(null)  
  const [edit, setEdit] = useState({ title: '', description: '' })

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const statusParam = filter !== 'all' ? `?status=${filter.toUpperCase()}` : ''
      const response = await fetch(`/api/tasks${statusParam}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
    setLoading(false)
  }

const [error, setError] = useState('')

const handleCreate = async () => {
  // console.log('1handleCreate')
  // console.log('2newTask:', newTask)
  setError('')
  
  if (!newTask.title.trim()) {
    // console.log('title is empty, errror')
    setError('! Task title is required!') 
    return
  }

   try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create task')
        return
      }

      setNewTask({ title: '', description: '' })
      setError('')
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      setError('Please try again later.')
    }

}

  const handleToggleStatus = async (task: Task) => {
    try {
      const newStatus: TaskStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task')
      loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }
  
  const handleDelete = async (id: number) => {  
    if (!confirm('Confirm deleting the selected task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')
      loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const startEdit = (task: Task) => {
    setEditId(task.id)
    setEdit({ title: task.title, description: task.description || '' })
  }

  const handleUpdate = async (id: number) => { 
    if (!edit.title.trim()) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to update task')
        return
      }

      setEditId(null)
      loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      action()
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-blue-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">To-do List</h1>
          <p className="text-gray-600 mb-8 text-center">Plan your day, one task at a time</p>

          <br />
          <div className="mb-8">
            <div className="space-y-4">
              <p className='taskTitle font-semibold'>Task Title<span className="text-red-500">*</span></p>
              
              {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
              )}

              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyDown={(e) => handleKeyPress(e, handleCreate)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className='taskTitle font-semibold'>Description</p>
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
              <button
                onClick={handleCreate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <OctagonXIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks found. Create your first task above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition duration-200 ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {editId === task.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={edit.title}
                        onChange={(e) =>
                          setEdit({ ...edit, title: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyPress(e, () => handleUpdate(task.id))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <textarea
                        value={edit.description}
                        onChange={(e) =>
                          setEdit({ ...edit, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(task.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {task.status === 'COMPLETED' && (
                          <Check size={16} className="text-white" />
                        )}
                      </button>

                      <div className="flex-grow">
                        <h3
                          className={`font-semibold text-lg ${
                            task.status === 'COMPLETED'
                              ? 'line-through text-gray-500'
                              : 'text-gray-800'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p
                            className={`text-sm mt-1 ${
                              task.status === 'COMPLETED' ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button 
                        onClick={() => startEdit(task)}
                        disabled={task.status === 'COMPLETED'}
                        className={`flex-shrink-0 p-2 transition ${
                        task.status === 'COMPLETED'
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-purple-500 hover:text-purple-700'
                        }`}>
                        <Edit size={18} />
                      </button>  

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}