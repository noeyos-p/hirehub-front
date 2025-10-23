import React from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";
import MyInfo from "./myPageComponents/MyInfo";
import FavoriteNotices from "./myPageComponents/FavoriteNotices";
import AppliedNotices from "./myPageComponents/AppliedNotices";
import Resume from "./myPageComponents/Resume";
import ResumeDetail from "./myPageComponents/ResumeDetail";
import MyPosts from "./myPageComponents/MyPosts";
import FavoriteCompanies from "./myPageComponents/FavoriteCompanies";
import SchedulePage from "./myPageComponents/SchedulePage";

const tabs = [
  { key: "MyInfo", label: "내 정보", component: <MyInfo /> },
  { key: "Resume", label: "이력서 관리", component: <Resume /> },
  { key: "FavoriteNotices", label: "관심 공고", component: <FavoriteNotices /> },
  { key: "FavoriteCompanies", label: "관심 회사", component: <FavoriteCompanies /> },
  { key: "AppliedNotices", label: "지원 내역", component: <AppliedNotices /> },
  { key: "MyPosts", label: "작성한 게시물", component: <MyPosts /> },
  { key: "SchedulePage", label: "공고 일정", component: <SchedulePage /> },

];

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "MyInfo";

  const activeComponent = tabs.find((t) => t.key === activeTab)?.component || <MyInfo />;

  return (
    <div className="flex min-h-screen">
      {/* 좌측 탭 메뉴 */}
      <aside className="w-64 border-r border-gray-200 p-6 bg-white">
        <ul className="space-y-6">
          {tabs.map((t) => (
            <li
              key={t.key}
              onClick={() => navigate(`/myPage/${t.key}`)}
              className={`cursor-pointer text-gray-700 hover:text-black ${
                activeTab === t.key ? "font-semibold" : ""
              }`}
            >
              {t.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 bg-gray-50 p-6">
        <Routes>
          {/* 기본 Resume 탭 */}
          <Route path="/" element={activeComponent} />
          {/* Resume 하위 라우트 */}
          <Route path="ResumeDetail" element={<ResumeDetail />} />
        </Routes>
      </main>
    </div>
  );
};

export default MyPage;
