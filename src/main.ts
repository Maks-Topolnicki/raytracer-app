import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Sphere } from "./sphere";
import { Plane } from "./plane";

function traceRay(ray: Ray): Vec3 {
  let bestT = Infinity;
  let bestObject = null;

  for (const obj of objects) {
    const t = obj.shape.intersect(ray);
    if (t !== null && t < bestT) {
      bestT = t;
      bestObject = obj;
    }
  }

  if (bestObject !== null) {
    const P = ray.pointAt(bestT);
    const normal = bestObject.shape.getNormal(P);
    const lightDir = light.sub(P).normalize();
    const shadowOrigin = P.add(normal.scale(0.001));
    const shadowRay = new Ray(shadowOrigin, lightDir);
    let brightness = Math.max(0, normal.dot(lightDir));

    for (const object of objects) {
      const t = object.shape.intersect(shadowRay);
      let inShadow = false;

      if (t !== null) {
        inShadow = true;
      }

      if (inShadow == true) {
        brightness = 0;
      }
    }

    return new Vec3(
      brightness * bestObject.color.x,
      brightness * bestObject.color.y,
      brightness * bestObject.color.z,
    );
  } else {
    return new Vec3(0, 0, 0);
  }
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const light = new Vec3(2, 2, 0);

const objects = [
  { shape: new Sphere(new Vec3(0, 0, -3), 1), color: new Vec3(1, 0, 0) },
  {
    shape: new Plane(new Vec3(0, -1, 0), new Vec3(0, 1, 0)),
    color: new Vec3(0.5, 0.5, 0.5),
  },
];

const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

for (let py = 0; py < 600; py++) {
  for (let px = 0; px < 800; px++) {
    let x = (px - 400) / 300;
    let y = ((py - 300) * -1) / 300;

    const direction = new Vec3(x, y, -1).normalize();
    const ray = new Ray(new Vec3(0, 0, 0), direction);
    const index = (py * canvas.width + px) * 4;

    const color = traceRay(ray);

    data[index] = 255 * color.x;
    data[index + 1] = 255 * color.y;
    data[index + 2] = 255 * color.z;
    data[index + 3] = 255;
  }
}

ctx.putImageData(imageData, 0, 0);
