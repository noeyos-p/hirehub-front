// src/myPage/myPageComponents/ResumeDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import { flushSync } from "react-dom";

import api from "../../api/api";

type ResumeDto = {
  id: number;
  title: string;
  idPhoto?: string | null;
  essayTitle?: string | null;
  essayTittle?: string | null;
  essayContent?: string | null;
  htmlContent?: string | null;
  locked: boolean;
  createAt: string;
  updateAt: string;
};

type MyProfileDto = {
  id: number;
  email?: string | null;
  nickname?: string | null;
  name?: string | null;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  position?: string | null;
  education?: string | null;
  birth?: string | null;
  age?: number | null;
  region?: string | null;
  career?: string | null;
};

type ExtraState = {
  educations: Array<{ school: string; period: string; status: string; major: string }>;
  careers: Array<{ company: string; period: string; role: string; job: string; desc: string }>;
  certs: string[];
  skills: string[];
  langs: string[];
};

const defaultExtra: ExtraState = {
  educations: [],
  careers: [],
  certs: [],
  skills: [],
  langs: [],
};

const prettyGender = (g?: string | null) => {
  if (!g) return "";
  const s = String(g).toLowerCase();
  if (["m", "male", "남", "남성"].includes(s)) return "남";
  if (["f", "female", "여", "여성"].includes(s)) return "여";
  return g;
};

