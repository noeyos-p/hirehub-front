import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Resume = () => {
  const resumes = [
    { id: 1, title: "이력서123", createdAt: "11.05(수)" },
    { id: 2, title: "이력서456", createdAt: "11.06(목)" },
  ];

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === resumes.length) setSelectedIds([]);
    else setSelectedIds(resumes.map(r => r.id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">이력서 관리</h2>
        <button
          onClick={handleSelectAll}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {selectedIds.length === resumes.length ? "전체해제" : "전체선택"}
        </button>
      </div>

      <div className="space-y-5">
        {resumes.map(resume => (
          <div
            key={resume.id}
            className="flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 accent-blue-500"
                checked={selectedIds.includes(resume.id)}
                onChange={() => handleCheckboxChange(resume.id)}
              />
              <div className="text-gray-700 mt-1">{resume.title}</div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-md">
                수정하기
              </button>
              <span className="text-sm text-gray-500">- {resume.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6 gap-6">
        <button
          onClick={() => navigate("/myPage/resume/ResumeDetail")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-500 text-sm font-medium px-4 py-1.5 rounded-md"
        >
          이력서 작성
        </button>
        <button className="text-red-500 hover:text-red-600 text-sm font-medium">
          삭제
        </button>
      </div>
    </div>
  );
};

export default Resume;
