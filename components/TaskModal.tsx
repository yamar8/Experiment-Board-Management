
import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XIcon, CheckIcon } from './icons';
import Tooltip from './Tooltip';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUpdateTasks: (newTasks: Task[]) => void;
  weekStartDate: string;
  experimentName: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onUpdateTasks,
  weekStartDate,
  experimentName
}) => {
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInternalTasks(tasks);
    }
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    const newTasks = [
      ...internalTasks,
      {
        id: `task_${Date.now()}`,
        text: newTaskText.trim(),
        description: '',
        completed: false,
      },
    ];
    setInternalTasks(newTasks);
    onUpdateTasks(newTasks);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    const newTasks = internalTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setInternalTasks(newTasks);
    onUpdateTasks(newTasks);
  };
  
  const handleDeleteTask = (taskId: string) => {
    const newTasks = internalTasks.filter(task => task.id !== taskId);
    setInternalTasks(newTasks);
    onUpdateTasks(newTasks);
  };
  
  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = internalTasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setInternalTasks(newTasks);
    onUpdateTasks(newTasks);
  };

  const formattedDate = new Date(weekStartDate).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bkg-light dark:bg-bkg-dark rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{experimentName}</h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">משימות לשבוע המתחיל ב-{formattedDate}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {internalTasks.length === 0 ? (
            <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-8">אין משימות עדיין.</p>
          ) : (
            <ul className="space-y-3">
              {internalTasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task} 
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                  onEditStart={() => setEditingTask(task)}
                />
              ))}
            </ul>
          )}
        </div>
        
        <footer className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="הוסף משימה חדשה..."
              className="flex-grow bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAddTask}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <PlusIcon className="w-5 h-5"/>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (task: Task) => void;
    onEditStart: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [editDesc, setEditDesc] = useState(task.description);

    const handleSave = () => {
        onUpdate({ ...task, text: editText, description: editDesc });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <li className="p-3 bg-primary-light/30 dark:bg-primary-dark/20 rounded-lg">
                <input 
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-transparent font-semibold border-b border-primary mb-2 p-1 focus:outline-none"
                />
                <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="הוסף תיאור..."
                    className="w-full bg-transparent text-sm border-b border-primary p-1 h-20 resize-none focus:outline-none"
                />
                <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">ביטול</button>
                    <button onClick={handleSave} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark">שמור</button>
                </div>
            </li>
        );
    }

    return (
        <li className="flex items-center group bg-surface-light dark:bg-surface-dark p-2 rounded-lg transition-colors">
            <button
                onClick={() => onToggle(task.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                    task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-400 dark:border-gray-500 hover:border-primary'
                }`}
            >
                {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            <Tooltip text={task.description} disabled={!task.description}>
                <div className="flex-grow">
                    <span className={`transition-colors ${task.completed ? 'line-through text-text-secondary-light dark:text-text-secondary-dark' : ''}`}>
                        {task.text}
                    </span>
                </div>
            </Tooltip>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2 space-x-1">
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><PencilIcon className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark"/></button>
                <button onClick={() => onDelete(task.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-4 h-4 text-red-500"/></button>
            </div>
        </li>
    );
};

export default TaskModal;
