/**
 * Reprezentuje idealnie płaską nieskończoną płaszczyznę
 */
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

  /**
   * Sprawdza czy światło uderza w podłogę
   */
  public intersect(ray: Ray): number | null {
    const D = ray.direction;
    const O = ray.origin;
    const oc = O.sub(this.point);

    // Kąt pod jakim promień wpada na płaszczyznę
    const denom = D.dot(this.normal);

    // Jeśli denom jest bliske zera, promień leci równolegle do ziemi i nigdy jej nie przecina
    if (Math.abs(denom) < 0.0001) {
      return null;
    }

    // Wyrachowanie odległości do uderzenia
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

  /**
   * Oblicza kolor szachownicy na podstawie współrzędnych punktu na planszy
   * Zwraca na zmiane jasny lub ciemny kwadrat
   */
  public getColorAt(point: Vec3): Vec3 {
    const squareX = Math.floor(point.x);
    const squareZ = Math.floor(point.z);
    const isEven = (squareX + squareZ) % 2 === 0;
    return isEven ? new Vec3(0.9, 0.9, 0.9) : new Vec3(0.3, 0.3, 0.3);
  }
}
