import React, { useState } from 'react';
import { User, Role } from '../types';
import { loginUser } from '../services/db';
import { Button } from './Button';
import { Input } from './Input';
import { Briefcase, User as UserIcon, Lock, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [role, setRole] = useState<Role>('freelancer');
  const [username, setUsername] = useState('');
  const [parentalCode, setParentalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginUser(username, role, parentalCode);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 relative">
        
        <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Masuk Kembali</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Pilih peran Anda untuk melanjutkan</p>

        {/* Role Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setRole('freelancer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'freelancer' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <UserIcon className="w-4 h-4" /> Siswa
          </button>
          <button 
            onClick={() => setRole('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'client' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Briefcase className="w-4 h-4" /> Klien
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Username" 
            placeholder="Masukkan username Anda"
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required
            className="bg-white/50"
          />

          {role === 'freelancer' && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <label className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Keamanan Orang Tua</label>
              </div>
              <Input 
                type="password"
                placeholder="Masukkan Kode Orang Tua"
                value={parentalCode} 
                onChange={e => setParentalCode(e.target.value)}
                required
                className="bg-white dark:bg-gray-900"
              />
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-2 leading-tight">
                *Siswa wajib memasukkan kode yang dibuat saat pendaftaran untuk bisa login.
              </p>
            </div>
          )}

          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm font-bold text-center border border-red-200 dark:border-red-800 animate-pulse">⚠️ {error}</div>}

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Masuk Sekarang
          </Button>
        </form>
      </div>
    </div>
  );
};