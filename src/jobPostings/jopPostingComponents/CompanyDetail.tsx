import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";

interface Review {
  id: number;
  author: string;
  content: string;
  date: string;
}

interface CompanyDetailProps {
  onBack: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ onBack }) => {
  const { companyName } = useParams<{ companyName: string }>(); // 경로에서 company 파라미터 추출
  const [reviews, setReviews] = useState<Review[]>([
    { id: 1, author: "홍길동", content: "똥 먹어본 사람 좋아요", date: "25.12.31 23:59" },
    { id: 2, author: "홍길동", content: "일단 나부터", date: "25.12.31 23:59" },
  ]);
  const [newReview, setNewReview] = useState("");

  // 더미 회사 데이터 (실제로는 API에서 가져와야 함)
  const company = {
    name: companyName || "기본 회사명",
    description: "이 회사는 혁신적인 기술로 유명합니다.",
    address: "서울특별시 강남구 테헤란로 123",
    website: "www.example.com",
    founded: "1990-01-01",
    industry: "IT",
    benefits: "건강보험, 연금, 유연근무",
    ceo: "김사장",
  };

  const handleAddReview = () => {
    if (!newReview.trim()) return;
    setReviews([
      ...reviews,
      { id: reviews.length + 1, author: "홍길동", content: newReview, date: new Date().toLocaleString() },
    ]);
    setNewReview("");
  };

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
          <StarIcon className="w-5 h-5 text-yellow-500 cursor-pointer" />
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
            <button
              onClick={handleAddReview}
              className="ml-2 text-sm text-gray-600 hover:text-gray-900"
            >
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