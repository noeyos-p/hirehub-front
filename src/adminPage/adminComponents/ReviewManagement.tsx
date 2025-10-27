import React, { useState } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface Review {
  id: number;
  score: number;
  content: string | null;
  users_id: number;
  company_id: number;
  userName?: string;
  companyName?: string;
  createdAt?: string;
  imageUrl?: string;
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    { 
      id: 1, 
      score: 5,
      content: "정말 좋은 회사입니다. 복지도 좋고 분위기도 최고예요!",
      users_id: 1,
      company_id: 1,
      userName: "홍길동",
      companyName: "휴넷",
      createdAt: "2025-10-17"
    },
    { 
      id: 2, 
      score: 4,
      content: "업무 환경이 쾌적하고 동료들이 친절합니다.",
      users_id: 2,
      company_id: 2,
      userName: "김철수",
      companyName: "카카오",
      createdAt: "2025-10-18"
    },
    { 
      id: 3, 
      score: 3,
      content: "평범한 회사입니다. 장단점이 공존합니다.",
      users_id: 3,
      company_id: 3,
      userName: "이영희",
      companyName: "네이버",
      createdAt: "2025-10-19"
    },
  ]);

  const handleDelete = (reviewId: number) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    console.log("삭제:", reviewId);
  };

  const handleEdit = (reviewId: number) => {
    console.log("수정:", reviewId);
  };

  // 별점 렌더링 함수
  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews.filter(review => 
    review.companyName?.includes(searchQuery) || 
    review.userName?.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">리뷰 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-semibold text-gray-800">{review.companyName}</div>
                  {renderStars(review.score)}
                </div>
                <div className="text-sm text-gray-600">작성자: {review.userName}</div>
                <div className="text-sm text-gray-700 mt-1 line-clamp-1">{review.content}</div>
                <div className="text-xs text-gray-500 mt-1">{review.createdAt}</div>
              </div>
              <div className="flex space-x-3">
                <PencilIcon 
                  onClick={() => handleEdit(review.id)}
                  className="w-5 h-5 text-gray-400 hover:text-gray-700 cursor-pointer" 
                />
                <TrashIcon 
                  onClick={() => handleDelete(review.id)}
                  className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 검색창 */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 w-64">
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;