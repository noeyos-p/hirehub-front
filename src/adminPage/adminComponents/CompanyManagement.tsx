import React, { useState } from "react";
import { TrashIcon, PhotoIcon, PencilIcon } from "@heroicons/react/24/outline";

interface Company {
  id: number;
  name: string;
  category: string;
  location: string;
  employeeCount: string;
  imageUrl?: string;
}

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([
    { 
      id: 1, 
      name: "휴넷", 
      category: "IT/소프트웨어",
      location: "서울 강남구 · 100-500명",
      employeeCount: "재용 15개"
    },
    { 
      id: 2, 
      name: "카카오", 
      category: "인터넷/포털",
      location: "서울 서초구 · 1000명 이상",
      employeeCount: "재용 42개"
    },
    { 
      id: 3, 
      name: "네이버", 
      category: "인터넷/포털",
      location: "성남시 · 1000명 이상",
      employeeCount: "재용 68개"
    },
  ]);
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // AWS 연결 후 구현 예정
    console.log("파일 업로드:", e.target.files);
  };

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newCompanies = [...companies];
    const draggedItem = newCompanies[draggedIndex];
    
    // 드래그한 항목 제거
    newCompanies.splice(draggedIndex, 1);
    // 새 위치에 삽입
    newCompanies.splice(index, 0, draggedItem);
    
    setCompanies(newCompanies);
    setDraggedIndex(index);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedIndex(null);
    // DB 업데이트 로직 추후 추가
    console.log("새로운 순서:", companies);
  };

  const handleDelete = (companyId: number) => {
    setCompanies(companies.filter(company => company.id !== companyId));
    if (selectedCompany?.id === companyId) {
      setSelectedCompany(null);
    }
    // DB 삭제 로직 추후 추가
    console.log("삭제:", companyId);
  };

  const handleEdit = (companyId: number) => {
    // 수정 로직 추후 추가
    console.log("수정:", companyId);
  };

  return (
    <div className="p-8 h-full bg-gray-50">
      {/* 페이지 타이틀 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">기업 관리</h2>
        <button className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200">
          신규
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* 좌측: 기업 로고 업로드 및 미리보기 */}
        <div className="w-[350px] flex flex-col gap-4">
          {/* 파일 업로드 영역 - 크기 축소 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="기업 로고 첨부, 등록 기능(aws에 직접 저장)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
              <label className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer whitespace-nowrap transition-colors">
                등록
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* 이미지 미리보기 영역 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
            {selectedCompany && selectedCompany.imageUrl ? (
              <img
                src={selectedCompany.imageUrl}
                alt={selectedCompany.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <PhotoIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">로고 상세 보기</p>
                <p className="text-xs mt-1">우측 목록에서 기업을 선택하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 기업 목록 */}
        <div className="flex-1 flex flex-col">
          {/* 기업 목록 컨테이너 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 overflow-y-auto h-full">
              <div className="space-y-3">
                {companies.map((company, index) => (
                  <div
                    key={company.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCompanyClick(company)}
                    className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all ${
                      selectedCompany?.id === company.id
                        ? "ring-2 ring-blue-500 shadow-md border-blue-200"
                        : "hover:border-gray-300 hover:shadow-sm"
                    } ${draggedIndex === index ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600">{company.category}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(company.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <PencilIcon className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(company.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {company.location} · {company.employeeCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;