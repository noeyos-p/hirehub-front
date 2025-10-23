import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  experience: string;
  deadline: string;
}

const JobManagement: React.FC = () => {
  // DB 연동 시 API로 대체 예정
  const [jobs] = useState<Job[]>([
    { id: 1, company: "휴넷", title: "백엔드 개발자 신입/경력", location: "서울 강남구", experience: "신입", deadline: "2025-11-05" },
    { id: 2, company: "카카오", title: "프론트엔드 개발자", location: "서울 서초구", experience: "경력", deadline: "2025-11-10" },
    { id: 3, company: "네이버", title: "풀스택 개발자", location: "성남시", experience: "신입", deadline: "2025-11-15" },
    { id: 4, company: "라인", title: "서버 개발자", location: "서울 송파구", experience: "경력", deadline: "2025-11-20" },
    { id: 5, company: "쿠팡", title: "백엔드 개발자", location: "서울 강동구", experience: "신입", deadline: "2025-11-18" },
    { id: 6, company: "토스", title: "웹 개발자", location: "서울 강남구", experience: "경력", deadline: "2025-11-25" },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter(job => 
    job.company.includes(searchQuery) || 
    job.title.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">공고 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="text-sm font-semibold text-gray-800">{job.company}</div>
                <div className="text-sm text-gray-600">{job.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {job.location} · {job.experience} · ~{job.deadline}
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

export default JobManagement;