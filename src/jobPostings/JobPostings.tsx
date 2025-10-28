import React, { useEffect, useState } from "react";
import { BookmarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import JobDetail from "./jopPostingComponents/JobDetail";
import api from "../api/api";

const JobPostings: React.FC = () => {
  const [filters, setFilters] = useState({
    role: "",
    experience: "",
    education: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoritedCompanies, setFavoritedCompanies] = useState<Set<number>>(new Set());
  const [scrappedJobs, setScrappedJobs] = useState<Set<number>>(new Set());
  const itemsPerPage = 7;

  // ✅ 백엔드에서 채용공고 데이터 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/api/jobposts");
        console.log("📦 채용공고 조회:", response.data);
        setJobListings(response.data);
      } catch (err: any) {
        console.error("❌ 채용공고 로딩 실패:", err.response?.data);
        setError(err.response?.data?.message || "채용공고를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ 기업 즐겨찾기 목록 가져오기
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get("/api/mypage/favorites/companies?page=0&size=1000");
        console.log("⭐ 즐겨찾기 기업 목록:", res.data);

        const items = res.data.rows || res.data.content || [];
        const companyIds = new Set<number>(
          items.map((item: any) => Number(item.companyId)).filter((id: number) => !isNaN(id))
        );
        setFavoritedCompanies(companyIds);
      } catch (err: any) {
        console.error("❌ 즐겨찾기 목록 로딩 실패:", err);
        if (err.response?.status !== 401) {
          setFavoritedCompanies(new Set());
        }
      }
    };

    fetchFavorites();
  }, []);

  // ✅ 스크랩된 공고 목록 가져오기
  useEffect(() => {
    const fetchScrappedJobs = async () => {
      try {
        const res = await api.get("/api/mypage/favorites/jobposts?page=0&size=1000");
        console.log("📌 스크랩된 공고 목록:", res.data);

        const items = res.data.rows || res.data.content || [];
        const jobIds = new Set<number>(
          items.map((item: any) => Number(item.jobPostId)).filter((id: number) => !isNaN(id))
        );
        setScrappedJobs(jobIds);
      } catch (err: any) {
        console.error("❌ 스크랩 목록 로딩 실패:", err);
        if (err.response?.status !== 401) {
          setScrappedJobs(new Set());
        }
      }
    };

    fetchScrappedJobs();
  }, []);

  // ✅ 기업 즐겨찾기 토글
  const handleFavoriteClick = async (e: React.MouseEvent, companyId: number) => {
    e.stopPropagation();

    const isFavorited = favoritedCompanies.has(companyId);
    console.log(`⭐ 즐겨찾기 토글 - Company ${companyId}, 현재: ${isFavorited}`);

    try {
      if (isFavorited) {
        const res = await api.delete(`/api/mypage/favorites/companies/${companyId}`);
        if (res.status === 204 || res.status === 200) {
          setFavoritedCompanies(prev => {
            const newSet = new Set(prev);
            newSet.delete(companyId);
            return newSet;
          });
          alert("기업 즐겨찾기가 해제되었습니다.");
        }
      } else {
        const res = await api.post(`/api/mypage/favorites/companies/${companyId}`);
        if (res.status === 200 && res.data) {
          setFavoritedCompanies(prev => new Set(prev).add(companyId));
          alert("기업을 즐겨찾기에 추가했습니다.");
        }
      }
    } catch (err: any) {
      console.error("❌ 즐겨찾기 처리 실패:", err);
      
      let errorMsg = "즐겨찾기 처리에 실패했습니다.";
      if (err.response?.status === 401) {
        errorMsg = "로그인이 필요합니다.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      alert(errorMsg);
    }
  };

  // ✅ 공고 스크랩 토글
  const handleBookmarkClick = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();

    const isScrapped = scrappedJobs.has(jobId);
    console.log(`📌 스크랩 토글 - Job ${jobId}, 현재: ${isScrapped}`);

    try {
      if (isScrapped) {
        const res = await api.delete(`/api/mypage/favorites/jobposts/${jobId}`);
        if (res.status === 204 || res.status === 200) {
          setScrappedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
          alert("북마크가 해제되었습니다.");
        }
      } else {
        const res = await api.post(`/api/mypage/favorites/jobposts/${jobId}`);
        if (res.status === 200 && res.data) {
          setScrappedJobs(prev => new Set(prev).add(jobId));
          alert("북마크에 저장되었습니다.");
        }
      }
    } catch (err: any) {
      console.error("❌ 스크랩 처리 실패:", err);
      
      let errorMsg = "북마크 처리에 실패했습니다.";
      if (err.response?.status === 401) {
        errorMsg = "로그인이 필요합니다.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      alert(errorMsg);
    }
  };

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

  if (selectedJobId) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <JobDetail jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 필터 UI */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-700 ">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2"
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <option value="">희망지역</option>
            {seoulDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* 로딩 중 */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-600">
            로딩 중...
          </div>
        ) : (
          <>
            {/* 리스트 */}
            <div className="divide-y divide-gray-200">
              {paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex justify-between items-center py-4 hover:bg-gray-100 px-2 rounded-md transition"
                >
                  {/* 왼쪽: 회사명 + 별 아이콘 + 공고 정보 */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{job.companyName}</p>
                      
                      {/* 기업 즐겨찾기 별 아이콘 */}
                      <button
                        onClick={(e) => handleFavoriteClick(e, job.companyId)}
                        className="transition-all hover:scale-110"
                        title={favoritedCompanies.has(job.companyId) ? "즐겨찾기 해제" : "즐겨찾기"}
                      >
                        {favoritedCompanies.has(job.companyId) ? (
                          <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <StarIcon className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500">
                      {job.careerLevel} / {job.education} / {job.location}
                    </p>
                  </div>

                  {/* 오른쪽: 날짜 + 북마크 */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{job.startAt} - {job.endAt}</span>
                    
                    {/* 공고 스크랩 북마크 아이콘 */}
                    <button
                      onClick={(e) => handleBookmarkClick(e, job.id)}
                      className="transition-all hover:scale-110"
                      title={scrappedJobs.has(job.id) ? "북마크 해제" : "북마크 추가"}
                    >
                      {scrappedJobs.has(job.id) ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-gray-600 hover:text-yellow-500" />
                      )}
                    </button>
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
          </>
        )}
      </div>
    </div>
  );
};

export default JobPostings;