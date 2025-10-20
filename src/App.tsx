import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import "./index.css";
import Layout from './layout/Layout';
import MainPage from './mainPage/MainPage';
import BoardPage from './boardPage/BoardPage';
import SignInfo from './signInfo/SignInfo';
import AdminLayout from './adminPage/AdminPage';
import MyPage from './myPage/MyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={<Layout><MainPage /></Layout>} />

        {/* 게시판 페이지 */}
        <Route path="/board/*" element={<Layout><BoardPage /></Layout>} />

        {/* 관리자 페이지 */}
        <Route path="/admin/:tab" element={<Layout><AdminLayout /></Layout>} />

        {/* 마이 페이지 */}
        <Route path="/myPage" element={<Navigate to="/myPage/MyInfo" replace />} />
        <Route path="/myPage/:tab" element={<Layout><MyPage /></Layout>} />

        {/* 기존 경로 */}
        <Route path="/jobs" element={<Layout><h1>채용정보</h1></Layout>} />
        
        <Route path="/login" element={<Layout><h1>로그인</h1></Layout>} />
        <Route path="/signup" element={<Layout><h1>회원가입</h1></Layout>} />

        {/* 회원 가입 시 정보 입력 받는 창 */}
        <Route path="/signInfo" element={<SignInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;