import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

type ResumeDto = {
  id: number;
  title: string;
  htmlContent?: string | null;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

const ResumeViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ResumeDto>(`/api/mypage/resumes/${id}`);
        setResume(data);
      } catch (e) {
        console.error("이력서 조회 실패:", e);
        alert("이력서를 불러올 수 없습니다.");
        navigate("/myPage/Resume");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResume();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        로딩 중...
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/myPage/Resume")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← 목록으로 돌아가기
        </button>
        {resume.locked && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            제출됨 (수정 불가)
          </span>
        )}
      </div>

      {/* HTML 컨텐츠 렌더링 */}
      {resume.htmlContent ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <iframe
            srcDoc={resume.htmlContent}
            className="w-full"
            style={{ minHeight: "800px", border: "none" }}
            title="이력서 미리보기"
          />
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8">
          <p className="text-center text-gray-500">
            이력서 내용을 불러올 수 없습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeViewer;