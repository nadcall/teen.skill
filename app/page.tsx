import React from 'react';
import { Shield, Coins, Rocket, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <main className="flex-grow">
        <section className="py-24 px-4 text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Platform Freelance Aman <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Untuk Remaja
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 font-medium">
            Pelajari keterampilan dunia nyata, hasilkan uang dengan aman, dan bangun masa depanmu.
            Disetujui orang tua, aman, dan dirancang khusus untuk remaja 13-17 tahun.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={onStart} className="px-8 py-3 text-lg h-auto shadow-lg shadow-indigo-500/20">Gabung Sekarang</Button>
            <Button onClick={onStart} variant="secondary" className="px-8 py-3 text-lg h-auto shadow-lg">Pasang Lowongan</Button>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', title: 'Keamanan Utama', desc: 'Setiap tugas diperiksa oleh AI demi keamanan. Kontrol orang tua memastikan remaja hanya mengambil pekerjaan yang aman.' },
            { icon: Coins, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', title: 'Hasilkan & Belajar', desc: 'Bangun portofolio sejak dini. Dapatkan bayaran untuk desain grafis, coding, menulis, dan banyak lagi.' },
            { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', title: 'Klien Terverifikasi', desc: 'Klien diverifikasi. Pembayaran ditahan di rekening bersama (escrow) sampai pekerjaan selesai.' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700 hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-indigo-900 dark:bg-indigo-950 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            
            <div className="relative p-12 text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">Siap memulai perjalananmu?</h2>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-white">
                    <Briefcase className="w-5 h-5 text-indigo-300" /> Saya Klien
                  </h4>
                  <p className="text-indigo-100 mb-6">Pasang tugas aman untuk remaja berbakat. Bantu generasi penerus berkembang.</p>
                  <Button onClick={onStart} variant="secondary" className="w-full">Rekrut Talenta</Button>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-white">
                    <Rocket className="w-5 h-5 text-purple-300" /> Saya Remaja
                  </h4>
                  <p className="text-indigo-100 mb-6">Siapkan kode orang tua Anda dan mulai hasilkan uang hari ini.</p>
                  <Button onClick={onStart} variant="primary" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 dark:hover:bg-gray-200">Mulai Bekerja</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-gray-500 dark:text-gray-400 py-8 text-center text-sm font-medium">
        <p>© 2024 TeenSkill. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
};