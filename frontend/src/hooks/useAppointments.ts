import { useState, useEffect, useCallback } from "react";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";
import { format } from "date-fns";

export interface AppointmentEvent {
  id: string;
  clientName: string;
  clientId?: string;
  service: string;
  serviceId?: string;
  serviceColor?: string;
  date: string;
  time: string;
  duration: number;
  status?: string;
}

function mapApiAppointment(item: Record<string, unknown>): AppointmentEvent {
  const startAt = new Date(item.startAt as string);
  const endAt = new Date(item.endAt as string);
  const durationHours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
  return {
    id: String(item.id),
    clientName: (item.clientName as string) || "Cliente",
    clientId: item.clientId ? String(item.clientId) : undefined,
    service: (item.serviceName as string) || "Cita",
    serviceId: item.serviceId ? String(item.serviceId) : undefined,
    serviceColor: item.colorHex as string | undefined,
    date: format(startAt, "yyyy-MM-dd"),
    time: format(startAt, "HH:mm"),
    duration: durationHours > 0 ? durationHours : 1,
    status: item.status as string | undefined,
  };
}

export function useAppointments() {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data.map(mapApiAppointment));
        } else {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.warn("Failed to fetch appointments:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addAppointment = async (newEvent: Omit<AppointmentEvent, "id">) => {
    if (!token || !newEvent.clientId || !newEvent.serviceId) {
      const id = Date.now().toString();
      setEvents((prev) => [...prev, { ...newEvent, id }]);
      return;
    }

    try {
      const start = new Date(`${newEvent.date}T${newEvent.time}:00`);
      const end = new Date(start.getTime() + newEvent.duration * 60 * 60 * 1000);

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: newEvent.clientId,
          serviceId: newEvent.serviceId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          status: "PENDING",
          paymentStatus: "UNPAID",
        }),
      });

      if (response.ok) {
        await fetchAppointments();
        return;
      }
    } catch (e) {
      console.error("API error adding appointment:", e);
    }

    const id = Date.now().toString();
    setEvents((prev) => [...prev, { ...newEvent, id }]);
  };

  const updateAppointment = async (id: string, updatedEvent: Partial<AppointmentEvent>) => {
    if (!token) return;
    try {
      const existing = events.find(e => e.id === id);
      if (!existing) return;

      const dateVal = updatedEvent.date || existing.date;
      const timeVal = updatedEvent.time || existing.time;
      const durationVal = updatedEvent.duration !== undefined ? updatedEvent.duration : existing.duration;

      const start = new Date(`${dateVal}T${timeVal}:00`);
      const end = new Date(start.getTime() + durationVal * 60 * 60 * 1000);

      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          status: updatedEvent.status || existing.status || "CONFIRMED",
        }),
      });

      if (response.ok) {
        await fetchAppointments();
        return;
      }
    } catch (e) {
      console.error("API error updating appointment:", e);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchAppointments();
        return;
      }
    } catch (e) {
      console.error("API error deleting appointment:", e);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleCreated = () => fetchAppointments();
    window.addEventListener("appointment-created", handleCreated);
    return () => window.removeEventListener("appointment-created", handleCreated);
  }, [fetchAppointments]);

  return { events, loading, addAppointment, updateAppointment, deleteAppointment, refresh: fetchAppointments };
}
