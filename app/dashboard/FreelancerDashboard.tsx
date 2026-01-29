
import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ChatWindow } from '@/components/ChatWindow';
import { Briefcase, Lock, Search, Smile, Star, MessageCircle } from 'lucide-react';

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
  
  const [chatTask, setChatTask] = useState<any | null>(null);

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
  }, [view]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const handleTakeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError('');
    setLoading(true);

    try {
      await takeTaskAction(selectedTask.id, parentalCodeInput);
      setSelectedTask(null);
      setParentalCodeInput('');
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Halo, {user.name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Saldo Dompetmu: <span className="text-sky-600 dark:text-sky-400 font-bold text-lg">{formatRupiah(user.balance)}</span>
          </p>
        </div>
        
        <div className="bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 flex shadow-sm backdrop-blur-md self-start md:self-auto">
          <button 
            onClick={() => setView('market')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'market' ? 'bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <Search className="w-4 h-4" /> Cari Kerja
          </button>
          <button 
             onClick={() => setView('my-tasks')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'my-tasks' ? 'bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <Star className="w-4 h-4" /> Tugas Saya
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {loading ? (
           [1,2,3].map(i => (
             <div key={i} className="h-32 bg-white/40 dark:bg-slate-800/40 rounded-2xl animate-pulse"></div>
           ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/50 dark:border-slate-700 backdrop-blur-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
               <Smile className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-bold">
              {view === 'market' ? 'Belum ada lowongan baru saat ini.' : 'Kamu belum mengambil tugas apapun.'}
            </p>
            <p className="text-slate-400 text-sm mt-1">Coba cek lagi nanti ya!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group relative bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-700 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 backdrop-blur-md overflow-hidden">
              
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative z-10">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed text-sm line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <Briefcase className="w-3.5 h-3.5" /> ID: {task.id.substring(0,6)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                      📅 {new Date(task.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <div className="text-right">
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Honor</span>
                    <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {formatRupiah(task.budget)}
                    </span>
                  </div>
                  
                  {view === 'market' && (
                    <Button onClick={() => setSelectedTask(task)} className="w-full text-sm py-2 shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white">
                      Ambil Tugas
                    </Button>
                  )}
                  {view === 'my-tasks' && (
                    <div className="flex gap-2">
                       <Button variant="secondary" onClick={() => setChatTask(task)} className="h-9 px-3">
                        <MessageCircle className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                       </Button>
                       
                       <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${
                         task.status === 'completed' 
                           ? 'bg-green-100 text-green-700 border-green-200' 
                           : 'bg-sky-100 text-sky-700 border-sky-200'
                       }`}>
                         <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-sky-500'}`}></div>
                         {task.status === 'completed' ? 'Selesai' : 'Aktif'}
                       </div>
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
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">{selectedTask?.title}</h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
            Kamu akan mengerjakan tugas ini dengan honor <strong>{selectedTask && formatRupiah(selectedTask.budget)}</strong>.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-3 py-2 rounded-lg">
             <Star className="w-3 h-3 fill-current" />
             Sisa Kuota Harianmu: {user.taskQuotaDaily} Tugas
          </div>
        </div>

        <form onSubmit={handleTakeTask} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Masukkan Kode Orang Tua</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
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

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
             <Button type="button" variant="ghost" onClick={() => setSelectedTask(null)}>Batalkan</Button>
             <Button type="submit" isLoading={loading} className="bg-sky-500 text-white hover:bg-sky-600">Verifikasi & Ambil</Button>
          </div>
        </form>
      </Modal>

      {/* Chat Modal */}
      {chatTask && (
        <ChatWindow
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          currentUserId={user.id}
          onClose={() => setChatTask(null)}
        />
      )}
    </div>
  );
};
