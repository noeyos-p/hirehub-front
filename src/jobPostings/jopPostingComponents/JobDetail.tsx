import React from "react";
import { BookmarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

interface JobDetailProps {
  job: any;
  onBack: () => void;
  onStarClick?: () => void; // 스타 클릭 이벤트 (나중에 구현)
}

const JobDetail: React.FC<JobDetailProps> = ({
  job,
  onBack,
  onStarClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="text-sm text-blue-600 mb-4 hover:underline"
      >
        ← 목록으로 돌아가기
      </button>

      {/* 회사 이름과 아이콘 */}
      <div className="flex justify-between items-center mb-3">
        {/* 왼쪽: 회사명 (링크로 변경) + 스타 아이콘 */}
        <div className="flex items-center space-x-1">
          <Link
            to={`/company/${encodeURIComponent(job.company)}`} // 회사명 기반 동적 경로
            className="text-2xl font-semibold text-gray-800 cursor-pointer hover:underline"
          >
            {job.company}
          </Link>
          <StarIcon
            onClick={onStarClick}
            className="w-5 h-5 text-yellow-500 cursor-pointer"
          />
        </div>

        {/* 오른쪽: 북마크 아이콘 */}
        <BookmarkIcon className="w-8 h-8 text-gray-600 cursor-pointer" />
      </div>

      {/* 공고 제목 */}
      <h1 className="text-xl font-bold text-gray-900 mb-8">
        {job.title}
      </h1>

      {/* 상세 정보와 지원 버튼 */}
      <div className="border border-gray-200 rounded-lg p-6 mb-10 bg-gray-50">
        <div className="flex justify-between items-start">
          {/* 정보 그리드 */}
          <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-800">
            <div>
              <p className="text-gray-500">경력</p>
              <p>{job.experience}</p>
            </div>
            <div>
              <p className="text-gray-500">직무</p>
              <p>{job.job}</p>
            </div>
            <div>
              <p className="text-gray-500">학력</p>
              <p>{job.education}</p>
            </div>
            <div>
              <p className="text-gray-500">고용형태</p>
              <p>정규직</p>
            </div>
            <div>
              <p className="text-gray-500">근무지역</p>
              <p>{job.location}</p>
            </div>
            <div>
              <p className="text-gray-500">마감일</p>
              <p>{job.date}</p>
            </div>
          </div>

          {/* 지원 버튼 */}
          <button className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            입사지원
          </button>
        </div>
      </div>

      {/* 공고 사진 */}
      <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
        공고 사진
      </div>
    </div>
  );
};

export default JobDetail;