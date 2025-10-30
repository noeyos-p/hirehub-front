import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      console.log('📦 로그인 응답:', response.data);

      const { accessToken, role, email: userEmail, id: userId } = response.data;

      if (accessToken) {
        // 토큰, role, 이메일 저장
        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role || 'USER');
        localStorage.setItem('email', userEmail || email);
        localStorage.setItem('userId', String(userId));
        
        console.log('🔑 로그인 성공');
        console.log('- 토큰:', accessToken.substring(0, 20) + '...');
        console.log('- Role:', role);
        console.log('- Email:', userEmail || email);

        // ✅ 로그인 후 페이지 새로고침으로 이동
        if (role === 'ADMIN') {
          console.log('✅ 관리자 - Admin 페이지로 이동');
          window.location.href = '/admin';
        } else {
          console.log('✅ 일반 사용자 - 메인 페이지로 이동');
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      console.error('❌ 로그인 에러:', err.response?.data);
      const errorMessage = err.response?.data?.message || '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseURL}/api/auth/google`;
  };

  return (
    <div className="flex min-h-[80vh] bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-white items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-sm space-y-6">
        <img src="/HIREHUB_LOGO.PNG" alt="HireHub Logo" className="h-10" />
        <h1 className="text-text-primary dark:text-white text-2xl font-bold leading-tight text-center px-4 pb-6">로그인</h1>
        
        {error && (
          <div className="w-full px-4 py-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="flex flex-col">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-text-primary dark:text-white text-base font-medium leading-normal pb-2">이메일</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-0 border border-[#cfdbe7] dark:border-gray-600 bg-background-light dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#4c739a] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
                required
                disabled={isLoading}
              />
            </label>
          </div>
          <div className="flex flex-col">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-text-primary dark:text-white text-base font-medium leading-normal pb-2">비밀번호</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-0 border border-[#cfdbe7] dark:border-gray-600 bg-background-light dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#4c739a] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
                required
                disabled={isLoading}
              />
            </label>
          </div>
          <div className="flex px-0 py-3 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{isLoading ? '로그인 중...' : '로그인'}</span>
            </button>
          </div>
          <div className="flex items-center px-4 py-6">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">또는</span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="flex px-0 py-3 w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark h-14 px-5 text-gray-800 dark:text-white font-medium text-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                alt="Google logo"
                className="w-7 h-7 mr-3"
                src='/google_logo_icon_169090.png'
              />
              <span>Google</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-text-secondary dark:text-gray-400 text-sm font-normal leading-normal">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline text-blue-600">
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;