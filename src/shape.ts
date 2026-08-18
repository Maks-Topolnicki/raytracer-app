/**
 * Abstrakcyjna klasa bazowa dla wszystkich obiektów (kształtów) na scenie
 * Narzuca jakie zasady, metody musi posiadać każdy obiekt (np. kula czy płaszczyzna)
 */
import { Vec3 } from "./vector3";
import { Ray } from "./ray";

export abstract class Shape {
  /**
   * Sprawdza czy i w jakim punkcie światło przecina obiekt
   * Zwraca odległość lub null jeśli w nic nie trafi
   */
  abstract intersect(ray: Ray): number | null;
  /**
   * Oblicza wektor normalny (prostopadły do powierzchni)
   */
  abstract getNormal(point: Vec3): Vec3;
}
