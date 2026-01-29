import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { Button } from './Button';

interface XenditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  taskTitle: string;
  onSuccess: () => void;
}

export const XenditPaymentModal: React.FC<XenditPaymentModalProps> = ({ isOpen, onClose, amount, taskTitle, onSuccess }) => {
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!selectedMethod) return;
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleFinish = () => {
    onSuccess();
    // Reset state after closing
    setTimeout(() => {
      setStep('method');
      setSelectedMethod(null);
    }, 500);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header with Xendit Branding */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
             {/* Xendit-like Logo */}
             <div className="font-sans font-bold text-2xl tracking-tighter text-gray-900 dark:text-white">
               xendit<span className="text-blue-500">.</span>
             </div>
             <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-mono">TEST</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          
          {step === 'method' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pembayaran</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{formatRupiah(amount)}</h2>
                <p className="text-xs text-gray-400 mt-1 truncate">Untuk: {taskTitle}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Pilih Metode Pembayaran</h3>
                
                {/* Virtual Account */}
                <button 
                  onClick={() => setSelectedMethod('va')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'va' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Virtual Account</p>
                      <p className="text-xs text-gray-500">BCA, Mandiri, BRI, BNI</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'va' ? 'border-blue-500' : 'border-gray-300'}`}>
                    {selectedMethod === 'va' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                </button>

                {/* E-Wallet */}
                <button 
                  onClick={() => setSelectedMethod('ewallet')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'ewallet' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">E-Wallet / QRIS</p>
                      <p className="text-xs text-gray-500">OVO, DANA, ShopeePay</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'ewallet' ? 'border-blue-500' : 'border-gray-300'}`}>
                    {selectedMethod === 'ewallet' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                </button>

                {/* Credit Card */}
                <button 
                  onClick={() => setSelectedMethod('cc')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'cc' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Kartu Kredit / Debit</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'cc' ? 'border-blue-500' : 'border-gray-300'}`}>
                    {selectedMethod === 'cc' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Memproses Pembayaran...</h3>
                <p className="text-gray-500 text-sm mt-2">Mohon jangan tutup jendela ini.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pembayaran Berhasil!</h3>
                <p className="text-gray-500 text-sm mt-2">Dana telah diteruskan ke freelancer.</p>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-500">
                  REF: XND-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'method' && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <Button 
              onClick={handlePayment} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
              disabled={!selectedMethod}
            >
              Bayar Sekarang
            </Button>
            <div className="flex justify-center items-center gap-2 mt-3 text-[10px] text-gray-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Pembayaran Aman & Terenkripsi oleh Xendit</span>
            </div>
          </div>
        )}
        
        {step === 'success' && (
           <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
             <Button onClick={handleFinish} className="w-full">
               Selesai
             </Button>
           </div>
        )}
      </div>
    </div>
  );
};