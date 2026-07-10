import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";

export function useGoogleCalendar() {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("google_calendar_token");
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("google_calendar_token", accessToken);
    } else {
      localStorage.removeItem("google_calendar_token");
    }
  }, [accessToken]);

  const connect = (token: string) => {
    setAccessToken(token);
    showToast("Google Calendar conectado con éxito", "success");
  };

  const disconnect = () => {
    setAccessToken(null);
    showToast("Google Calendar desconectado", "success");
  };

  const isConnected = !!accessToken;

  // Format date and time to ISO strings required by Google Calendar API
  const createEvent = async (eventDetails: {
    summary: string;
    description: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    durationMinutes: number;
    clientEmail?: string;
  }) => {
    if (!accessToken) {
      console.warn("Intento de crear evento sin conexión simulada");
      return false;
    }

    try {
      // Simular tiempo de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("SIMULACIÓN: Evento creado en Google Calendar", eventDetails);
      return true;
    } catch (error) {
      console.error("SIMULACIÓN: Error al sincronizar con Google Calendar", error);
      return false;
    }
  };

  return {
    isConnected,
    connect,
    disconnect,
    createEvent
  };
}
