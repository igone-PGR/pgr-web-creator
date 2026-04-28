import type { BlockInstance, BlockType } from "@/lib/site/types";
import { NavBlock } from "./blocks/NavBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { ServicesBlock } from "./blocks/ServicesBlock";
import { AboutBlock } from "./blocks/AboutBlock";
import { CtaBlock } from "./blocks/CtaBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { CategoriesBlock } from "./blocks/CategoriesBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { ProcessBlock } from "./blocks/ProcessBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { HoursBlock } from "./blocks/HoursBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { MapBlock } from "./blocks/MapBlock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlockComponent = React.ComponentType<{ content: any; variant: "a" | "b" }>;

export const BLOCK_REGISTRY: Record<BlockType, AnyBlockComponent> = {
  nav: NavBlock,
  hero: HeroBlock,
  services: ServicesBlock,
  about: AboutBlock,
  cta: CtaBlock,
  footer: FooterBlock,
  categories: CategoriesBlock,
  stats: StatsBlock,
  process: ProcessBlock,
  gallery: GalleryBlock,
  testimonials: TestimonialsBlock,
  faq: FaqBlock,
  hours: HoursBlock,
  contact: ContactBlock,
  map: MapBlock,
};

export function renderBlock(block: BlockInstance) {
  const Cmp = BLOCK_REGISTRY[block.type];
  if (!Cmp) return null;
  return <Cmp content={block.content} variant={block.variant} />;
}
