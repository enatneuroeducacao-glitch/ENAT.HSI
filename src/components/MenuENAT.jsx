import { NavLink } from "react-router-dom";

export function MenuENAT() {
  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">ENAT HSI</div>
        <nav>
          <ul className="flex gap-6">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Início</NavLink>
            </li>
            <li>
              <NavLink to="/sobre" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Sobre</NavLink>
            </li>
            <li>
              <NavLink to="/produtos" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Produtos</NavLink>
            </li>
            <li>
              <NavLink to="/certificacao" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Certificação</NavLink>
            </li>
            <li>
              <NavLink to="/governanca" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Governança</NavLink>
            </li>
            <li>
              <NavLink to="/contato" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>Contato</NavLink>
            </li>
            <li>
              <NavLink to="/resultados" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>📊 Resultados</NavLink>
            </li>
            <li>
              <NavLink to="/cursos" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>📚 Cursos</NavLink>
            </li>
            <li>
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                  ➕ Cadastro
                  <span className="text-xs">▼</span>
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <NavLink to="/cadastro/instrutor" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b">👨‍🏫 Cadastro Instrutor</NavLink>
                  <NavLink to="/cadastro/aluno" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">👨‍🎓 Cadastro Aluno</NavLink>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
