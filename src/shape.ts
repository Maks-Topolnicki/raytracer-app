import { Vec3 } from "./vector3";
import { Ray } from "./ray";

export abstract class Shape {
  abstract intersect(ray: Ray): number | null;
  abstract getNormal(point: Vec3): Vec3;
}
