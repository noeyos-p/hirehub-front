import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

/** 서버 응답 DTO들 */
type FavoriteCompanyRow = {
  favoriteId: number;   // 즐겨찾기 PK (행 고유키)
  companyId: number;    // 회사 PK   (삭제 등 액션에 사용)
  companyName: string;  // 회사명
  openPostCount: number;// 채용 중 공고 수
};

type PagedResponse<T> = {
  items?: T[];
  content?: T[];
  rows?: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const FavoriteCompanies: React.FC = () => {
  const [rows, setRows] = useState<FavoriteCompanyRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  /** 목록 조회 */
  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PagedResponse<FavoriteCompanyRow>>(
        "/api/mypage/favorites/companies",
        { params: { page: 0, size: 100 } }
      );

      // 응답 키 방어적으로 처리
      const list = (data?.items ?? data?.content ?? data?.rows ?? []) as FavoriteCompanyRow[];
      setRows(Array.isArray(list) ? list : []);
      setSelectedIds([]);
      // 디버그 로그(필요시 확인)
      // console.log("관심기업 응답:", data);
    } catch (e: any) {
      console.error("관심기업 목록 조회 실패:", e?.response?.status, e?.response?.data || e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 상세페이지에서 즐겨찾기 토글 후 재조회
  useEffect(() => {
    const onFavChanged = () => fetchList();
    const onFocus = () => fetchList();
    window.addEventListener("favorite-changed", onFavChanged as EventListener);
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("favorite-changed", onFavChanged as EventListener);
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  /** 체크박스 */
  const handleCheckboxChange = (companyId: number) => {
    setSelectedIds(prev =>
      prev.includes(companyId) ? prev.filter(v => v !== companyId) : [...prev, companyId]
    );
  };

  const allSelected = useMemo(
    () => rows.length > 0 && selectedIds.length === rows.length,
    [rows, selectedIds]
  );

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(rows.map(r => r.companyId));
  };

  /** 삭제 (회사 ID 기준 DELETE) */
  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`선택한 ${selectedIds.length}개를 삭제할까요?`)) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((cid) =>
          api.delete(`/api/mypage/favorites/companies/${cid}`)
        )
      );
      await fetchList();
    } catch (e) {
      console.error("관심기업 삭제 실패:", e);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 px-6 py-10 max-w-4xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">관심 기업</h2>
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {allSelected ? "전체해제" : "전체선택"}
          </button>
        </div>

        {/* 기업 리스트 */}
        <div className="space-y-5">
          {rows.length === 0 && !loading && (
            <div className="text-sm text-gray-500">즐겨찾기한 기업이 없습니다.</div>
          )}

          {rows.map((r) => (
            <div
              key={r.favoriteId ?? `${r.companyId}-${r.companyName}`}
              className="flex justify-between border-b border-gray-200 pb-4 items-center"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 accent-blue-500"
                  checked={selectedIds.includes(r.companyId)}
                  onChange={() => handleCheckboxChange(r.companyId)}
                  disabled={loading}
                />
                <div>
                  <div className="text-gray-900 font-semibold">{r.companyName}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-black">
                  채용 중 <span className="text-blue-800">{r.openPostCount ?? 0}</span>개
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 삭제 버튼 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleDelete}
            disabled={!selectedIds.length || loading}
            className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCompanies;
