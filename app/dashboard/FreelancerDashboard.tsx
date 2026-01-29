
import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction, syncUser } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ChatWindow } from '@/components/ChatWindow';
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { useTheme } from '@/context/ThemeContext';
import { 
  Briefcase, Lock, Search, Smile, Star, MessageCircle, 
  Home, Clock, Award, Bell, Sun, Moon, LogOut, CheckCircle2, TrendingUp, Wallet
} from 'lucide-react';

interface FreelancerDashboardProps {
  user: any;
}

// --- SUB-COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-3xl border border-white/50 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const Badge = ({ level, xp }: { level: number, xp: number }) => {
  let badgeName = "Novice";
  let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
  let icon = Star;

  if (level >= 5) { badgeName = "Apprentice"; badgeColor = "bg-sky-100 text-sky-600 border-sky-200"; icon = TrendingUp; }
  if (level >= 10) { badgeName = "Expert"; badgeColor = "bg-indigo-100 text-indigo-600 border-indigo-200"; icon = Award; }
  if (level >= 20) { badgeName = "Master"; badgeColor = "bg-purple-100 text-purple-600 border-purple-200"; icon = CheckCircle2; }

  // XP to next level (simple logic: level * 100)
  const nextLevelXp = level * 100;
  const progress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badgeColor} w-fit`}>
        <div className={`p-1 rounded-full bg-white dark:bg-slate-900`}>
           {React.createElement(icon, { size: 12 })}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{badgeName} (Lv.{level})</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-400" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 text-right">{xp}/{nextLevelXp} XP</p>
    </div>
  );
};

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ user: initialUser }) => {
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'market' | 'active' | 'history'>('market');
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(initialUser); // Local state for immediate XP/Balance updates
  
  // Modal & Actions State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatTask, setChatTask] = useState<any | null>(null);

  // Computed Stats
  const level = Math.floor((currentUser.xp || 0) / 100) + 1;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  // Note: API `getOpenTasks` doesn't return completed ones if we are in 'market' tab. 
  // We need to rely on `getMyTasks` for stats or create a separate stat fetcher. 
  // For simplicity, we calculate from what we have loaded or fetch fresh user data.

  const fetchTasks = async () => {
    setLoading(true);
    // Refresh user data to get latest XP/Balance
    const freshUser = await syncUser();
    if(freshUser) setCurrentUser(freshUser);

    if (activeTab === 'market') {
      const data = await getOpenTasksAction();
      setTasks(data);
    } else {
      // Both 'active' and 'history' use getMyTasks but filtered client-side for now
      const data = await getMyTasksAction(currentUser.id, 'freelancer');
      if (activeTab === 'active') {
        setTasks(data.filter((t: any) => t.status === 'taken' || t.status === 'submitted'));
      } else {
        setTasks(data.filter((t: any) => t.status === 'completed'));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

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
      setActiveTab('active'); // Switch to active tab
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-24 px-4 min-h-screen bg-transparent">
      
      {/* --- DESKTOP FLOATING NAVBAR (TOP) --- */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-xl shadow-sky-900/5 rounded-full px-6 py-3 items-center gap-8 animate-fade-in-up">
         <div className="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-gray-700">
            <span className="font-bold text-sky-600 dark:text-sky-400 tracking-tight text-lg">TeenSkill</span>
         </div>
         
         <div className="flex items-center gap-2">
            <NavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={Search} label="Cari Kerja" />
            <NavButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={Briefcase} label="Tugas Aktif" />
            <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={Clock} label="Riwayat" />
         </div>

         <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-slate-300" />}
            </button>
            <UserButton afterSignOutUrl="/" />
         </div>
      </nav>

      {/* --- CONTENT WRAPPER --- */}
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
               <img src={clerkUser?.imageUrl} className="w-20 h-20 rounded-3xl border-4 border-white dark:border-slate-800 shadow-lg" alt="Profile" />
               <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800">
                 Lv.{level}
               </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Halo, {currentUser.name.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Siap menyelesaikan tantangan hari ini?</p>
              <Badge level={level} xp={currentUser.xp || 0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <StatCard icon={Wallet} label="Dompet" value={formatRupiah(currentUser.balance)} color="bg-green-500" />
            <StatCard icon={Star} label="Total XP" value={currentUser.xp || 0} color="bg-orange-500" />
          </div>
        </div>

        {/* TAB HEADER (MOBILE ONLY) */}
        <div className="md:hidden flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-800 dark:text-white">
             {activeTab === 'market' ? 'Bursa Kerja' : activeTab === 'active' ? 'Tugasku' : 'Riwayat'}
           </h2>
           <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-bold">
             {tasks.length} Item
           </span>
        </div>

        {/* TASK LIST */}
        <div className="grid gap-4">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-32 bg-white/40 dark:bg-slate-800/40 rounded-3xl animate-pulse" />)
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/50 dark:border-slate-700 backdrop-blur-sm">
               <Smile className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500 font-medium">Tidak ada data di sini.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="group bg-white/70 dark:bg-slate-800/70 p-6 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 backdrop-blur-md relative overflow-hidden">
                {/* Accent Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  task.status === 'completed' ? 'bg-green-500' : 
                  task.status === 'taken' ? 'bg-sky-500' : 'bg-indigo-500'
                }`} />

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                   <div className="flex-1 pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        {task.status === 'completed' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">SELESAI</span>}
                        {task.status === 'taken' && <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">AKTIF</span>}
                        {task.status === 'open' && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BARU</span>}
                        <span className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-2">{task.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                   </div>

                   <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                        {formatRupiah(task.budget)}
                      </span>
                      
                      {activeTab === 'market' && (
                        <Button onClick={() => setSelectedTask(task)} className="w-full h-10 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                          Ambil
                        </Button>
                      )}
                      
                      {activeTab === 'active' && (
                        <Button variant="secondary" onClick={() => setChatTask(task)} className="w-full h-10 text-sm flex items-center justify-center gap-2 rounded-xl">
                          <MessageCircle className="w-4 h-4" /> Diskusi
                        </Button>
                      )}
                      
                      {activeTab === 'history' && (
                        <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                           <CheckCircle2 className="w-3 h-3" /> Paid
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (DOCK STYLE) --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-2 flex justify-around items-center">
           <MobileNavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={Home} label="Beranda" />
           <MobileNavButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={Briefcase} label="Aktif" />
           
           {/* Center Profile Action */}
           <div className="relative -top-6">
             <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 p-1 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-full h-full" } }} />
             </div>
           </div>

           <MobileNavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={Clock} label="Riwayat" />
           <MobileNavButton active={false} onClick={toggleTheme} icon={theme === 'light' ? Moon : Sun} label="Tema" />
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal 
        isOpen={!!selectedTask} 
        onClose={() => { setSelectedTask(null); setError(''); }} 
        title="Verifikasi Izin"
      >
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">{selectedTask?.title}</h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
            Kamu akan mengerjakan tugas ini dengan honor <strong>{selectedTask && formatRupiah(selectedTask.budget)}</strong>.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-3 py-2 rounded-lg">
             <Star className="w-3 h-3 fill-current" />
             Sisa Kuota Harianmu: {currentUser.taskQuotaDaily} Tugas
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
          {error && <p className="text-sm text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">{error}</p>}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
             <Button type="button" variant="ghost" onClick={() => setSelectedTask(null)}>Batalkan</Button>
             <Button type="submit" isLoading={loading} className="bg-sky-500 text-white hover:bg-sky-600">Verifikasi</Button>
          </div>
        </form>
      </Modal>

      {chatTask && (
        <ChatWindow
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          currentUserId={currentUser.id}
          onClose={() => setChatTask(null)}
        />
      )}
    </div>
  );
};

// --- NAV HELPERS ---

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
      active 
      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);

const MobileNavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
      active ? 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    <Icon className={`w-6 h-6 mb-1 ${active ? 'fill-current' : ''}`} />
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);
