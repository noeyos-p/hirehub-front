// src/myPage/myPageComponents/ResumeDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import api from "../../api/api";

type ResumeDto = {
  id: number;
  title: string;
  idPhoto?: string | null;
  essayTitle?: string | null;
  essayTittle?: string | null;
  essayContent?: string | null;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

const isComposingEvt = (e: React.KeyboardEvent<HTMLInputElement>) =>
  // @ts-ignore
  !!(e.nativeEvent?.isComposing || e.isComposing);

const ResumeDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeIdFromQS = useMemo(() => {
    const qs = new URLSearchParams(location.search || "");
    const v = qs.get("id");
    return v && /^\d+$/.test(v) ? Number(v) : undefined;
  }, [location.search]);

  const [resumeId, setResumeId] = useState<number | undefined>(resumeIdFromQS);
  const [title, setTitle] = useState("새 이력서");
  const [essayTitle, setEssayTitle] = useState("자기소개서");
  const [essayContent, setEssayContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- 사진 업로드/미리보기 ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const handlePickPhoto = () => fileRef.current?.click();
  const ensureResumeId = async (): Promise<number> => {
    if (resumeId) return resumeId;
    const res = await api.post(
      "/api/mypage/resumes",
      {
        title: title || "새 이력서",
        idPhoto: null,
        essayTitle: essayTitle || "자기소개서",
        essayContent: (essayContent && essayContent.trim()) || "임시 자기소개서 내용",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    const id = res?.data?.id;
    if (!id) throw new Error("이력서 생성 실패");
    setResumeId(id);
    return id;
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const id = await ensureResumeId();

      // 로컬 미리보기 즉시
      const localURL = URL.createObjectURL(file);
      setPhotoPreview(localURL);

      const form = new FormData();
      form.append("file", file);

      // ⚠️ 백엔드 업로드 엔드포인트에 맞춰 경로 사용
      const res = await api.post(`/api/mypage/resumes/${id}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 서버가 돌려준 최종 URL이 있으면 교체
      const url = res?.data?.url || res?.data?.idPhoto;
      if (url) setPhotoPreview(url);
    } catch (err) {
      console.error(err);
      alert("사진 업로드 중 오류가 발생했습니다.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ---- 목록형 입력들 (비제어) ----
  const eduSchoolRef = useRef<HTMLInputElement>(null);
  const eduPeriodRef = useRef<HTMLInputElement>(null);
  const eduStatusRef = useRef<HTMLInputElement>(null);
  const eduMajorRef = useRef<HTMLInputElement>(null);
  const [educations, setEducations] = useState<
    Array<{ school: string; period: string; status: string; major: string }>
  >([]);
  const addEducation = () => {
    const school = eduSchoolRef.current?.value?.trim() || "";
    const period = eduPeriodRef.current?.value?.trim() || "";
    const status = eduStatusRef.current?.value?.trim() || "";
    const major = eduMajorRef.current?.value?.trim() || "";
    if (!school && !period && !status && !major) return;
    setEducations((p) => [...p, { school, period, status, major }]);
    if (eduSchoolRef.current) eduSchoolRef.current.value = "";
    if (eduPeriodRef.current) eduPeriodRef.current.value = "";
    if (eduStatusRef.current) eduStatusRef.current.value = "";
    if (eduMajorRef.current) eduMajorRef.current.value = "";
    setTimeout(() => eduSchoolRef.current?.focus(), 0);
  };
  const removeEducation = (i: number) =>
    setEducations((p) => p.filter((_, idx) => idx !== i));

  const carCompanyRef = useRef<HTMLInputElement>(null);
  const carPeriodRef = useRef<HTMLInputElement>(null);
  const carRoleRef = useRef<HTMLInputElement>(null);
  const carJobRef = useRef<HTMLInputElement>(null);
  const carDescRef = useRef<HTMLInputElement>(null);
  const [careers, setCareers] = useState<
    Array<{ company: string; period: string; role: string; job: string; desc: string }>
  >([]);
  const addCareer = () => {
    const company = carCompanyRef.current?.value?.trim() || "";
    const period = carPeriodRef.current?.value?.trim() || "";
    const role = carRoleRef.current?.value?.trim() || "";
    const job = carJobRef.current?.value?.trim() || "";
    const desc = carDescRef.current?.value?.trim() || "";
    if (!company && !period && !role && !job && !desc) return;
    setCareers((p) => [...p, { company, period, role, job, desc }]);
    if (carCompanyRef.current) carCompanyRef.current.value = "";
    if (carPeriodRef.current) carPeriodRef.current.value = "";
    if (carRoleRef.current) carRoleRef.current.value = "";
    if (carJobRef.current) carJobRef.current.value = "";
    if (carDescRef.current) carDescRef.current.value = "";
    setTimeout(() => carCompanyRef.current?.focus(), 0);
  };
  const removeCareer = (i: number) =>
    setCareers((p) => p.filter((_, idx) => idx !== i));

  const certRef = useRef<HTMLInputElement>(null);
  const skillRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLInputElement>(null);
  const [certs, setCerts] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const addCert = () => {
    const v = certRef.current?.value?.trim();
    if (!v) return;
    setCerts((p) => [...p, v]);
    if (certRef.current) {
      certRef.current.value = "";
      setTimeout(() => certRef.current?.focus(), 0);
    }
  };
  const removeCert = (i: number) => setCerts((p) => p.filter((_, idx) => idx !== i));
  const addSkill = () => {
    const v = skillRef.current?.value?.trim();
    if (!v) return;
    setSkills((p) => [...p, v]);
    if (skillRef.current) skillRef.current.value = "";
  };
  const removeSkill = (i: number) => setSkills((p) => p.filter((_, idx) => idx !== i));
  const addLang = () => {
    const v = langRef.current?.value?.trim();
    if (!v) return;
    setLangs((p) => [...p, v]);
    if (langRef.current) langRef.current.value = "";
  };
  const removeLang = (i: number) => setLangs((p) => p.filter((_, idx) => idx !== i));

  // ---- 서버에서 기존 이력서 로드 (있으면) + 사진 URL 세팅 ----
  useEffect(() => {
    (async () => {
      if (!resumeId) return;
      try {
        setLoading(true);
        const { data } = await api.get<ResumeDto>(`/api/mypage/resumes/${resumeId}`);
        setTitle(data?.title || "새 이력서");
        setEssayTitle(data?.essayTitle ?? data?.essayTittle ?? "자기소개서");
        setEssayContent(data?.essayContent ?? "");
        if (data?.idPhoto) setPhotoPreview(data.idPhoto);
      } catch (e) {
        console.warn("이력서 조회 실패(신규 작성 가능):", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [resumeId]);

  // ---- 저장 ----
  // 저장 함수 수정
const handleSave = async () => {
  try {
    setSaving(true);
    const id = await ensureResumeId();
    
    // HTML 생성
    const htmlContent = generateResumeHTML();
    
    await api.put(
      `/api/mypage/resumes/${id}`,
      {
        title: title || "새 이력서",
        essayTitle: essayTitle || "자기소개서",
        essayContent: (essayContent && essayContent.trim()) || "임시 자기소개서 내용",
        htmlContent: htmlContent  // HTML 추가
      },
      { headers: { "Content-Type": "application/json" } }
    );
    alert("저장되었습니다.");
    navigate("/myPage/Resume");
  } catch (e: any) {
    console.error("저장 실패:", e?.response || e);
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "저장 중 오류가 발생했습니다.";
    alert(msg);
  } finally {
    setSaving(false);
  }
};

  // ---- 공통 섹션 레이아웃(디자인 유지) ----
  const Section = ({
    title,
    onAdd,
    children,
  }: {
    title: string;
    onAdd?: () => void;
    children?: React.ReactNode;
  }) => (
    <div className="mb-18">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-gray-500 hover:text-gray-800 opacity-50"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );

  // HTML 생성 함수 추가
const generateResumeHTML = () => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; gap: 30px; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .photo { width: 140px; height: 140px; background: #e5e7eb; }
        .photo img { width: 100%; height: 100%; object-fit: cover; }
        .info { flex: 1; }
        .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .item { margin-bottom: 10px; padding: 5px 0; }
        .essay { white-space: pre-wrap; line-height: 1.6; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; margin-bottom: 30px;">${title}</h1>
      
      <div class="header">
        <div class="photo">
          ${photoPreview ? `<img src="${photoPreview}" alt="프로필" />` : '사진'}
        </div>
        <div class="info">
          <div class="name">홍길동</div>
          <p>남 19xx년생 (만 xx세)</p>
          <p>휴대폰</p>
          <p>이메일</p>
          <p>주소</p>
        </div>
      </div>

      ${educations.length > 0 ? `
      <div class="section">
        <div class="section-title">학력</div>
        ${educations.map(ed => `
          <div class="item">${ed.school} · ${ed.period} · ${ed.status} · ${ed.major}</div>
        `).join('')}
      </div>
      ` : ''}

      ${careers.length > 0 ? `
      <div class="section">
        <div class="section-title">경력</div>
        ${careers.map(c => `
          <div class="item">${c.company} · ${c.period} · ${c.role} · ${c.job} · ${c.desc}</div>
        `).join('')}
      </div>
      ` : ''}

      ${certs.length > 0 ? `
      <div class="section">
        <div class="section-title">자격증</div>
        ${certs.map(c => `<div class="item">${c}</div>`).join('')}
      </div>
      ` : ''}

      ${skills.length > 0 ? `
      <div class="section">
        <div class="section-title">스킬</div>
        ${skills.map(s => `<div class="item">${s}</div>`).join('')}
      </div>
      ` : ''}

      ${langs.length > 0 ? `
      <div class="section">
        <div class="section-title">언어</div>
        ${langs.map(l => `<div class="item">${l}</div>`).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">${essayTitle}</div>
        <div class="essay">${essayContent}</div>
      </div>
    </body>
    </html>
  `;
};

  return (
    <div className="max-w-5xl mx-auto py-10 px-8 bg-white">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold text-gray-900">이력서 작성</h2>
        <input
          className="ml-4 flex-1 max-w-xs border-b border-gray-300 focus:border-black focus:outline-none text-sm py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="이력서 제목"
        />
      </div>

      {/* 프로필 영역: 박스 클릭 → 파일 선택 → 미리보기 */}
      <div className="flex gap-8 mb-12">
        <button
          type="button"
          onClick={handlePickPhoto}
          className="w-[140px] h-[140px] bg-gray-200 flex items-center justify-center text-sm text-gray-500 overflow-hidden rounded"
          title="사진 업로드"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            "사진"
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div>
          <p className="text-lg font-semibold text-gray-800">홍길동</p>
          <p className="text-sm text-gray-500">남 19xx년생 (만 xx세)</p>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>휴대폰</p>
            <p>이메일</p>
            <p>주소</p>
          </div>
        </div>
      </div>

      {/* 학력 */}
      <Section title="학력" onAdd={addEducation}>
        <div className="grid grid-cols-5 gap-4 text-xs text-gray-300 mb-2">
          <span>학교명</span>
          <span>재학기간</span>
          <span>졸업상태</span>
          <span>전공학과</span>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <input ref={eduSchoolRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 중앙고" />
          <input ref={eduPeriodRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 2020~2024" />
          <input ref={eduStatusRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 졸업" />
          <input
            ref={eduMajorRef}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="예) 컴퓨터공학 (Enter 추가)"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (isComposingEvt(e)) return;
              e.preventDefault();
              addEducation();
            }}
          />
        </div>
        {educations.length > 0 && (
          <ul className="text-sm text-gray-700 space-y-1">
            {educations.map((ed, i) => (
              <li key={i} className="flex items-center gap-2">
                {ed.school} · {ed.period} · {ed.status} · {ed.major}
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => removeEducation(i)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 경력 */}
      <Section title="경력" onAdd={addCareer}>
        <div className="grid grid-cols-5 gap-4 text-xs text-gray-300 mb-2">
          <span>회사명</span>
          <span>근무기간</span>
          <span>직책</span>
          <span>직무</span>
          <span>업무내용</span>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <input ref={carCompanyRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) ABC" />
          <input ref={carPeriodRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 2022~2023" />
          <input ref={carRoleRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 대리" />
          <input ref={carJobRef} className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="예) 프론트엔드" />
          <input
            ref={carDescRef}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="예) 업무 요약 (Enter 추가)"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (isComposingEvt(e)) return;
              e.preventDefault();
              addCareer();
            }}
          />
        </div>
        {careers.length > 0 && (
          <ul className="text-sm text-gray-700 space-y-1">
            {careers.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                {c.company} · {c.period} · {c.role} · {c.job} · {c.desc}
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => removeCareer(i)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 자격증 / 스킬 / 언어 */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <Section title="자격증" onAdd={addCert}>
            <input
              ref={certRef}
              className="border border-gray-300 rounded px-2 py-1 text-sm mb-2 w-full"
              placeholder="자격증명 (Enter 추가)"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (isComposingEvt(e)) return;
                e.preventDefault();
                addCert();
              }}
            />
            {certs.length > 0 && (
              <ul className="text-sm text-gray-700 space-y-1">
                {certs.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {c}
                    <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => removeCert(i)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="스킬" onAdd={addSkill}>
            <input
              ref={skillRef}
              className="border border-gray-300 rounded px-2 py-1 text-sm mb-2 w-full"
              placeholder="스킬 (Enter 추가)"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (isComposingEvt(e)) return;
                e.preventDefault();
                addSkill();
              }}
            />
            {skills.length > 0 && (
              <ul className="text-sm text-gray-700 space-y-1">
                {skills.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {s}
                    <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => removeSkill(i)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div>
          <Section title="언어" onAdd={addLang}>
            <input
              ref={langRef}
              className="border border-gray-300 rounded px-2 py-1 text-sm mb-2 w-full"
              placeholder="예) 토익 900 (Enter 추가)"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (isComposingEvt(e)) return;
                e.preventDefault();
                addLang();
              }}
            />
            {langs.length > 0 && (
              <ul className="text-sm text-gray-700 space-y-1">
                {langs.map((l, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {l}
                    <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => removeLang(i)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>

      <hr className="text-gray-200 my-6" />
      <br />

      {/* 자기소개서 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개서</h3>
        <input
          type="text"
          placeholder="자기소개서 제목"
          className="w-full border-b border-gray-300 focus:border-black focus:outline-none text-sm py-1 mb-3"
          value={essayTitle}
          onChange={(e) => setEssayTitle(e.target.value)}
          disabled={loading || saving}
        />
        <textarea
          placeholder="자기소개서 내용"
          rows={5}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
          value={essayContent}
          onChange={(e) => setEssayContent(e.target.value)}
          disabled={loading || saving}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2"
          disabled={saving}
        >
          다음에 하기
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-gray-200 hover:bg-gray-300 text-gray-500 text-sm font-medium px-5 py-2 rounded-md disabled:opacity-50"
          disabled={saving || loading}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default ResumeDetail;
