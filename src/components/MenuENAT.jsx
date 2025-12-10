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
          </ul>
        </nav>
      </div>
    </header>
  );
}
