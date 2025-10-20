import React, { useState } from "react";

const FavoriteCompanies = () => {
  const companies = [
    { id: 1, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
    { id: 2, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
    { id: 3, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
    { id: 4, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
    { id: 5, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
    { id: 6, name: "휴넷", categories: ["포털", "컨텐츠", "커뮤니티"], openings: 15 },
  ];

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === companies.length) setSelectedIds([]);
    else setSelectedIds(companies.map(c => c.id));
  };

  return (
    <div className="flex">
      {/* 우측 메인 콘텐츠 */}
      <div className="flex-1 px-6 py-10 max-w-4xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">관심 기업</h2>
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {selectedIds.length === companies.length ? "전체해제" : "전체선택"}
          </button>
        </div>

        {/* 기업 리스트 */}
        <div className="space-y-5">
          {companies.map(company => (
            <div
              key={company.id}
              className="flex justify-between border-b border-gray-200 pb-4 items-center"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 accent-blue-500"
                  checked={selectedIds.includes(company.id)}
                  onChange={() => handleCheckboxChange(company.id)}
                />
                <div>
                  <div className="text-gray-900 font-semibold">{company.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {company.categories.join(" · ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-black">채용 중 <span className="text-blue-800">{company.openings}</span>개</span>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 삭제 버튼 */}
        <div className="flex justify-end mt-6">
          <button className="text-red-500 hover:text-red-600 text-sm font-medium">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCompanies;
