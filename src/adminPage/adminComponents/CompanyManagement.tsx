import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Company {
  id: number;
  name: string;
  industry: string;
  location: string;
  employees: string;
  openings: number;
}

const CompanyManagement: React.FC = () => {
  // DB 연동 시 API로 대체 예정
  const [companies] = useState<Company[]>([
    { id: 1, name: "휴넷", industry: "IT/소프트웨어", location: "서울 강남구", employees: "100-500명", openings: 15 },
    { id: 2, name: "카카오", industry: "인터넷/포털", location: "서울 서초구", employees: "1000명 이상", openings: 42 },
    { id: 3, name: "네이버", industry: "인터넷/포털", location: "성남시", employees: "1000명 이상", openings: 68 },
    { id: 4, name: "라인", industry: "IT/소프트웨어", location: "서울 송파구", employees: "500-1000명", openings: 23 },
    { id: 5, name: "쿠팡", industry: "전자상거래", location: "서울 강동구", employees: "1000명 이상", openings: 35 },
    { id: 6, name: "토스", industry: "금융/핀테크", location: "서울 강남구", employees: "500-1000명", openings: 28 },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter(company => 
    company.name.includes(searchQuery) || 
    company.industry.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">기업 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="text-sm font-semibold text-gray-800">{company.name}</div>
                <div className="text-sm text-gray-600">{company.industry}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {company.location} · {company.employees} · 채용 {company.openings}개
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

export default CompanyManagement;