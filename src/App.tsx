// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';
import Layout from './layout/Layout';
import MainPage from './mainPage/MainPage';
import BoardPage from './boardPage/BoardPage';
import SignInfo from './signInfo/SignInfo';
import AdminLayout from './adminPage/AdminPage';
import MyPage from './myPage/MyPage';
import Login from './signPage/login/Login';
import Signup from './signPage/signup/SignUp';
import JobPostings from './jobPostings/JobPostings';
import CompanyDetail from './jobPostings/jopPostingComponents/CompanyDetail';
import ChatBot from './chatBot/ChatBot';
import JobDetailRoute from "./jobPostings/JobDetailRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 */}
        <Route path="/" element={<Layout><MainPage /></Layout>} />

        {/* 게시판 */}
        <Route path="/board/*" element={<Layout><BoardPage /></Layout>} />

        {/* 관리자 */}
        <Route path="/admin" element={<Navigate to="/admin/job-management" replace />} />
        <Route path="/admin/:tab/*" element={<Layout><AdminLayout /></Layout>} />

        {/* 마이페이지(탭 라우팅은 MyPage 내부에서 처리) */}
        <Route path="/myPage" element={<Navigate to="/myPage/MyInfo" replace />} />
        <Route path="/myPage/:tab/*" element={<Layout><MyPage /></Layout>} />

        {/* 채용 공고 */}
        <Route path="/jobPostings" element={<Layout><JobPostings /></Layout>} />

        {/* 로그인/회원가입 */}
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/signInfo" element={<SignInfo />} />

        {/* 챗봇/기업 상세 */}
        <Route path="/chatBot" element={<Layout><ChatBot /></Layout>} />
        <Route path="/company/:companyName" element={<Layout><CompanyDetail onBack={() => window.history.back()} /></Layout>} />

        {/* ❌ 여기 있었던 /myPage/resume/ResumeViewer/:id 라우트는 제거 */}

          {/* ...기존 라우트들 */}
  <Route path="/jobposts/:id" element={<JobDetailRoute />} />
  {/* 필요하면 별칭도 같이 열어두세요 */}
  <Route path="/jobs/:id" element={<JobDetailRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
