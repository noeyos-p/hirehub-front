// src/myPage/favorite/FavoriteNotices.tsx
import React, { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "../../api/api";

// ---------- 유틸 ----------
const yoil = ["일", "월", "화", "수", "목", "금", "토"];
const prettyMDW = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const w = yoil[d.getDay()];
  return `${mm}.${dd}(${w})`;
};

// “a.b.c” 같은 경로도 뽑아오는 헬퍼
const deepPick = (obj: any, paths: string[], def: any = "") => {
  for (const p of paths) {
    const v = p.split(".").reduce((acc: any, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return def;
};

// ---------- 화면 모델 ----------
type NoticeItem = {
  id: number;        // jobPostId
  company: string;
  title: string;
  info: string;      // "신입/경력, 서울 강남구, 학력무관"
  deadline: string;  // "11.05(수)"
};

type ResumeItem = {
  id: number;
  title: string;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

const FavoriteNotices: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 지원 모달 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTargetJobId, setApplyTargetJobId] = useState<number | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // 응답 객체에서 “가장 먼저 보이는 배열”을 찾아 리턴
  const firstArrayIn = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      for (const k of ["items", "content", "rows", "data", "list", "result"]) {
        if (Array.isArray(data[k])) return data[k];
      }
      const arr = Object.values(data).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) return arr as any[];
    }
    return [];
  };

  // 서버 -> 화면 모델
  const mapRow = (r: any): NoticeItem | null => {
    const rawId = deepPick(r, ["jobPostId", "id", "postId", "jobPost.id"]);
    const idNum = Number(rawId);
    if (!rawId || Number.isNaN(idNum)) return null;

    const company = String(
      deepPick(r, ["companyName", "company", "corpName", "jobPost.companyName", "jobPost.company.name"], "")
    );

    const title = String(
      deepPick(r, ["title", "jobPostTitle", "jobPost.title"], "")
    );

    const loc = String(
      deepPick(r, ["location", "region", "addr", "jobPost.location"], "")
    );

    const career = String(
      deepPick(r, ["career", "careerLevel", "jobPost.careerLevel"], "")
    );

    const edu = String(
      deepPick(r, ["education", "edu", "jobPost.education"], "")
    );

    const info = [career, loc, edu].filter(Boolean).join(", ");
    const endIso = String(deepPick(r, ["endAt", "deadline", "dueDate", "jobPost.endAt"], ""));
    const deadline = prettyMDW(endIso);

    return { id: idNum, company, title, info, deadline };
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/mypage/favorites/jobposts", {
        params: { page: 0, size: 100 },
        withCredentials: true,
      });

      const raw = firstArrayIn(data);
      const list = raw.map(mapRow).filter(Boolean) as NoticeItem[];
      setNotices(list);
      setSelectedIds([]);
    } catch (e: any) {
      console.error("스크랩 공고 목록 조회 실패:", e?.response?.status, e?.response?.data || e);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // 상세/목록에서 토글 후 재조회(이벤트 훅)
  useEffect(() => {
    const handler = () => fetchList();
    window.addEventListener("scrap-changed", handler);
    window.addEventListener("focus", handler);
    window.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("scrap-changed", handler);
      window.removeEventListener("focus", handler);
      window.removeEventListener("visibilitychange", handler);
    };
  }, []);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const allSelected = useMemo(() => notices.length > 0 && selectedIds.length === notices.length, [notices, selectedIds]);

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(notices.map((n) => n.id));
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`선택한 ${selectedIds.length}개를 삭제할까요?`)) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/api/mypage/favorites/jobposts/${id}`)));
      await fetchList();
    } catch (e) {
      console.error("스크랩 공고 삭제 실패:", e);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ====== 지원하기 플로우 ======

  // 이력서 목록 불러오기 (잠금 해제된 것만)
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/api/mypage/resumes", { params: { page: 0, size: 50 } });
      const list: ResumeItem[] = (data?.items ?? data?.content ?? []).filter((r: ResumeItem) => !r.locked);
      setResumes(list);
      if (list.length) setSelectedResumeId(list[0].id);
      else setSelectedResumeId(null);
    } catch (e) {
      console.error("이력서 목록 조회 실패:", e);
      alert("이력서 목록을 불러올 수 없습니다.");
      setResumes([]);
    }
  };

  // “지원하기” 버튼 클릭 (행 단위)
  const openApplyModal = async (jobPostId: number) => {
    setApplyTargetJobId(jobPostId);
    setShowApplyModal(true);
    await fetchResumes();
  };

  // 실제 지원 호출
  const submitApply = async () => {
    if (!applyTargetJobId) return;
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }
    if (!confirm("선택한 이력서로 지원하시겠습니까? 제출 후에는 이력서를 수정할 수 없습니다.")) return;

    try {
      setIsApplying(true);
      await api.post("/api/mypage/applies", {
        jobPostId: applyTargetJobId,
        resumeId: selectedResumeId,
      });
      alert("지원이 완료되었습니다!");
      // 잠김 처리로 인해 이력서가 수정 불가가 되므로, 모달 종료
      setShowApplyModal(false);
      setApplyTargetJobId(null);
      setSelectedResumeId(null);
      // 필요 시 목록 새로고침(데드라인/상태 표시는 동일)
      // window.dispatchEvent(new Event("apply-changed"));
    } catch (e: any) {
      console.error("지원 실패:", e?.response?.data || e);
      const msg = e?.response?.data?.message || "지원 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsApplying(false);
    }
  };

  // 모달 컴포넌트
  const ApplyModal: React.FC = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">지원할 이력서 선택</h3>
          <button
            onClick={() => {
              setShowApplyModal(false);
              setApplyTargetJobId(null);
              setSelectedResumeId(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {resumes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>제출 가능한 이력서가 없습니다.</p>
              <p className="text-sm mt-2">이력서 작성 후 다시 시도해주세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((r) => (
                <label
                  key={r.id}
                  className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedResumeId === r.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resume"
                      value={r.id}
                      checked={selectedResumeId === r.id}
                      onChange={() => setSelectedResumeId(r.id)}
                      className="accent-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        최종 수정: {new Date(r.updateAt || r.createAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={() => {
              setShowApplyModal(false);
              setApplyTargetJobId(null);
              setSelectedResumeId(null);
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            disabled={isApplying}
          >
            취소
          </button>
          <button
            onClick={submitApply}
            disabled={!selectedResumeId || isApplying}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? "지원 중..." : "지원하기"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">관심 공고</h2>
        <button onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-gray-800">
          {allSelected ? "전체해제" : "전체선택"}
        </button>
      </div>

      <div className="space-y-5">
        {notices.length === 0 && !loading && (
          <div className="text-sm text-gray-500">스크랩한 공고가 없습니다.</div>
        )}

        {notices.map((n) => (
          <div key={n.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 accent-blue-500"
                checked={selectedIds.includes(n.id)}
                onChange={() => handleCheckboxChange(n.id)}
                disabled={loading}
              />
              <div>
                <div className="text-gray-900 font-semibold">{n.company}</div>
                <div className="text-gray-700 mt-1">{n.title}</div>
                <div className="text-sm text-gray-500 mt-1">{n.info}</div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => openApplyModal(n.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md"
              >
                지원하기
              </button>
              <span className="text-sm text-gray-500">- {n.deadline}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleDelete}
          disabled={!selectedIds.length || loading}
          className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
        >
          삭제
        </button>
      </div>

      {/* 지원 모달 */}
      {showApplyModal && <ApplyModal />}
    </div>
  );
};

export default FavoriteNotices;
