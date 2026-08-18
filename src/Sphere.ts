/**
 * Reprezentuję kulę w przestrzeni 3D
 */

import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Shape } from "./shape";

export class Sphere extends Shape {
  public center: Vec3;
  public radius: number;

  constructor(center: Vec3, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
  }

  /**
   * Sprawdza czy promień uderzył w kulę, rozwiązując równanie kwadratowe
   * Zwraca wartość do najbliższego punktu trafienia (t1 lub t2)
   */
  public intersect(ray: Ray): number | null {
    const D = ray.direction;
    const O = ray.origin;

    // Wektor od środka kuli do początku promienia
    const oc = O.sub(this.center);

    // Współczynniki równania kwadratowego i delta
    const a = D.dot(D);
    const b = 2.0 * oc.dot(D);
    const c = oc.dot(oc) - this.radius * this.radius;
    const delta = b * b - 4 * a * c;

    if (delta > 0) {
      // Punkty przecięcia
      const t1 = (-b + Math.sqrt(delta)) / (2 * a);
      const t2 = (-b - Math.sqrt(delta)) / (2 * a);

      // Sprawdzenie który jest bliżej
      if (t2 >= 0) return t2;
      else if (t2 < 0 && t1 >= 0) return t1;
      else return null;
    } else if (delta == 0) {
      return -b / (2 * a);
    } else return null;
  }

  /**
   * Wektor normalnu
   * Dla kuli jest to po prostu wektor ciągnący się od jej środka na zewnątrz
   */
  public getNormal(point: Vec3): Vec3 {
    return point.sub(this.center).normalize();
  }
}
