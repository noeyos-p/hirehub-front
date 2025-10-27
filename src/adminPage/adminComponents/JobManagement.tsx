import React, { useState, useEffect } from "react";
import { TrashIcon, PhotoIcon, PencilIcon } from "@heroicons/react/24/outline";
import api from "../../api/api";

interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  experience: string;
  deadline: string;
  imageUrl?: string;
}

const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 공고 목록 불러오기
  const fetchJobs = async () => {
    console.log("=== fetchJobs 시작 ===");
    
    // 토큰 확인
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('저장된 토큰:', token ? token.substring(0, 20) + '...' : '없음');
    console.log('저장된 Role:', role);
    
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }
    
    if (role !== 'ADMIN') {
      setError('관리자 권한이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('API 호출 시작:', '/api/admin/job-management');
      
      const res = await api.get("/api/admin/job-management");
      
      console.log('API 응답 성공:', res.data);
      
      if (res.data.success) {
        console.log('공고 데이터:', res.data.data);
        setJobs(res.data.data);
      } else {
        console.error("데이터 불러오기 실패:", res.data.message);
        setError(res.data.message || '데이터를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error("=== API 요청 오류 ===");
      console.error('전체 에러:', err);
      console.error('응답 상태:', err.response?.status);
      console.error('응답 데이터:', err.response?.data);
      console.error('에러 메시지:', err.message);
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        } else if (status === 403) {
          setError('관리자 권한이 필요합니다.');
        } else if (status === 500) {
          setError('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
        } else {
          setError(err.response.data?.message || '오류가 발생했습니다.');
        }
      } else if (err.request) {
        setError('서버와 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ 첫 렌더링 시 데이터 가져오기
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobClick = (job: Job) => setSelectedJob(job);

  // ✅ 파일 업로드 (S3)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedJob) return;

    const formData = new FormData();
    formData.append("companyId", selectedJob.id.toString());
    formData.append("file", file);

    try {
      const res = await api.post("/api/admin/job-management/jobpost-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("이미지 업로드 성공!");
        setSelectedJob({ ...selectedJob, imageUrl: res.data.fileUrl });
      }
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // ✅ 공고 삭제
  const handleDelete = async (jobId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await api.delete(`/api/admin/job-management/${jobId}`);
      if (res.data.success) {
        alert("삭제 완료");
        setJobs(jobs.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert('삭제에 실패했습니다.');
    }
  };

  // ✅ 새 공고 등록
  const handleCreate = async () => {
    const newJob = {
      company: "테스트회사",
      title: "신규 등록 공고",
      location: "서울 강남구",
      experience: "신입",
      deadline: "2025-12-31",
    };

    try {
      const res = await api.post("/api/admin/job-management", newJob);
      if (res.data.success) {
        alert("공고 등록 완료");
        fetchJobs();
      }
    } catch (err) {
      console.error("등록 실패:", err);
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className="p-8 h-full bg-gray-50">
      {/* 타이틀 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">공고 관리</h2>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          신규
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">오류 발생</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-2 text-sm underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          등록된 공고가 없습니다.
        </div>
      )}

      {/* 공고 목록 */}
      {!loading && !error && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleJobClick(job)}
            >
              <h3 className="font-bold text-lg mb-2">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
              <p className="text-sm text-gray-500">경력: {job.experience}</p>
              <p className="text-sm text-gray-500">마감: {job.deadline}</p>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobManagement;