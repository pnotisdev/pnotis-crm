import { getTasks, createTask } from '../lib/db';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { CalendarIcon, ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';
import '../src/app/globals.css';

export async function getServerSideProps() {
  const tasks = await getTasks();
  return { props: { tasks } };
}

export default function TasksPage({ tasks }) {
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, dueDate }),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      router.replace(router.asPath);
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Tasks
        </h1>
        
        <form onSubmit={handleAddTask} className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="mb-4">
            <label htmlFor="task-description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Description
            </label>
            <input
              id="task-description"
              required
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="task-due-date" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-xl" disabled={loading}>
            <PlusIcon className="h-5 w-5 mr-2" />
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        <ul className="grid gap-4 md:grid-cols-2">
          {tasks?.map((task) => (
            <li key={task.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    <ClipboardDocumentListIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{task.description}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}