const formatBirth = (dateStr?: string | null) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  } catch {
    return "";
  }
};

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

  const [profile, setProfile] = useState<MyProfileDto | null>(null);
  const gender = prettyGender(profile?.gender);
  const birth = formatBirth(profile?.birth);
  const ageText = profile?.age != null ? `만 ${profile.age}세` : "";
  const genderAge = [gender, ageText].filter(Boolean).join(" · ");

  const [extra, setExtra] = useState<ExtraState>(defaultExtra);
  const extraRef = useRef(extra);
  useEffect(() => {
    extraRef.current = extra;
  }, [extra]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const handlePickPhoto = () => fileRef.current?.click();

  // ✅ 온보딩 프로필 불러오기
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<MyProfileDto>("/api/mypage/me");
        setProfile(data);
      } catch (e: any) {
        console.error("프로필 조회 실패:", e?.response?.status, e?.response?.data || e);
        setProfile(null);
      }
    })();
  }, []);

  // ✅ 이력서 로드
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

        if (data?.htmlContent) {
          const parsed = JSON.parse(data.htmlContent) as Partial<ExtraState>;
          setExtra({
            educations: parsed.educations ?? [],
            careers: parsed.careers ?? [],
            certs: parsed.certs ?? [],
            skills: parsed.skills ?? [],
            langs: parsed.langs ?? [],
          });
        } else {
          setExtra(defaultExtra);
        }
      } catch (e) {
        console.warn("이력서 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [resumeId]);

  const ensureResumeId = async (): Promise<number> => {
    if (resumeId) return resumeId;
    const payload = {
      title,
      essayTitle,
      essayContent,
      htmlContent: JSON.stringify(extraRef.current),
    };
    const res = await api.post("/api/mypage/resumes", payload, {
      headers: { "Content-Type": "application/json" },
    });
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
      const localURL = URL.createObjectURL(file);
      setPhotoPreview(localURL);
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/api/mypage/resumes/${id}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.url || res?.data?.idPhoto;
      if (url) setPhotoPreview(url);
    } catch (err) {
      console.error(err);
      alert("사진 업로드 중 오류가 발생했습니다.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ---- 학력/경력/스킬 입력 refs ----
  const eduSchoolRef = useRef<HTMLInputElement>(null);
  const eduPeriodRef = useRef<HTMLInputElement>(null);
  const eduStatusRef = useRef<HTMLInputElement>(null);
  const eduMajorRef = useRef<HTMLInputElement>(null);

  const carCompanyRef = useRef<HTMLInputElement>(null);
  const carPeriodRef = useRef<HTMLInputElement>(null);
  const carRoleRef = useRef<HTMLInputElement>(null);
  const carJobRef = useRef<HTMLInputElement>(null);
  const carDescRef = useRef<HTMLInputElement>(null);

  const certRef = useRef<HTMLInputElement>(null);
  const skillRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLInputElement>(null);

  // ✅ add 함수들
  const addEducation = () => {
    const school = eduSchoolRef.current?.value?.trim() || "";
    const period = eduPeriodRef.current?.value?.trim() || "";
    const status = eduStatusRef.current?.value?.trim() || "";
    const major = eduMajorRef.current?.value?.trim() || "";
    if (!school && !period && !status && !major) return;
    setExtra((p) => ({
      ...p,
      educations: [...p.educations, { school, period, status, major }],
    }));
    if (eduSchoolRef.current) eduSchoolRef.current.value = "";
    if (eduPeriodRef.current) eduPeriodRef.current.value = "";
    if (eduStatusRef.current) eduStatusRef.current.value = "";
    if (eduMajorRef.current) eduMajorRef.current.value = "";
  };

  const addCareer = () => {
    const company = carCompanyRef.current?.value?.trim() || "";
    const period = carPeriodRef.current?.value?.trim() || "";
    const role = carRoleRef.current?.value?.trim() || "";
    const job = carJobRef.current?.value?.trim() || "";
    const desc = carDescRef.current?.value?.trim() || "";
    if (!company && !period && !role && !job && !desc) return;
    setExtra((p) => ({
      ...p,
      careers: [...p.careers, { company, period, role, job, desc }],
    }));
    if (carCompanyRef.current) carCompanyRef.current.value = "";
    if (carPeriodRef.current) carPeriodRef.current.value = "";
    if (carRoleRef.current) carRoleRef.current.value = "";
    if (carJobRef.current) carJobRef.current.value = "";
    if (carDescRef.current) carDescRef.current.value = "";
  };

  const addCert = () => {
    const v = certRef.current?.value?.trim();
    if (!v) return;
    setExtra((p) => ({ ...p, certs: [...p.certs, v] }));
    if (certRef.current) certRef.current.value = "";
  };

  const addSkill = () => {
    const v = skillRef.current?.value?.trim();
    if (!v) return;
    setExtra((p) => ({ ...p, skills: [...p.skills, v] }));
    if (skillRef.current) skillRef.current.value = "";
  };

  const addLang = () => {
    const v = langRef.current?.value?.trim();
    if (!v) return;
    setExtra((p) => ({ ...p, langs: [...p.langs, v] }));
    if (langRef.current) langRef.current.value = "";
  };

  // ✅ 저장 함수
 
 const handleSave = async () => {
  try {
    setSaving(true);

    // ✅ 항상 최신 extra를 JSON으로 안전 직렬화
    const safeExtra = extra && Object.keys(extra).length > 0 ? extra : defaultExtra;
    const payload = {
      title: title || "새 이력서",
      essayTitle: essayTitle || "자기소개서",
      essayContent: (essayContent && essayContent.trim()) || "임시 자기소개서 내용",
      htmlContent: JSON.stringify(safeExtra), // ✅ 무조건 JSON 문자열
    };

    console.log("💾 [DEBUG] 저장 직전 payload:", payload); // ← 콘솔 확인용

    if (resumeId) {
      await api.put(`/api/mypage/resumes/${resumeId}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const res = await api.post(`/api/mypage/resumes`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const id = res?.data?.id;
      if (id) setResumeId(id);
    }

    alert("저장되었습니다.");
    navigate("/myPage/Resume");
  } catch (e: any) {
    console.error("저장 실패:", e);
    alert("저장 중 오류가 발생했습니다.");
  } finally {
    setSaving(false);
  }
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

      {/* ✅ 온보딩 프로필 */}
      <div className="flex gap-8 mb-12">
        <button
          type="button"
          onClick={handlePickPhoto}
          className="w-[140px] h-[140px] bg-gray-200 flex items-center justify-center text-sm text-gray-500 overflow-hidden rounded"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            "사진"
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">{profile?.name || ""}</p>
          {(genderAge || birth) && (
            <p className="text-sm text-gray-500">{[genderAge, birth].filter(Boolean).join(" / ")}</p>
          )}
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            {profile?.phone ? <p>{profile.phone}</p> : null}
            {profile?.email ? <p>{profile.email}</p> : null}
            {profile?.address ? <p>{profile.address}</p> : profile?.region ? <p>{profile.region}</p> : null}
          </div>
        </div>
      </div>

      {/* 학력 */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-3">학력</h3>
        <div className="grid grid-cols-5 gap-4 mb-2 text-xs text-gray-400">
          <span>학교명</span>
          <span>재학기간</span>
          <span>졸업상태</span>
          <span>전공</span>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <input ref={eduSchoolRef} placeholder="학교명" className="border p-1 rounded" />
          <input ref={eduPeriodRef} placeholder="기간" className="border p-1 rounded" />
          <input ref={eduStatusRef} placeholder="상태" className="border p-1 rounded" />
          <input ref={eduMajorRef} placeholder="전공 (Enter 추가)" className="border p-1 rounded"
            onKeyDown={(e) => { if (e.key === "Enter") addEducation(); }} />
        </div>
        <ul className="text-sm text-gray-700 space-y-1">
          {extra.educations.map((ed, i) => (
            <li key={i}>{ed.school} · {ed.period} · {ed.status} · {ed.major}</li>
          ))}
        </ul>
      </div>

      {/* 경력 */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-3">경력</h3>
        <div className="grid grid-cols-5 gap-4 mb-2 text-xs text-gray-400">
          <span>회사명</span><span>근무기간</span><span>직책</span><span>직무</span><span>내용</span>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <input ref={carCompanyRef} placeholder="회사명" className="border p-1 rounded" />
          <input ref={carPeriodRef} placeholder="기간" className="border p-1 rounded" />
          <input ref={carRoleRef} placeholder="직책" className="border p-1 rounded" />
          <input ref={carJobRef} placeholder="직무" className="border p-1 rounded" />
          <input ref={carDescRef} placeholder="내용 (Enter 추가)" className="border p-1 rounded"
            onKeyDown={(e) => { if (e.key === "Enter") addCareer(); }} />
        </div>
        <ul className="text-sm text-gray-700 space-y-1">
          {extra.careers.map((c, i) => (
            <li key={i}>{c.company} · {c.period} · {c.role} · {c.job} · {c.desc}</li>
          ))}
        </ul>
      </div>

      {/* 자격증/스킬/언어 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div>
          <h3 className="text-lg font-semibold mb-2">자격증</h3>
          <input ref={certRef} placeholder="자격증 (Enter 추가)" className="border p-1 rounded w-full mb-2"
            onKeyDown={(e) => { if (e.key === "Enter") addCert(); }} />
          <ul>{extra.certs.map((c, i) => (<li key={i}>{c}</li>))}</ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">스킬</h3>
          <input ref={skillRef} placeholder="스킬 (Enter 추가)" className="border p-1 rounded w-full mb-2"
            onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }} />
          <ul>{extra.skills.map((s, i) => (<li key={i}>{s}</li>))}</ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">언어</h3>
          <input ref={langRef} placeholder="언어 (Enter 추가)" className="border p-1 rounded w-full mb-2"
            onKeyDown={(e) => { if (e.key === "Enter") addLang(); }} />
          <ul>{extra.langs.map((l, i) => (<li key={i}>{l}</li>))}</ul>
        </div>
      </div>

      {/* 자기소개서 */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-3">자기소개서</h3>
        <input
          type="text"
          value={essayTitle}
          onChange={(e) => setEssayTitle(e.target.value)}
          className="w-full border-b p-1 mb-3"
          placeholder="자기소개서 제목"
        />
        <textarea
          rows={5}
          value={essayContent}
          onChange={(e) => setEssayContent(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="자기소개서 내용"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={() => navigate(-1)} className="border px-4 py-2 rounded">다음에 하기</button>
        <button onClick={handleSave} className="bg-gray-200 px-5 py-2 rounded">저장하기</button>
      </div>
    </div>
  );
};

export default ResumeDetail;
