// src/myPage/applies/AppliedNotices.tsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

type ApplyItem = {
  id: number;
  companyName: string;     // 회사명 (백엔드: a.getJobPosts().getCompany().getName())
  resumeTitle: string;     // 이 지원 시 사용한 이력서 제목 (백엔드: a.getResume().getTitle())
  applyAt: string;         // 지원일 ISO (백엔드: a.getApplyAt())
};

const yoil = ["일", "월", "화", "수", "목", "금", "토"];
const prettyMDW = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const w = yoil[d.getDay()];
  return `${mm}.${dd}(${w})`;
};

const AppliedNotices: React.FC = () => {
  const [items, setItems] = useState<ApplyItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplies = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<ApplyItem[]>("/api/mypage/applies");
      setItems(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      alert("지원 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplies();
  }, []);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items, selectedIds]
  );

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(items.map((n) => n.id));
  };

  const handleOpenResume = (row: ApplyItem) => {
    // 백엔드 응답에 resumeId가 아직 없으므로 우선 이력서 목록으로 이동
    // (resumeId 추가되면 `/myPage/resume/ResumeDetail?id=${resumeId}` 로 변경)
    window.location.href = "/myPage/resume";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지원 내역</h2>
        <button
          onClick={handleSelectAll}
          className="text-sm text-gray-600 hover:text-gray-800"
          disabled={loading || items.length === 0}
        >
          {allSelected ? "전체해제" : "전체선택"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">지원한 공고가 없습니다.</div>
      ) : (
        <div className="space-y-5">
          {items.map((notice) => (
            <div
              key={notice.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 accent-blue-500"
                  checked={selectedIds.includes(notice.id)}
                  onChange={() => handleCheckboxChange(notice.id)}
                  disabled={loading}
                />
                <div>
                  <div className="text-gray-900 font-semibold">
                    {notice.companyName}
                  </div>
                  {/* 디자인의 '공고 제목' 자리에 현재 스키마상 이력서 제목을 표시 */}
                  <div className="text-gray-700 mt-1">{notice.resumeTitle}</div>
                  {/* 요약 정보는 백엔드 응답에 없으므로 비워두거나 필요시 보강 */}
                  <div className="text-sm text-gray-500 mt-1">-</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-md"
                  onClick={() => handleOpenResume(notice)}
                  disabled={loading}
                >
                  이력서 보기
                </button>
                <span className="text-sm text-gray-500">
                  - {prettyMDW(notice.applyAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => alert("삭제 기능은 추후 연결 예정입니다.")}
          disabled={selectedIds.length === 0 || loading}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default AppliedNotices;
