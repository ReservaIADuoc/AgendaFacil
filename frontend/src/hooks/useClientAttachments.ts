import { useState, useCallback } from "react";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";

export interface ClientAttachment {
  id: string;
  clientId: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export function useClientAttachments(clientUuid: string | undefined) {
  const { token } = useAuth();
  const [attachments, setAttachments] = useState<ClientAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!clientUuid || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientUuid}/attachments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAttachments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Error fetching attachments:", e);
    } finally {
      setLoading(false);
    }
  }, [clientUuid, token]);

  const uploadFile = async (file: File): Promise<ClientAttachment | null> => {
    if (!clientUuid || !token) return null;
    setUploading(true);
    try {
      // Read file as Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URI prefix (e.g. "data:application/pdf;base64,")
          resolve(result.split(",")[1] || result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE_URL}/clients/${clientUuid}/attachments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          contentBase64: base64,
        }),
      });

      if (res.ok) {
        const saved: ClientAttachment = await res.json();
        setAttachments((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (e) {
      console.error("Error uploading attachment:", e);
    } finally {
      setUploading(false);
    }
    return null;
  };

  /** Format file size to human-readable string */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = async (attachmentId: string) => {
    if (!clientUuid || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientUuid}/attachments/${attachmentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // data contains: filename, mimeType, contentBase64
        const link = document.createElement("a");
        link.href = `data:${data.mimeType};base64,${data.contentBase64}`;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Error downloading file:", e);
    }
  };

  return { attachments, loading, uploading, fetchAttachments, uploadFile, downloadFile, formatSize };
}
