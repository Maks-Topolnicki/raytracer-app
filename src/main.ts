import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Sphere } from "./sphere";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const sphere = new Sphere(new Vec3(0, 0, -3), 1);

const center = new Vec3(0, 0, -3);
const radius = 1;
const light = new Vec3(2, 2, 0);

const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

for (let py = 0; py < 600; py++) {
  for (let px = 0; px < 800; px++) {
    let x = (px - 400) / 300;
    let y = ((py - 300) * -1) / 300;

    const direction = new Vec3(x, y, -1).normalize();
    const ray = new Ray(new Vec3(0, 0, 0), direction);
    const index = (py * canvas.width + px) * 4;
    const t = sphere.intersect(ray);

    if (t !== null) {
      const P = ray.pointAt(t);
      const normal = P.sub(sphere.center).normalize();
      const lightDir = light.sub(P).normalize();
      const brightness = Math.max(0, normal.dot(lightDir));

      data[index] = 255 * brightness; // R
      data[index + 1] = 0; // G
      data[index + 2] = 0; // B
      data[index + 3] = 255; // A (255 - w pełni widoczne)
    } else {
      data[index] = 0; // R
      data[index + 1] = 0; // G
      data[index + 2] = 0; // B
      data[index + 3] = 255; // A (255 - w pełni widoczne)
    }
  }
}

ctx.putImageData(imageData, 0, 0);
