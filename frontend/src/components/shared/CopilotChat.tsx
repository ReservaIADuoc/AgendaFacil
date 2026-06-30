import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, User, Calendar, Check } from "lucide-react";
import { useAuth, API_BASE_URL } from "../../contexts/AuthContext";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  isActionCard?: boolean;
};

export default function CopilotChat({ mode = "professional", username }: { mode?: "professional" | "client"; username?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: "ai",
        text: mode === "client"
          ? "Hola, soy el asistente virtual de reservas. ¿Deseas agendar una hora o consultar la disponibilidad de atención?"
          : "Hola, soy tu asistente de Inteligencia Artificial de Agenda Fácil. ¿En qué te puedo ayudar hoy?"
      }
    ]);
  }, [mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-copilot", handleOpen);
    return () => {
      window.removeEventListener("open-copilot", handleOpen);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const isClient = mode === "client";
    const endpoint = isClient ? "/appointments/public/ai/chat" : "/appointments/ai/chat";

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(!isClient && token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
          username: username,
          history: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const text = data.response || "No se pudo obtener una respuesta.";
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      setIsTyping(false);

      const isAction = data.actionTaken === "SCHEDULE_APPOINTMENT";

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: text,
          isActionCard: isAction
        }
      ]);

      // If an appointment was scheduled, trigger update of the calendar/dashboard
      if (isAction) {
        window.dispatchEvent(new CustomEvent("appointment-created"));
      }

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: `❌ Error al conectar con el Asistente de IA: ${error?.message || "Error desconocido"}.`
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} bg-gradient-to-tr from-[#C0987A] to-[#D9A05B] hover:scale-110 hover:shadow-[0_0_20px_rgba(192,152,122,0.5)]`}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[360px] h-[550px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C0987A] to-[#D9A05B] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm" style={{ fontFamily: "'Fraunces', serif" }}>IA Copiloto</h3>
              <p className="text-white/80 text-[10px]">Gemini powered</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-[#C0987A]/20 text-[#C0987A] dark:bg-[#C0987A]/10' : 'bg-muted text-muted-foreground'}`}>
                {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#C0987A] text-white rounded-tr-none' : 'bg-card border border-border text-foreground rounded-tl-none'}`}>
                  {msg.text}
                </div>
                
                {/* Action Card Mock */}
                {msg.isActionCard && (
                  <div className="bg-card border border-border rounded-xl p-3 shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#C0987A]" />
                      <span className="text-xs font-bold text-foreground">Sugerencia de Cita</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">Jueves, 15:00 hrs<br/>Terapia Individual - 45 min</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.currentTarget.innerText = "¡Confirmada!";
                          e.currentTarget.classList.add("bg-green-100", "text-green-700");
                        }}
                        className="flex-1 py-1.5 bg-[#C0987A]/10 text-[#C0987A] hover:bg-[#C0987A]/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3 max-w-[85%]">
               <div className="w-7 h-7 rounded-full bg-[#C0987A]/20 text-[#C0987A] flex items-center justify-center shrink-0">
                 <Sparkles className="w-3.5 h-3.5" />
               </div>
               <div className="p-3 bg-card border border-border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-[#C0987A]/60 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-[#C0987A]/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                 <span className="w-1.5 h-1.5 bg-[#C0987A]/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-card border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2 focus-within:border-[#C0987A] focus-within:ring-1 focus-within:ring-[#C0987A] transition-all">
            <input 
              type="text" 
              placeholder="Pide a la IA que agende, resuma..." 
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1.5 rounded-lg bg-[#C0987A] text-white disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> La IA de Gemini puede cometer errores.
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
