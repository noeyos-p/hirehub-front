import React, { useState } from "react";

const AppliedNotices = () => {
  const notices = [
    { id: 1, company: "휴넷", title: "백엔드 개발자 신입 / 경력 모집", info: "신입 / 경력, 서울 강남구, 학력무관", deadline: "11.05(수)" },
    { id: 2, company: "휴넷", title: "백엔드 개발자 신입 / 경력 모집", info: "신입 / 경력, 서울 강남구, 학력무관", deadline: "11.05(수)" },
    { id: 3, company: "휴넷", title: "백엔드 개발자 신입 / 경력 모집", info: "신입 / 경력, 서울 강남구, 학력무관", deadline: "11.05(수)" },
  ];

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notices.length) setSelectedIds([]);
    else setSelectedIds(notices.map(n => n.id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지원 내역</h2>
        <button onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-gray-800">
          {selectedIds.length === notices.length ? "전체해제" : "전체선택"}
        </button>
      </div>

      <div className="space-y-5">
        {notices.map(notice => (
          <div key={notice.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 accent-blue-500"
                checked={selectedIds.includes(notice.id)}
                onChange={() => handleCheckboxChange(notice.id)}
              />
              <div>
                <div className="text-gray-900 font-semibold">{notice.company}</div>
                <div className="text-gray-700 mt-1">{notice.title}</div>
                <div className="text-sm text-gray-500 mt-1">{notice.info}</div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-md">
                이력서 보기
              </button>
              <span className="text-sm text-gray-500">- {notice.deadline}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button className="text-red-500 hover:text-red-600 text-sm font-medium">삭제</button>
      </div>
    </div>
  );
};

export default AppliedNotices;
