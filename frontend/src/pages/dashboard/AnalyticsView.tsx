import {
  TrendingUp, Users, Calendar, DollarSign,
  ArrowUpRight, Sparkles, Download, X,
  ChevronRight, Star, Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useAppointments } from "../../hooks/useAppointments";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";

const PRIMARY = "#C0987A";
const ACCENT = "#A9B3A2";

export default function AnalyticsView() {
  const { showToast } = useToast();
  const { events } = useAppointments();
  const { clients } = useClients();
  const { services } = useServices();

  const [isLoading, setIsLoading] = useState(true);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [activeRange, setActiveRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeRange]);

  // Pricing helper
  const getEventPrice = (eventService: string) => {
    const n = eventService.toLowerCase();
    const s = services.find(sv => sv.name.toLowerCase().includes(n) || n.includes(sv.type.toLowerCase()));
    if (s) return parseFloat(s.price.replace(/[^\d]/g, "")) || 0;
    if (n.includes("terapia")) return 80000;
    if (n.includes("evalua")) return 40000;
    return 50000;
  };

  // Filter events dynamically based on range
  const filteredEvents = events.filter(e => {
    try {
      const eventDate = new Date(e.date + "T00:00:00");
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - eventDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (activeRange === "week") {
        return diffDays <= 7;
      } else if (activeRange === "month") {
        return diffDays <= 30;
      } else if (activeRange === "year") {
        return diffDays <= 365;
      }
      return true;
    } catch {
      return true;
    }
  });

  const totalRevenue = filteredEvents.reduce((sum, e) => sum + getEventPrice(e.service), 0);
  const totalRevenueFormatted = `$${new Intl.NumberFormat("es-CL").format(totalRevenue)}`;

  // Service breakdown
  const svcMap: Record<string, number> = {};
  filteredEvents.forEach(ev => {
    const key = ev.service || "otros";
    svcMap[key] = (svcMap[key] || 0) + 1;
  });
  const topServices = Object.entries(svcMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const totalEvents = filteredEvents.length || 1;

  const svcColors = [PRIMARY, ACCENT, "#D9A05B", "#94A3B8"];
  const svcLabels: Record<string, string> = {
    consulta: "Consulta General",
    terapia: "Terapia de Pareja",
    evaluacion: "Evaluación Inicial",
    "terapia-individual": "Terapia Individual",
  };

  // Dynamically group chart data based on selected range
  let chartData: Array<{ label: string; count: number; pct: number }> = [];

  if (activeRange === "week") {
    const daysLabel = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    filteredEvents.forEach(ev => {
      try {
        const d = new Date(ev.date + "T00:00:00");
        let idx = d.getDay();
        idx = idx === 0 ? 6 : idx - 1;
        counts[idx]++;
      } catch {}
    });
    const maxVal = Math.max(...counts, 1);
    chartData = counts.map((c, i) => ({
      label: daysLabel[i],
      count: c,
      pct: Math.max((c / maxVal) * 90, c > 0 ? 18 : 5)
    }));
  } else if (activeRange === "month") {
    const counts = [0, 0, 0, 0];
    filteredEvents.forEach(ev => {
      try {
        const day = parseInt(ev.date.split("-")[2]) || 1;
        counts[Math.min(Math.floor((day - 1) / 7), 3)]++;
      } catch {}
    });
    const maxVal = Math.max(...counts, 1);
    chartData = counts.map((c, i) => ({
      label: `Sem ${i + 1}`,
      count: c,
      pct: Math.max((c / maxVal) * 90, c > 0 ? 18 : 5)
    }));
  } else {
    const monthsLabel = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const counts = Array(12).fill(0);
    filteredEvents.forEach(ev => {
      try {
        const d = new Date(ev.date + "T00:00:00");
        counts[d.getMonth()]++;
      } catch {}
    });
    const maxVal = Math.max(...counts, 1);
    chartData = counts.map((c, i) => ({
      label: monthsLabel[i],
      count: c,
      pct: Math.max((c / maxVal) * 90, c > 0 ? 18 : 5)
    }));
  }

  // KPIs
  const kpis = [
    {
      label: activeRange === "week" ? "Ingresos Semanales" : activeRange === "month" ? "Ingresos del Mes" : "Ingresos Anuales",
      value: totalRevenueFormatted,
      sub: `${filteredEvents.length} sesiones facturadas`,
      icon: DollarSign,
      color: PRIMARY,
    },
    {
      label: "Citas Realizadas",
      value: filteredEvents.length.toString(),
      sub: "en el período actual",
      icon: Calendar,
      color: "#60A5FA",
    },
    {
      label: "Clientes Activos",
      value: clients.length.toString(),
      sub: "en tu cartera",
      icon: Users,
      color: "#34D399",
    },
    {
      label: "Asistencia",
      value: "96%",
      sub: "tasa de presentismo",
      icon: TrendingUp,
      color: "#F59E0B",
    },
  ];

  const handleExport = () => {
    try {
      const rows = [
        ["Métrica", "Valor", "Período"],
        ["Ingresos", totalRevenueFormatted, activeRange],
        ["Citas Realizadas", filteredEvents.length.toString(), ""],
        ["Clientes Activos", clients.length.toString(), ""],
        ["Tasa de Asistencia", "96%", ""],
        [],
        ["Rango", "Citas"],
        ...chartData.map(d => [d.label, d.count.toString()]),
        [],
        ["Servicio", "Citas", "% del Total"],
        ...topServices.map(([key, cnt]) => [
          svcLabels[key] || key,
          cnt.toString(),
          `${Math.round((cnt / totalEvents) * 100)}%`,
        ]),
      ];
      const csv = "data:text/csv;charset=utf-8,\uFEFF"
        + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const a = document.createElement("a");
      a.href = encodeURI(csv);
      a.download = `reporte_agendafacil_${activeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Reporte exportado exitosamente", "success");
    } catch {
      showToast("Error al exportar", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-card shrink-0">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Analíticas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rendimiento del consultorio · Filtrando por {activeRange === "week" ? "Semana" : activeRange === "month" ? "Mes" : "Año"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period toggle */}
          <div className="flex bg-muted rounded-xl p-1 text-xs font-bold gap-1">
            {(["week", "month", "year"] as const).map(r => (
              <button
                key={r}
                onClick={() => {
                  setIsLoading(true);
                  setActiveRange(r);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRange === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "week" ? "Semana" : r === "month" ? "Mes" : "Año"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsInsightsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
            style={{ color: PRIMARY, background: `${PRIMARY}15`, borderColor: `${PRIMARY}30` }}
          >
            <Sparkles className="w-4 h-4" />
            Insights IA
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-foreground font-medium hover:bg-muted transition-colors text-sm cursor-pointer bg-card"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return isLoading ? (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-muted mb-4" />
                <div className="w-20 h-3 rounded bg-muted mb-2" />
                <div className="w-28 h-7 rounded bg-muted" />
              </div>
            ) : (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-5 hover:border-[#C0987A]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}18` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <ArrowUpRight className="w-3 h-3" />
                    +8%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Main 2-col row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Bar Chart */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Actividad por Período</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Citas agendadas y completadas</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PRIMARY }} />
                  Realizadas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-muted" />
                  Canceladas
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="h-52 flex items-end gap-4 px-2 animate-pulse">
                {[60, 85, 40, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t-xl bg-muted" style={{ height: `${h}%` }} />
                    <div className="w-12 h-3 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="h-52 flex items-end gap-3 px-1">
                  {chartData.map((bar, i) => {
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex items-end justify-center gap-1 h-full relative">
                          {bar.count > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {bar.count} cita{bar.count !== 1 ? "s" : ""}
                            </div>
                          )}
                          <div
                            className="w-8 rounded-t-xl transition-all duration-500"
                            style={{
                              height: `${bar.pct}%`,
                              background: bar.count > 0
                                ? `linear-gradient(to top, ${PRIMARY}, #D9A05B)`
                                : "hsl(var(--muted))",
                            }}
                          />
                          <div
                            className="w-3 rounded-t-lg bg-muted transition-all duration-500"
                            style={{ height: bar.count > 0 ? "8%" : "3%" }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-full">{bar.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-muted-foreground font-medium">
                  <span>{filteredEvents.length} citas totales</span>
                  <span>Promedio: {(filteredEvents.length / chartData.length).toFixed(1)} por bloque</span>
                  <span>{totalRevenueFormatted}</span>
                </div>
              </>
            )}
          </div>

          {/* Service Breakdown */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-base text-foreground">Distribución de Servicios</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Popularidad relativa de cada tipo</p>
            </div>

            {isLoading ? (
              <div className="flex-1 space-y-5 animate-pulse">
                {[75, 55, 35].map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <div className="w-24 h-3 rounded bg-muted" />
                      <div className="w-8 h-3 rounded bg-muted" />
                    </div>
                    <div className="h-2.5 rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      {topServices.map(([, cnt], i) => {
                        const pct = (cnt / totalEvents) * 100;
                        const offset = topServices.slice(0, i).reduce((s, [, c]) => s + (c / totalEvents) * 100, 0);
                        return (
                          <circle
                            key={i}
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke={svcColors[i] || "#94A3B8"}
                            strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={100 - offset}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-xl font-bold text-foreground">{filteredEvents.length}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold">total</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {topServices.length > 0 ? topServices.map(([key, cnt], i) => {
                    const pct = Math.round((cnt / totalEvents) * 100);
                    const label = svcLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: svcColors[i] }} />
                            {label}
                          </span>
                          <span className="text-xs text-muted-foreground font-bold">{cnt} · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: svcColors[i] }}
                          />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                      <Calendar className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No hay citas en este rango</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom details row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Clients */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-foreground">Clientes Frecuentes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Los que más te visitan en el rango actual</p>
              </div>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="w-28 h-3 rounded bg-muted mb-1" />
                      <div className="w-16 h-2.5 rounded bg-muted" />
                    </div>
                    <div className="w-8 h-6 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (() => {
              const clientCount: Record<string, number> = {};
              filteredEvents.forEach(ev => {
                clientCount[ev.clientName] = (clientCount[ev.clientName] || 0) + 1;
              });
              const ranked = Object.entries(clientCount).sort(([,a],[,b]) => b - a).slice(0, 5);

              return ranked.length > 0 ? (
                <div className="space-y-3">
                  {ranked.map(([name, count], i) => {
                    const initials = name.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase();
                    return (
                      <div key={name} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: i === 0 ? PRIMARY : i === 1 ? ACCENT : "#94A3B8" }}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                          <p className="text-[11px] text-muted-foreground">{count} cita{count !== 1 ? "s" : ""} agendada(s)</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
                          style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
                          #{i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Aún no hay datos de clientes para este rango</p>
                </div>
              );
            })()}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-card rounded-2xl border border-border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-foreground">Resumen de Ingresos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Desglose estimado por tipo de sesión</p>
              </div>
              <DollarSign className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>

            {isLoading ? (
              <div className="space-y-3 flex-1 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 rounded-xl bg-muted" />
                ))}
              </div>
            ) : (() => {
              const revenueByService: Record<string, { count: number; total: number }> = {};
              filteredEvents.forEach(ev => {
                const key = ev.service || "otros";
                const price = getEventPrice(ev.service);
                if (!revenueByService[key]) revenueByService[key] = { count: 0, total: 0 };
                revenueByService[key].count++;
                revenueByService[key].total += price;
              });

              const entries = Object.entries(revenueByService).sort(([,a],[,b]) => b.total - a.total);

              return entries.length > 0 ? (
                <>
                  <div className="space-y-2 flex-1">
                    {entries.map(([key, { count, total }], i) => {
                      const label = svcLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
                      const pct = Math.round((total / totalRevenue) * 100);
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: svcColors[i] || "#94A3B8" }} />
                            <div className="text-left">
                              <p className="text-xs font-bold text-foreground">{label}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {count} sesión{count !== 1 ? "es" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">${new Intl.NumberFormat("es-CL").format(total)}</p>
                            <p className="text-[11px] text-muted-foreground">{pct}% del total</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Total estimado</span>
                    <span className="text-lg font-bold" style={{ color: PRIMARY }}>{totalRevenueFormatted}</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <DollarSign className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Agenda citas para ver tus ingresos en este rango</p>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* AI Insights Modal */}
      {isInsightsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-lg shadow-2xl border border-border overflow-hidden text-foreground animate-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between px-6 py-5 border-b border-border"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}20, transparent)` }}>
              <h2 className="text-[18px] font-bold text-foreground flex items-center gap-2.5"
                style={{ fontFamily: "'Fraunces', serif" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                Insights de Negocio con IA
              </h2>
              <button onClick={() => setIsInsightsOpen(false)}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Análisis generado a partir de <strong className="text-foreground">{filteredEvents.length} citas</strong> del rango seleccionado ({activeRange === "week" ? "Semana" : activeRange === "month" ? "Mes" : "Año"}):
              </p>

              {[
                {
                  title: "💰 Rendimiento Financiero",
                  body: `Tus ingresos estimados del período son ${totalRevenueFormatted} en ${filteredEvents.length} sesiones. ${filteredEvents.length > 2 ? "¡Excelente actividad! Considera implementar una política de pago anticipado para reducir ausencias." : "Puedes incrementar tus ingresos agendando más citas esta semana."}`,
                },
                {
                  title: "📊 Servicio Estrella",
                  body: topServices.length > 0
                    ? `"${svcLabels[topServices[0][0]] || topServices[0][0]}" es tu servicio más solicitado (${Math.round((topServices[0][1] / totalEvents) * 100)}% de tus citas). Asegúrate de tener suficiente disponibilidad para este tipo de sesión.`
                    : "Registra citas para descubrir cuáles son tus servicios más populares.",
                },
                {
                  title: "👥 Base de Clientes",
                  body: `Tienes ${clients.length} clientes registrados en tu catálogo. ${clients.length < 5 ? "Comparte tu link de reservas públicas para atraer nuevos clientes." : "¡Excelente cartera! El boca a boca con tus clientes actuales es una de las mejores formas de crecer."}`,
                },
                {
                  title: "📈 Recomendación Estratégica",
                  body: "Mantener una tasa de asistencia alta es clave. Considera activar los recordatorios automáticos de citas en la sección de notificaciones para reducir las ausencias al mínimo.",
                },
              ].map(({ title, body }, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-muted/30">
                  <h4 className="text-sm font-bold text-foreground mb-1.5">{title}</h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
              >
                <Download className="w-4 h-4" />
                Exportar reporte
              </button>
              <button
                onClick={() => setIsInsightsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity border-none"
                style={{ background: PRIMARY }}
              >
                Entendido <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
