<<<<<<< Updated upstream
import React, { useEffect, useState } from "react";
import { BookmarkIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
=======
import React, { useEffect, useMemo, useState } from "react";
import { BookmarkIcon, StarIcon } from "@heroicons/react/24/outline";
>>>>>>> Stashed changes
import { BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import api from "../../api/api";

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
}

interface ResumeItem {
  id: number;
  title: string;
  locked: boolean;
  createAt: string;
  updateAt: string;
}

interface Job {
  id: number;
  title: string;
  companyName: string;
  companyId: number;
  views: number;
  careerLevel: string;
  position: string;
  education: string;
  type?: string;
  location: string;
  endAt: string;
}

const JobDetail: React.FC<JobDetailProps> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<Job | null>(null);
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
  const [hasApplied, setHasApplied] = useState(false); // ⭐ 같은 공고 재지원 방지

<<<<<<< Updated upstream
  // ✅ 상세 공고 불러오기 (조회수 증가 로직 제거)
=======
  // --- 상세 ---
>>>>>>> Stashed changes
  const fetchJobDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
<<<<<<< Updated upstream
      const res = await api.get<Job>(`/api/jobposts/${jobId}`);
=======
      const res = await api.get(`/api/jobposts/${jobId}`);
>>>>>>> Stashed changes
      setJob(res.data);
    } catch (err: any) {
      console.error("공고 불러오기 실패:", err);
      if (err.response?.status === 404) setError("해당 공고를 찾을 수 없습니다.");
      else setError("상세 공고를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< Updated upstream
  // 스크랩 상태 확인
  const fetchScrapStatus = async () => {
    try {
      const res = await api.get(`/api/mypage/favorites/jobposts?page=0&size=1000`);
      const scrappedItems = res.data.rows || res.data.content || [];
      const exists = scrappedItems.some((item: any) => Number(item.jobPostId) === Number(jobId));
      setIsScrapped(exists);
    } catch (err: any) {
      if (err.response?.status !== 401) setIsScrapped(false);
=======
  // --- 스크랩 상태 ---
  const fetchScrapStatus = async () => {
    try {
      const res = await api.get(`/api/mypage/favorites/jobposts?page=0&size=1000`);
      const rows = res.data.items || res.data.content || res.data.rows || [];
      const exists = rows.some((it: any) =>
        Number(it.jobPostId ?? it.id ?? it.job_posts_id ?? it.job_post_id) === Number(jobId)
      );
      setIsScrapped(exists);
    } catch (err) {
      setIsScrapped(false);
>>>>>>> Stashed changes
    }
  };

  // --- 즐겨찾기(기업) 상태 ---
  const fetchFavoriteStatus = async () => {
    if (!job?.companyId) return;
    try {
      const res = await api.get(`/api/mypage/favorites/companies?page=0&size=1000`);
<<<<<<< Updated upstream
      const favoritedItems = res.data.rows || res.data.content || [];
      const exists = favoritedItems.some((item: any) => Number(item.companyId) === Number(job.companyId));
      setIsFavorited(exists);
    } catch (err: any) {
      if (err.response?.status !== 401) setIsFavorited(false);
=======
      const rows = res.data.items || res.data.content || res.data.rows || [];
      const exists = rows.some((it: any) => Number(it.companyId ?? it.company?.id) === Number(job.companyId));
      setIsFavorited(exists);
    } catch (err) {
      setIsFavorited(false);
    }
  };

  // --- 이미 지원했는지(프론트 가드) ---
  const fetchAppliedStatus = async () => {
    try {
      // 서버 응답에 jobPostId가 없다면 회사명+제목으로 best-effort 매칭
      const res = await api.get(`/api/mypage/applies`);
      const rows: any[] = res.data || [];
      const matched = rows.some((a: any) => {
        const comp = a.companyName ?? a.company ?? a.jobPosts?.company?.name;
        const title = a.resumeTitle ?? a.resume?.title ?? "";
        // 회사명이 같고, 이 공고로 지원한 기록이 있을 때(제목 매칭은 느슨)
        return String(comp) === String(job?.companyName);
      });
      setHasApplied(matched);
    } catch {
      setHasApplied(false);
>>>>>>> Stashed changes
    }
  };

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (job) {
      fetchScrapStatus();
      fetchFavoriteStatus();
      fetchAppliedStatus();
    }
  }, [job]);

  // 즐겨찾기 변경 이벤트에 반응(다른 탭/페이지 동기화)
  useEffect(() => {
<<<<<<< Updated upstream
    const handleFavoriteChanged = () => {
      if (job?.companyId) fetchFavoriteStatus();
    };
    window.addEventListener("favorite-changed", handleFavoriteChanged);
    return () => window.removeEventListener("favorite-changed", handleFavoriteChanged);
  }, [job?.companyId]);

  // 북마크 토글
  const handleBookmarkClick = async () => {
    if (!job || isBookmarkProcessing) return;
    setIsBookmarkProcessing(true);
    const previousState = isScrapped;

    try {
      if (previousState) {
        const res = await api.delete(`/api/mypage/favorites/jobposts/${job.id}`);
        if (res.status === 204 || res.status === 200) setIsScrapped(false);
      } else {
        const res = await api.post(`/api/mypage/favorites/jobposts/${job.id}`);
        if (res.status === 200 && res.data) setIsScrapped(true);
      }
    } catch (err: any) {
      setIsScrapped(previousState);
      alert(err.response?.data?.message || "북마크 처리에 실패했습니다.");
=======
    const onFavChanged = () => fetchFavoriteStatus();
    const onScrapChanged = () => fetchScrapStatus();
    window.addEventListener("favorite-changed", onFavChanged);
    window.addEventListener("scrap-changed", onScrapChanged);
    return () => {
      window.removeEventListener("favorite-changed", onFavChanged);
      window.removeEventListener("scrap-changed", onScrapChanged);
    };
  }, [job?.companyId]);

  // --- 스크랩 토글 ---
  const handleBookmarkClick = async () => {
    if (!job || isBookmarkProcessing) return;
    setIsBookmarkProcessing(true);
    const prev = isScrapped;
    try {
      if (prev) {
        await api.delete(`/api/mypage/favorites/jobposts/${job.id}`);
        setIsScrapped(false);
        // 📣 마이페이지 관심공고 새로고침
        window.dispatchEvent(new Event("scrap-changed"));
      } else {
        await api.post(`/api/mypage/favorites/jobposts/${job.id}`);
        setIsScrapped(true);
        window.dispatchEvent(new Event("scrap-changed"));
      }
    } catch (e) {
      setIsScrapped(prev);
>>>>>>> Stashed changes
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  // --- 기업 즐겨찾기 토글 ---
  const handleFavoriteClick = async () => {
    if (!job?.companyId || isFavoriteProcessing) return;
    setIsFavoriteProcessing(true);
<<<<<<< Updated upstream
    const previousState = isFavorited;

    try {
      if (previousState) {
        const res = await api.delete(`/api/mypage/favorites/companies/${job.companyId}`);
        if (res.status === 204 || res.status === 200) setIsFavorited(false);
      } else {
        const res = await api.post(`/api/mypage/favorites/companies/${job.companyId}`);
        if (res.status === 200 && res.data) setIsFavorited(true);
      }
    } catch (err: any) {
      setIsFavorited(previousState);
      alert(err.response?.data?.message || "즐겨찾기 처리에 실패했습니다.");
=======
    const prev = isFavorited;
    try {
      if (prev) {
        await api.delete(`/api/mypage/favorites/companies/${job.companyId}`);
        setIsFavorited(false);
        // 📣 마이페이지 관심기업 새로고침
        window.dispatchEvent(new Event("favorite-changed"));
      } else {
        await api.post(`/api/mypage/favorites/companies/${job.companyId}`);
        setIsFavorited(true);
        window.dispatchEvent(new Event("favorite-changed"));
      }
    } catch (e) {
      setIsFavorited(prev);
>>>>>>> Stashed changes
    } finally {
      setIsFavoriteProcessing(false);
    }
  };

<<<<<<< Updated upstream
  // 이력서 목록
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/api/mypage/resumes", { params: { page: 0, size: 50 } });
      const list: ResumeItem[] = data?.items ?? data?.content ?? [];
      setResumes(list.filter(r => !r.locked));
    } catch (e) {
      alert("이력서 목록을 불러올 수 없습니다.");
    }
  };

=======
  // --- 이력서 목록 ---
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/api/mypage/resumes", { params: { page: 0, size: 50 } });
      const list: ResumeItem[] = (data?.items ?? data?.content ?? []).filter((r: ResumeItem) => !r.locked);
      setResumes(list);
      if (!list.length) setSelectedResumeId(null);
    } catch {
      setResumes([]);
    }
  };

  // --- 지원 플로우 ---
>>>>>>> Stashed changes
  const handleApplyClick = async () => {
    if (hasApplied) return; // 이미 지원했다면 버튼 비활성
    setShowApplyModal(true);
    await fetchResumes();
  };

  const handleSubmitApply = async () => {
<<<<<<< Updated upstream
    if (!selectedResumeId) return alert("이력서를 선택해주세요.");
=======
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }
>>>>>>> Stashed changes
    if (!confirm("선택한 이력서로 지원하시겠습니까? 제출 후에는 이력서를 수정할 수 없습니다.")) return;

    try {
      setIsApplying(true);
<<<<<<< Updated upstream
      await api.post("/api/mypage/applies", { jobPostId: job!.id, resumeId: selectedResumeId });
      alert("지원이 완료되었습니다!");
=======
      await api.post("/api/mypage/applies", { jobPostId: job.id, resumeId: selectedResumeId });
      setHasApplied(true);                 // ✅ 같은 공고 재지원 방지
>>>>>>> Stashed changes
      setShowApplyModal(false);
      setSelectedResumeId(null);
      // 필요 시: window.dispatchEvent(new Event("applies-changed"));
    } catch (err: any) {
<<<<<<< Updated upstream
      alert(err?.response?.data?.message || "지원 중 오류가 발생했습니다.");
=======
      // 서버가 중복 지원 시 409 등을 던진다면, 그 경우도 막아둔다.
      if (err?.response?.status === 409) {
        setHasApplied(true);
        setShowApplyModal(false);
      }
      const msg = err?.response?.data?.message || "지원 중 오류가 발생했습니다.";
      alert(msg);
>>>>>>> Stashed changes
    } finally {
      setIsApplying(false);
    }
  };

  const ApplyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">지원할 이력서 선택</h3>
