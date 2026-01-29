
import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction, submitTaskAction, syncUser } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ChatWindow } from '@/components/ChatWindow';
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from '@/context/ThemeContext';
import { 
  Briefcase, Lock, Search, Smile, Star, MessageCircle, 
  Home, Clock, Award, Sun, Moon, CheckCircle2, TrendingUp, Wallet, Send, FileText, Link as LinkIcon
} from 'lucide-react';

interface FreelancerDashboardProps {
  user: any;
}

const BentoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ user: initialUser }) => {
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'market' | 'active' | 'history'>('market');
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(initialUser);
  
  // Modals & Logic
  const [selectedTask, setSelectedTask] = useState<any | null>(null); // For taking task
  const [submitTaskModal, setSubmitTaskModal] = useState<any | null>(null); // For submitting task
  const [chatTask, setChatTask] = useState<any | null>(null);
  
  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [submissionData, setSubmissionData] = useState({ url: '', note: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const level = Math.floor((currentUser.xp || 0) / 100) + 1;

  const fetchTasks = async () => {
    setLoading(true);
    const freshUser = await syncUser();
    if(freshUser) setCurrentUser(freshUser);

    if (activeTab === 'market') {
      setTasks(await getOpenTasksAction());
    } else {
      const data = await getMyTasksAction(currentUser.id, 'freelancer');
      if (activeTab === 'active') {
        setTasks(data.filter((t: any) => t.status === 'taken' || t.status === 'submitted'));
      } else {
        setTasks(data.filter((t: any) => t.status === 'completed'));
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [activeTab]);

  const handleTakeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await takeTaskAction(selectedTask.id, parentalCodeInput);
      setSelectedTask(null); setParentalCodeInput(''); setActiveTab('active');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
       await submitTaskAction(submitTaskModal.id, submissionData.url, submissionData.note);
       setSubmitTaskModal(null); setSubmissionData({ url: '', note: '' }); fetchTasks();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div className="pb-24 pt-4 md:pt-24 px-4 min-h-screen bg-transparent w-full max-w-[1600px] mx-auto">
      
      {/* DESKTOP NAV */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-xl shadow-sky-900/5 rounded-full px-8 py-3 items-center gap-8 animate-fade-in-up">
         <span className="font-bold text-sky-600 dark:text-sky-400 text-lg">TeenSkill</span>
         <div className="flex gap-2">
            {['market', 'active', 'history'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                  {tab === 'market' ? 'Bursa' : tab === 'active' ? 'Aktif' : 'Riwayat'}
               </button>
            ))}
         </div>
         <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"><Sun className="w-4 h-4" /></button>
            <UserButton afterSignOutUrl="/" />
         </div>
      </nav>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up">
        
        {/* COL 1: PROFILE & STATS */}
        <div className="md:col-span-1 space-y-6">
           <BentoCard className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                 <img src={clerkUser?.imageUrl} className="w-24 h-24 rounded-3xl shadow-lg border-4 border-white dark:border-slate-700" alt="Profile" />
                 <span className="absolute -bottom-2 -right-2 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">Lv.{level}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name.split(' ')[0]}</h2>
              <div className="mt-4 w-full bg-gray-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                 <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full" style={{ width: `${(currentUser.xp % 100)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentUser.xp} XP Total</p>
           </BentoCard>

           <div className="grid grid-cols-2 gap-3">
              <BentoCard className="p-4 bg-green-500 text-white border-none">
                 <Wallet className="w-6 h-6 mb-2 opacity-80" />
                 <p className="text-xs font-medium opacity-90">Saldo</p>
                 <p className="text-lg font-bold truncate">{formatRupiah(currentUser.balance)}</p>
              </BentoCard>
              <BentoCard className="p-4 bg-orange-500 text-white border-none">
                 <Star className="w-6 h-6 mb-2 opacity-80" />
                 <p className="text-xs font-medium opacity-90">Rating</p>
                 <p className="text-lg font-bold">5.0</p>
              </BentoCard>
           </div>
        </div>

        {/* COL 2: MAIN FEED (Wide) */}
        <div className="md:col-span-3">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                 {activeTab === 'market' ? 'Lowongan Terbaru' : activeTab === 'active' ? 'Proyek Sedang Berjalan' : 'Riwayat Pekerjaan'}
              </h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? [1,2,3,4].map(i => <div key={i} className="h-40 bg-white/40 rounded-3xl animate-pulse" />) :
              tasks.length === 0 ? (
                 <div className="col-span-2 py-20 text-center">
                    <Smile className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Belum ada data.</p>
                 </div>
              ) : (
                 tasks.map(task => (
                    <BentoCard key={task.id} className="relative group overflow-hidden border-l-4 border-l-sky-500">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                             {task.status === 'open' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">OPEN</span>}
                             {task.status === 'submitted' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">REVIEW</span>}
                             <span className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xl font-black text-slate-800 dark:text-white">{formatRupiah(task.budget)}</p>
                       </div>
                       
                       <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white leading-tight">{task.title}</h3>
                       <p className="text-sm text-slate-500 line-clamp-2 mb-6">{task.description}</p>

                       <div className="flex gap-2 mt-auto">
                          {activeTab === 'market' && (
                             <Button onClick={() => setSelectedTask(task)} className="w-full bg-slate-900 text-white">Ambil Tugas</Button>
                          )}
                          
                          {activeTab === 'active' && (
                             <>
                                <Button variant="secondary" onClick={() => setChatTask(task)} className="flex-1"><MessageCircle className="w-4 h-4" /></Button>
                                {task.status === 'taken' ? (
                                   <Button onClick={() => setSubmitTaskModal(task)} className="flex-[2] bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                                      <Send className="w-4 h-4 mr-2" /> Submit
                                   </Button>
                                ) : (
                                   <div className="flex-[2] bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center rounded-xl">
                                      Menunggu Review
                                   </div>
                                )}
                             </>
                          )}

                          {activeTab === 'history' && (
                             <div className="w-full bg-green-100 text-green-700 font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Selesai
                             </div>
                          )}
                       </div>
                    </BentoCard>
                 ))
              )}
           </div>
        </div>
      </div>

      {/* --- MOBILE NAV --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-2 flex justify-around">
          <button onClick={() => setActiveTab('market')} className={`p-3 rounded-2xl ${activeTab === 'market' ? 'text-sky-600 bg-sky-50' : 'text-slate-400'}`}><Home className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('active')} className={`p-3 rounded-2xl ${activeTab === 'active' ? 'text-sky-600 bg-sky-50' : 'text-slate-400'}`}><Briefcase className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('history')} className={`p-3 rounded-2xl ${activeTab === 'history' ? 'text-sky-600 bg-sky-50' : 'text-slate-400'}`}><Clock className="w-6 h-6" /></button>
      </div>

      {/* MODAL: TAKE TASK */}
      <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setError(''); }} title="Verifikasi">
        <form onSubmit={handleTakeTask} className="space-y-4">
          <p className="text-sm text-slate-600">Masukkan kode orang tua untuk mengambil tugas <strong>{selectedTask?.title}</strong>.</p>
          <div className="relative">
             <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
             <Input type="password" className="pl-10" placeholder="Kode Orang Tua" value={parentalCodeInput} onChange={e => setParentalCodeInput(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button type="submit" isLoading={loading} className="w-full bg-sky-500 text-white">Verifikasi</Button>
        </form>
      </Modal>

      {/* MODAL: SUBMIT TASK */}
      <Modal isOpen={!!submitTaskModal} onClose={() => setSubmitTaskModal(null)} title="Kirim Hasil Kerja">
         <form onSubmit={handleSubmitWork} className="space-y-4">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1">Link Hasil Kerja</label>
               <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input className="pl-10" placeholder="https://drive.google.com/..." value={submissionData.url} onChange={e => setSubmissionData({...submissionData, url: e.target.value})} required />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
               <textarea className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Saya sudah menyelesaikan..." value={submissionData.note} onChange={e => setSubmissionData({...submissionData, note: e.target.value})} />
            </div>
            <Button type="submit" isLoading={loading} className="w-full bg-blue-600 text-white">Kirim ke Klien</Button>
         </form>
      </Modal>

      {chatTask && (
        <ChatWindow taskId={chatTask.id} taskTitle={chatTask.title} currentUserId={currentUser.id} onClose={() => setChatTask(null)} />
      )}
    </div>
  );
};
