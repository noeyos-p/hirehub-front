import React, { useState } from "react";

// 예시 공고 데이터
const notices = [
  { date: "2025-10-22", title: "LG전자 프론트엔드 개발자 채용", location: "서울 강서구", type: "신입/경력" },
  { date: "2025-10-23", title: "카카오페이 데이터 엔지니어 모집", location: "서울 송파구", type: "경력" },
  { date: "2025-10-24", title: "네이버 클라우드 인프라 엔지니어", location: "성남시 분당구", type: "경력" },
  { date: "2025-10-25", title: "삼성SDS 모바일 앱 개발자 채용", location: "서울 서초구", type: "신입" },
  { date: "2025-10-26", title: "현대자동차 AI 연구원 모집", location: "서울 양재동", type: "경력" },
  { date: "2025-10-27", title: "카카오 UX/UI 디자이너 모집", location: "서울 강남구", type: "신입/경력" },
  { date: "2025-10-28", title: "토스 백엔드 개발자 채용", location: "서울 강남구", type: "경력" },
  { date: "2025-10-29", title: "라인프렌즈 모바일 앱 개발자 모집", location: "서울 성동구", type: "신입" },
  { date: "2025-10-30", title: "네이버 검색 엔진 개발자 모집", location: "성남시 분당구", type: "경력" },
  { date: "2025-10-31", title: "삼성전자 AI 알고리즘 연구원", location: "서울 서초구", type: "경력" },
  { date: "2025-10-22", title: "LG전자 프론트엔드 개발자 채용", location: "서울 강서구", type: "신입/경력" },
  { date: "2025-10-22", title: "카카오 클라우드 백엔드 엔지니어", location: "서울 송파구", type: "경력" },
  { date: "2025-10-22", title: "네이버 AI 연구원 모집", location: "성남시 분당구", type: "신입/경력" },
  { date: "2025-10-23", title: "삼성SDS 모바일 앱 개발자 채용", location: "서울 서초구", type: "신입" },
  { date: "2025-10-23", title: "현대자동차 AI 연구원 모집", location: "서울 양재동", type: "경력" },
  { date: "2025-10-24", title: "카카오페이 데이터 엔지니어 모집", location: "서울 송파구", type: "경력" },
  { date: "2025-10-24", title: "토스 백엔드 개발자 채용", location: "서울 강남구", type: "경력" },
  { date: "2025-10-25", title: "라인프렌즈 모바일 앱 개발자 모집", location: "서울 성동구", type: "신입" },
  { date: "2025-10-25", title: "네이버 검색 엔진 개발자 모집", location: "성남시 분당구", type: "경력" },
  { date: "2025-10-26", title: "삼성전자 AI 알고리즘 연구원", location: "서울 서초구", type: "경력" },
  { date: "2025-10-26", title: "카카오 UX/UI 디자이너 모집", location: "서울 강남구", type: "신입/경력" },
];


const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const SchedulePage: React.FC = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayStr);

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

  // 선택한 연·월 날짜
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const startDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const calendarDays = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const filteredNotices = notices.filter((n) => n.date === selectedDate);

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

  return (
    <div className="flex p-4 gap-6">
      {/* 좌측 달력 */}
      <div className="w-2/3 bg-white rounded-lg shadow p-6" style={{ minHeight: "550px" }}>
        {/* 연도/월 선택 */}
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
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 공고 리스트 */}
      <div className="w-1/3 space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice, idx) => (
            <div key={idx} className=" rounded p-4 shadow-sm bg-white transition-transform hover:bg-gray-100">
              <h3 className="font-semibold mb-1">{notice.title}</h3>
              <p className="text-sm text-gray-500">{notice.type} / {notice.location}</p>
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
