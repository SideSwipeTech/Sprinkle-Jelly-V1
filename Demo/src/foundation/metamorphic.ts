/**
 * metamorphic.ts — Physical & Cinematic Theme Transition Gateway
 * 
 * Routes all theme and scheme transitions through the high-performance
 * metamorphic particle & reverse genesis engine.
 */

import { type ProductTheme, type SchemeKey, type AppearanceState } from "./appearance";
import { startMetamorphicTransition, type MetamorphicTransitionOptions } from "./metamorphicEngine";

export interface MorphOptions {
  theme?: ProductTheme;
  scheme?: SchemeKey;
  originEvent?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number };
}

export function performMetamorphicTransition(
  options: MorphOptions,
  onComplete?: (state: AppearanceState) => void
): AppearanceState {
  return startMetamorphicTransition(options as MetamorphicTransitionOptions, onComplete);
}
