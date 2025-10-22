import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

const ResumeDetail: React.FC = () => {
  const navigate = useNavigate();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children?: React.ReactNode;
  }) => (
    <div className="mb-18">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-gray-500 hover:text-gray-800 opacity-50">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 bg-white">
      <h2 className="text-2xl font-bold mb-10 text-gray-900">이력서 작성</h2>

      {/* 프로필 */}
      <div className="flex gap-8 mb-12">
        <div className="w-[140px] h-[140px] bg-gray-200 flex items-center justify-center text-sm text-gray-500">
         사진
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">홍길동</p>
          <p className="text-sm text-gray-500">남 19xx년생 (만 xx세)</p>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>휴대폰</p>
            <p>이메일</p>
            <p>주소</p>
          </div>
        </div>
      </div>

      {/* 학력 */}
      <Section title="학력">
        <div className="grid grid-cols-5 gap-4 text-xs text-gray-300 mb-2">
          <span>학교명</span>
          <span>재학기간</span>
          <span>졸업상태</span>
          <span>전공학과</span>
        </div>
      </Section>

      {/* 경력 */}
      <Section title="경력">
        <div className="grid grid-cols-5 gap-4 text-xs text-gray-300 mb-2">
          <span>회사명</span>
          <span>근무기간</span>
          <span>직책</span>
          <span>직무</span>
          <span>업무내용</span>
        </div>
      </Section>

      {/* 자격증 / 스킬 (왼쪽), 언어 (오른쪽) */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <Section title="자격증" />
          <Section title="스킬" />
        </div>
        <div>
          <Section title="언어" />
        </div>
      </div>

      <hr className="text-gray-200 my-6" />
      <br />

      {/* 자기소개서 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개서</h3>
        <input
          type="text"
          placeholder="자기소개서 제목"
          className="w-full border-b border-gray-300 focus:border-black focus:outline-none text-sm py-1 mb-3"
        />
        <textarea
          placeholder="자기소개서 내용"
          rows={5}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2"
        >
          다음에 하기
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-500 text-sm font-medium px-5 py-2 rounded-md">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default ResumeDetail;
