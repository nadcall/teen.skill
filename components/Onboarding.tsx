import React, { useState } from 'react';
import { User, Role } from '../types';
import { registerUser } from '../services/db';
import { Button } from './Button';
import { Input } from './Input';
import { Briefcase, User as UserIcon } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User) => void;
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
      const ageNum = parseInt(formData.age);
      const user = await registerUser(
        formData.name,
        formData.username,
        role,
        isNaN(ageNum) ? 0 : ageNum,
        formData.parentalCode
      );
      onComplete(user);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-4 animate-fade-in-up">
        <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700 p-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900 dark:text-white">Selamat Datang</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">Pilih jenis akun Anda untuk memulai</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleRoleSelect('freelancer')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group bg-white/50 dark:bg-gray-800/50"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Saya Freelancer Remaja</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Usia 13-17. Mencari pekerjaan.</p>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('client')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group bg-white/50 dark:bg-gray-800/50"
            >
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Saya Klien</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Usia 18+. Mencari talenta.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Lengkapi Profil</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Nama Pengguna" 
            value={formData.username} 
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
          />
          
          {role === 'freelancer' && (
            <>
              <Input 
                label="Usia (13-17)" 
                type="number"
                min="13"
                max="17"
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})}
                required
              />
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/50">
                <p className="text-xs text-yellow-800 dark:text-yellow-400 mb-2 font-bold tracking-wide">PERSETUJUAN ORANG TUA DIPERLUKAN</p>
                <Input 
                  label="Kode Orang Tua" 
                  value={formData.parentalCode} 
                  onChange={e => setFormData({...formData, parentalCode: e.target.value})}
                  placeholder="Masukkan kode dari orang tua"
                  required
                  className="bg-white dark:bg-gray-900"
                />
              </div>
            </>
          )}

          {role === 'client' && (
             <Input 
             label="Usia (Harus 18+)" 
             type="number"
             min="18"
             value={formData.age} 
             onChange={e => setFormData({...formData, age: e.target.value})}
             required
           />
          )}

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep('role')}>Kembali</Button>
            <Button type="submit" className="flex-1" isLoading={loading}>Buat Akun</Button>
          </div>
        </form>
      </div>
    </div>
  );
};