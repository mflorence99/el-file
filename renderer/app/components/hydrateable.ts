import { ElementRef } from '@angular/core';

/**
 * Contract for hydrateable components
 */

export interface Hydrateable {
  element: ElementRef;
  hydrated: boolean;
  path: string;
  repaint: () => void;
}
