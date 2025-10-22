import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const BoardWrite: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="mb-8 max-w-3xl mx-auto py-6 px-4 bg-gray-50 rounded-lg">
      <button
        onClick={() => navigate('/board')}
        className="flex items-center text-gray-500 text-sm mb-6 hover:text-gray-700"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        목록으로
      </button>

      <h2 className="text-xl font-bold text-gray-800">게시글 작성</h2>
      <br />

      {/* 게시글 제목 입력 */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          id="title"
          type="text"
          placeholder="제목을 입력하세요"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* 게시글 본문 입력 */}
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          id="content"
          placeholder="내용을 입력하세요"
          rows={8}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/board')}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2"
        >
          취소
        </button>
        <button className="bg-black text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-800">
          등록
        </button>
      </div>
    </section>
  );
};

export default BoardWrite;
