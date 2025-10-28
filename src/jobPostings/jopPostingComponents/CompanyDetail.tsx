import React, { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import api from "../../api/api";

interface Review {
  id: number;
  author: string;
  content: string;
  date: string;
}

interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
  website: string;
  founded: string;
  industry: string;
  benefits: string;
  ceo: string;
}

interface CompanyDetailProps {
  onBack: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ onBack }) => {
  const { companyName } = useParams<{ companyName: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteProcessing, setIsFavoriteProcessing] = useState(false);

  // ✅ 회사 정보 + 리뷰 불러오기
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyName) return;
      setIsLoading(true);
      setError("");

      try {
        // 1) 회사 정보 (이 이름으로 상세 가져오는 백엔드가 이미 있음)
        const companyRes = await api.get(`/api/companies/${encodeURIComponent(companyName)}`);
        setCompany(companyRes.data);

        // 2) 리뷰(옵션)
        try {
          const reviewRes = await api.get(`/api/reviews/company/${encodeURIComponent(companyName)}`);
          setReviews(reviewRes.data);
        } catch {
          setReviews([]);
        }
      } catch (err: any) {
        console.error("회사 정보 로딩 실패:", err?.response?.data || err);
        setError("회사 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyName]);

  // ✅ 즐겨찾기 상태 확인: /api/mypage 쪽 목록에서 현재 company.id가 존재하는지 확인
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!company?.id) return;
      try {
        const res = await api.get(`/api/mypage/favorites/companies`, {
          params: { page: 0, size: 1000 },
        });
        // 서버 응답은 PagedResponse<FavoriteCompanySummaryDto>
        // { items: [{favoriteId, companyId, companyName, openPostCount}, ...], ... }
        const rows = res.data?.items || res.data?.content || res.data?.rows || [];
        const exists = rows.some((r: any) => Number(r.companyId) === Number(company.id));
        setIsFavorited(exists);
      } catch (err) {
        console.error("즐겨찾기 상태 확인 실패:", err);
        setIsFavorited(false);
      }
    };

    fetchFavoriteStatus();
  }, [company?.id]);

  // ✅ 즐겨찾기 토글 (경로를 /api/mypage 로 통일)
  const handleFavoriteClick = async () => {
    if (!company || isFavoriteProcessing) return;

    setIsFavoriteProcessing(true);
    const prev = isFavorited;

    try {
      if (prev) {
        // 해제: DELETE /api/mypage/favorites/companies/{companyId}
        await api.delete(`/api/mypage/favorites/companies/${company.id}`);
        setIsFavorited(false);
        // 마이페이지 즐겨찾기 화면 새로고침 트리거
        window.dispatchEvent(new CustomEvent("favorite-changed"));
      } else {
        // 추가: POST /api/mypage/favorites/companies/{companyId}
        await api.post(`/api/mypage/favorites/companies/${company.id}`);
        setIsFavorited(true);
        // 마이페이지 즐겨찾기 화면 새로고침 트리거
        window.dispatchEvent(new CustomEvent("favorite-changed"));
      }
    } catch (err: any) {
      console.error("즐겨찾기 처리 실패:", err?.response?.data || err);
      setIsFavorited(prev); // 롤백
      alert(
        err?.response?.status === 401
          ? "로그인이 필요합니다."
          : err?.response?.data?.message || "즐겨찾기 처리에 실패했습니다."
      );
    } finally {
      setIsFavoriteProcessing(false);
    }
  };

  // ✅ 리뷰 추가 (로컬)
  const handleAddReview = () => {
    if (!newReview.trim()) return;
    const newItem = {
      id: reviews.length + 1,
      author: "홍길동",
      content: newReview,
      date: new Date().toLocaleString(),
    };
    setReviews((prev) => [...prev, newItem]);
    setNewReview("");
  };

  // ✅ 로딩 & 에러 핸들링
  if (isLoading) return <div className="text-center py-10 text-gray-600">로딩 중...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <button onClick={onBack} className="block mt-4 text-blue-600 underline">
          목록으로 돌아가기
        </button>
      </div>
    );

  if (!company) return null;

  // ✅ 메인 렌더링 (디자인 유지)
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        {/* 뒤로가기 버튼 */}
        <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">
          ← 목록으로 돌아가기
        </button>

        {/* 회사명 및 즐겨찾기 */}
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <button
            onClick={handleFavoriteClick}
            disabled={isFavoriteProcessing}
            className={`transition-all ${
              isFavoriteProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
            }`}
            title={isFavorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            {isFavorited ? (
              <StarSolidIcon className="w-6 h-6 text-yellow-500" />
            ) : (
              <StarIcon className="w-6 h-6 text-gray-400 hover:text-yellow-500" />
            )}
          </button>
        </div>

        {/* 회사 소개 */}
        <p className="text-gray-600 mb-6">{company.description}</p>

        {/* 회사 정보 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-6">
          <div>
            <p className="text-gray-500">주소</p>
            <p>{company.address}</p>
          </div>
          <div>
            <p className="text-gray-500">홈페이지</p>
            <p>{company.website}</p>
          </div>
          <div>
            <p className="text-gray-500">설립년도</p>
            <p>{company.founded}</p>
          </div>
          <div>
            <p className="text-gray-500">업종</p>
            <p>{company.industry}</p>
          </div>
          <div>
            <p className="text-gray-500">복리후생</p>
            <p>{company.benefits}</p>
          </div>
          <div>
            <p className="text-gray-500">대표자명</p>
            <p>{company.ceo}</p>
          </div>
        </div>

        {/* 회사 사진 */}
        <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg mb-6">
          기업 사진
        </div>

        {/* 리뷰 작성 */}
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mb-8 max-w-md">
          <input
            type="text"
            placeholder="기업 리뷰를 남겨주세요"
            className="flex-1 text-sm outline-none"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button onClick={handleAddReview} className="ml-2 text-sm text-gray-600 hover:text-gray-900">
            ➤
          </button>
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-6 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{review.author}</p>
                <p className="text-sm text-gray-800">{review.content}</p>
                <p className="text-xs text-gray-400 mt-1">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
