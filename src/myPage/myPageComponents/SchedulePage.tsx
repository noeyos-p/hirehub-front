import React, { useEffect, useMemo, useState } from "react";

type Notice = {
  date: string;      // YYYY-MM-DD (마감일)
  title: string;
  location?: string;
  type?: string;
};

// 필요시 ENV로 교체: import.meta.env.VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// 액세스 토큰 보관 키(프로젝트에 맞게 조정)
const TOKEN_KEY = "accessToken";

// 🔧 토큰 탐색 헬퍼 (localStorage / sessionStorage / cookie)
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

const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const SchedulePage: React.FC = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 선택된 연/월/일
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // 서버 데이터
  const [notices, setNotices] = useState<Notice[]>([]);              // 우측 패널용 (deadlines API)
  const [calendarMap, setCalendarMap] = useState<Record<string, number>>({}); // 날짜별 개수 표시용
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이전/다음 달 이동
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };
  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // 선택한 연·월의 달력 계산
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const startDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const calendarDays = useMemo(
    () => [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [startDay, daysInMonth]
  );

  // 특정 날짜의 카드 리스트
  const filteredNotices = useMemo(
    () => notices.filter((n) => n.date === selectedDate),
    [notices, selectedDate]
  );

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

  // 🔹 월간 달력 데이터 로드 (/api/jobposts/calendar)
  useEffect(() => {
    const controller = new AbortController();
    const token = resolveAccessToken();

    async function fetchCalendar() {
      try {
        setError(null);
        const from = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-01`;
        const toDate = new Date(selectedYear, selectedMonth, 0).getDate();
        const to = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-${String(toDate).padStart(2,"0")}`;

        const url = `${API_BASE}/api/jobposts/calendar?from=${from}&to=${to}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`(${res.status}) ${text || "달력 데이터 로드 실패"}`);
        }

        // 백 DTO: CalendarDayDto { date: LocalDate, items: List<JobPostMiniDto> }
        const raw = await res.json();

        // 날짜별 개수 맵으로 변환 (달력 점 표시용)
        const map: Record<string, number> = {};
        (raw ?? []).forEach((day: any) => {
          const d = String(day.date);                // "2025-10-22"
          const cnt = Array.isArray(day.items) ? day.items.length : 0;
          map[d] = cnt;
        });
        setCalendarMap(map);

        // 현재 월로 이동했을 때 선택일이 월 범위를 벗어나면 1일로 보정
        const selectedMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}`;
        if (!selectedDate.startsWith(selectedMonthStr)) {
          setSelectedDate(`${selectedMonthStr}-01`);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e.message || "달력 데이터 로드 중 오류가 발생했습니다.");
      }
    }

    fetchCalendar();
    return () => controller.abort();
  }, [selectedYear, selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔹 선택 날짜 마감 목록 로드 (/api/jobposts/deadlines?date=YYYY-MM-DD)
  useEffect(() => {
    const controller = new AbortController();
    const token = resolveAccessToken();

    async function fetchDay() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}/api/jobposts/deadlines?date=${selectedDate}&page=0&size=50`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`(${res.status}) ${text || "선택일 공고 로드 실패"}`);
        }

        // 백 응답: PagedResponse<JobPostMiniDto> { content: [...] }
        const raw = await res.json();
        const list = Array.isArray(raw?.content) ? raw.content : [];

        // JobPostMiniDto에서 필요한 값만 매핑
        const mapped: Notice[] = list.map((it: any) => ({
          date: (it.endAt ?? it.date ?? selectedDate).slice(0, 10),
          title: it.title ?? "",
          location: it.location ?? it.companyLocation ?? it.company?.location ?? "",
          type: it.type ?? it.positionType ?? it.position ?? "",
        }));

        setNotices(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e.message || "선택일 공고 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 과거일 클릭 방지 로직과 동일하게 오늘 이후만 요청
    if (selectedDate >= todayStr) fetchDay();
    else setNotices([]);
    return () => controller.abort();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

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
              setSelectedDate(todayStr);
              setSelectedYear(today.getFullYear());
              setSelectedMonth(today.getMonth() + 1);
            }}
            className="px-3 py-1 bg-blue-50 rounded"
          >
            오늘
          </button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 text-center gap-4 mb-6 font-semibold">
          <span className="text-red-500">일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span className="text-blue-500">토</span>
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
                {/* 날짜 숫자 */}
                <div>{day}</div>

                {/* 🔹해당 날짜에 공고가 있으면 작은 점 표시(디자인 유지) */}
                {calendarMap[fullDate] > 0 && (
                  <div className="mt-1 mx-auto w-2 h-2 rounded-full bg-gray-400"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* 로딩/에러 (달력 하단에 작게) */}
        <div className="mt-4 text-sm text-gray-500">
          {loading && <span>불러오는 중…</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* 우측 공고 리스트 */}
      <div className="w-1/3 space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice, idx) => (
            <div key={idx} className=" rounded p-4 shadow-sm bg-white transition-transform hover:bg-gray-100">
              <h3 className="font-semibold mb-1">{notice.title}</h3>
              <p className="text-sm text-gray-500">{notice.type ?? "구분 미정"} / {notice.location ?? "지역 미정"}</p>
              <p className="text-xs text-gray-400 mt-1">{notice.date}</p>
              <button className="mt-2 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">지원하기</button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">선택한 날짜의 공고가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
