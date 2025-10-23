import React from 'react';
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const ChatBot: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">고객지원센터</h1>

        {/* 채팅 영역 */}
        <div className="bg-gray-100 rounded-lg p-6 min-h-[600px] flex flex-col">
          {/* 메시지 영역 */}
          <div className="flex-1 space-y-6 mb-6">
            {/* 봇 메시지 1 */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">HireBot</p>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm max-w-md">
                  <p className="text-sm text-gray-800">안녕하세요 반갑습니다.</p>
                </div>
              </div>
            </div>

            {/* 봇 메시지 2 (옵션 포함) */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">HireBot</p>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm max-w-md mb-3">
                  <p className="text-sm text-gray-800">
                    아래 내용이 궁금하다면 클릭하여 빠르게 안내를 받아 보세요.
                  </p>
                </div>
                
                {/* 옵션 버튼들 */}
                <div className="space-y-2">
                  <button className="block w-35 text-left bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm text-sm text-gray-700 transition">
                    자주 묻는 질문 1
                  </button>
                  <button className="block w-35 text-left bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm text-sm text-gray-700 transition">
                    자주 묻는 질문 2
                  </button>
                  <button className="block w-35 text-left bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm text-sm text-gray-700 transition">
                    자주 묻는 질문 3
                  </button>
                  <button className="block w-35 text-left bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm text-sm text-gray-700 transition">
                    자주 묻는 질문 4
                  </button>
                  <button className="block w-35 text-left bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm text-sm text-gray-700 transition">
                    상담사 연결하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="relative">
            <input
              type="text"
              placeholder="문의 사항을 남겨주세요"
              className="w-full bg-white border border-gray-300 rounded-full px-6 py-4 pr-14 text-sm focus:outline-none"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;