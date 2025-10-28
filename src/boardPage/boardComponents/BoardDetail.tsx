import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatBubbleLeftIcon, EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { boardApi, commentApi, type BoardListResponse, type CommentResponse } from '../../api/boardApi';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/api';

// 트리 구조를 위한 확장 타입
type CommentWithChildren = CommentResponse & { 
  children: CommentWithChildren[] 
};

const BoardDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [board, setBoard] = useState<BoardListResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
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

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

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

  const handleReplySubmit = async (parentCommentId: number) => {
    if (!replyContent.trim() || !id) return;

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await commentApi.createComment({
        content: replyContent,
        boardId: Number(id),
        parentCommentId
      });
      
      setReplyContent('');
      setReplyingTo(null);
      fetchComments(Number(id));
    } catch (err) {
      console.error('대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다.');
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

  const handleBoardDelete = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/board/${id}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다.');
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

  // 댓글 트리 구조 생성
  const buildCommentTree = (comments: CommentResponse[]): CommentWithChildren[] => {
    const commentMap = new Map<number, CommentWithChildren>();
    const rootComments: CommentWithChildren[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    comments.forEach(comment => {
      const commentWithChildren = commentMap.get(comment.id)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.children.push(commentWithChildren);
        }
      } else {
        rootComments.push(commentWithChildren);
      }
    });

    return rootComments;
  };

  const renderProfileImage = (comment: CommentResponse) => {
    const displayName = comment.nickname || comment.usersName || '익명';
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-300 flex-shrink-0">
        {comment.usersProfileImage ? (
          <img 
            src={comment.usersProfileImage} 
            alt={`${displayName}'s profile`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-600 font-medium">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  const CommentItem: React.FC<{ 
    comment: CommentWithChildren;
    depth: number;
  }> = ({ comment, depth }) => {
    const isOwner = user?.id === comment.usersId;
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const canDelete = isAuthenticated && (isOwner || isAdmin);

    return (
      <div className={`${depth > 0 ? 'ml-10 mt-4' : 'mt-6'}`}>
        <div className="flex items-start space-x-3">
          {renderProfileImage(comment)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-700">
                  {comment.nickname || comment.usersName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(comment.createAt)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    답글
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleCommentDelete(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-800 break-words whitespace-pre-line">
              {comment.content}
            </p>

            {replyingTo === comment.id && (
              <div className="mt-3 flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(comment.id)}
                  placeholder={`@${comment.nickname || comment.usersName}에게 답글 작성`}
                  className="flex-1 text-sm outline-none bg-transparent"
                  autoFocus
                />
                <button
                  onClick={() => handleReplySubmit(comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 ml-2 font-medium"
                >
                  등록
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>

        {comment.children.length > 0 && (
          <div className="border-l-2 border-gray-200 pl-2 mt-2">
            {comment.children.map(child => (
              <CommentItem key={child.id} comment={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
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

  const commentTree = buildCommentTree(comments);
  const isOwner = user?.id === board.usersId;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const canDeleteBoard = isAuthenticated && (isOwner || isAdmin);

  return (
    <section className="mb-8">
      <button
        onClick={() => navigate('/board')}
        className="flex items-center text-gray-500 text-sm mb-6 hover:text-gray-700"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        목록으로
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{board.title}</h2>
        {canDeleteBoard && (
          <button
            onClick={handleBoardDelete}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            게시글 삭제
          </button>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-6">
        <div className="w-10 h-10 rounded-full mr-3 overflow-hidden flex items-center justify-center bg-gray-300">
          {board.usersProfileImage ? (
            <img 
              src={board.usersProfileImage} 
              alt={`${board.nickname || board.usersName}'s profile`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {(board.nickname || board.usersName || '익명').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {board.nickname || board.usersName || '익명'}
          </p>
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

      <div className="border-t border-b border-gray-200 py-6 text-gray-800 leading-relaxed whitespace-pre-line">
        {board.content}
      </div>

      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-4">
          댓글 {comments.length}
        </h3>

        {isAuthenticated ? (
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
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              등록
            </button>
          </div>
        ) : (
          <div className="text-center py-4 mb-6 text-gray-500 text-sm border border-gray-200 rounded-lg bg-gray-50">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        )}

        {commentTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            첫 댓글을 작성해보세요!
          </div>
        ) : (
          <div className="space-y-2">
            {commentTree.map((comment) => (
              <CommentItem key={comment.id} comment={comment} depth={0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardDetail;