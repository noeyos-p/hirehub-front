import React, { useState } from "react";
import { TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface Ad {
  id: number;
  title: string;
  imageUrl?: string;
}

const AdsManagement: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([
    { id: 1, title: "광고 항목 1" },
    { id: 2, title: "광고 항목 2" },
    { id: 3, title: "광고 항목 3" },
    { id: 4, title: "광고 항목 4" },
    { id: 5, title: "광고 항목 5" },
  ]);
  
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAdClick = (ad: Ad) => {
    setSelectedAd(ad);
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

    const newAds = [...ads];
    const draggedItem = newAds[draggedIndex];
    
    // 드래그한 항목 제거
    newAds.splice(draggedIndex, 1);
    // 새 위치에 삽입
    newAds.splice(index, 0, draggedItem);
    
    setAds(newAds);
    setDraggedIndex(index);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedIndex(null);
    // DB 업데이트 로직 추후 추가
    console.log("새로운 순서:", ads);
  };

  const handleDelete = (adId: number) => {
    setAds(ads.filter(ad => ad.id !== adId));
    if (selectedAd?.id === adId) {
      setSelectedAd(null);
    }
    // DB 삭제 로직 추후 추가
    console.log("삭제:", adId);
  };

  return (
    <div className="p-8 h-full">
      {/* 페이지 타이틀 */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">광고 관리</h2>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* 좌측: 광고 이미지 업로드 및 미리보기 */}
        <div className="flex-1 flex flex-col">
          {/* 파일 업로드 영역 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="광고 첨부, 등록 기능(aws에 직접 저장)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
              <label className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-200 cursor-pointer whitespace-nowrap">
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
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            {selectedAd && selectedAd.imageUrl ? (
              <img
                src={selectedAd.imageUrl}
                alt={selectedAd.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <PhotoIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                <p className="text-sm">사진 상세 보기 되올 곳</p>
                <p className="text-xs mt-1">우측 목록에서 광고를 선택하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 광고 목록 */}
        <div className="flex-1 flex flex-col">
          {/* 광고 목록 컨테이너 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-3">
              {ads.map((ad, index) => (
                <div
                  key={ad.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleAdClick(ad)}
                  className={`flex justify-between items-center bg-gray-50 rounded-md px-4 py-3 cursor-move transition ${
                    selectedAd?.id === ad.id
                      ? "ring-2 ring-blue-500 shadow-md"
                      : "hover:bg-gray-100 hover:shadow-sm"
                  } ${draggedIndex === index ? "opacity-50" : ""}`}
                >
                  <div className="text-sm text-gray-700 flex-1">{ad.title}</div>
                  <TrashIcon 
                    className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0 ml-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ad.id);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsManagement;