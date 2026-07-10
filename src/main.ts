import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Sphere } from "./sphere";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const sphere = new Sphere(new Vec3(0, 0, -3), 1);

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const center = new Vec3(0, 0, -3);
const radius = 1;

for (let py = 0; py < 600; py++) {
  for (let px = 0; px < 800; px++) {
    let x = (px - 400) / 400;
    let y = ((py - 300) * -1) / 300;

    const direction = new Vec3(x, y, -1).normalize();
    const ray = new Ray(new Vec3(0, 0, 0), direction);

    if (sphere.intersect(ray) !== null) {
      ctx.fillStyle = "red";
      ctx.fillRect(px, py, 1, 1);
    }
  }
}
