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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Selamat Datang di TeenSkill</h2>
          <p className="text-gray-500 text-center mb-8">Pilih jenis akun Anda untuk memulai</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleRoleSelect('freelancer')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200">
                <UserIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Saya Freelancer Remaja</h3>
                <p className="text-sm text-gray-500">Usia 13-17. Mencari pekerjaan.</p>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('client')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Saya Klien</h3>
                <p className="text-sm text-gray-500">Usia 18+. Mencari talenta.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Lengkapi Profil</h2>
        
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
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-800 mb-2 font-semibold">PERSETUJUAN ORANG TUA DIPERLUKAN</p>
                <Input 
                  label="Kode Orang Tua (Diatur oleh Orang Tua)" 
                  value={formData.parentalCode} 
                  onChange={e => setFormData({...formData, parentalCode: e.target.value})}
                  placeholder="Masukkan kode dari orang tua"
                  required
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

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep('role')}>Kembali</Button>
            <Button type="submit" className="flex-1" isLoading={loading}>Buat Akun</Button>
          </div>
        </form>
      </div>
    </div>
  );
};