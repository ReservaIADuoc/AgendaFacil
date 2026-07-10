import { BookingMockup, ReminderMockup, ClientMockup } from "./LandingMockups";

export const professionals = [
  "Psicólogos", "Coaches", "Abogados", "Nutricionistas",
  "Fisioterapeutas", "Médicos", "Entrenadores", "Consultores",
];

export const features = [
  {
    tag: "Reservas online",
    title: "Tu cliente reserva solo. Tú descansas.",
    body: "Activa tu agenda online y recibe citas las 24 horas, los 7 días de la semana. Sin llamadas, sin WhatsApps a medianoche, sin huecos sin llenar.",
    visual: <BookingMockup />,
    reverse: false,
  },
  {
    tag: "Recordatorios automáticos",
    title: "Reduce las ausencias un 80%.",
    body: "Enviamos recordatorios automáticos por WhatsApp, email y SMS antes de cada cita. Tus clientes llegan, y tú cobras.",
    visual: <ReminderMockup />,
    reverse: true,
  },
  {
    tag: "Gestión de clientes",
    title: "Todo sobre tu cliente, en un solo lugar.",
    body: "Historial de citas, notas de sesión, pagos pendientes y datos de contacto. Nunca más buscar entre conversaciones de WhatsApp.",
    visual: <ClientMockup />,
    reverse: false,
  },
];

export const testimonials = [
  {
    name: "Valentina Rojas",
    role: "Psicóloga clínica · Santiago",
    text: "Antes perdía 2 horas al día gestionando la agenda por WhatsApp. Ahora mis clientes reservan solos y yo me enfoco en lo que importa: la terapia.",
    rating: 5,
    initials: "VR",
    hue: "var(--theme-primary, #C0987A)",
  },
  {
    name: "Matías Fuentes",
    role: "Coach de vida · Bogotá",
    text: "El sistema de recordatorios es increíble. Bajé mis cancelaciones de último momento de un 40% a casi cero. Mi agenda ahora está siempre llena.",
    rating: 5,
    initials: "MF",
    hue: "#A9B3A2",
  },
  {
    name: "Andrea Castillo",
    role: "Nutricionista · Buenos Aires",
    text: "Lo que más me gusta es que parece profesional. Mis clientes dicen que les da confianza ver una agenda tan ordenada. Eso tiene valor.",
    rating: 5,
    initials: "AC",
    hue: "#D9A05B",
  },
];

export const plans = [
  {
    name: "Básico",
    price: "0",
    period: "Para siempre",
    desc: "Para empezar sin riesgo.",
    cta: "Empezar gratis",
    primary: false,
    features: [
      "Hasta 30 citas al mes",
      "Agenda online personalizada",
      "Recordatorios por email",
      "1 servicio",
    ],
  },
  {
    name: "Profesional",
    price: "19",
    period: "por mes",
    desc: "El favorito de los independientes.",
    cta: "Probar 14 días gratis",
    primary: true,
    badge: "Más popular",
    features: [
      "Citas ilimitadas",
      "Recordatorios por WhatsApp + SMS",
      "Pagos online integrados",
      "Hasta 5 servicios",
      "Estadísticas y reportes",
      "Soporte prioritario",
    ],
  },
  {
    name: "Estudio",
    price: "39",
    period: "por mes",
    desc: "Para equipos y consultorios.",
    cta: "Hablar con ventas",
    primary: false,
    features: [
      "Todo lo de Profesional",
      "Hasta 5 profesionales",
      "Agenda multiprofesional",
      "Panel de administración",
      "API e integraciones",
      "Soporte 24/7",
    ],
  },
];
