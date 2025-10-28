// src/myPage/resume/ResumeViewer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

// ----- 타입 -----
type ProfileMini = {
  id: number;
  nickname?: string | null;
  name?: string | null;
  phone?: string | null;
  gender?: string | null;
  birth?: string | null;     // yyyy-MM-dd
  address?: string | null;
  email?: string | null;
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

type ResumeDto = {
  id: number;
  title: string;
  idPhoto?: string | null;
  essayTitle?: string | null;
  essayContent?: string | null;
  htmlContent?: string | null;  // JSON 문자열(ExtraState)
  locked: boolean;
  createAt: string;
  updateAt: string;
  profile?: ProfileMini | null; // ✅ 백에서 내려주는 온보딩 요약
};

// ----- 유틸 -----
const prettyGender = (g?: string | null) => {
  if (!g) return "";
  const s = String(g).toLowerCase();
  if (["m", "male", "남", "남성"].includes(s)) return "남";
  if (["f", "female", "여", "여성"].includes(s)) return "여";
  return g || "";
};

const prettyBirthAge = (birth?: string | null) => {
  if (!birth) return { birthText: "", ageText: "" };
  try {
    const date = new Date(birth);
    if (isNaN(date.getTime())) return { birthText: birth, ageText: "" };

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const md = (today.getMonth() + 1) * 100 + today.getDate();
    const bd = (date.getMonth() + 1) * 100 + date.getDate();
    if (md < bd) age--;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return { birthText: `${yyyy}.${mm}.${dd}`, ageText: `만 ${Math.max(age, 0)}세` };
  } catch {
    return { birthText: birth, ageText: "" };
  }
};

const ViewerSection: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="border-t border-gray-200 pt-3">{children}</div>
  </div>
);

// ===== 컴포넌트 =====
const ResumeViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ResumeDto | null>(null);
  const [extra, setExtra] = useState<ExtraState>(defaultExtra);
  const [loading, setLoading] = useState(true);

  // 조회
  useEffect(() => {
    (async () => {
      if (!id || isNaN(Number(id))) {
        alert("잘못된 이력서 ID 입니다.");
        navigate("/myPage/Resume", { replace: true });
        return;
      }
      try {
        setLoading(true);
        const { data } = await api.get<ResumeDto>(`/api/mypage/resumes/${id}`);
        setData(data);

        // htmlContent(JSON) 파싱 → 섹션 데이터
        if (data?.htmlContent) {
          try {
            const parsed = JSON.parse(data.htmlContent) as Partial<ExtraState>;
            setExtra({
              educations: parsed.educations ?? [],
              careers: parsed.careers ?? [],
              certs: parsed.certs ?? [],
              skills: parsed.skills ?? [],
              langs: parsed.langs ?? [],
            });
          } catch {
            setExtra(defaultExtra);
          }
        } else {
          setExtra(defaultExtra);
        }
      } catch (e: any) {
        console.error("이력서 조회 실패:", e?.response?.status, e?.response?.data || e);
        alert("이력서를 불러올 수 없습니다.");
        navigate("/myPage/Resume", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const gender = prettyGender(data?.profile?.gender);
  const { birthText, ageText } = prettyBirthAge(data?.profile?.birth);

  const headerRightRows = useMemo(() => {
    const rows: Array<{ label: string; value?: string | null }> = [
      { label: "휴대폰", value: data?.profile?.phone },
      { label: "이메일", value: data?.profile?.email },
      { label: "주소", value: data?.profile?.address },
    ];
    return rows.filter((r) => !!r.value);
  }, [data]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-10 text-center">로딩 중...</div>;
  }
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-white">
      {/* 상단: 프로필 */}
      <div className="flex gap-6 items-start">
        <div className="w-[96px] h-[120px] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {data.idPhoto ? (
            <img src={data.idPhoto} alt="증명사진" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">사진</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-bold text-gray-900">
              {data.profile?.name ?? "이름 없음"}
            </h1>
            <div className="text-sm text-gray-500">
              {birthText ? `빈 ${birthText}` : ""}
              {ageText ? ` (${ageText})` : ""}
            </div>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            {[gender].filter(Boolean).join(" · ")}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700">
            {headerRightRows.map((r, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-14 text-gray-500">{r.label}</span>
                <span>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 상단 타이틀(이력서 제목) */}
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">이력서 제목</div>
          <div className="text-base font-semibold text-gray-800">{data.title}</div>
        </div>
      </div>

      {/* 학력 */}
      {extra.educations.length > 0 && (
        <ViewerSection title="학력">
          <div className="space-y-2">
            {extra.educations.map((ed, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">학교명</div>
                  <div className="text-gray-800">{ed.school}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">재학기간</div>
                  <div className="text-gray-800">{ed.period}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">졸업상태</div>
                  <div className="text-gray-800">{ed.status}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">전공</div>
                  <div className="text-gray-800">{ed.major}</div>
                </div>
              </div>
            ))}
          </div>
        </ViewerSection>
      )}

      {/* 경력 */}
      {extra.careers.length > 0 && (
        <ViewerSection title="경력">
          <div className="space-y-2">
            {extra.careers.map((c, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">회사명</div>
                  <div className="text-gray-800">{c.company}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">근무기간</div>
                  <div className="text-gray-800">{c.period}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">직책</div>
                  <div className="text-gray-800">{c.role}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">직무</div>
                  <div className="text-gray-800">{c.job}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">업무내용</div>
                  <div className="text-gray-800 whitespace-pre-wrap">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </ViewerSection>
      )}

      {/* 자격증 / 언어 / 스킬 */}
      {(extra.certs.length > 0 || extra.langs.length > 0 || extra.skills.length > 0) && (
        <div className="grid grid-cols-3 gap-8 mt-6">
          {extra.certs.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">자격증</h3>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {extra.certs.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>
          )}
          {extra.langs.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">언어</h3>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {extra.langs.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>
          )}
          {extra.skills.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">스킬</h3>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {extra.skills.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 자기소개서 */}
      {(data.essayTitle || data.essayContent) && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-800 mb-2">자기소개서</h3>
          {data.essayTitle && (
            <div className="text-sm text-gray-700 mb-2">{data.essayTitle}</div>
          )}
          <div className="border border-gray-200 rounded p-4 text-sm text-gray-800 whitespace-pre-wrap leading-6">
            {data.essayContent || ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeViewer;
