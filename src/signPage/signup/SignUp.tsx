import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // 추후 users 테이블과 연동된 API 호출 로직 추가 (예: fetch('/api/signup', { method: 'POST', body: JSON.stringify({ email, password }) }))
    console.log('Signup attempt with:', { email, password });
  };

  const handleGoogleSignup = () => {
    // 추후 Google OAuth API 호출 로직 추가
    console.log('Google signup attempted');
  };

  return (
    <div className="flex min-h-[80vh] bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-white items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-sm space-y-6">
        <img src="/HIREHUB_LOGO.PNG" alt="HireHub Logo" className="h-10" />
        <h1 className="text-text-primary dark:text-white text-2xl font-bold leading-tight text-center px-4 pb-6">회원가입</h1>
        <form onSubmit={handleSignup} className="w-full space-y-4">
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
              />
            </label>
          </div>
          <div className="flex px-0 py-3 w-full">
            <button
              type="submit"
              className="bg-blue-500 flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              <span className="truncate">회원가입</span>
            </button>
          </div>
          <div className="flex items-center px-4 py-6">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">또는</span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="flex px-0 py-3 w-full">
            <button
              onClick={handleGoogleSignup}
              className="flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark h-14 px-5 text-gray-800 dark:text-white font-medium text-lg shadow-md"
            >
              <img
                alt="Google logo"
                className="w-7 h-7 mr-3"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6YBO-cORHIn6I-QMnAUmnqXHa1nDAMQNBHV41slgiW-7zdmgfm6Qji0s2RwShUhRiK5j_SUteYlB1GzeHzEZiBmRA4j7qgoBBQS9VRFlY-agw15MB6wqwwzjAPzS-wvFT0vKCZHbOJQRUVOYvR0Pla-FOALMX4teVCgsU-vM2qpx5IKpC5E6ZiwGiFKW7HtIF4YDRCRbmUZOis-DIITME-QrJQAtsAfNnWtzqdyesIH84ggOtKJcxbVHb80_NUeC7DL6ZTIL4S0Q"
              />
              <span>Google</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-text-secondary dark:text-gray-400 text-sm font-normal leading-normal">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline text-blue-600">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;