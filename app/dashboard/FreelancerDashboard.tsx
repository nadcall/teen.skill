
import React, { useEffect, useState } from 'react';
import { getOpenTasksAction, getMyTasksAction, takeTaskAction, submitTaskAction, syncUser, getWeeklyTaskCountAction, updatePaymentDetailsAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ChatWindow } from '@/components/ChatWindow';
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from '@/context/ThemeContext';
import { 
  Briefcase, Lock, Search, Smile, Star, MessageCircle, CreditCard,
  Home, Clock, Award, Sun, Moon, CheckCircle2, TrendingUp, Wallet, Send, Link as LinkIcon, Zap, Calendar, AlertCircle
} from 'lucide-react';

interface FreelancerDashboardProps {
  user: any;
}

const BentoCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ user: initialUser }) => {
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'market' | 'active' | 'history'>('market');
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [weeklyCount, setWeeklyCount] = useState(0);
  
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [submitTaskModal, setSubmitTaskModal] = useState<any | null>(null);
  const [chatTask, setChatTask] = useState<any | null>(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    method: initialUser.paymentMethod || 'BCA',
    number: initialUser.paymentNumber || ''
  });

  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [submissionData, setSubmissionData] = useState({ url: '', note: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const level = Math.floor((currentUser.xp || 0) / 100) + 1;
  const progressToNextLevel = (currentUser.xp % 100);
  const maxQuota = currentUser.taskQuota || 5;

  const fetchTasks = async () => {
    setLoading(true);
    const freshUser = await syncUser();
    if(freshUser) {
        setCurrentUser(freshUser);
        setPaymentForm({
            method: freshUser.paymentMethod || 'BCA',
            number: freshUser.paymentNumber || ''
        });
        const count = await getWeeklyTaskCountAction(freshUser.id);
        setWeeklyCount(count);
    }

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

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await updatePaymentDetailsAction(paymentForm.method, paymentForm.number);
        setShowPaymentModal(false);
        fetchTasks();
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const initTakeTask = (task: any) => {
      // Validasi: Wajib punya rekening dulu
      if (!currentUser.paymentMethod || !currentUser.paymentNumber) {
          setShowPaymentModal(true);
          return;
      }
      setSelectedTask(task);
  };

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
    <div className="pt-32 pb-24 px-4 min-h-screen w-full max-w-[1600px] mx-auto">
      
      {/* DESKTOP NAV */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 rounded-full px-6 py-2 items-center gap-2 animate-fade-in-up transition-all hover:scale-105">
         <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg shadow-sky-500/30">
            TS
         </div>
         {['market', 'active', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
               {tab === 'market' ? 'Bursa Kerja' : tab === 'active' ? 'Tugasku' : 'Riwayat'}
            </button>
         ))}
         <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />
         <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400">
             {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
         </button>
         <div className="pl-2">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-white dark:border-slate-800" } }} />
         </div>
      </nav>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
        
        {/* LEFT COLUMN: PROFILE & STATS */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
           
           {/* Profile Card */}
           <BentoCard className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-20" />
              <div className="relative z-10 flex flex-col items-center text-center mt-4">
                 <div className="p-1 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl mb-4">
                     <img src={clerkUser?.imageUrl} className="w-24 h-24 rounded-[1.8rem]" alt="Profile" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{currentUser.name.split(' ')[0]}</h2>
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">@{currentUser.username}</p>
                 
                 <div className="mt-6 w-full">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                       <span>Level {level}</span>
                       <span>{currentUser.xp} XP</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-slate-600">
                       <div className="bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }} />
                    </div>
                 </div>
              </div>
           </BentoCard>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 flex flex-col justify-between bg-emerald-500 text-white rounded-[2rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                 <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-md">
                     <Wallet className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-emerald-100 mb-1 opacity-90">Saldo</p>
                    <p className="text-sm font-extrabold truncate tracking-tight">{formatRupiah(currentUser.balance)}</p>
                 </div>
              </div>
              <div className="p-5 flex flex-col justify-between bg-amber-500 text-white rounded-[2rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                 <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-md">
                     <Award className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-amber-100 mb-1 opacity-90">Selesai</p>
                    <p className="text-lg font-extrabold tracking-tight">
                        {tasks.filter(t => t.status === 'completed').length || 0}
                    </p>
                 </div>
              </div>
           </div>

           {/* Payment Details Card - NEW */}
           <BentoCard className="bg-white dark:bg-slate-900 group cursor-pointer hover:border-sky-500" onClick={() => setShowPaymentModal(true)}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-sky-500" /> Akun Bank
                    </h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">Edit</span>
                </div>
                {currentUser.paymentNumber ? (
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">{currentUser.paymentMethod}</p>
                        <p className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                            {currentUser.paymentNumber}
                        </p>
                        <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> Terverifikasi</p>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs text-red-500 font-bold mb-2">Belum diatur!</p>
                        <Button className="w-full h-8 text-xs bg-sky-500 text-white" onClick={(e) => { e.stopPropagation(); setShowPaymentModal(true); }}>Atur Sekarang</Button>
                    </div>
                )}
           </BentoCard>

           {/* Weekly Quota Card - UPDATED */}
           <BentoCard className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none relative overflow-hidden">
               <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10 rotate-12" />
               <h3 className="font-bold text-lg mb-1">Kuota Mingguan</h3>
               <p className="text-indigo-100 text-xs mb-4 font-medium opacity-80">
                   Jatah ambil tugasmu reset setiap 7 hari.
               </p>
               <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">{maxQuota - weeklyCount}</span>
                  <span className="text-sm mb-1 opacity-80 font-bold">/ {maxQuota} Tersisa</span>
               </div>
               <div className="w-full bg-black/20 h-1.5 mt-3 rounded-full overflow-hidden">
                   <div className="bg-white h-full rounded-full transition-all" style={{ width: `${(weeklyCount / maxQuota) * 100}%` }} />
               </div>
           </BentoCard>
        </div>

        {/* RIGHT COLUMN: MAIN FEED */}
        <div className="md:col-span-8 lg:col-span-9">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    {activeTab === 'market' ? 'Bursa Kerja' : activeTab === 'active' ? 'Proyek Aktif' : 'Riwayat'}
                 </h1>
                 <p className="text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                    {activeTab === 'market' ? 'Temukan peluang baru dan tingkatkan skillmu.' : 'Fokus selesaikan tugasmu tepat waktu.'}
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {loading ? [1,2,3,4].map(i => <div key={i} className="h-48 bg-white/50 rounded-[2rem] animate-pulse" />) :
              tasks.length === 0 ? (
                 <div className="col-span-2 py-24 text-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smile className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Belum ada tugas saat ini.</h3>
                    <p className="text-slate-500 font-medium">Coba cek kembali nanti ya!</p>
                 </div>
              ) : (
                 tasks.map(task => (
                    <BentoCard key={task.id} className="group relative flex flex-col justify-between min-h-[220px] border-l-[6px] border-l-transparent hover:border-l-sky-500 overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 dark:bg-sky-900/10 rounded-bl-[4rem] -z-10 transition-transform group-hover:scale-150 duration-500" />

                       <div>
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex flex-wrap gap-2">
                                {task.status === 'open' && <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">OPEN</span>}
                                {task.status === 'taken' && <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">ON PROGRESS</span>}
                                {task.status === 'submitted' && <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">UNDER REVIEW</span>}
                                {task.status === 'completed' && <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider">DONE</span>}
                                <span className="text-xs text-slate-500 dark:text-slate-400 py-1 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" /> {new Date(task.createdAt).toLocaleDateString()}</span>
                                {task.deadline && (
                                   <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-red-100">
                                      <Calendar className="w-3 h-3" /> Due: {task.deadline}
                                   </span>
                                )}
                             </div>
                          </div>
                          <h3 className="font-extrabold text-xl mb-3 text-slate-900 dark:text-white leading-tight group-hover:text-sky-600 transition-colors">{task.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-6 font-medium">{task.description}</p>
                       </div>

                       <div className="flex items-end justify-between mt-auto">
                          <div className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                             {formatRupiah(task.budget)}
                          </div>
                          
                          <div className="flex gap-2">
                              {activeTab === 'market' && (
                                 <Button onClick={() => initTakeTask(task)} className="bg-slate-900 text-white shadow-xl shadow-slate-900/20 px-6 h-11 rounded-xl hover:scale-105">
                                    Ambil Tugas
                                 </Button>
                              )}
                              
                              {activeTab === 'active' && (
                                 <>
                                    <Button 
                                      onClick={() => setChatTask(task)} 
                                      className="w-11 h-11 p-0 rounded-xl flex items-center justify-center bg-violet-100 hover:bg-violet-200 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shadow-sm transition-colors"
                                      title="Chat dengan Klien"
                                    >
                                       <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
                                    </Button>

                                    {task.status === 'taken' ? (
                                       <Button onClick={() => setSubmitTaskModal(task)} className="bg-blue-600 text-white shadow-blue-500/30 px-5 h-11 rounded-xl">
                                          <Send className="w-4 h-4 mr-2" /> Submit
                                       </Button>
                                    ) : (
                                       <div className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center">
                                          <Clock className="w-3 h-3 mr-1" /> Menunggu Review
                                       </div>
                                    )}
                                 </>
                              )}
                          </div>
                       </div>
                    </BentoCard>
                 ))
              )}
           </div>
        </div>
      </div>

      {/* --- MOBILE NAV --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-2 flex justify-between items-center px-6">
          <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center gap-1 ${activeTab === 'market' ? 'text-sky-600' : 'text-slate-400'}`}>
             <div className={`p-2 rounded-xl transition-all ${activeTab === 'market' ? 'bg-sky-50' : ''}`}><Home className="w-6 h-6" /></div>
          </button>
          <button onClick={() => setActiveTab('active')} className={`flex flex-col items-center gap-1 ${activeTab === 'active' ? 'text-sky-600' : 'text-slate-400'}`}>
             <div className={`p-2 rounded-xl transition-all ${activeTab === 'active' ? 'bg-sky-50' : ''}`}><Briefcase className="w-6 h-6" /></div>
          </button>
          <div className="relative -top-5">
             <div className="bg-sky-500 p-1 rounded-full shadow-lg shadow-sky-500/40">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-white" } }} />
             </div>
          </div>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-sky-600' : 'text-slate-400'}`}>
             <div className={`p-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-sky-50' : ''}`}><Clock className="w-6 h-6" /></div>
          </button>
          <button onClick={toggleTheme} className="text-slate-400">
             <div className="p-2"><Sun className="w-6 h-6" /></div>
          </button>
      </div>

      {/* MODAL: UPDATE PAYMENT */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Detail Pembayaran">
         <form onSubmit={handleUpdatePayment} className="space-y-4">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
                 <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                 <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                     Masukkan rekening atau e-wallet tempat kamu ingin menerima pembayaran. Ini wajib diisi agar klien bisa membayar.
                 </p>
             </div>
             
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Metode (Bank / E-Wallet)</label>
                <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                >
                    <option value="BCA">Bank BCA</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="GOPAY">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="SHOPEEPAY">ShopeePay</option>
                </select>
             </div>

             <Input 
                label="Nomor Rekening / HP" 
                placeholder="Contoh: 1234567890" 
                value={paymentForm.number} 
                onChange={e => setPaymentForm({...paymentForm, number: e.target.value})} 
                required
                className="text-slate-900"
             />

             <Button type="submit" isLoading={loading} className="w-full bg-slate-900 text-white mt-4">Simpan Detail</Button>
         </form>
      </Modal>

      {/* MODAL: TAKE TASK */}
      <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setError(''); }} title="Verifikasi Izin Orang Tua">
        <form onSubmit={handleTakeTask} className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
             <Lock className="w-6 h-6 text-amber-500 flex-shrink-0" />
             <p className="text-sm text-amber-800 leading-relaxed">
                Untuk keamanan, masukkan <strong>Kode Orang Tua</strong> yang dibuat saat pendaftaran untuk mengambil tugas: <br/>
                <span className="font-bold text-amber-900">"{selectedTask?.title}"</span>
             </p>
          </div>
          
          <div className="relative">
             <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
             <Input type="password" className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-slate-900" placeholder="Masukkan Kode PIN" value={parentalCodeInput} onChange={e => setParentalCodeInput(e.target.value)} required />
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100">{error}</div>}
          
          <div className="flex gap-3">
             <Button type="button" variant="ghost" className="flex-1" onClick={() => setSelectedTask(null)}>Batal</Button>
             <Button type="submit" isLoading={loading} className="flex-[2] bg-slate-900 text-white shadow-lg h-12 rounded-xl">Konfirmasi</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SUBMIT TASK */}
      <Modal isOpen={!!submitTaskModal} onClose={() => setSubmitTaskModal(null)} title="Kirim Hasil Kerja">
         <form onSubmit={handleSubmitWork} className="space-y-5">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Link File / Dokumen</label>
               <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <Input className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 text-slate-900" placeholder="https://drive.google.com/..." value={submissionData.url} onChange={e => setSubmissionData({...submissionData, url: e.target.value})} required />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Catatan Tambahan</label>
               <textarea 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-900 placeholder:text-slate-400" 
                  rows={4}
                  placeholder="Ceritakan sedikit tentang hasil kerjamu..." 
                  value={submissionData.note} 
                  onChange={e => setSubmissionData({...submissionData, note: e.target.value})} 
               />
            </div>
            <Button type="submit" isLoading={loading} className="w-full bg-blue-600 text-white h-12 rounded-xl shadow-lg shadow-blue-500/20">Kirim ke Klien</Button>
         </form>
      </Modal>

      {chatTask && (
        <ChatWindow taskId={chatTask.id} taskTitle={chatTask.title} currentUserId={currentUser.id} onClose={() => setChatTask(null)} />
      )}
    </div>
  );
};