<<<<<<< Updated upstream
          <button onClick={() => { setShowApplyModal(false); setSelectedResumeId(null); }} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
=======
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

>>>>>>> Stashed changes
        <div className="flex-1 overflow-y-auto p-6">
          {resumes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>제출 가능한 이력서가 없습니다.</p>
              <p className="text-sm mt-2">새 이력서를 작성해주세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
<<<<<<< Updated upstream
                <label key={resume.id} className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedResumeId === resume.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="resume" value={resume.id} checked={selectedResumeId === resume.id} onChange={() => setSelectedResumeId(resume.id)} className="accent-blue-500" />
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={() => { setShowApplyModal(false); setSelectedResumeId(null); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" disabled={isApplying}>취소</button>
          <button onClick={handleSubmitApply} disabled={!selectedResumeId || isApplying} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
=======

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
>>>>>>> Stashed changes
            {isApplying ? "지원 중..." : "지원하기"}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-center py-10 text-gray-600">로딩 중...</div>;
<<<<<<< Updated upstream
  if (error) return (
    <div className="text-center py-10 text-red-600">
      {error}
      <button onClick={onBack} className="block mt-4 text-blue-600 underline">목록으로 돌아가기</button>
    </div>
  );
=======
  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <button onClick={onBack} className="block mt-4 text-blue-600 underline">
          목록으로 돌아가기
        </button>
      </div>
    );
>>>>>>> Stashed changes
  if (!job) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-8">
<<<<<<< Updated upstream
        <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">← 목록으로 돌아가기</button>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Link to={`/company/${encodeURIComponent(job.companyName)}`} className="text-2xl font-semibold text-gray-800 cursor-pointer hover:underline">{job.companyName}</Link>
            <button onClick={handleFavoriteClick} disabled={isFavoriteProcessing} className={`transition-all ${isFavoriteProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`} title={isFavorited ? "기업 즐겨찾기 해제" : "기업 즐겨찾기"}>
=======
        <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">
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

            {/* ⭐ 기업 즐겨찾기 */}
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriteProcessing}
              className={`transition-all ${
                isFavoriteProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
              }`}
              title={isFavorited ? "기업 즐겨찾기 해제" : "기업 즐겨찾기"}
            >
>>>>>>> Stashed changes
              {isFavorited ? <StarSolidIcon className="w-6 h-6 text-yellow-500" /> : <StarIcon className="w-6 h-6 text-gray-400 hover:text-yellow-500" />}
            </button>
          </div>

<<<<<<< Updated upstream
          <button onClick={handleBookmarkClick} disabled={isBookmarkProcessing} className={`transition-all ${isBookmarkProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`} title={isScrapped ? "북마크 해제" : "북마크 추가"}>
=======
          {/* 🔖 공고 스크랩 */}
          <button
            onClick={handleBookmarkClick}
            disabled={isBookmarkProcessing}
            className={`transition-all ${isBookmarkProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
            title={isScrapped ? "북마크 해제" : "북마크 추가"}
          >
>>>>>>> Stashed changes
            {isScrapped ? <BookmarkSolidIcon className="w-8 h-8 text-yellow-500" /> : <BookmarkIcon className="w-8 h-8 text-gray-600" />}
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h1>
        <p className="text-sm text-gray-500 mb-6">조회수: {job.views}</p>

        <div className="border border-gray-200 rounded-lg p-6 mb-10 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-800">
              <div><p className="text-gray-500">경력</p><p>{job.careerLevel}</p></div>
              <div><p className="text-gray-500">직무</p><p>{job.position}</p></div>
              <div><p className="text-gray-500">학력</p><p>{job.education}</p></div>
              <div><p className="text-gray-500">고용형태</p><p>{job.type || "정규직"}</p></div>
              <div><p className="text-gray-500">근무지역</p><p>{job.location}</p></div>
              <div><p className="text-gray-500">마감일</p><p>{job.endAt}</p></div>
            </div>

<<<<<<< Updated upstream
            <button onClick={handleApplyClick} className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">입사지원</button>
=======
            <button
              onClick={handleApplyClick}
              disabled={hasApplied}
              className={`px-5 py-2 rounded-md text-sm ${
                hasApplied ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {hasApplied ? "지원 완료" : "입사지원"}
            </button>
>>>>>>> Stashed changes
          </div>
        </div>

        <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
          공고 사진
        </div>
      </div>

      {showApplyModal && <ApplyModal />}
    </>
  );
};

export default JobDetail;
