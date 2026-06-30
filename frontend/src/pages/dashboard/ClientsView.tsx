import { Search, Filter, MoreVertical, Mail, Calendar, Clock, Phone, Users, FileText, Paperclip, Bold, Italic, List, Sparkles, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useToast } from "../../contexts/ToastContext";
import { useClients, Client } from "../../hooks/useClients";
import { useClientNotes } from "../../hooks/useClientNotes";
import { useClientAttachments } from "../../hooks/useClientAttachments";
import CreateClientModal from "../../components/dashboard/CreateClientModal";
import { useAuth } from "../../contexts/AuthContext";

const PRIMARY = "#C0987A";

export default function ClientsView() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"citas" | "notas" | "archivos">("citas");
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Clinical Notes hook – loads notes for the selected client
  const selectedUuid = selectedClient?.uuid;
  const { notes, saving, fetchNotes, saveNote } = useClientNotes(selectedUuid);

  // Attachments hook – loads files for the selected client
  const { attachments, uploading, fetchAttachments, uploadFile, formatSize } = useClientAttachments(selectedUuid);

  // Note editor state
  const [noteContent, setNoteContent] = useState("");

  // Auto-select client based on URL query parameter
  useEffect(() => {
    const selectId = searchParams.get("select");
    if (selectId && clients.length > 0) {
      const clientToSelect = clients.find(c => c.id.toString() === selectId);
      if (clientToSelect) {
        setSelectedClient(clientToSelect);
      }
    }
  }, [searchParams, clients]);

  // When a client is selected, load their notes and attachments
  useEffect(() => {
    if (selectedClient?.uuid) {
      fetchNotes();
      fetchAttachments();
      setNoteContent(""); // Reset editor
    }
  }, [selectedClient?.uuid]);

  // Toggle para probar la vista vacía vs llena
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedClient?.uuid) {
      const result = await uploadFile(file);
      if (result) {
        showToast(`Archivo "${file.name}" guardado exitosamente`, "success");
      } else {
        showToast("Error al subir el archivo", "error");
      }
      // Reset file input
      e.target.value = "";
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    const saved = await saveNote(noteContent);
    if (saved) {
      showToast("Nota guardada exitosamente", "success");
      setNoteContent("");
    } else {
      showToast("Error al guardar la nota", "error");
    }
  };

  const activeClients = showEmptyState ? [] : clients;
  const filteredClients = activeClients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddClient = (clientData: { name: string; email: string; phone: string }) => {
    addClient(clientData);
    showToast("Cliente agregado con éxito", "success");
  };

  const handleSaveEditedClient = async (editedData: { name: string; email: string; phone: string }) => {
    if (clientToEdit) {
      await updateClient(clientToEdit.id, editedData);
      showToast("Cliente actualizado con éxito", "success");
      // Update local selected client detail display
      if (selectedClient && selectedClient.id === clientToEdit.id) {
        setSelectedClient({
          ...selectedClient,
          ...editedData
        });
      }
      setClientToEdit(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-in fade-in duration-300">

      {/* Header */}
      <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Mis Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu cartera de pacientes y su historial.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Botón de QA oculto para probar */}
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 underline"
          >
            Ver estado {showEmptyState ? 'con datos' : 'vacío'}
          </button>
          <button 
            onClick={() => setClientModalOpen(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-white shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer" 
            style={{ background: PRIMARY }}
          >
            Añadir Cliente
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-6">

        {/* Clients List Area */}
        <div className={`flex-1 flex flex-col bg-card rounded-3xl border border-border shadow-sm overflow-hidden ${selectedClient ? 'hidden md:flex' : 'flex'}`}>

          {/* Toolbar */}
          <div className="p-4 border-b border-border flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent focus:border-primary focus:bg-card rounded-xl outline-none text-sm transition-all text-foreground"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-border rounded-xl hover:bg-muted text-foreground transition-colors flex items-center gap-2 px-3">
              <Filter className="w-4 h-4" /> <span className="text-sm font-medium hidden sm:inline">Filtrar</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground font-semibold sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Contacto</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Última cita</th>
                  <th className="px-6 py-4 font-medium">Estatus</th>
                  <th className="px-6 py-4 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map(client => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`hover:bg-muted/50 cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-muted/80' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-foreground">
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{client.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="text-foreground">{client.email}</div>
                      <div className="text-xs text-muted-foreground">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                      {client.lastAppointment}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${client.status === 'Activo' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        client.status === 'Inactivo' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedClient?.id === client.id) {
                              setSelectedClient(null); // Toggle if already open
                            } else {
                              setSelectedClient(client);
                            }
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors shadow-sm bg-background border border-border"
                          title="Ver Paciente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredClients.length === 0 && !showEmptyState && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron clientes con ese nombre.
              </div>
            )}

            {/* Empty State */}
            {showEmptyState && (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-primary mb-6 shadow-sm">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Aún no tienes clientes
                </h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm">
                  Comparte tu enlace de reserva en tus redes sociales o WhatsApp para conseguir tu primera cita de forma automática.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/book/${user?.usernameSlug || "valentina-rojas"}`);
                    showToast("Enlace de reserva copiado al portapapeles");
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2" style={{ background: PRIMARY }}
                >
                  <Calendar className="w-4 h-4" /> Copiar enlace de reserva
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Client Detail Sidebar */}
        {/* Client Detail Sidebar */}
        {selectedClient && (
          <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 bg-card rounded-3xl border border-border shadow-sm flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-6 border-b border-border flex flex-col items-center text-center relative">
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-foreground md:hidden"
              >
                Cerrar
              </button>

              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center font-bold text-2xl text-foreground mb-4 mt-2">
                {selectedClient.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>{selectedClient.name}</h2>

              <div className="flex gap-2 mt-6 w-full">
                <button className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Llamar
                </button>
              </div>
              <div className="flex gap-2 mt-2 w-full">
                <button 
                  onClick={() => setClientToEdit(selectedClient)}
                  className="flex-1 py-2 px-4 bg-[#C0987A]/10 hover:bg-[#C0987A]/20 text-[#C0987A] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${selectedClient.name}?`)) {
                      await deleteClient(selectedClient.id);
                      setSelectedClient(null);
                      showToast("Cliente eliminado", "success");
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>


            {/* Tabs */}
            <div className="flex border-b border-border px-6 pt-4">
              <button
                onClick={() => setActiveTab('citas')}
                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'citas' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Calendar className="w-4 h-4" /> Citas
              </button>
              <button
                onClick={() => setActiveTab('notas')}
                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notas' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <FileText className="w-4 h-4" /> Notas Clínicas
              </button>
              <button
                onClick={() => setActiveTab('archivos')}
                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'archivos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Paperclip className="w-4 h-4" /> Archivos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-card">

              {activeTab === 'citas' && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Últimas Citas</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3 border border-border rounded-xl p-3 bg-muted/20">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">Terapia Individual</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {selectedClient.lastAppointment}</div>
                        </div>
                      </div>
                      {selectedClient.appointments > 1 && (
                        <div className="flex gap-3 border border-border rounded-xl p-3 opacity-60">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">Consulta de Diagnóstico</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> 10 May 2026</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notas' && (
                <div className="h-full flex flex-col gap-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notas de Evolución</h3>
                    <button
                      onClick={() => showToast("La IA está resumiendo el historial del paciente...")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C0987A]/10 text-[#C0987A] text-xs font-bold hover:bg-[#C0987A]/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Resumir con IA
                    </button>
                  </div>

                  {/* Previous notes history */}
                  {notes.length > 0 && (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {notes.map((note) => (
                        <div key={note.id} className="border border-border rounded-xl p-3 bg-muted/20">
                          <p className="text-xs text-foreground whitespace-pre-wrap line-clamp-3">{note.contentMarkdown}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(note.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {note.isAiAssisted && <span className="ml-2 text-[#C0987A]">✦ IA</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New note editor */}
                  <div className="flex-1 border border-border rounded-xl bg-background flex flex-col overflow-hidden min-h-[150px]">
                    <div className="flex border-b border-border bg-muted/50 p-2 gap-1">
                      <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Bold className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Italic className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><List className="w-4 h-4" /></button>
                    </div>
                    <textarea
                      className="flex-1 w-full p-4 bg-transparent outline-none text-sm text-foreground resize-none"
                      placeholder="Escribe tus observaciones clínicas aquí..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={saving || !noteContent.trim()}
                      className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-sm font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Guardando..." : "Guardar Nota"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'archivos' && (
                <div className="animate-in fade-in py-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <h4 className="font-bold text-foreground text-sm">Archivos del Paciente</h4>
                    <button
                      onClick={() => document.getElementById("client-file-input")?.click()}
                      disabled={uploading}
                      className="text-primary text-xs font-bold hover:underline cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
                    >
                      {uploading ? "Subiendo..." : "+ Subir Archivo"}
                    </button>
                  </div>

                  {attachments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mx-auto mb-4">
                        <Paperclip className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-foreground mb-1">Sin archivos adjuntos</h4>
                      <p className="text-sm text-muted-foreground mb-4">Sube exámenes, consentimientos o imágenes de este paciente.</p>
                      <button
                        onClick={() => document.getElementById("client-file-input")?.click()}
                        className="text-primary text-sm font-bold hover:underline cursor-pointer bg-transparent border-none outline-none"
                      >
                        Subir Archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-4 h-4 text-[#C0987A]" />
                            <div className="text-left">
                              <div className="text-xs font-bold text-foreground truncate max-w-[160px]">{file.originalFilename}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {new Date(file.uploadedAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{formatSize(file.fileSizeBytes)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} onSave={handleAddClient} />
      <CreateClientModal 
        isOpen={clientToEdit !== null} 
        onClose={() => setClientToEdit(null)} 
        onSave={handleSaveEditedClient} 
        client={clientToEdit} 
      />
      <input
        type="file"
        id="client-file-input"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
    </div>
  );
}
