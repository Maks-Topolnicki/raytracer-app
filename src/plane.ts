import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Shape } from "./shape";

export class Plane extends Shape {
  public point: Vec3;
  public normal: Vec3;

  constructor(point: Vec3, normal: Vec3) {
    super();
    this.point = point;
    this.normal = normal.normalize();
  }

  public intersect(ray: Ray): number | null {
    const D = ray.direction;
    const O = ray.origin;
    const oc = O.sub(this.point);

    const denom = D.dot(this.normal);
    if (Math.abs(denom) < 0.0001) {
      return null;
    }

    const t = -oc.dot(this.normal) / D.dot(this.normal);

    if (t >= 0) {
      return t;
    } else {
      return null;
    }
  }

  public getNormal(point: Vec3): Vec3 {
    return this.normal;
  }
}
