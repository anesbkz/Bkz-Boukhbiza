import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Lock, ArrowRight, Shield, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useI18n();
  const { login, isStaff } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      // If staff, navigate to admin command center; otherwise to app dashboard
      navigate(isStaff ? 'admin' : 'app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        setErrorMessage('Invalid identifier or password. Please verify your credentials.');
      } else if (msg.includes('auth/too-many-requests')) {
        setErrorMessage('Access temporarily throttled due to multiple attempts. Please pause and retry.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-[#F5F7FA]">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8F0] mb-3">
            <Lock className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              FIREBASE AUTH GATEWAY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-2">
            Subject Authentication
          </h1>
          <p className="text-xs text-gray-600">
            Log in to your ZIRON 90-day trajectory companion dashboard.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-sm relative">
          <GridPattern />
          <div className="relative z-10">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Electronic Mail / Identifier"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subject@virexon-biosciences.com"
              />

              <Input
                label="Passphrase"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  'Authenticate Subject Access'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                onClick={() => navigate('register')}
                className="text-[#0B2346] font-semibold hover:underline cursor-pointer"
              >
                New subject? Enroll here →
              </button>
              <button
                onClick={() => navigate('verify')}
                className="text-gray-500 hover:text-[#0B2346] cursor-pointer"
              >
                Verify Container
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
