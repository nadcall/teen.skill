import React, { useEffect, useState } from 'react';
import { User, Task } from '../../types';
import { getAllOpenTasks, getMyTasks, takeTask } from '../../services/db';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Briefcase, Lock, Search } from 'lucide-react';

interface FreelancerDashboardProps {
  user: User;
}

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ user }) => {
  const [view, setView] = useState<'market' | 'my-tasks'>('market');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    if (view === 'market') {
      const data = await getAllOpenTasks();
      setTasks(data);
    } else {
      const data = await getMyTasks(user.id, 'freelancer');
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
      await takeTask(user, selectedTask.id, parentalCodeInput);
      setSelectedTask(null);
      setParentalCodeInput('');
      fetchTasks();
      // Optional: switch to my tasks or show success toast
      setView('my-tasks');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {view === 'market' ? 'Tugas Tersedia' : 'Pekerjaan Saya'}
        </h1>
        <div className="bg-white p-1 rounded-lg border flex">
          <button 
            onClick={() => setView('market')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'market' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cari Kerja
          </button>
          <button 
             onClick={() => setView('my-tasks')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'my-tasks' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tugas Saya
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{loading ? 'Memuat...' : 'Tidak ada tugas ditemukan.'}</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-2">{task.description}</p>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> Harga Tetap
                    </span>
                    <span>Diposting {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-2xl font-bold text-indigo-600">${task.budget}</span>
                  {view === 'market' && (
                    <Button onClick={() => setSelectedTask(task)}>Ambil Tugas</Button>
                  )}
                  {view === 'my-tasks' && (
                     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
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
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-4">
            Anda akan menerima <strong>{selectedTask?.title}</strong> seharga <strong>${selectedTask?.budget}</strong>.
            <br/><br/>
            Untuk melanjutkan, masukkan Kode Orang Tua. Ini memastikan orang tua Anda menyetujui aktivitas ini.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-4">
            Kuota Harian: Anda dapat mengambil maksimal {user.task_quota_daily} tugas per hari.
          </div>
        </div>

        <form onSubmit={handleTakeTask} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input 
              className="pl-10"
              placeholder="Masukkan Kode Orang Tua"
              type="password"
              value={parentalCodeInput}
              onChange={e => setParentalCodeInput(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
             <Button type="button" variant="ghost" onClick={() => setSelectedTask(null)}>Batal</Button>
             <Button type="submit" isLoading={loading}>Verifikasi & Terima</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};