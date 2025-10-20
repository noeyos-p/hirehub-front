import React, { useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const MyInfo: React.FC = () => {
  const [profile, setProfile] = useState({
    nickname: "나는야개똥벌레",
    이메일: "ghdrlfehd@gmail.com",
    이름: "홍길동",
    핸드폰: "010-1234-5678",
    생일: "1925-01-20",
    나이: 100,
    성별: "남자",
    주소: "서울시 용산구 청파로7가길 63 302호",
    지역: "서울시 강남구 / 송파구",
    직무: "프론트",
    경력: "신입",
    학력: "고졸",
    학교: "중앙대학교사범대학부속고등학교",
  });

  // 현재 수정 중인 항목의 key
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 수정 종료 (포커스 아웃 or Enter)
  const handleBlur = () => setEditingField(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setEditingField(null);
  };

  return (
    <div className="border-gray-200 rounded-lg p-6 max-w-5xl mx-auto flex gap-8">
      {/* 좌측 프로필 */}
      <div className="w-64 flex flex-col items-center space-y-4 border-r border-gray-200 pr-6">
        <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-white">
          {profile.nickname[0]}
        </div>
        <div className="text-lg font-semibold text-gray-900">
          {profile.nickname}
        </div>
      </div>

      {/* 우측 정보 리스트 */}
      <div className="flex-1">
        <div className="grid gap-4">
          {Object.entries(profile).map(([key, value]) => {
            if (key === "nickname") return null;

            const isEditing = editingField === key;

            return (
              <div
                key={key}
                className="flex items-center justify-between border-b border-gray-200 py-2"
              >
                <span className="w-32 font-medium text-gray-700">{key}</span>

                <div className="flex-1 flex items-center gap-2">
                  <input
                    type={key === "생일" ? "date" : "text"}
                    name={key}
                    value={value}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`border p-2 rounded flex-1 text-gray-800 ${
                      isEditing
                        ? "bg-white border-blue-400 focus:outline-blue-500"
                        : "bg-gray-50 border-gray-200 cursor-default"
                    }`}
                  />

                  <PencilIcon
                    className={`w-5 h-5 cursor-pointer transition ${
                      isEditing
                        ? "text-blue-500 hover:text-blue-600"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    onClick={() =>
                      setEditingField(isEditing ? null : key)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
