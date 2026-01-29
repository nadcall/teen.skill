import React, { useEffect, useState } from 'react';
import { User, Task } from '../../types';
import { createTask, getMyTasks } from '../../services/db';
import { checkTaskSafety } from '../../services/geminiService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Plus, List, AlertTriangle } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', budget: '' });
  const [safetyError, setSafetyError] = useState<string | null>(null);

  const fetchTasks = async () => {
    const myTasks = await getMyTasks(user.id, 'client');
    setTasks(myTasks);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSafetyError(null);

    // 1. AI Safety Check
    const safetyCheck = await checkTaskSafety(newTask.title, newTask.description);
    
    if (!safetyCheck.safe) {
      setSafetyError(`Peringatan Keamanan: ${safetyCheck.reason}`);
      setIsLoading(false);
      return;
    }

    try {
      await createTask(user, newTask.title, newTask.description, Number(newTask.budget));
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', budget: '' });
      fetchTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dasbor Klien</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Buat Tugas Baru
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada tugas yang diposting.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xl">{task.description}</p>
                <div className="flex gap-3 mt-3 text-xs font-medium">
                  <span className={`px-2 py-1 rounded-full ${
                    task.status === 'open' ? 'bg-green-100 text-green-700' :
                    task.status === 'taken' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    Diposting: {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-indigo-600">${task.budget}</span>
                <span className="text-gray-400 text-sm">Anggaran</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Tugas Baru">
        <form onSubmit={handlePostTask} className="space-y-4">
          <Input 
            label="Judul Tugas" 
            placeholder="misal: Desain Logo" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
              placeholder="Jelaskan detail pekerjaan..."
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
              required
            />
          </div>
          <Input 
            label="Anggaran ($)" 
            type="number" 
            placeholder="50" 
            value={newTask.budget} 
            onChange={e => setNewTask({...newTask, budget: e.target.value})} 
            required
          />
          
          {safetyError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Pemeriksaan Keamanan Gagal</p>
                <p className="text-sm text-red-600">{safetyError}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isLoading}>Posting Tugas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};