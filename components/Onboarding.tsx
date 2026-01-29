
import React, { useState } from 'react';
import { User, Role } from '../types'; 
import { registerUserAction } from '@/app/actions';
import { Button } from './Button';
import { Input } from './Input';
import { Briefcase, User as UserIcon, GraduationCap, Building2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    age: '',
    parentalCode: '',
  });

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep('details');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError('');

    try {
      const result = await registerUserAction({
        ...formData,
        role
      });
      
      if (result && result.success && result.user) {
        // SUKSES: Jangan reload halaman! Langsung update state di parent.
        // Ini mencegah error "Server Component Render" karena koneksi ulang.
        onComplete(result.user);
      } else {
        throw new Error('Gagal mendapatkan respon sukses dari server.');
      }
    } catch (err: any) {
      console.error("Registration Error:", err);
      // Pesan error yang lebih membantu
      if (err.message && err.message.includes("TURSO")) {
         setError("Koneksi Database bermasalah. Hubungi Admin.");
      } else {
         setError(err.message || 'Terjadi kesalahan sistem. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] animate-fade-in-up">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Siapa Kamu?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Pilih peranmu untuk menyesuaikan pengalaman aplikasi.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Opsi 1: Siswa / Freelancer */}
            <button 
              onClick={() => handleRoleSelect('freelancer')}
              className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border-2 border-transparent hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-200 dark:hover:shadow-sky-900/20 transition-all duration-300 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">Saya Siswa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Saya berusia 13-17 tahun. Saya ingin mencari uang saku tambahan dengan mengerjakan tugas aman.
              </p>
              <div className="mt-6 flex items-center text-sky-600 font-bold text-sm">
                Daftar sebagai Freelancer &rarr;
              </div>
            </button>

            {/* Opsi 2: Klien */}
            <button 
              onClick={() => handleRoleSelect('client')}
              className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border-2 border-transparent hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-200 dark:hover:shadow-purple-900/20 transition-all duration-300 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">Saya Pemberi Tugas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Saya UMKM, Orang Tua, atau Profesional. Saya mencari bantuan remaja berbakat untuk tugas ringan.
              </p>
              <div className="mt-6 flex items-center text-purple-600 font-bold text-sm">
                Daftar sebagai Klien &rarr;
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Details (Langkah 2)
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] p-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700 p-8 relative overflow-hidden">
        
        {/* Dekorasi Background */}
        <div className={`absolute top-0 left-0 w-full h-2 ${role === 'freelancer' ? 'bg-sky-500' : 'bg-purple-500'}`} />
        
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-900 dark:text-white">Lengkapi Profil</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Mendaftar sebagai <span className={`font-bold ${role === 'freelancer' ? 'text-sky-600' : 'text-purple-600'}`}>
            {role === 'freelancer' ? 'Siswa Freelancer' : 'Pemberi Tugas'}
          </span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Contoh: Budi Santoso"
          />
          <Input 
            label="Username Unik" 
            value={formData.username} 
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
            placeholder="Contoh: budi_design"
          />
          
          {role === 'freelancer' && (
            <>
              <Input 
                label="Usia (13-17 Tahun)" 
                type="number"
                min="13"
                max="17"
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})}
                required
              />
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                <div className="flex gap-2 items-center mb-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                   <p className="text-xs text-amber-800 dark:text-amber-400 font-bold tracking-wide uppercase">Izin Orang Tua Wajib</p>
                </div>
                <Input 
                  label="Buat Kode Rahasia" 
                  value={formData.parentalCode} 
                  onChange={e => setFormData({...formData, parentalCode: e.target.value})}
                  placeholder="Kode PIN (ingat baik-baik)"
                  required
                  className="bg-white dark:bg-gray-900"
                />
                <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                  Kode ini akan diminta setiap kali kamu mengambil pekerjaan untuk memastikan orang tua setuju.
                </p>
              </div>
            </>
          )}

          {role === 'client' && (
             <Input 
             label="Usia (Minimal 18 Tahun)" 
             type="number"
             min="18"
             value={formData.age} 
             onChange={e => setFormData({...formData, age: e.target.value})}
             required
           />
          )}

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900 text-center">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep('role')}>Ganti Peran</Button>
            <Button type="submit" className={`flex-1 ${role === 'freelancer' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-purple-600 hover:bg-purple-700'}`} isLoading={loading}>
              Selesai & Masuk
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
