export interface ProjectData {
  businessName: string;
  description: string;
  sector: string;
  logo: string | null;
  address: string;
  instagram: string;
  facebook: string;
  email: string;
  phone: string;
  contactName: string;
  businessEmail: string;
  businessPhone: string;
  colorScheme: string;
  darkMode: boolean;
  slogan?: string;
  businessHours?: string;
  servicesList?: { name: string; description: string }[];
  photos?: string[];
}

export const COLOR_SCHEMES = [
  { name: "Coral", primary: "#FF6B4A", secondary: "#FFF0ED" },
  { name: "Azul", primary: "#3B82F6", secondary: "#EFF6FF" },
  { name: "Verde", primary: "#10B981", secondary: "#ECFDF5" },
  { name: "Violeta", primary: "#8B5CF6", secondary: "#F5F3FF" },
  { name: "Rosa", primary: "#EC4899", secondary: "#FDF2F8" },
  { name: "Ámbar", primary: "#F59E0B", secondary: "#FFFBEB" },
] as const;
