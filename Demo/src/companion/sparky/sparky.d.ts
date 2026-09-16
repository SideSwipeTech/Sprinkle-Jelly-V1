/** Type surface for the JS character rig (canonical source; the lab imports the same files). */
export interface SparkyNodes {
  svg: SVGSVGElement; root: SVGGElement; shadow: SVGEllipseElement; body: SVGGElement;
  podL: SVGGElement; podR: SVGGElement; topper: SVGGElement; bolt: SVGPathElement; visor: SVGGElement;
  face: SVGGElement; look: SVGGElement; eyeL: SVGGElement; eyeR: SVGGElement; mouth: SVGGElement;
  mouthPath: SVGPathElement; extras: SVGGElement; glyph: SVGGElement; scan: SVGRectElement;
  status: SVGCircleElement; badge: SVGGElement;
}
export interface FaceDef {
  eyes?: [string, string]; mouth?: string; extras?: string | null; badge?: string | null;
  glyph?: string | null; tone?: string; dim?: boolean; lean?: number; tilt?: number; calm?: boolean;
}
export interface SparkyRig {
  el: SVGSVGElement;
  nodes: SparkyNodes;
  setSize(px: number): void;
  setFace(def?: FaceDef): void;
}
export function createSparky(opts?: { size?: number }): SparkyRig;
