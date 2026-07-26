import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Sphere } from "./sphere";
import { Plane } from "./plane";

// ---------- Scene setup ----------

const light = new Vec3(2, 2, 0);

const objects = [
  {
    shape: new Sphere(new Vec3(0, 0, -3), 1),
    color: new Vec3(1, 0, 0),
    reflectivity: 0.6,
  },
  {
    shape: new Plane(new Vec3(0, -1, 0), new Vec3(0, 1, 0)),
    color: new Vec3(0.5, 0.5, 0.5),
    reflectivity: 0,
  },
];

// ---------- Core raytracing logic ----------

function traceRay(ray: Ray, depth: number = 3): Vec3 {
  if (depth <= 0) {
    return new Vec3(0, 0, 0);
  }

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

    ray.direction.reflect(normal);

    const localColor = new Vec3(
      brightness * bestObject.color.x,
      brightness * bestObject.color.y,
      brightness * bestObject.color.z,
    );

    if (bestObject.reflectivity <= 0) {
      return localColor;
    }

    const reflectedDir = ray.direction.reflect(normal);
    const reflectedOrigin = P.add(normal.scale(0.001));
    const reflectedRay = new Ray(reflectedOrigin, reflectedDir);
    const reflectedColor = traceRay(reflectedRay, depth - 1);

    return localColor
      .scale(1 - bestObject.reflectivity)
      .add(reflectedColor.scale(bestObject.reflectivity));
  } else {
    return new Vec3(0, 0, 0);
  }
}

// ---------- Render loop ----------

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;
const SAMPLES = 4;

for (let py = 0; py < 600; py++) {
  for (let px = 0; px < 800; px++) {
    const index = (py * canvas.width + px) * 4;
    let colorSum = new Vec3(0, 0, 0);

    for (let s = 0; s < SAMPLES; s++) {
      const samplePx = px + Math.random();
      const samplePy = py + Math.random();
      let x = (samplePx - 400) / 300;
      let y = ((samplePy - 300) * -1) / 300;

      const direction = new Vec3(x, y, -1).normalize();
      const ray = new Ray(new Vec3(0, 0, 0), direction);

      colorSum = colorSum.add(traceRay(ray));
    }

    const finalColor = colorSum.scale(1 / 4);

    data[index] = 255 * finalColor.x;
    data[index + 1] = 255 * finalColor.y;
    data[index + 2] = 255 * finalColor.z;
    data[index + 3] = 255;
  }
}

ctx.putImageData(imageData, 0, 0);
