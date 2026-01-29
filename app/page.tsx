import React from 'react';
import { Shield, Coins, Rocket, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">TeenSkill</span>
          </div>
          <Button onClick={onStart} variant="primary">Mulai Sekarang</Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 px-4 text-center bg-gradient-to-b from-indigo-50 to-white">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Platform Freelance Aman <br/><span className="text-indigo-600">Untuk Remaja</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Pelajari keterampilan dunia nyata, hasilkan uang dengan aman, dan bangun masa depanmu.
            Disetujui orang tua, aman, dan dirancang khusus untuk remaja 13-17 tahun.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={onStart} className="px-8 py-3 text-lg h-auto">Gabung Sekarang</Button>
            <Button onClick={onStart} variant="secondary" className="px-8 py-3 text-lg h-auto">Pasang Lowongan</Button>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Keamanan Utama</h3>
            <p className="text-gray-600">Setiap tugas diperiksa oleh AI demi keamanan. Kontrol orang tua memastikan remaja hanya mengambil pekerjaan yang disetujui.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hasilkan & Belajar</h3>
            <p className="text-gray-600">Bangun portofolio sejak dini. Dapatkan bayaran untuk desain grafis, coding, menulis, dan banyak lagi.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Klien Terverifikasi</h3>
            <p className="text-gray-600">Klien diverifikasi. Pembayaran ditahan di rekening bersama (escrow) sampai pekerjaan selesai.</p>
          </div>
        </section>

        <section className="bg-indigo-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Siap memulai perjalananmu?</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-indigo-800 p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Saya Klien
                </h4>
                <p className="text-indigo-200 mb-4">Pasang tugas aman untuk remaja berbakat. Bantu generasi penerus berkembang.</p>
                <Button onClick={onStart} variant="secondary" className="w-full">Rekrut Talenta</Button>
              </div>
              <div className="bg-indigo-800 p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Rocket className="w-5 h-5" /> Saya Remaja
                </h4>
                <p className="text-indigo-200 mb-4">Siapkan kode orang tua Anda dan mulai hasilkan uang hari ini.</p>
                <Button onClick={onStart} variant="primary" className="w-full bg-white text-indigo-900 hover:bg-indigo-50">Mulai Bekerja</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-500 py-8 text-center">
        <p>© 2024 TeenSkill. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
};