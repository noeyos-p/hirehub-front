import React, { useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import JobDetail from "./jopPostingComponents/JobDetail";

const JobPostings: React.FC = () => {
  const [filters, setFilters] = useState({
    role: "",
    experience: "",
    education: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any>(null); // ✅ 선택한 공고 저장

  const itemsPerPage = 7;

  const seoulDistricts = [
    "강남구", "강동구", "강북구", "강서구", "관악구",
    "광진구", "구로구", "금천구", "노원구", "도봉구",
    "동대문구", "동작구", "마포구", "서대문구", "서초구",
    "성동구", "성북구", "송파구", "양천구", "영등포구",
    "용산구", "은평구", "종로구", "중구", "중랑구",
  ];

  const jobListings = [
    { id: 1, company: "휴넷", title: "백엔드 개발자 신입 / 경력 모집", job: "프론트", experience: "신입", education: "학력무관", location: "서울 강남구", date: "10/21 - 11/5" },
    { id: 2, company: "카카오", title: "프론트엔드 개발자 모집", job: "백엔드", experience: "경력", education: "대졸", location: "서울 서초구", date: "10/23 - 11/10" },
    { id: 3, company: "네이버", title: "풀스택 개발자", job: "풀스택", experience: "신입", education: "대졸", location: "성남시", date: "10/24 - 11/15" },
    { id: 4, company: "라인", title: "서버 개발자", job: "프론트", experience: "경력", education: "학력무관", location: "서울 송파구", date: "10/25 - 11/20" },
    { id: 5, company: "쿠팡", title: "백엔드 개발자 신입", job: "프론트", experience: "신입", education: "대졸", location: "서울 강동구", date: "10/26 - 11/18" },
    { id: 6, company: "토스", title: "웹 개발자", job: "백엔드", experience: "경력", education: "학력무관", location: "서울 강남구", date: "10/27 - 11/25" },
    { id: 7, company: "배민", title: "React 개발자", job: "풀스택", experience: "경력", education: "대졸", location: "서울 송파구", date: "10/28 - 11/30" },
    { id: 8, company: "당근마켓", title: "Node.js 개발자", job: "백엔드", experience: "신입", education: "대졸", location: "서울 마포구", date: "10/29 - 12/01" },
  ];

  const filteredJobs = jobListings.filter(
    (job) =>
      (filters.role ? job.title.includes(filters.role) : true) &&
      (filters.experience ? job.experience === filters.experience : true) &&
      (filters.education ? job.education === filters.education : true) &&
      (filters.location ? job.location.includes(filters.location) : true)
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (selectedJob) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <JobDetail job={selectedJob} onBack={() => setSelectedJob(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-700 ">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2"
          >
            <option value="">직무</option>
            <option value="프론트">프론트</option>
            <option value="백엔드">백엔드</option>
            <option value="풀스택">풀스택</option>
          </select>

          <select
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="px-3 py-2"
          >
            <option value="">경력</option>
            <option value="신입">신입</option>
            <option value="경력">경력</option>
          </select>

          <select
            value={filters.education}
            onChange={(e) => setFilters({ ...filters, education: e.target.value })}
            className="px-3 py-2"
          >
            <option value="">학력</option>
            <option value="고졸">고졸</option>
            <option value="대졸">대졸</option>
            <option value="학력무관">학력무관</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-3 py-2"
          >
            <option value="">희망지역</option>
            {seoulDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* 리스트 */}
        <div className="divide-y divide-gray-200">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center py-4 cursor-pointer hover:bg-gray-100 px-2 rounded-md transition"
              onClick={() => setSelectedJob(job)}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.company}</p>
                <p className="text-sm text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">
                 {job.job} / {job.experience} / {job.education} / {job.location}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>{job.date}</span>
                <BookmarkIcon className="w-5 h-5 text-gray-600 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center space-x-2 mt-8">
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === i + 1 ? "bg-gray-200 text-gray-700 border-gray-300" : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostings;