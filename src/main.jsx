import React from "react";
import { createRoot } from "react-dom/client";
import CentralENATHSI from "./App.jsx";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ENAT HSI runtime error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const message = this.state.error?.message || String(this.state.error);
    return (
      <main style={{ minHeight: "100vh", padding: "40px", fontFamily: "Arial, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 30px rgba(0,0,0,.08)" }}>
          <h1 style={{ color: "#b91c1c", marginTop: 0 }}>ENAT HSI — erro de execução</h1>
          <p>O aplicativo foi carregado, mas ocorreu um erro no frontend.</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f1f5f9", padding: "16px", borderRadius: "10px", overflowX: "auto" }}>{message}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 18px", border: 0, borderRadius: "8px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Recarregar</button>
        </div>
      </main>
    );
  }
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <CentralENATHSI />
    </AppErrorBoundary>
  </React.StrictMode>
);
