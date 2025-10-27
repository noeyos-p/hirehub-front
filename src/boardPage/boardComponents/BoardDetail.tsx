import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatBubbleLeftIcon, EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { boardApi, commentApi, type BoardListResponse, type CommentResponse } from '../../api/boardApi';

const BoardDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<BoardListResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBoardDetail(Number(id));
      fetchComments(Number(id));
    }
  }, [id]);

  const fetchBoardDetail = async (boardId: number) => {
    try {
      setLoading(true);
      const data = await boardApi.getBoardById(boardId);
      setBoard(data);
    } catch (err) {
      console.error('게시글 조회 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (boardId: number) => {
    try {
      const data = await commentApi.getCommentsByBoardId(boardId);
      setComments(data);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id) return;

    try {
      await commentApi.createComment({
        content: newComment,
        boardId: Number(id)
      });
      
      setNewComment('');
      fetchComments(Number(id));
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentApi.deleteComment(commentId);
      if (id) {
        fetchComments(Number(id));
      }
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\. /g, '.').replace('.', '');
  };

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </section>
    );
  }

  if (error || !board) {
    return (
      <section className="mb-8">
        <button
          onClick={() => navigate('/board')}
          className="flex items-center text-gray-500 text-sm mb-6 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          목록으로
        </button>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error || '게시글을 찾을 수 없습니다.'}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <button
        onClick={() => navigate('/board')}
        className="flex items-center text-gray-500 text-sm mb-6 hover:text-gray-700"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        목록으로
      </button>

      {/* 게시글 제목 */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{board.title}</h2>

      {/* 작성자 정보 */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <div className="w-10 h-10 rounded-full mr-3 overflow-hidden flex items-center justify-center bg-gray-300">
          {board.usersProfileImage ? (
            <img 
              src={board.usersProfileImage} 
              alt={`${board.usersNickname || board.usersName}'s profile`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600">
              {board.usersNickname?.charAt(0) || board.usersName?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">{board.usersNickname || board.usersName || '익명'}</p>
          <p>{formatDateTime(board.createAt)}</p>
        </div>
        <div className="flex items-center ml-4 space-x-3 text-gray-400">
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>{board.views || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{comments.length}</span>
          </div>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="border-t border-b border-gray-200 py-6 text-gray-800 leading-relaxed whitespace-pre-line">
        {board.content}
      </div>

      {/* 댓글 영역 */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-4">
          댓글 {comments.length}
        </h3>

        {/* 댓글 입력창 */}
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mb-6">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            placeholder="댓글을 남겨주세요"
            className="flex-1 text-sm outline-none"
          />
          <button
            onClick={handleCommentSubmit}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ➤
          </button>
        </div>

        {/* 댓글 리스트 */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {comments
              .filter(comment => !comment.parentCommentId)
              .map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-300">
                    {comment.usersProfileImage ? (
                      <img 
                        src={comment.usersProfileImage} 
                        alt={`${comment.usersNickname || comment.usersName}'s profile`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-600">
                        {comment.usersNickname?.charAt(0) || comment.usersName?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {comment.usersNickname || comment.usersName}
                      </p>
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(comment.createAt)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardDetail;