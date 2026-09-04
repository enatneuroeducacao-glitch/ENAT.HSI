import { NavLink } from "react-router-dom";

export function MenuENAT() {
  return <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50"><div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"><div className="text-2xl font-bold">ENAT HSI</div><nav><ul className="flex gap-8 items-center"><li><NavLink to="/cursos/admin" className={({isActive})=>(isActive?"text-blue-600 font-semibold":"text-gray-700")}>📚 Banco de Cursos</NavLink></li><li><NavLink to="/alunos" className={({isActive})=>(isActive?"text-blue-600 font-semibold":"text-gray-700")}>👥 Alunos</NavLink></li><li><NavLink to="/emissor" className={({isActive})=>(isActive?"text-blue-600 font-semibold":"text-gray-700")}>🖨️ Emissor de Certificados</NavLink></li></ul></nav></div></header>;
}
