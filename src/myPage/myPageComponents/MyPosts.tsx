import React, { useState } from "react";

const MyPosts = () => {
  const posts = [
    {
      id: 1,
      title: "BIGBIRD",
      content:
        "I don’t need to be surprised I have to make them all stop I don’t need to tell something And it doesn’t need a reason It’s nothing...",
    },
    {
      id: 2,
      title: "꿈과 책과 힘과 벽",
      content: "허가 든고 지는 것에 연연하지 않던 나의 시온 병 든 마음 능멸 불길하듯...",
    },
    {
      id: 3,
      title: "예의",
      content: "예의 매너를 지켜요. 예의 정중히 말해요. 결말경쟁 따지 말고 모두 예의를 지킵시다.",
    },
    {
      id: 4,
      title: "개꿀 연예인",
      content: "개꿀 개꿀 개꿀 개꿀 연예인이 개꿀이죠 다 그런건 아니지만...",
    },
    {
      id: 5,
      title: "하얀 강아지 메로",
      content: "송사람 같은 너 사람 안무슨 너 절대 짖지 않아 순하다던 아이가 너는 내 강아지 하지...",
    },
    {
      id: 6,
      title: "검은 고양이 네로",
      content: "검은 고양이 네로 네로 네로 네로 내 친구는 검은 고양이 네로...",
    },
  ];

  // ✅ 체크 상태 관리
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 개별 체크박스 토글
  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // ✅ 전체선택 버튼
  const handleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      // 이미 전부 선택되어 있으면 해제
      setSelectedIds([]);
    } else {
      // 전체 선택
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">작성한 게시물</h2>
        <button
          onClick={handleSelectAll}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {selectedIds.length === posts.length ? "전체해제" : "전체선택"}
        </button>
      </div>

      {/* 게시물 리스트 */}
      <div className="space-y-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex justify-between border-b border-gray-200 pb-4"
          >
            {/* 왼쪽: 체크박스 + 내용 */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 accent-blue-500"
                checked={selectedIds.includes(post.id)}
                onChange={() => handleCheckboxChange(post.id)}
              />
              <div>
                <div className="text-gray-900 font-semibold">{post.title}</div>
                <div className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2 w-[600px]">
                  {post.content}
                </div>
              </div>
            </div>

            {/* 오른쪽: 수정하기 버튼 + 아이콘 섹션 */}
            <div className="flex flex-col items-end justify-between">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-md">
                수정하기
              </button>
              <div className="flex items-center text-gray-400 text-xs space-x-4 mt-2">
                <span>댓글 50</span>
                <span>조회수 50</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 삭제 버튼 */}
      <div className="flex justify-end mt-6">
        <button className="text-red-500 hover:text-red-600 text-sm font-medium">
          삭제
        </button>
      </div>
    </div>
  );
};

export default MyPosts;
