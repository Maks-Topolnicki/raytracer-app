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
    reflectivity: 0,
    transparency: 0.9,
    refractiveIndex: 1.5,
  },
  {
    shape: new Plane(new Vec3(0, -1, 0), new Vec3(0, 1, 0)),
    color: new Vec3(0.5, 0.5, 0.5),
    reflectivity: 0,
    transparency: 0,
    refractiveIndex: 1,
  },

  {
    shape: new Sphere(new Vec3(0.75, 0, -5), 0.7),
    color: new Vec3(0.2, 0.4, 1),
    reflectivity: 0,
    transparency: 0,
    refractiveIndex: 1,
  },

  {
    shape: new Sphere(new Vec3(-1, 0, -2), 1),
    color: new Vec3(1, 1, 1),
    reflectivity: 0,
    transparency: 0.9,
    refractiveIndex: 1.5,
  },
];

// ---------- Core raytracing logic ----------

function traceRay(ray: Ray, depth: number = 3): Vec3 {
  if (depth <= 0) {
    return new Vec3(0, 0, 0);
  }

  let bestT = Infinity;
  let bestObject = null;
  const AMBIENT = 0.3;

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
    let brightness =
      AMBIENT + (1 - AMBIENT) * Math.max(0, normal.dot(lightDir));

    for (const object of objects) {
      const t = object.shape.intersect(shadowRay);
      let inShadow = false;

      if (t !== null) {
        inShadow = true;
      }

      if (inShadow == true) {
        brightness = AMBIENT;
      }
    }

    const surfaceColor =
      bestObject.shape instanceof Plane
        ? bestObject.shape.getColorAt(P)
        : bestObject.color;

    const localColor = new Vec3(
      brightness * surfaceColor.x,
      brightness * surfaceColor.y,
      brightness * surfaceColor.z,
    );

    const isEntering = ray.direction.dot(normal) < 0;
    const n1 = isEntering ? 1.0 : bestObject.refractiveIndex;
    const n2 = isEntering ? bestObject.refractiveIndex : 1.0;
    const refractNormal = isEntering ? normal : normal.scale(-1);

    if (bestObject.transparency > 0) {
      const cosI = Math.abs(ray.direction.dot(refractNormal));
      const r0 = Math.pow((n1 - n2) / (n1 + n2), 2);
      const fresnel = r0 + (1 - r0) * Math.pow(1 - cosI, 5);

      const reflectedDir = ray.direction.reflect(normal);
      const reflectedOrigin = P.add(normal.scale(0.001));
      const reflectedRay = new Ray(reflectedOrigin, reflectedDir);
      const reflectedColor = traceRay(reflectedRay, depth - 1);

      const refractedDir = ray.direction.refract(refractNormal, n1, n2);

      let combinedColor: Vec3;
      if (refractedDir !== null) {
        const refractedOrigin = P.add(refractedDir.scale(0.001));
        const refractedRay = new Ray(refractedOrigin, refractedDir);
        const refractedColor = traceRay(refractedRay, depth - 1);
        combinedColor = reflectedColor
          .scale(fresnel)
          .add(refractedColor.scale(1 - fresnel));
      } else {
        combinedColor = reflectedColor; // całkowite wewnętrzne odbicie
      }

      return localColor
        .scale(1 - bestObject.transparency)
        .add(combinedColor.scale(bestObject.transparency));
    }

    if (bestObject.reflectivity > 0) {
      const reflectedDir = ray.direction.reflect(normal);
      const reflectedOrigin = P.add(normal.scale(0.001));
      const reflectedRay = new Ray(reflectedOrigin, reflectedDir);
      const reflectedColor = traceRay(reflectedRay, depth - 1);
      return localColor
        .scale(1 - bestObject.reflectivity)
        .add(reflectedColor.scale(bestObject.reflectivity));
    }

    return localColor;
  } else {
    return new Vec3(0, 0, 0);
  }
}

function getCameraBasis(
  azimuth: number,
  elevation: number,
  distance: number,
  target: Vec3,
) {
  const x = distance * Math.cos(elevation) * Math.sin(azimuth);
  const y = distance * Math.sin(elevation);
  const z = distance * Math.cos(elevation) * Math.cos(azimuth);

  const cameraPos = target.add(new Vec3(x, y, z));
  const forward = target.sub(cameraPos).normalize();
  const worldUp = new Vec3(0, 1, 0);
  const right = forward.cross(worldUp).normalize();
  const up = right.cross(forward);

  return { cameraPos, forward, right, up };
}

// ---------- Render loop ----------

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;
const SAMPLES = 4;

function render(azimuth: number, elevation: number, distance: number) {
  const target = new Vec3(0, 0, -3);
  const { cameraPos, forward, right, up } = getCameraBasis(
    azimuth,
    elevation,
    distance,
    target,
  );

  for (let py = 0; py < 600; py++) {
    for (let px = 0; px < 800; px++) {
      const index = (py * canvas.width + px) * 4;
      let colorSum = new Vec3(0, 0, 0);

      for (let s = 0; s < SAMPLES; s++) {
        const samplePx = px + Math.random();
        const samplePy = py + Math.random();
        const x = (samplePx - 400) / 300;
        const y = ((samplePy - 300) * -1) / 300;

        const direction = forward
          .add(right.scale(x))
          .add(up.scale(y))
          .normalize();
        const ray = new Ray(cameraPos, direction);

        colorSum = colorSum.add(traceRay(ray));
      }

      const finalColor = colorSum.scale(1 / SAMPLES);

      data[index] = 255 * finalColor.x;
      data[index + 1] = 255 * finalColor.y;
      data[index + 2] = 255 * finalColor.z;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

render(0, 0.3, 5);
