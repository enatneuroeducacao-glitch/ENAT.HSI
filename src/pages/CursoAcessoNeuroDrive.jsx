import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ACCESS_KEY = "neurodrive_course_access_ticket_v1";

function safeText(value) {
  return String(value ?? "");
}

export function CursoAcessoNeuroDrive() {
  const [state, setState] = useState({ loading: true, error: "", course: null, session: "" });
  const ticket = useMemo(() => {\n    const hash = window.location.hash.replace(/^#/, "");\n    const params = new URLSearchParams(hash);\n    return params.get("access") || sessionStorage.getItem(ACCESS_KEY) || "";\n  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!supabase) throw new Error("Conexão com o NeuroDrive indisponível.");

        if (!ticket) throw new Error("Este acesso ao curso expirou. Volte à Rede Neurotrânsito e abra o curso novamente.");\n\n        const { data, error } = await supabase.rpc("neurodrive_redeem_course_access", { p_ticket: ticket });
        if (error) {
          let message = error.message || "Não foi possível validar o acesso ao curso.";
          try {
            const detail = await error.context?.json?.();
            if (detail?.error) message = detail.error;
          } catch {}
          throw new Error(message);
        }

        if (!data?.course) {\n          throw new Error("A autorização do curso não foi concluída.");\n        }\n\n        sessionStorage.setItem(ACCESS_KEY, ticket);
        if (!cancelled) {
          window.history.replaceState(null, "", window.location.pathname);
          setState({ loading: false, error: "", course: data.course, session: ticket });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err?.message || "Acesso não autorizado.", course: null, session: "" });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [ticket]);

  if (state.loading) {
    return (
      <main className="min-h-screen bg-slate-50 grid place-items-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <div className="text-3xl">🧠</div>
          <h1 className="text-xl font-black mt-3">Validando seu acesso</h1>
          <p className="text-slate-500 mt-2">Abrindo somente o curso autorizado do NeuroDrive.</p>
        </div>
      </main>
    );
  }

  if (state.error || !state.course) {
    return (
      <main className="min-h-screen bg-slate-50 grid place-items-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-3xl">🔒</div>
          <h1 className="text-2xl font-black mt-3">Acesso ao curso não autorizado</h1>
          <p className="text-slate-600 mt-2 leading-6">{state.error}</p>
          <p className="text-xs text-slate-400 mt-5">O acesso é temporário e limitado ao curso autorizado pela Rede Neurotrânsito.</p>
        </div>
      </main>
    );
  }

  const course = state.course;
  const modules = Array.isArray(course.modules) ? course.modules : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#07111f] text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-300 font-black">NeuroDrive · Cursos</div>
            <div className="text-lg font-black mt-1">Acesso autorizado pela Rede Neurotrânsito</div>
          </div>
          <span className="text-xs font-black px-3 py-2 rounded-full bg-white/10">Somente este curso</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-emerald-700 font-black">{safeText(course.code)}</div>
              <h1 className="text-3xl font-black mt-2">{safeText(course.name)}</h1>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">{safeText(course.hours)} horas</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">{safeText(course.modality || "Online")}</span>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-900 text-sm font-bold">
              Acesso exclusivo
            </div>
          </div>

          <div className="mt-6 whitespace-pre-line text-slate-600 leading-7">
            {safeText(course.summary)}
          </div>
        </section>

        <section className="mt-5 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Conteúdo do curso</h2>
              <p className="text-sm text-slate-500 mt-1">Você não recebe acesso ao restante do ambiente do NeuroDrive.</p>
            </div>
            <span className="text-xs font-black px-3 py-2 rounded-full bg-slate-100">{modules.length} módulo(s)</span>
          </div>

          <div className="space-y-3 mt-5">
            {modules.length ? modules.map((module, moduleIndex) => (
              <article key={moduleIndex} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-emerald-700 font-black">Módulo {moduleIndex + 1}</div>
                    <h3 className="font-black text-lg mt-1">{safeText(module.title || "Módulo")}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{safeText(module.hours || 0)} h</span>
                </div>
                <div className="mt-4 space-y-2">
                  {(Array.isArray(module.lessons) ? module.lessons : []).map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 grid place-items-center text-xs font-black">{lessonIndex + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm">{safeText(lesson.name || "Aula")}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{safeText(lesson.hours || 0)} horas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )) : (
              <div className="p-5 rounded-2xl bg-slate-50 text-slate-500">O conteúdo está sendo preparado no catálogo do NeuroDrive.</div>
            )}
          </div>
        </section>

        <div className="mt-5 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <b>Privacidade e segurança:</b> este link não abre o painel administrativo, o dashboard ou outros cursos. A autorização é temporária e vinculada exclusivamente a este curso.
        </div>
      </div>
    </main>
  );
}
