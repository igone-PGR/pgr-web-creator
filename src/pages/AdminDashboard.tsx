import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, Search, Eye, Edit, CheckCircle, Loader2, Package, ExternalLink, Image, Trash2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  business_name: string;
  email: string;
  sector: string;
  paid: boolean;
  status: string;
  created_at: string;
  description: string;
  phone: string | null;
  address: string | null;
  slogan: string | null;
  instagram: string | null;
  facebook: string | null;
  color_scheme: string;
  dark_mode: boolean;
  business_hours: string | null;
  services_list: any;
  generated_content: any;
  contact_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  photos: string[] | null;
  logo: string | null;
  vercel_url: string | null;
  language: string;
  preferred_domain: string | null;
  corporate_colors?: string[];
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProjects();
  }, [isAdmin]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("paid", true)
      .order("created_at", { ascending: false });

    if (!error && data) setProjects(data as Project[]);
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      toast({ title: "Proyecto eliminado" });
      fetchProjects();
    } else {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const markAsDelivered = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "delivered" })
      .eq("id", id);

    if (!error) {
      toast({ title: "Proyecto marcado como entregado" });
      fetchProjects();
    }
  };

  const saveEdit = async () => {
    if (!editProject) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        business_name: editProject.business_name,
        description: editProject.description,
        email: editProject.email,
        phone: editProject.phone,
        address: editProject.address,
        slogan: editProject.slogan,
        instagram: editProject.instagram,
        facebook: editProject.facebook,
        business_hours: editProject.business_hours,
      })
      .eq("id", editProject.id);

    setSaving(false);
    if (!error) {
      toast({ title: "Proyecto actualizado" });
      setEditProject(null);
      fetchProjects();
    } else {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.business_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-bold">Panel Admin</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/admin/login"); }}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total pagados</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{projects.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pendientes</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{projects.filter(p => p.status === "pending").length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Entregados</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{projects.filter(p => p.status === "delivered").length}</p></CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Web</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.business_name}</TableCell>
                    <TableCell>{p.contact_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell className="capitalize">{p.sector}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "delivered" ? "default" : "secondary"}>
                        {p.status === "delivered" ? "Entregado" : p.status === "deployed" ? "Desplegado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.vercel_url ? (
                        <a href={p.vercel_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Ver web
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {/* View */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedProject(p)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedProject?.business_name}</DialogTitle>
                          </DialogHeader>
                          {selectedProject && (
                            <div className="space-y-4 text-sm">
                              {/* Basic info */}
                              <div className="grid grid-cols-2 gap-3">
                                <p><strong>Contacto:</strong> {selectedProject.contact_name || "—"}</p>
                                <p><strong>Email:</strong> {selectedProject.email}</p>
                                <p><strong>Teléfono:</strong> {selectedProject.phone || "—"}</p>
                                <p><strong>Email negocio:</strong> {selectedProject.business_email || "—"}</p>
                                <p><strong>Tel. negocio:</strong> {selectedProject.business_phone || "—"}</p>
                                <p><strong>Dirección:</strong> {selectedProject.address || "—"}</p>
                                <p><strong>Sector:</strong> {selectedProject.sector}</p>
                                <p><strong>Slogan:</strong> {selectedProject.slogan || "—"}</p>
                                <p><strong>Horario:</strong> {selectedProject.business_hours || "—"}</p>
                                <p><strong>Instagram:</strong> {selectedProject.instagram || "—"}</p>
                                <p><strong>Facebook:</strong> {selectedProject.facebook || "—"}</p>
                                <p><strong>Idioma:</strong> {selectedProject.language || "es"}</p>
                                <p><strong>Dominio preferido:</strong> {selectedProject.preferred_domain || "—"}</p>
                                <p><strong>Modo oscuro:</strong> {selectedProject.dark_mode ? "Sí" : "No"}</p>
                              </div>

                              <p><strong>Descripción:</strong> {selectedProject.description}</p>

                              {/* Vercel URL */}
                              {selectedProject.vercel_url && (
                                <div className="p-3 rounded-lg bg-muted">
                                  <strong>🌐 URL publicada:</strong>{" "}
                                  <a href={selectedProject.vercel_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                    {selectedProject.vercel_url}
                                  </a>
                                </div>
                              )}

                              {/* Logo */}
                              {selectedProject.logo && (
                                <div>
                                  <strong>Logo:</strong>
                                  <div className="mt-2">
                                    <img src={selectedProject.logo} alt="Logo" className="w-20 h-20 object-contain rounded-lg border" />
                                  </div>
                                </div>
                              )}

                              {/* Photos */}
                              {selectedProject.photos && selectedProject.photos.length > 0 && (
                                <div>
                                  <strong className="flex items-center gap-1"><Image className="w-4 h-4" /> Fotos del cliente ({selectedProject.photos.length}):</strong>
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {selectedProject.photos.map((photo, i) => (
                                      <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                                        <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Services */}
                              {selectedProject.services_list && (
                                <div>
                                  <strong>Servicios:</strong>
                                  {Array.isArray(selectedProject.services_list) && selectedProject.services_list.length > 0 ? (
                                    <ul className="mt-1 space-y-1 list-disc list-inside">
                                      {selectedProject.services_list.map((s: any, i: number) => (
                                        <li key={i}><strong>{s.name}</strong>: {s.description}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-muted-foreground mt-1">Sin servicios</p>
                                  )}
                                </div>
                              )}

                              {/* Generated content summary */}
                              {selectedProject.generated_content && (
                                <div>
                                  <strong>Contenido generado:</strong>
                                  <div className="mt-2 space-y-2 bg-muted p-3 rounded-lg text-xs">
                                    {selectedProject.generated_content.heroHeadline && (
                                      <p><strong>Hero:</strong> {selectedProject.generated_content.heroHeadline}</p>
                                    )}
                                    {selectedProject.generated_content.heroSubtitle && (
                                      <p><strong>Subtítulo:</strong> {selectedProject.generated_content.heroSubtitle}</p>
                                    )}
                                    {selectedProject.generated_content.aboutText && (
                                      <p><strong>About:</strong> {selectedProject.generated_content.aboutText}</p>
                                    )}
                                    {selectedProject.generated_content.services && (
                                      <div>
                                        <strong>Servicios generados:</strong>
                                        <ul className="list-disc list-inside mt-1">
                                          {selectedProject.generated_content.services.map((s: any, i: number) => (
                                            <li key={i}>{s.name}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {selectedProject.generated_content.colors && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <strong>Paleta:</strong>
                                        {Object.entries(selectedProject.generated_content.colors).map(([key, val]) => (
                                          <span key={key} className="inline-flex items-center gap-1">
                                            <span className="w-4 h-4 rounded border inline-block" style={{ backgroundColor: val as string }} />
                                            <span>{key}</span>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Edit */}
                      <Dialog open={editProject?.id === p.id} onOpenChange={(open) => !open && setEditProject(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditProject({ ...p })}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar proyecto</DialogTitle>
                          </DialogHeader>
                          {editProject && (
                            <div className="space-y-3">
                              <div><Label>Nombre</Label><Input value={editProject.business_name} onChange={(e) => setEditProject({ ...editProject, business_name: e.target.value })} /></div>
                              <div><Label>Email</Label><Input value={editProject.email} onChange={(e) => setEditProject({ ...editProject, email: e.target.value })} /></div>
                              <div><Label>Teléfono</Label><Input value={editProject.phone || ""} onChange={(e) => setEditProject({ ...editProject, phone: e.target.value })} /></div>
                              <div><Label>Dirección</Label><Input value={editProject.address || ""} onChange={(e) => setEditProject({ ...editProject, address: e.target.value })} /></div>
                              <div><Label>Slogan</Label><Input value={editProject.slogan || ""} onChange={(e) => setEditProject({ ...editProject, slogan: e.target.value })} /></div>
                              <div><Label>Horario</Label><Input value={editProject.business_hours || ""} onChange={(e) => setEditProject({ ...editProject, business_hours: e.target.value })} /></div>
                              <div><Label>Instagram</Label><Input value={editProject.instagram || ""} onChange={(e) => setEditProject({ ...editProject, instagram: e.target.value })} /></div>
                              <div><Label>Facebook</Label><Input value={editProject.facebook || ""} onChange={(e) => setEditProject({ ...editProject, facebook: e.target.value })} /></div>
                              <div><Label>Descripción</Label><Textarea value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} /></div>
                              <Button onClick={saveEdit} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Guardar cambios
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Mark delivered */}
                      {p.status !== "delivered" && (
                        <Button variant="ghost" size="icon" onClick={() => markAsDelivered(p.id)} title="Marcar como entregado">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Eliminar proyecto">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará permanentemente «{p.business_name}». Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProject(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
