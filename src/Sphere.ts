import { Vec3 } from "./vector3";
import { Ray } from "./ray";

export class Sphere {
  public center: Vec3;
  public radius: number;

  constructor(center: Vec3, radius: number) {
    this.center = center;
    this.radius = radius;
  }

  public intersect(ray: Ray): number | null {
    const D = ray.direction;
    const O = ray.origin;
    const oc = O.sub(this.center);
    const a = D.dot(D);
    const b = 2.0 * oc.dot(D);
    const c = oc.dot(oc) - this.radius * this.radius;

    const delta = b * b - 4 * a * c;

    if (delta > 0) {
      const t1 = (-b + Math.sqrt(delta)) / (2 * a);
      const t2 = (-b - Math.sqrt(delta)) / (2 * a);
      if (t2 >= 0) return t2;
      else if (t2 < 0 && t1 >= 0) return t1;
      else return null;
    } else if (delta == 0) {
      return -b / (2 * a);
    } else return null;
  }
}
