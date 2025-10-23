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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={<Layout><MainPage /></Layout>} />

        {/* 게시판 페이지 */}
        <Route path="/board/*" element={<Layout><BoardPage /></Layout>} />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<Navigate to="/admin/job-management" replace />} />
        <Route path="/admin/:tab/*" element={<Layout><AdminLayout /></Layout>} />

        {/* 마이 페이지 */}
        <Route path="/myPage" element={<Navigate to="/myPage/MyInfo" replace />} />
        <Route path="/myPage/:tab/*" element={<Layout><MyPage /></Layout>} />

        {/* 채용 공고 */}
        <Route path="/jobPostings" element={<Layout><JobPostings /></Layout>} />

        {/* 로그인 / 회원 가입 */}
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />

        {/* 회원 가입 시 정보 입력 받는 창 */}
        <Route path="/signInfo" element={<SignInfo />} />

        {/* 챗봇 */}
        <Route path="/chatBot" element={<Layout><ChatBot /></Layout>} />

        {/* 기업 상세 */}
        <Route path="/company/:companyName" element={<Layout><CompanyDetail onBack={() => window.history.back()} /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;