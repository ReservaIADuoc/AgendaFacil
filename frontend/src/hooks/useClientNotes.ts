import { useState, useCallback } from "react";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";

export interface ClinicalNote {
  id: string;
  clientId: string;
  contentMarkdown: string;
  isAiAssisted: boolean;
  version: number;
  createdAt: string;
}

export function useClientNotes(clientUuid: string | undefined) {
  const { token } = useAuth();
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!clientUuid || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientUuid}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Error fetching clinical notes:", e);
    } finally {
      setLoading(false);
    }
  }, [clientUuid, token]);

  const saveNote = async (content: string, isAiAssisted = false): Promise<ClinicalNote | null> => {
    if (!clientUuid || !token) return null;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientUuid}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, isAiAssisted }),
      });
      if (res.ok) {
        const saved: ClinicalNote = await res.json();
        setNotes((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (e) {
      console.error("Error saving clinical note:", e);
    } finally {
      setSaving(false);
    }
    return null;
  };

  return { notes, loading, saving, fetchNotes, saveNote };
}
