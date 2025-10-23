import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Post {
  id: number;
  title: string;
  author: string;
  views: number;
  comments: number;
  createdAt: string;
}

const BoardManagement: React.FC = () => {
  // DB 연동 시 API로 대체 예정
  const [posts] = useState<Post[]>([
    { id: 1, title: "퇴사가 너무 하고싶은데요", author: "홍길동", views: 123, comments: 50, createdAt: "2025-10-17" },
    { id: 2, title: "BIGBIRD", author: "김철수", views: 456, comments: 32, createdAt: "2025-10-18" },
    { id: 3, title: "꿈과 책과 힘과 벽", author: "이영희", views: 234, comments: 18, createdAt: "2025-10-19" },
    { id: 4, title: "예의", author: "박민수", views: 89, comments: 12, createdAt: "2025-10-20" },
    { id: 5, title: "개꿀 연예인", author: "최지원", views: 567, comments: 45, createdAt: "2025-10-21" },
    { id: 6, title: "하얀 강아지 메로", author: "정수현", views: 345, comments: 28, createdAt: "2025-10-22" },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter(post => 
    post.title.includes(searchQuery) || 
    post.author.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">게시판 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="text-sm font-semibold text-gray-800">{post.title}</div>
                <div className="text-sm text-gray-600">작성자: {post.author}</div>
                <div className="text-xs text-gray-500 mt-1">
                  조회 {post.views} · 댓글 {post.comments} · {post.createdAt}
                </div>
              </div>
              <div className="flex space-x-3">
                <PencilIcon className="w-5 h-5 text-gray-400 hover:text-gray-700 cursor-pointer" />
                <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 검색창 */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 w-64">
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BoardManagement;