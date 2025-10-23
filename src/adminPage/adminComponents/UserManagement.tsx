import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  // DB 연동 시 API로 대체 예정
  const [users] = useState<User[]>([
    { id: 1, name: "홍길동", email: "hong@example.com", role: "일반", createdAt: "2025-01-15" },
    { id: 2, name: "김철수", email: "kim@example.com", role: "일반", createdAt: "2025-02-20" },
    { id: 3, name: "이영희", email: "lee@example.com", role: "일반", createdAt: "2025-03-10" },
    { id: 4, name: "박민수", email: "park@example.com", role: "관리자", createdAt: "2025-01-05" },
    { id: 5, name: "최지원", email: "choi@example.com", role: "일반", createdAt: "2025-04-12" },
    { id: 6, name: "정수현", email: "jung@example.com", role: "일반", createdAt: "2025-05-08" },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.includes(searchQuery) || 
    user.email.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">유저 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.role} · 가입일: {user.createdAt}
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

export default UserManagement;