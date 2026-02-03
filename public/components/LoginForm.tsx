import { useRouter } from 'next/navigation';
import { useState } from 'react';


interface LoginFormProps {
  mockSignIn: (provider: string, credentials?: any) => Promise<any>;
}

function LoginForm({ mockSignIn }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleEmailPasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!showOtpInput) {
      const result = await mockSignIn('credentials', { email, password });
      if (result?.error) {
        setError(result.error);
        if (result.error === 'otp_required') {
          setShowOtpInput(true);
        }
      } else if (result?.ok) {
        router.push('/');
      }
    } else {
      const result = await mockSignIn('credentials', { email, password, otp });
      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/');
      }
    }
  };

  return (
    <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="อีเมล"
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="รหัสผ่าน"
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showOtpInput && (
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="รหัส OTP"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        {showOtpInput ? 'ยืนยัน OTP และเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  );
}