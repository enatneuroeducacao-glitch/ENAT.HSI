import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./ENATTVStudio.css";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL || ""}/functions/v1`;

export function ENATTVStudio() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [event, setEvent] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const validate = async () => {
      if (!token) { setError("Convite do estúdio não informado."); setLoading(false); return; }
      try {
        const response = await fetch(`${FUNCTIONS_URL}/enat-tv-studio`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "validate_invite", token }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.error || "Convite inválido ou expirado.");
        if (mounted) { setEvent(result.event); setGuest(result.guest); }
      } catch (e) { if (mounted) setError(e.message || "Não foi possível validar o convite."); }
      finally { if (mounted) setLoading(false); }
    };
    validate();
    return () => { mounted = false; if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop()); };
  }, [token]);

  const eventDate = useMemo(() => event?.scheduled_start ? new Date(event.scheduled_start).toLocaleString("pt-BR") : "", [event]);

  const startCamera = async () => {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true); setMicOn(true);
      setMessage("Câmera e microfone conectados. O transporte ao vivo será iniciado pela Central quando o programa entrar no ar.");
    } catch (e) { setMessage(`Não foi possível acessar câmera/microfone: ${e.message || "verifique as permissões do navegador."}`); }
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled; setMicOn(track.enabled);
  };
  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled; setCameraOn(track.enabled);
  };
  const shareScreen = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screen.getVideoTracks()[0];
      if (videoRef.current) videoRef.current.srcObject = screen;
      setSharing(true); setMessage("Compartilhamento de tela ativo para pré-visualização.");
      screenTrack.onended = () => { setSharing(false); if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; };
    } catch (e) { setMessage(e.message || "Compartilhamento cancelado."); }
  };

  if (loading) return <main className="enat-studio-page"><div className="studio-card"><span className="studio-kicker">ENAT TV</span><h1>Validando acesso ao estúdio…</h1></div></main>;
  if (error) return <main className="enat-studio-page"><div className="studio-card"><span className="studio-kicker">ENAT TV</span><h1>Acesso ao estúdio</h1><p className="studio-error">{error}</p><Link to="/tv" className="studio-link">Voltar para ENAT TV</Link></div></main>;

  return <main className="enat-studio-page">
    <header className="studio-header"><div><span className="studio-kicker">ENAT TV · ESTÚDIO VIRTUAL</span><h1>{event?.title}</h1><p>{eventDate} · {guest?.display_name}{guest?.role === "host" ? " · Apresentador" : " · Convidado"}</p></div><span className="studio-status">● Sala autorizada</span></header>
    <section className="studio-grid">
      <div className="studio-stage"><video ref={videoRef} autoPlay muted playsInline className="studio-video" /><div className="studio-overlay">{sharing ? "🖥️ COMPARTILHANDO TELA" : cameraOn ? "🎥 PRÉ-VISUALIZAÇÃO" : "🎥 CÂMERA DESLIGADA"}</div></div>
      <aside className="studio-controls"><h2>Seu estúdio</h2><p>Entre alguns minutos antes do horário para testar câmera e microfone.</p><div className="studio-buttons"><button onClick={startCamera}>🎥 Testar câmera + microfone</button><button onClick={toggleCamera} disabled={!streamRef.current}>📷 {cameraOn ? "Desligar câmera" : "Ligar câmera"}</button><button onClick={toggleMic} disabled={!streamRef.current}>🎤 {micOn ? "Desligar microfone" : "Ligar microfone"}</button><button onClick={shareScreen}>🖥️ Compartilhar tela</button></div><div className="studio-live-box"><span>🔴</span><strong>A transmissão é controlada pela Central ENAT TV</strong><small>Você não precisa conhecer YouTube, OBS ou configurações técnicas.</small></div>{message && <div className="studio-message">{message}</div>}</aside>
    </section>
    <footer className="studio-footer"><span>ENAT TV · Rede de Neuroeducação, Ciência e Segurança no Trânsito</span><Link to="/tv">Sair do estúdio</Link></footer>
  </main>;
}
