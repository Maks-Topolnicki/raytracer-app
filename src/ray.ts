/**
 * Klasa reprezentująca pojedynczy promień światła w przestrzeni
 * Składa się z punktu z którego wylatuje, oraz kierunku w którym leci
 */

import { Vec3 } from "./vector3";
export class Ray {
  public origin: Vec3;
  public direction: Vec3;

  constructor(origin: Vec3, direction: Vec3) {
    this.origin = origin;
    this.direction = direction;
  }

  /**
   * Oblicza dokładny punkt w przestrzeni, w którym znajdzie się promień
   * po pokonaniu odległości "n" os startu
   */
  public pointAt(n: number): Vec3 {
    return this.origin.add(this.direction.scale(n));
  }
}
