import hosteleriaImg from "@/assets/sectors/hosteleria.jpg";
import esteticaImg from "@/assets/sectors/estetica.jpg";
import restauracionImg from "@/assets/sectors/restauracion.jpg";
import consultoriaImg from "@/assets/sectors/consultoria.jpg";
import fitnessImg from "@/assets/sectors/fitness.jpg";
import comercioImg from "@/assets/sectors/comercio.jpg";
import otroImg from "@/assets/sectors/otro.jpg";

// Reuse existing images for new sector names
export const SECTOR_IMAGES: Record<string, string> = {
  "Hostelería": hosteleriaImg,
  "Estética": esteticaImg,
  "Restaurante": restauracionImg,
  "Consultoría / Asesoría": consultoriaImg,
  "Fitness / Deportes": fitnessImg,
  "Servicios": comercioImg,
  "Arquitectura / Portfolio": otroImg,
  "Otros": otroImg,
};
