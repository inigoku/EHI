// Cross-references between chapters that aren't sequential neighbors — used by
// both the "Constelación de Capítulos" graph and the sidebar's contextual
// "ver también" card, so the two surfaces never drift out of sync.
export interface ConceptualLink {
  fromId: string;
  toId: string;
}

export const conceptualLinks: ConceptualLink[] = [
  { fromId: "cap1", toId: "cap8" },
  { fromId: "cap1", toId: "cap20_real" },
  { fromId: "cap2", toId: "cap10" },
  { fromId: "cap2", toId: "cap15_real" },
  { fromId: "cap3", toId: "cap11" },
  { fromId: "cap4", toId: "cap12" },
  { fromId: "cap4", toId: "cap19_real" },
  { fromId: "cap5", toId: "cap13_5" },
  { fromId: "cap5", toId: "cap18_real" },
  { fromId: "cap6", toId: "cap14_real" },
  { fromId: "cap6", toId: "cap20_5" },
  { fromId: "cap7", toId: "cap12" },
  { fromId: "cap7", toId: "cap17_real" },
  { fromId: "cap8", toId: "cap13" },
  { fromId: "cap8", toId: "cap20_real" },
  { fromId: "cap9", toId: "cap16_real" },
  { fromId: "cap10", toId: "cap18_real" },
  { fromId: "cap10", toId: "cap20_real" },
  { fromId: "cap13", toId: "cap17_real" },
  { fromId: "cap15_real", toId: "cap20_5" },
  { fromId: "cap_traductor", toId: "cap_calibracion" },
];

export function findConceptualLink(chapterId: string): string | undefined {
  const link = conceptualLinks.find((l) => l.fromId === chapterId || l.toId === chapterId);
  if (!link) return undefined;
  return link.fromId === chapterId ? link.toId : link.fromId;
}
