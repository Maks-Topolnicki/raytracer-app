import { Vec3 } from "./vector3";
export class Ray {
  public origin: Vec3;
  public direction: Vec3;

  constructor(origin: Vec3, direction: Vec3) {
    this.origin = origin;
    this.direction = direction;
  }

  public pointAt(n: number): Vec3 {
    return this.origin.add(this.direction.scale(n));
  }
}
