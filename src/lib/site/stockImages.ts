// Curated stock image catalog (Unsplash) per sector.
// Used as fallback when the client doesn't upload enough photos.
// All IDs are stable Unsplash photo IDs that don't 404.

const u = (id: string, w = 1600, h = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

type StockSet = {
  hero: string[];
  about: string[];
  gallery: string[];
};

const STOCK_BY_SECTOR: Record<string, StockSet> = {
  "Hostelería / Restaurante": {
    hero: ["photo-1517248135467-4c7edcad34c4", "photo-1414235077428-338989a2e8c0", "photo-1555396273-367ea4eb4db5"],
    about: ["photo-1559339352-11d035aa65de", "photo-1466637574441-749b8f19452f"],
    gallery: [
      "photo-1565299624946-b28f40a0ae38",
      "photo-1551782450-a2132b4ba21d",
      "photo-1546069901-ba9599a7e63c",
      "photo-1540189549336-e6e99c3679fe",
      "photo-1504674900247-0877df9cc836",
    ],
  },
  "Estética / Peluquería": {
    hero: ["photo-1560066984-138dadb4c035", "photo-1522337360788-8b13dee7a37e", "photo-1487412947147-5cebf100ffc2"],
    about: ["photo-1595476108010-b4d1f102b1b1", "photo-1607008829749-c0f284a49841"],
    gallery: [
      "photo-1583001931096-959e9a1a6223",
      "photo-1522337360788-8b13dee7a37e",
      "photo-1560066984-138dadb4c035",
      "photo-1487412947147-5cebf100ffc2",
      "photo-1519415943484-9fa1873496d4",
    ],
  },
  "Fitness / Deportes": {
    hero: ["photo-1571019614242-c5c5dee9f50b", "photo-1534438327276-14e5300c3a48", "photo-1517836357463-d25dfeac3438"],
    about: ["photo-1581009146145-b5ef050c2e1e", "photo-1540497077202-7c8a3999166f"],
    gallery: [
      "photo-1517836357463-d25dfeac3438",
      "photo-1534438327276-14e5300c3a48",
      "photo-1574680096145-d05b474e2155",
      "photo-1571019613454-1cb2f99b2d8b",
      "photo-1518611012118-696072aa579a",
    ],
  },
  "Consultoría / Asesoría": {
    hero: ["photo-1497366216548-37526070297c", "photo-1556761175-5973dc0f32e7", "photo-1454165804606-c3d57bc86b40"],
    about: ["photo-1573496359142-b8d87734a5a2", "photo-1521737711867-e3b97375f902"],
    gallery: [
      "photo-1497366754035-f200968a6e72",
      "photo-1604328698692-f76ea9498e76",
      "photo-1497366811353-6870744d04b2",
      "photo-1559136555-9303baea8ebd",
      "photo-1542744173-8e7e53415bb0",
    ],
  },
  "Arquitectura / Portfolio": {
    hero: ["photo-1487958449943-2429e8be8625", "photo-1511818966892-d7d671e672a2", "photo-1545324418-cc1a3fa10c00"],
    about: ["photo-1503387762-592deb58ef4e", "photo-1486325212027-8081e485255e"],
    gallery: [
      "photo-1545324418-cc1a3fa10c00",
      "photo-1511818966892-d7d671e672a2",
      "photo-1487958449943-2429e8be8625",
      "photo-1496307653780-42ee777d4833",
      "photo-1497366216548-37526070297c",
    ],
  },
  "Servicios": {
    hero: ["photo-1521737604893-d14cc237f11d", "photo-1556761175-5973dc0f32e7", "photo-1542744173-8e7e53415bb0"],
    about: ["photo-1521737711867-e3b97375f902", "photo-1573164713714-d95e436ab8d6"],
    gallery: [
      "photo-1521737604893-d14cc237f11d",
      "photo-1556761175-5973dc0f32e7",
      "photo-1542744173-8e7e53415bb0",
      "photo-1521737711867-e3b97375f902",
      "photo-1573164713714-d95e436ab8d6",
    ],
  },
  "Otros": {
    hero: ["photo-1497366216548-37526070297c", "photo-1521737604893-d14cc237f11d", "photo-1556761175-5973dc0f32e7"],
    about: ["photo-1521737711867-e3b97375f902", "photo-1573164713714-d95e436ab8d6"],
    gallery: [
      "photo-1542744173-8e7e53415bb0",
      "photo-1556761175-5973dc0f32e7",
      "photo-1521737604893-d14cc237f11d",
      "photo-1497366216548-37526070297c",
      "photo-1521737711867-e3b97375f902",
    ],
  },
};

export interface ResolvedImagePool {
  hero: string[];
  about: string[];
  gallery: string[];
  /** Flat list (client first, then stock) for any block that just needs N images. */
  all: string[];
}

/**
 * Build a ready-to-use image pool combining client-uploaded photos and curated stock.
 * Client photos are always prioritized; stock fills the rest to guarantee every block has visuals.
 */
export function resolveImagePool(sector: string, clientPhotos: string[]): ResolvedImagePool {
  const stock = STOCK_BY_SECTOR[sector] || STOCK_BY_SECTOR["Otros"];
  const stockUrls = (ids: string[], w?: number, h?: number) => ids.map((id) => u(id, w, h));

  const heroStock = stockUrls(stock.hero, 1600, 1000);
  const aboutStock = stockUrls(stock.about, 1200, 1500);
  const galleryStock = stockUrls(stock.gallery, 1200, 900);

  // Client photos are versatile — use them first across all categories.
  const hero = [...clientPhotos, ...heroStock];
  const about = [...clientPhotos, ...aboutStock];
  const gallery = [...clientPhotos, ...galleryStock];
  const all = [...clientPhotos, ...heroStock, ...aboutStock, ...galleryStock];

  return { hero, about, gallery, all };
}
