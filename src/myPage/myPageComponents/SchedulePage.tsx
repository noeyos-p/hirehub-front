// src/myPage/myPageComponents/SchedulePage.tsx
import React, { useEffect, useMemo, useState } from "react";

type Notice = {
  id?: number;       // ← jobPostId
  date: string;      // YYYY-MM-DD
  title: string;
  location?: string;
  type?: string;
};

type ResumeItem = {
  id: number;
  title: string;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const TOKEN_KEY = "accessToken";

// 토큰 탐색 헬퍼
function resolveAccessToken(): string | null {
  const primary = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  if (primary) return primary.startsWith("Bearer ") ? primary.slice(7) : primary;

  const keys = ["jwt", "jwtToken", "token", "Authorization"];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v.startsWith("Bearer ") ? v.slice(7) : v;
  }
  const m = document.cookie.match(/(?:^|;\s*)Authorization=([^;]+)/);
  if (m) {
    const decoded = decodeURIComponent(m[1]);
    return decoded.startsWith("Bearer ") ? decoded.replace(/^Bearer\s+/i, "") : decoded;
  }
  return null;
}

// 안전 추출
const pick = (obj: any, keys: string[], fallback: any = "") => {
  for (const path of keys) {
    const v = path.split(".").reduce((acc: any, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const SchedulePage: React.FC = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 선택된 연/월/일
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // 전체 스크랩 공고
  const [allFavorites, setAllFavorites] = useState<Notice[]>([]);
  const [calendarMap, setCalendarMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지원 모달 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | undefined>(undefined);

  // 달 이동
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((p) => p - 1);
    } else setSelectedMonth((p) => p - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((p) => p + 1);
    } else setSelectedMonth((p) => p + 1);
  };

  // 달력 계산
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const startDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const calendarDays = useMemo(
    () => [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [startDay, daysInMonth]
  );

  // 선택 월 문자열
  const ym = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  // 우측 패널: 선택일 공고
  const filteredNotices = useMemo(
    () => allFavorites.filter((n) => n.date === selectedDate),
    [allFavorites, selectedDate]
  );

  // 스크랩 공고 로드
  useEffect(() => {
    const controller = new AbortController();
    const token = resolveAccessToken();

    async function fetchFavorites() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}/api/mypage/favorites/jobposts?page=0&size=1000`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`(${res.status}) ${text || "스크랩 공고 로드 실패"}`);
        }

        const raw = await res.json();

        // 배열 추출
        let arr: any[] = [];
        if (Array.isArray(raw)) arr = raw;
        else if (Array.isArray(raw.items)) arr = raw.items;
        else if (Array.isArray(raw.content)) arr = raw.content;
        else if (Array.isArray(raw.rows)) arr = raw.rows;
        else if (Array.isArray(raw.data)) arr = raw.data;
        else if (Array.isArray(raw.list)) arr = raw.list;
        else {
          const firstArray = Object.values(raw).find((v) => Array.isArray(v));
          arr = (firstArray as any[]) || [];
        }

        // 통일된 Notice 매핑
        const mapped: Notice[] = arr.map((r: any) => {
          const id = Number(pick(r, ["jobPostId", "id", "postId", "jobPost.id"], undefined));
          const title = String(pick(r, ["title", "jobPostTitle", "jobPost.title"], ""));
          const endAt = String(pick(r, ["endAt", "deadline", "dueDate", "jobPost.endAt"], "")).slice(0, 10);
          const location = String(pick(r, ["location", "region", "addr", "jobPost.location", "company.location"], ""));
          const type = String(pick(r, ["type", "positionType", "position", "jobPost.type"], ""));
          return endAt ? { id, title, date: endAt, location, type } : null;
        }).filter(Boolean) as Notice[];

        setAllFavorites(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e.message || "스크랩 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
    return () => controller.abort();
  }, []);

  // 선택 월 집계
  useEffect(() => {
    const map: Record<string, number> = {};
    for (const n of allFavorites) {
      if (n.date.startsWith(ym)) map[n.date] = (map[n.date] || 0) + 1;
    }
    setCalendarMap(map);
    if (!selectedDate.startsWith(ym)) setSelectedDate(`${ym}-01`);
  }, [allFavorites, ym]);

  // 날짜 셀 스타일
  const getDayClass = (fullDate: string) => {
    const isSelected = fullDate === selectedDate;
    const isPast = fullDate < todayStr;
    const isToday = fullDate === todayStr;

    let classes = "p-4 rounded cursor-pointer transition-all duration-200 text-base ";
    if (isSelected) classes += "border border-blue-300 font-bold scale-105";
    else if (isPast) classes += "text-gray-300 cursor-not-allowed";
    else classes += "hover:bg-gray-200 hover:scale-105";
    if (isToday) classes += "border bg-blue-300";
    return classes;
  };

  // ------ 지원하기 모달 관련 ------
  const openApplyModal = async (jobPostId?: number) => {
    if (!jobPostId) {
      alert("공고 정보가 올바르지 않습니다.");
      return;
    }
    setCurrentJobId(jobPostId);
    setSelectedResumeId(null);

    const controller = new AbortController();
    const token = resolveAccessToken();

    try {
      // 이력서 목록 로드(잠기지 않은 것만)
      const res = await fetch(`${API_BASE}/api/mypage/resumes?page=0&size=50`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("이력서 목록을 불러올 수 없습니다.");

      const data = await res.json();
      const list: ResumeItem[] = (data?.items ?? data?.content ?? []).filter((r: any) => !r.locked);
      setResumes(list);
      setShowApplyModal(true);
    } catch (e: any) {
      alert(e?.message || "이력서 목록 로드 실패");
    }
  };

  const submitApply = async () => {
    if (!currentJobId) return alert("공고 정보가 없습니다.");
    if (!selectedResumeId) return alert("이력서를 선택해주세요.");
    if (!confirm("선택한 이력서로 지원하시겠습니까? 제출 후에는 이력서를 수정할 수 없습니다.")) return;

    const token = resolveAccessToken();
    try {
      setApplying(true);
      const res = await fetch(`${API_BASE}/api/mypage/applies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ jobPostId: currentJobId, resumeId: selectedResumeId }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "지원 중 오류가 발생했습니다.");
      }

      alert("지원이 완료되었습니다!");
      setShowApplyModal(false);
      setSelectedResumeId(null);
      setCurrentJobId(undefined);
    } catch (e: any) {
      alert(e?.message || "지원 실패");
    } finally {
      setApplying(false);
    }
  };

  const ApplyModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">지원할 이력서 선택</h3>
          <button
            onClick={() => { setShowApplyModal(false); setSelectedResumeId(null); }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {resumes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>제출 가능한 이력서가 없습니다.</p>
              <p className="text-sm mt-2">마이페이지 &gt; 이력서 관리에서 새 이력서를 작성해 주세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((r) => (
                <label
                  key={r.id}
                  className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedResumeId === r.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
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
                        최종 수정: {new Date(r.updateAt || r.createAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={() => { setShowApplyModal(false); setSelectedResumeId(null); }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            disabled={applying}
          >
            취소
          </button>
          <button
            onClick={submitApply}
            disabled={!selectedResumeId || applying}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {applying ? "지원 중..." : "지원하기"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex p-4 gap-6">
      {/* 좌측 달력 */}
      <div className="w-2/3 bg-white rounded-lg shadow p-6" style={{ minHeight: "550px" }}>
        {/* 상단 */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1" onClick={prevMonth}>{"<"}</button>
            <span className="font-semibold text-lg">{selectedYear}년 {monthNames[selectedMonth - 1]}</span>
            <button className="px-3 py-1" onClick={nextMonth}>{">"}</button>
          </div>
          <button
            onClick={() => {
              const t = new Date();
              const tStr = t.toISOString().slice(0, 10);
              setSelectedDate(tStr);
              setSelectedYear(t.getFullYear());
              setSelectedMonth(t.getMonth() + 1);
            }}
            className="px-3 py-1 bg-blue-50 rounded"
          >
            오늘
          </button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 text-center gap-4 mb-6 font-semibold">
          <span className="text-red-500">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span className="text-blue-500">토</span>
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-7 gap-6 text-center">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const fullDate = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            return (
              <div
                key={day}
                onClick={() => fullDate >= todayStr && setSelectedDate(fullDate)}
                className={getDayClass(fullDate)}
              >
                <div>{day}</div>
                {calendarMap[fullDate] > 0 && <div className="mt-1 mx-auto w-2 h-2 rounded-full bg-gray-400"></div>}
              </div>
            );
          })}
        </div>

        {/* 로딩/에러 */}
        <div className="mt-4 text-sm text-gray-500">
          {loading && <span>불러오는 중…</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* 우측 공고 리스트 */}
      <div className="w-1/3 space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice, idx) => (
            <div key={idx} className="rounded p-4 shadow-sm bg-white transition-transform hover:bg-gray-100">
              <h3 className="font-semibold mb-1">{notice.title}</h3>
              <p className="text-sm text-gray-500">
                {notice.type ?? "구분 미정"} / {notice.location ?? "지역 미정"}
              </p>
              <p className="text-xs text-gray-400 mt-1">{notice.date}</p>
              <button
                className="mt-2 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                onClick={() => openApplyModal(notice.id)}
              >
                지원하기
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">선택한 날짜의 공고가 없습니다.</p>
        )}
      </div>

      {/* 모달 */}
      {showApplyModal && <ApplyModal />}
    </div>
  );
};

export default SchedulePage;
