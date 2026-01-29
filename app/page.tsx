import React from 'react';
import { Shield, Coins, Rocket, Briefcase, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingProps {
  onRegister: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
        
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 shadow-sm flex items-center gap-2">
          <Rocket className="w-3 h-3" /> Platform Freelance #1 Untuk Siswa
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 dark:text-white mb-6 tracking-tight leading-[1.1]">
          Belajar Mandiri, <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500">
            Hasilkan Prestasi
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Hubungkan siswa berbakat dengan klien terpercaya. 
          Aman dengan <span className="text-indigo-600 dark:text-indigo-400 font-bold">Kontrol Orang Tua</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          <Button onClick={onRegister} className="w-full sm:w-auto px-10 py-4 text-lg shadow-xl shadow-sky-500/20 transform hover:scale-105 transition-transform">
            Daftar Baru <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button onClick={onLogin} variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg border-2 border-white/50">
            <UserCheck className="w-5 h-5 mr-2" /> Sudah Punya Akun?
          </Button>
        </div>

        {/* Roles Explanation */}
        <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl w-full">
           <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-white/60 dark:border-slate-700 text-left backdrop-blur-sm hover:bg-white/80 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Untuk Klien (Pemberi Kerja)</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Posting tugas, bantu siswa belajar skill dunia nyata, dan bayar dengan aman.</p>
           </div>
           <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-white/60 dark:border-slate-700 text-left backdrop-blur-sm hover:bg-white/80 transition-colors">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mb-4 text-sky-600">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Untuk Siswa (Freelancer)</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Kerjakan tugas sesuai skill, kumpulkan portofolio, dan dapatkan uang saku. Wajib izin ortu.</p>
           </div>
        </div>

        {/* Features Grid */}
        <section className="mt-16 w-full max-w-6xl grid md:grid-cols-3 gap-6 text-left">
          {[
            { 
              icon: Shield, 
              color: 'text-sky-600', 
              bg: 'bg-sky-50 dark:bg-sky-900/20', 
              title: 'Keamanan Berlapis', 
              desc: 'Login siswa wajib menggunakan Kode Orang Tua. Tugas difilter oleh AI.' 
            },
            { 
              icon: Coins, 
              color: 'text-indigo-600', 
              bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
              title: 'Transparan', 
              desc: 'Harga tugas jelas di awal. Tidak ada biaya tersembunyi.' 
            },
            { 
              icon: CheckCircle, 
              color: 'text-purple-600', 
              bg: 'bg-purple-50 dark:bg-purple-900/20', 
              title: 'Pembayaran Valid', 
              desc: 'Sistem pembayaran aman menjamin siswa dibayar setelah kerja selesai.' 
            }
          ].map((feature, idx) => (
            <div key={idx} className="group bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg p-6 rounded-2xl border border-white/50 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-sm">
              <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-base font-bold mb-2 text-slate-800 dark:text-slate-100">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="py-8 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
        <p>© 2024 TeenSkill. Aman. Edukatif. Terpercaya.</p>
      </footer>
    </div>
  );
};