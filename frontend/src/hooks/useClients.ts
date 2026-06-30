import { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";

export interface Client {
  id: number;
  uuid?: string;
  name: string;
  email: string;
  phone: string;
  lastAppointment: string;
  status: string;
  appointments: number;
}


export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchClients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Client[] = data.map((item: any) => ({
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            email: item.email,
            phone: item.phone,
            lastAppointment: item.lastAppointment || "N/A",
            status: item.status || "Activo",
            appointments: item.appointments || 0,
          }));
          setClients(mapped);
        } else {
          setClients([]);
        }
      } else {
        setClients([]);
      }
    } catch (e) {
      console.warn("Failed to fetch clients from API:", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<Client, "id" | "lastAppointment" | "appointments">) => {
    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newClient),
        });
        if (response.ok) {
          await fetchClients();
          return;
        }
      }
    } catch (e) {
      console.error("API error adding client:", e);
    }
    
    // Local fallback update
    const id = clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
    const clientToAdd: Client = {
      ...newClient,
      id,
      lastAppointment: "Hoy",
      status: "Nuevo",
      appointments: 1,
    };
    setClients([...clients, clientToAdd]);
  };

  const updateClient = async (id: number, updatedData: Partial<Client>) => {
    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        });
        if (response.ok) {
          await fetchClients();
          return;
        }
      }
    } catch (e) {
      console.error("API error updating client:", e);
    }

    // Local fallback update
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteClient = async (id: number) => {
    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          await fetchClients();
          return;
        }
      }
    } catch (e) {
      console.error("API error deleting client:", e);
    }

    // Local fallback delete
    setClients(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  return { clients, loading, addClient, updateClient, deleteClient, refresh: fetchClients };
}

