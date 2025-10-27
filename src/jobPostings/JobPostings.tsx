import React, { useEffect, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import JobDetail from "./jopPostingComponents/JobDetail";
import api from "../api/api"; // ✅ axios 인스턴스 가져오기

const JobPostings: React.FC = () => {
  const [filters, setFilters] = useState({
    role: "",
    experience: "",
    education: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobListings, setJobListings] = useState<any[]>([]); // ✅ DB에서 가져온 공고 리스트 저장
  const itemsPerPage = 7;

  // ✅ 백엔드에서 데이터 가져오기 (api 인스턴스 사용)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/api/jobposts"); // ✅ baseURL 자동 적용
        setJobListings(res.data);
      } catch (err) {
        console.error("채용공고 로딩 실패:", err);
      }
    };

    fetchJobs();
  }, []);

  const seoulDistricts = [
    "강남구", "강동구", "강북구", "강서구", "관악구",
    "광진구", "구로구", "금천구", "노원구", "도봉구",
    "동대문구", "동작구", "마포구", "서대문구", "서초구",
    "성동구", "성북구", "송파구", "양천구", "영등포구",
    "용산구", "은평구", "종로구", "중구", "중랑구",
  ];

  // ✅ 필터
  const filteredJobs = jobListings.filter(
    (job) =>
      (filters.role ? job.title.includes(filters.role) : true) &&
      (filters.experience ? job.careerLevel === filters.experience : true) &&
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
        {/* 필터 UI */}
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
            onChange={(e) =>
              setFilters({ ...filters, experience: e.target.value })
            }
            className="px-3 py-2"
          >
            <option value="">경력</option>
            <option value="신입">신입</option>
            <option value="경력">경력</option>
          </select>

          <select
            value={filters.education}
            onChange={(e) =>
              setFilters({ ...filters, education: e.target.value })
            }
            className="px-3 py-2"
          >
            <option value="">학력</option>
            <option value="고졸">고졸</option>
            <option value="대졸">대졸</option>
            <option value="학력무관">학력무관</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
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
                <p className="text-sm font-semibold text-gray-900">{job.companyName}</p>
                <p className="text-sm text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.careerLevel} / {job.education} / {job.location}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>{job.startAt} - {job.endAt}</span>
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
                currentPage === i + 1
                  ? "bg-gray-200 text-gray-700 border-gray-300"
                  : "text-gray-500 border-gray-300"
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
