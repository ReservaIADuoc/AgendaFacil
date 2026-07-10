import { useState } from "react";


const ACCENT = "#A9B3A2";

export function BookingMockup() {
  const slots = ["09:00", "09:30", "10:00", "11:00", "11:30", "14:00", "15:00", "16:30"];
  const [selected, setSelected] = useState("10:00");
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden w-full max-w-sm mx-auto">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "var(--theme-primary, #C0987A)" }}>VR</div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">Valentina Rojas</p>
            <p className="text-[11px] text-gray-500">Psicóloga Clínica · 50 min</p>
          </div>
        </div>
        <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Junio 2026</div>
        <div className="grid grid-cols-7 gap-1">
          {["L","M","X","J","V","S","D"].map(d => (
            <div key={d} className="h-6 flex items-center justify-center text-[10px] text-gray-400 font-medium">{d}</div>
          ))}
          {[null,null,null,null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d,i) => (
            <div key={i} className={`h-7 flex items-center justify-center text-[11px] rounded-full cursor-pointer font-medium transition-all
              ${d === 22 ? "text-white shadow-sm" : d ? "text-gray-700 hover:bg-[#F3EFE9]" : ""}
            `} style={d === 22 ? { background: "var(--theme-primary, #C0987A)" } : {}}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Horarios disponibles</p>
        <div className="grid grid-cols-4 gap-1.5">
          {slots.map(s => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className="py-1.5 rounded-lg text-[11px] font-semibold transition-all border"
              style={{
                background: selected === s ? "var(--theme-primary, #C0987A)" : "transparent",
                color: selected === s ? "#fff" : "#374151",
                borderColor: selected === s ? "var(--theme-primary, #C0987A)" : "#E5E7EB",
              }}
            >{s}</button>
          ))}
        </div>
        <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: ACCENT }}>
          Confirmar cita
        </button>
      </div>
    </div>
  );
}

export function ReminderMockup() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {[
        { icon: "💬", channel: "WhatsApp", time: "24h antes", msg: "Hola María, mañana tienes cita con Valentina a las 10:00. ¿Confirmas?", color: "#25D366" },
        { icon: "📧", channel: "Email", time: "2h antes", msg: "Recordatorio: tu sesión de psicología es en 2 horas.", color: "#4F46E5" },
        { icon: "📱", channel: "SMS", time: "30min antes", msg: "Tu cita empieza en 30 minutos. ¡No llegues tarde!", color: "var(--theme-primary, #C0987A)" },
      ].map(r => (
        <div key={r.channel} className="bg-white rounded-2xl shadow-lg border border-black/5 p-4 flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: r.color + "15" }}>
            {r.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold text-gray-900">{r.channel}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: r.color + "15", color: r.color }}>{r.time}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{r.msg}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClientMockup() {
  const clients = [
    { name: "María García", sessions: 14, next: "Hoy 10:00", status: "Al día", initials: "MG", hue: "var(--theme-primary, #C0987A)" },
    { name: "Carlos Ruiz", sessions: 8, next: "Jue 11:30", status: "Pago pendiente", initials: "CR", hue: "#F59E0B" },
    { name: "Ana Martínez", sessions: 3, next: "Vie 09:00", status: "Al día", initials: "AM", hue: "#A9B3A2" },
    { name: "Luis Fernández", sessions: 21, next: "Lun 14:00", status: "Al día", initials: "LF", hue: "#D9A05B" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden w-full max-w-sm mx-auto">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[13px] font-bold text-gray-900">Mis clientes</span>
        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: "var(--theme-primary, #C0987A)" + "15", color: "var(--theme-primary, #C0987A)" }}>48 activos</span>
      </div>
      <div className="divide-y divide-gray-50">
        {clients.map(c => (
          <div key={c.name} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: c.hue }}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-[10px] text-gray-400">{c.sessions} sesiones · {c.next}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
              ${c.status === "Al día" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
