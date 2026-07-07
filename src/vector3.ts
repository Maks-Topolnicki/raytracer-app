class Vec3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public sub(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public scale(n: number): Vec3 {
    return new Vec3(this.x * n, this.y * n, this.z * n);
  }

  public length(): number {
    //return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return Math.sqrt(this.dot(this));
  }

  public normalize(): Vec3 {
    const len = this.length();
    return new Vec3(this.x / len, this.y / len, this.z / len);
  }
}
