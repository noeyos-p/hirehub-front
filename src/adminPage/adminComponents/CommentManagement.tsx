import React, { useState } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface Comment {
  id: number;
  content: string;
  users_id: number;
  board_id: number;
  comment_id: number | null; // parent comment for replies
  create_at: string;
  update_at: string | null;
  userName?: string;
  boardTitle?: string;
  imageUrl?: string;
}

const CommentManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    { 
      id: 1, 
      content: "정말 유익한 글이네요. 감사합니다!",
      users_id: 1,
      board_id: 1,
      comment_id: null,
      create_at: "2025-10-17 14:30:00",
      update_at: null,
      userName: "홍길동",
      boardTitle: "퇴사가 너무 하고싶은데요"
    },
    { 
      id: 2, 
      content: "저도 같은 생각입니다. 공감되네요.",
      users_id: 2,
      board_id: 1,
      comment_id: 1,
      create_at: "2025-10-17 15:20:00",
      update_at: null,
      userName: "김철수",
      boardTitle: "퇴사가 너무 하고싶은데요"
    },
    { 
      id: 3, 
      content: "좋은 정보 감사합니다!",
      users_id: 3,
      board_id: 2,
      comment_id: null,
      create_at: "2025-10-18 09:15:00",
      update_at: "2025-10-18 10:00:00",
      userName: "이영희",
      boardTitle: "BIGBIRD"
    },
  ]);

  const handleDelete = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    console.log("삭제:", commentId);
  };

  const handleEdit = (commentId: number) => {
    console.log("수정:", commentId);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredComments = comments.filter(comment => 
    comment.boardTitle?.includes(searchQuery) || 
    comment.userName?.includes(searchQuery)
  );

  return (
    <div className="p-8">
      {/* 상단 타이틀 + 신규 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">댓글 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      {/* 2열 그리드 테이블 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="flex justify-between items-center border border-gray-100 bg-white rounded-md px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-semibold text-gray-800">{comment.userName}</div>
                  {comment.comment_id && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      답글
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-1">게시글: {comment.boardTitle}</div>
                <div className="text-sm text-gray-700 line-clamp-1">{comment.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  작성: {comment.create_at}
                  {comment.update_at && ` · 수정: ${comment.update_at}`}
                </div>
              </div>
              <div className="flex space-x-3">
                <PencilIcon 
                  onClick={() => handleEdit(comment.id)}
                  className="w-5 h-5 text-gray-400 hover:text-gray-700 cursor-pointer" 
                />
                <TrashIcon 
                  onClick={() => handleDelete(comment.id)}
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

export default CommentManagement;