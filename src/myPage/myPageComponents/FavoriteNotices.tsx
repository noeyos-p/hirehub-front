// src/myPage/favorite/FavoriteNotices.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  id: number;        // jobPostId or id or jobPost.id ...
  company: string;
  title: string;
  info: string;      // "신입/경력, 서울 강남구, 학력무관"
  deadline: string;  // "11.05(수)"
};

const FavoriteNotices: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 응답 객체에서 “가장 먼저 보이는 배열”을 찾아 리턴
  const firstArrayIn = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      // 흔한 필드 우선
      for (const k of ["items", "content", "rows", "data", "list", "result"]) {
        if (Array.isArray(data[k])) return data[k];
      }
      // 그래도 없으면 값들 중 배열 하나 찾아서 사용
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
        withCredentials: true, // 쿠키 세션 사용중이면 필수
      });

      console.log("⭐ 스크랩된 공고 전체 응답:", data);
      const raw = firstArrayIn(data);
      console.log("⭐ 추출된 배열 길이:", raw.length, "샘플:", raw[0]);

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
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-md">
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
    </div>
  );
};

export default FavoriteNotices;
