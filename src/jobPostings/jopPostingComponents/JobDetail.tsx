// src/components/job/JobDetail.tsx
import React, { useEffect, useState } from "react";
import { BookmarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
}

type ResumeItem = {
  id: number;
  title: string;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

const JobDetail: React.FC<JobDetailProps> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isScrapped, setIsScrapped] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteProcessing, setIsFavoriteProcessing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // 상세 공고 불러오기
  const fetchJobDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await api.get(`/api/jobposts/${jobId}`);
      console.log("✅ fetchJobDetail response:", res.data);
      setJob(res.data);
    } catch (err: any) {
      console.error("❌ 공고 불러오기 실패:", err);
      if (err.response?.status === 404) setError("해당 공고를 찾을 수 없습니다.");
      else setError("상세 공고를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 서버에서 스크랩 상태 확인
  const fetchScrapStatus = async () => {
    try {
      const res = await api.get(`/api/mypage/favorites/jobposts?page=0&size=1000`);
      console.log("✅ fetchScrapStatus 전체 응답:", res.data);

      const scrappedItems = res.data.rows || res.data.content || [];
      console.log("📦 스크랩된 항목들:", scrappedItems);

      const exists = scrappedItems.some((item: any) => {
        console.log(`비교: item.jobPostId(${item.jobPostId}) === jobId(${jobId})`);
        return Number(item.jobPostId) === Number(jobId);
      });

      console.log(`📌 Job ${jobId} 최종 스크랩 상태:`, exists);
      setIsScrapped(exists);
    } catch (err: any) {
      console.error("❌ 스크랩 상태 불러오기 실패:", err);
      if (err.response?.status !== 401) {
        setIsScrapped(false);
      }
    }
  };

  // 기업 즐겨찾기 상태 확인
  const fetchFavoriteStatus = async () => {
    if (!job?.companyId) return;

    try {
      const res = await api.get(`/api/mypage/favorites/companies?page=0&size=1000`);
      console.log("✅ 기업 즐겨찾기 목록:", res.data);

      const favoritedItems = res.data.rows || res.data.content || [];
      const exists = favoritedItems.some((item: any) =>
        Number(item.companyId) === Number(job.companyId)
      );

      console.log(`⭐ Company ${job.companyId} 즐겨찾기 상태:`, exists);
      setIsFavorited(exists);
    } catch (err: any) {
      console.error("❌ 즐겨찾기 상태 확인 실패:", err);
      if (err.response?.status !== 401) {
        setIsFavorited(false);
      }
    }
  };

  // 페이지 진입 시 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      await fetchJobDetail();
    };
    loadData();
  }, [jobId]);

  // job 데이터 로드 후 스크랩/즐겨찾기 상태 확인
  useEffect(() => {
    if (job) {
      fetchScrapStatus();
      fetchFavoriteStatus();
    }
  }, [job]);

  useEffect(() => {
  const handleFavoriteChanged = () => {
    if (job?.companyId) fetchFavoriteStatus();
  };
  window.addEventListener("favorite-changed", handleFavoriteChanged);
  return () => window.removeEventListener("favorite-changed", handleFavoriteChanged);
}, [job?.companyId]);  // job.companyId deps 추가

  // 북마크 클릭 (토글: 추가/삭제)
  const handleBookmarkClick = async () => {
    if (!job || isBookmarkProcessing) {
      console.log("⏳ 처리 중이거나 Job 데이터 없음");
      return;
    }

    setIsBookmarkProcessing(true);
    const previousState = isScrapped;

    console.log(`🔄 북마크 토글 시작 - 현재 상태: ${previousState ? '스크랩됨' : '스크랩 안됨'}`);

    try {
      if (previousState) {
        console.log(`🗑️ DELETE 요청: /api/mypage/favorites/jobposts/${job.id}`);
        const res = await api.delete(`/api/mypage/favorites/jobposts/${job.id}`);
        console.log("✅ DELETE 성공:", res.status);

        if (res.status === 204 || res.status === 200) {
          setIsScrapped(false);
          alert("북마크가 해제되었습니다.");
        }
      } else {
        console.log(`➕ POST 요청: /api/mypage/favorites/jobposts/${job.id}`);
        const res = await api.post(`/api/mypage/favorites/jobposts/${job.id}`);
        console.log("✅ POST 성공:", res.data);

        if (res.status === 200 && res.data) {
          setIsScrapped(true);
          alert("북마크에 저장되었습니다.");
        }
      }
    } catch (err: any) {
      console.error("❌ 북마크 처리 실패:", err.response?.data || err.message);

      let errorMsg = "북마크 처리에 실패했습니다.";
      if (err.response?.status === 401) {
        errorMsg = "로그인이 필요합니다.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      alert(errorMsg);
      setIsScrapped(previousState);
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  // 기업 즐겨찾기 토글
  const handleFavoriteClick = async () => {
    if (!job?.companyId || isFavoriteProcessing) {
      console.log("⏳ 처리 중이거나 회사 데이터 없음");
      return;
    }

    setIsFavoriteProcessing(true);
    const previousState = isFavorited;

    console.log(`⭐ 기업 즐겨찾기 토글 - 현재: ${previousState ? '즐겨찾기됨' : '즐겨찾기 안됨'}`);

    try {
      if (previousState) {
        console.log(`🗑️ DELETE: /api/mypage/favorites/companies/${job.companyId}`);
        const res = await api.delete(`/api/mypage/favorites/companies/${job.companyId}`);
        console.log("✅ DELETE 성공:", res.status);

        if (res.status === 204 || res.status === 200) {
          setIsFavorited(false);
          alert("기업 즐겨찾기가 해제되었습니다.");
        }
      } else {
        console.log(`➕ POST: /api/mypage/favorites/companies/${job.companyId}`);
        const res = await api.post(`/api/mypage/favorites/companies/${job.companyId}`);
        console.log("✅ POST 성공:", res.data);

        if (res.status === 200 && res.data) {
          setIsFavorited(true);
          alert("기업을 즐겨찾기에 추가했습니다.");
        }
      }
    } catch (err: any) {
      console.error("❌ 즐겨찾기 처리 실패:", err.response?.data || err.message);

      let errorMsg = "즐겨찾기 처리에 실패했습니다.";
      if (err.response?.status === 401) {
        errorMsg = "로그인이 필요합니다.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      alert(errorMsg);
      setIsFavorited(previousState);
    } finally {
      setIsFavoriteProcessing(false);
    }
  };

  // 이력서 목록 불러오기
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/api/mypage/resumes", {
        params: { page: 0, size: 50 }
      });
      const list: ResumeItem[] = data?.items ?? data?.content ?? [];
      // 잠기지 않은 이력서만 표시
      setResumes(list.filter(r => !r.locked));
    } catch (e) {
      console.error("이력서 목록 조회 실패:", e);
      alert("이력서 목록을 불러올 수 없습니다.");
    }
  };

  // 입사지원 버튼 클릭
  const handleApplyClick = async () => {
    setShowApplyModal(true);
    await fetchResumes();
  };

  // 지원하기
  const handleSubmitApply = async () => {
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }

    if (!confirm("선택한 이력서로 지원하시겠습니까? 제출 후에는 이력서를 수정할 수 없습니다.")) {
      return;
    }

    try {
      setIsApplying(true);
      await api.post("/api/mypage/applies", {
        jobPostId: job.id,
        resumeId: selectedResumeId
      });
      alert("지원이 완료되었습니다!");
      setShowApplyModal(false);
      setSelectedResumeId(null);
    } catch (err: any) {
      console.error("지원 실패:", err);
      const msg = err?.response?.data?.message || "지원 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsApplying(false);
    }
  };

  // 모달 컴포넌트
const ApplyModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-semibold">지원할 이력서 선택</h3>
        <button
          onClick={() => {
            setShowApplyModal(false);
            setSelectedResumeId(null);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 이력서 목록 */}
      <div className="flex-1 overflow-y-auto p-6">
        {resumes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>제출 가능한 이력서가 없습니다.</p>
            <p className="text-sm mt-2">새 이력서를 작성해주세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <label
                key={resume.id}
                className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedResumeId === resume.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResumeId === resume.id}
                    onChange={() => setSelectedResumeId(resume.id)}
                    className="accent-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{resume.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      최종 수정: {new Date(resume.updateAt || resume.createAt).toLocaleDateString()}
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
            setSelectedResumeId(null);
          }}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          disabled={isApplying}
        >
          취소
        </button>
        <button
          onClick={handleSubmitApply}
          disabled={!selectedResumeId || isApplying}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? "지원 중..." : "지원하기"}
        </button>
      </div>
    </div>
  </div>
);

  if (isLoading)
    return <div className="text-center py-10 text-gray-600">로딩 중...</div>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <button onClick={onBack} className="block mt-4 text-blue-600 underline">
          목록으로 돌아가기
        </button>
      </div>
    );

  if (!job) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-8">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 mb-4 hover:underline"
        >
          ← 목록으로 돌아가기
        </button>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Link
              to={`/company/${encodeURIComponent(job.companyName)}`}
              className="text-2xl font-semibold text-gray-800 cursor-pointer hover:underline"
            >
              {job.companyName}
            </Link>

            {/* 기업 즐겨찾기 별 아이콘 */}
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriteProcessing}
              className={`transition-all ${isFavoriteProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                }`}
              title={isFavorited ? "기업 즐겨찾기 해제" : "기업 즐겨찾기"}
            >
              {isFavorited ? (
                <StarSolidIcon className="w-6 h-6 text-yellow-500" />
              ) : (
                <StarIcon className="w-6 h-6 text-gray-400 hover:text-yellow-500" />
              )}
            </button>
          </div>

          {/* 공고 북마크 아이콘 */}
          <button
            onClick={handleBookmarkClick}
            disabled={isBookmarkProcessing}
            className={`transition-all ${isBookmarkProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            title={isScrapped ? "북마크 해제" : "북마크 추가"}
          >
            {isScrapped ? (
              <BookmarkSolidIcon className="w-8 h-8 text-yellow-500" />
            ) : (
              <BookmarkIcon className="w-8 h-8 text-gray-600" />
            )}
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-8">{job.title}</h1>

        <div className="border border-gray-200 rounded-lg p-6 mb-10 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-800">
              <div>
                <p className="text-gray-500">경력</p>
                <p>{job.careerLevel}</p>
              </div>
              <div>
                <p className="text-gray-500">직무</p>
                <p>{job.role}</p>
              </div>
              <div>
                <p className="text-gray-500">학력</p>
                <p>{job.education}</p>
              </div>
              <div>
                <p className="text-gray-500">고용형태</p>
                <p>{job.type || "정규직"}</p>
              </div>
              <div>
                <p className="text-gray-500">근무지역</p>
                <p>{job.location}</p>
              </div>
              <div>
                <p className="text-gray-500">마감일</p>
                <p>{job.endAt}</p>
              </div>
            </div>

            <button
              onClick={handleApplyClick}
              className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              입사지원
            </button>
          </div>
        </div>

        <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
          공고 사진
        </div>
      </div>
      
      {/* 모달 렌더링 */}
      {showApplyModal && <ApplyModal />}
    </>
  )
  // 모달 렌더링 (return 문 끝에 추가)
{showApplyModal && <ApplyModal />}
  
};

export default JobDetail;