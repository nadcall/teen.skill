import React, { useEffect, useState } from 'react';
import { User, Task } from '../../types';
import { createTask, getMyTasks, completeTaskPayment } from '../../services/db';
import { checkTaskSafety } from '../../services/geminiService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { XenditPaymentModal } from '../../components/XenditPaymentModal';
import { Plus, List, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', budget: '' });
  const [safetyError, setSafetyError] = useState<string | null>(null);

  // State for Payment
  const [paymentTask, setPaymentTask] = useState<Task | null>(null);

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

  const handlePaymentSuccess = async () => {
    if (paymentTask) {
      await completeTaskPayment(paymentTask.id);
      fetchTasks();
      setPaymentTask(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Dasbor Klien</h1>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-indigo-500/20">
          <Plus className="w-5 h-5" /> Buat Tugas Baru
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700">
            <List className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Belum ada tugas yang diposting.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{task.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl leading-relaxed">{task.description}</p>
                <div className="flex gap-3 mt-4 text-xs font-bold tracking-wide items-center">
                  <span className={`px-3 py-1 rounded-full border ${
                    task.status === 'open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                    task.status === 'taken' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 
                    task.status === 'completed' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                    Diposting: {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-left sm:text-right w-full sm:w-auto">
                <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">${task.budget}</span>
                <span className="text-gray-400 text-sm font-medium mb-2">Anggaran</span>
                
                {/* Action Button for Payment */}
                {(task.status === 'taken' || task.status === 'submitted') && (
                  <Button 
                    onClick={() => setPaymentTask(task)}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                  >
                    <Wallet className="w-4 h-4" /> Bayar & Selesaikan
                  </Button>
                )}

                {task.status === 'completed' && (
                   <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-sm">
                     <CheckCircle className="w-4 h-4" /> Lunas
                   </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Tugas Baru">
        <form onSubmit={handlePostTask} className="space-y-5">
          <Input 
            label="Judul Tugas" 
            placeholder="misal: Desain Logo" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            required
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi</label>
            <textarea 
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none h-32 transition-all"
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-300">Pemeriksaan Keamanan Gagal</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{safetyError}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isLoading}>Posting Tugas</Button>
          </div>
        </form>
      </Modal>

      {/* Xendit Payment Modal */}
      {paymentTask && (
        <XenditPaymentModal 
          isOpen={!!paymentTask}
          onClose={() => setPaymentTask(null)}
          amount={paymentTask.budget}
          taskTitle={paymentTask.title}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};