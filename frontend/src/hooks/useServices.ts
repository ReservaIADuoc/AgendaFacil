import { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";
import { Video, Building, Activity } from "lucide-react";

export interface Service {
  id: number;
  uuid?: string;
  name: string;
  duration: string;
  durationMinutes: number;
  price: string;
  type: string;
  status: string;
  icon: any;
}


export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchServices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Service[] = data.map((item: any) => {
            let icon = Video;
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes("pareja") || nameLower.includes("presencial")) {
              icon = Building;
            } else if (nameLower.includes("inicial") || nameLower.includes("evalu")) {
              icon = Activity;
            }
            return {
              id: item.id,
              uuid: item.uuid,
              name: item.name,
              duration: `${item.durationMinutes} min`,
              durationMinutes: item.durationMinutes || 60,
              price: `$${new Intl.NumberFormat("es-CL").format(item.price)}`,
              type: item.modality || (nameLower.includes("pareja") ? "presencial" : "video"),
              status: item.active !== false ? "active" : "inactive",
              icon,
            };
          });
          setServices(mapped);
        } else {
          setServices([]);
        }
      } else {
        setServices([]);
      }
    } catch (e) {
      console.warn("Failed to fetch services from API:", e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    const svc = services.find(s => s.id === id);
    if (!svc) return;

    const newStatus = svc.status === 'active' ? 'inactive' : 'active';
    const isActive = newStatus === 'active';

    // Optimistic update
    setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));

    try {
      if (token) {
        const cleanPrice = parseFloat(svc.price.replace(/[^\d]/g, "")) || 0;
        const durationMinutes = parseInt(svc.duration) || 60;

        const urlId = svc.uuid || id;
        await fetch(`${API_BASE_URL}/services/${urlId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: svc.name,
            durationMinutes,
            price: cleanPrice,
            active: isActive,
          }),
        });
      }
    } catch (e) {
      console.error("Failed to update status in backend", e);
      // Revert if error
      setServices(services.map(s => s.id === id ? { ...s, status: svc.status } : s));
    }
  };

  const addService = async (newService: { name: string; duration: string; price: string; type: string }) => {
    try {
      if (token) {
        const durationMinutes = parseInt(newService.duration) || 60;
        const cleanPrice = parseFloat(newService.price.replace(/[^\d]/g, "")) || 0;

        const response = await fetch(`${API_BASE_URL}/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newService.name,
            durationMinutes,
            price: cleanPrice,
            description: `Servicio de tipo ${newService.type}`,
            modality: newService.type,
          }),
        });

        if (response.ok) {
          await fetchServices();
          return;
        }
      }
    } catch (e) {
      console.error("API error adding service:", e);
    }

    // Local fallback update
    const id = services.length + 1;
    let icon = Video;
    if (newService.type === "presencial") icon = Building;
    
    const serviceObj: Service = {
      id,
      name: newService.name,
      duration: newService.duration.includes("min") ? newService.duration : `${newService.duration} min`,
      durationMinutes: parseInt(newService.duration) || 60,
      price: newService.price.startsWith("$") ? newService.price : `$${new Intl.NumberFormat("es-CL").format(parseFloat(newService.price) || 0)}`,
      type: newService.type,
      status: "active",
      icon,
    };
    setServices([...services, serviceObj]);
  };

  const updateService = async (serviceData: { id: number; uuid?: string; name: string; duration: string; price: string; type: string }) => {
    try {
      if (token) {
        const durationMinutes = parseInt(serviceData.duration) || 60;
        const cleanPrice = parseFloat(serviceData.price.replace(/[^\d]/g, "")) || 0;
        const urlId = serviceData.uuid || serviceData.id;

        const response = await fetch(`${API_BASE_URL}/services/${urlId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: serviceData.name,
            durationMinutes,
            price: cleanPrice,
            description: `Servicio de tipo ${serviceData.type}`,
            modality: serviceData.type,
          }),
        });

        if (response.ok) {
          await fetchServices();
          return;
        }
      }
    } catch (e) {
      console.error("API error updating service:", e);
    }

    // Local fallback update
    setServices(prev => prev.map(s => s.id === serviceData.id ? {
      ...s,
      name: serviceData.name,
      duration: serviceData.duration.includes("min") ? serviceData.duration : `${serviceData.duration} min`,
      price: serviceData.price.startsWith("$") ? serviceData.price : `$${new Intl.NumberFormat("es-CL").format(parseFloat(serviceData.price) || 0)}`,
      type: serviceData.type
    } : s));
  };

  const deleteService = async (id: number, uuid?: string) => {
    try {
      if (token) {
        const urlId = uuid || id;
        const response = await fetch(`${API_BASE_URL}/services/${urlId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          await fetchServices();
          return;
        }
      }
    } catch (e) {
      console.error("API error deleting service:", e);
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  return { services, loading, toggleStatus, addService, updateService, deleteService, refresh: fetchServices };
}
