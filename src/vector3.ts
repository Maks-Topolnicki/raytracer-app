/**
 * Reprezentuje wektor lub punkt w przestrzeni 3D.
 * Używany zarówno do pozycji (np. środek kuli), jak i kierunków (np. promień światła).
 */
export class Vec3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Oblicza sumę wektorów
   */
  public add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * Oblicza różnicę wektorów
   */
  public sub(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Oblicza iloczyn skalarny dwóch wektorów.
   * Dla znormalizowanych wektorów zwraca cosinus kąta międzt nimi -
   * używane m.in. do liczenia jasności (Lambert) i sprawdzenia prostopadłości
   */
  public dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Mnożenie wektora przez skalar (jakąś stałą liczbę n)
   */
  public scale(n: number): Vec3 {
    return new Vec3(this.x * n, this.y * n, this.z * n);
  }

  /**
   * Oblicza długość wektora (moduł)
   */
  public length(): number {
    //return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return Math.sqrt(this.dot(this));
  }

  /**
   * Proces zmiany długości wektora na 1, przy zachowaniu tego samego kierunku
   * Używany m.in. do obliczenia oświetlenia i cieni
   * Pozycjonowania i orientacji kamery
   */
  public normalize(): Vec3 {
    const len = this.length();
    return new Vec3(this.x / len, this.y / len, this.z / len);
  }

  /**
   * Oblicza pod jakim kątem jest odbijane światło od powierzchni reflektywnej
   * Fizyczna zasada: kąt padania = kąt odbicia.
   */
  public reflect(normal: Vec3): Vec3 {
    const d = this.dot(normal);
    const projection = normal.scale(2 * d);
    return this.sub(projection);
  }

  /**
   * Oblicza jak biegnie światło przy jego załamaniu (prawo Snella)
   * Przy przejściu między dwoma ośrodkami o różnych współczynnikach załamania
   * null - przy całkowitym wewnętrznym odbiciu
   */
  public refract(normal: Vec3, n1: number, n2: number): Vec3 | null {
    const n = n1 / n2;
    const cosI = -this.dot(normal);
    const sinT2 = n * n * (1 - cosI * cosI);

    if (sinT2 > 1) {
      return null; // całkowite wewnętrzne odbicie - światło nie może przejść
    }

    const cosT = Math.sqrt(1 - sinT2);
    return this.scale(n).add(normal.scale(n * cosI - cosT));
  }

  /**
   * Iloczyn wektorowy - zwraca nowy wektor prostopadły
   * Jednocześnie do obu wektorów wejściowych. Używany
   * do liczenia wektorów bazowych kamery
   */
  public cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }
}
