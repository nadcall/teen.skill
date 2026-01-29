
import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Briefcase, Lock, Search, Smile, Star } from 'lucide-react';

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
      {/* Header Personal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
              Halo, {user.name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Saldo Dompetmu: <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">${user.balance}</span>
          </p>
        </div>
        
        {/* Toggle View */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 flex shadow-sm backdrop-blur-md self-start md:self-auto">
          <button 
            onClick={() => setView('market')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'market' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
          >
            <Search className="w-4 h-4" /> Cari Kerja
          </button>
          <button 
             onClick={() => setView('my-tasks')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'my-tasks' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
          >
            <Star className="w-4 h-4" /> Tugas Saya
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {loading ? (
           // Skeleton Loading
           [1,2,3].map(i => (
             <div key={i} className="h-32 bg-white/40 dark:bg-gray-800/40 rounded-2xl animate-pulse"></div>
           ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-white/20 dark:border-gray-700 backdrop-blur-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
               <Smile className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-bold">
              {view === 'market' ? 'Belum ada lowongan baru saat ini.' : 'Kamu belum mengambil tugas apapun.'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Coba cek lagi nanti ya!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group relative bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 backdrop-blur-md overflow-hidden">
              
              {/* Decorative gradient blob on hover */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative z-10">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed text-sm line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <Briefcase className="w-3.5 h-3.5" /> ID: {task.id.substring(0,6)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                      📅 {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <div className="text-right">
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Honor</span>
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">${task.budget}</span>
                  </div>
                  
                  {view === 'market' && (
                    <Button onClick={() => setSelectedTask(task)} className="w-full text-sm py-2 shadow-indigo-500/20">
                      Ambil Tugas
                    </Button>
                  )}
                  {view === 'my-tasks' && (
                     <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${
                       task.status === 'completed' 
                         ? 'bg-green-100 text-green-700 border-green-200' 
                         : 'bg-blue-100 text-blue-700 border-blue-200'
                     }`}>
                       <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                       {task.status === 'completed' ? 'Selesai' : 'Sedang Dikerjakan'}
                     </div>
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
        title="Verifikasi Izin Orang Tua"
      >
        <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">{selectedTask?.title}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            Kamu akan mengerjakan tugas ini dengan honor <strong>${selectedTask?.budget}</strong>.
            Pastikan orang tuamu mengetahui aktivitas ini ya!
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg">
             <Star className="w-3 h-3 fill-current" />
             Sisa Kuota Harianmu: {user.taskQuotaDaily} Tugas
          </div>
        </div>

        <form onSubmit={handleTakeTask} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Masukkan Kode Orang Tua</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
              <Input 
                className="pl-11"
                placeholder="******"
                type="password"
                value={parentalCodeInput}
                onChange={e => setParentalCodeInput(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center animate-pulse">{error}</p>}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <Button type="button" variant="ghost" onClick={() => setSelectedTask(null)}>Batalkan</Button>
             <Button type="submit" isLoading={loading}>Verifikasi & Ambil</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
