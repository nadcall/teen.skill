import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Briefcase, Lock, Search } from 'lucide-react';

interface FreelancerDashboardProps {
  user: any;
}

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ user }) => {
  const [view, setView] = useState<'market' | 'my-tasks'>('market');
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    if (view === 'market') {
      const data = await getOpenTasksAction();
      setTasks(data);
    } else {
      const data = await getMyTasksAction(user.id, 'freelancer');
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleTakeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError('');
    setLoading(true);

    try {
      await takeTaskAction(selectedTask.id, parentalCodeInput);
      setSelectedTask(null);
      setParentalCodeInput('');
      fetchTasks();
      setView('my-tasks');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
          {view === 'market' ? 'Pasar Tugas' : 'Pekerjaan Saya'}
        </h1>
        <div className="bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 flex shadow-sm backdrop-blur-md">
          <button 
            onClick={() => setView('market')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'market' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Cari Kerja
          </button>
          <button 
             onClick={() => setView('my-tasks')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'my-tasks' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Tugas Saya
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-white/20 dark:border-gray-700 backdrop-blur-sm">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{loading ? 'Memuat...' : 'Tidak ada tugas ditemukan.'}</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{task.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{task.description}</p>
                  <div className="flex gap-4 mt-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-lg">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Harga Tetap
                    </span>
                    <span className="flex items-center px-3 py-1">Diposting {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${task.budget}</span>
                  {view === 'market' && (
                    <Button onClick={() => setSelectedTask(task)} className="w-full shadow-md shadow-indigo-500/20">Ambil Tugas</Button>
                  )}
                  {view === 'my-tasks' && (
                     <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full text-xs font-bold uppercase tracking-wider">
                       {task.status}
                     </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={!!selectedTask} 
        onClose={() => { setSelectedTask(null); setError(''); }} 
        title="Konfirmasi Tugas & Cek Orang Tua"
      >
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
            Anda akan menerima <strong>{selectedTask?.title}</strong> seharga <strong>${selectedTask?.budget}</strong>.
            <br/><br/>
            Untuk melanjutkan, masukkan Kode Orang Tua. Ini memastikan orang tua Anda menyetujui aktivitas ini.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 font-medium">
            Kuota Harian: Anda dapat mengambil maksimal {user.taskQuotaDaily} tugas per hari.
          </div>
        </div>

        <form onSubmit={handleTakeTask} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <Input 
              className="pl-11"
              placeholder="Masukkan Kode Orang Tua"
              type="password"
              value={parentalCodeInput}
              onChange={e => setParentalCodeInput(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
             <Button type="button" variant="ghost" onClick={() => setSelectedTask(null)}>Batal</Button>
             <Button type="submit" isLoading={loading}>Verifikasi & Terima</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};