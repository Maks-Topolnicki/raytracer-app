import { Vec3 } from "./vector3";
import { Ray } from "./ray";
import { Sphere } from "./sphere";
import { Plane } from "./plane";

// ---------- Konfiguracja sceny ----------

// Źródło światła
const light = new Vec3(2, 2, 0);

// Lista obiektów znajdujących się na scenie wraz z ich parametrami
// takimi jak przezroczystość, czy to jak bardzo uginają obraz
const objects = [
  {
    shape: new Sphere(new Vec3(0, 0, -3), 1),
    color: new Vec3(1, 0, 0),
    reflectivity: 0,
    transparency: 0.9, // Kula jest bardzo prześwitująca
    refractiveIndex: 1.5, // Stopień zniekształcenia widocznego tła przez obiekt
  },
  {
    shape: new Plane(new Vec3(0, -1, 0), new Vec3(0, 1, 0)),
    color: new Vec3(0.5, 0.5, 0.5),
    reflectivity: 0,
    transparency: 0, // Zwykła nieprzepuszczająca światła powierzchnia
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

// ---------- Główna logika RayTracingu ----------

/**
 * Główna funkcja raytracera określająca, jaki kolor widać na końcu promienia
 * Parametr 'depth' zabezpiecza przed nieskończonym śledzeniem światła
 */
function traceRay(ray: Ray, depth: number = 3): Vec3 {
  if (depth <= 0) {
    return new Vec3(0, 0, 0); // Limit odbić osiągnięty -> czarna pustka
  }

  let bestT = Infinity;
  let bestObject = null;
  const AMBIENT = 0.3; // Bardzo słabe, ciągłe światło środowiskowe, aby obiekty nie były kompletnie czarne

  // Przeszukanie sceny w celu znalezienia najbliższego trafionego obiektu
  for (const obj of objects) {
    const t = obj.shape.intersect(ray);
    if (t !== null && t < bestT) {
      bestT = t;
      bestObject = obj;
    }
  }

  if (bestObject !== null) {
    const P = ray.pointAt(bestT); // Konkretny punkt zderzenia
    const normal = bestObject.shape.getNormal(P); // Wektor określający wypukłość/kierunek powierzchni w tym punkcie
    const lightDir = light.sub(P).normalize(); // Kierunek skierowany ze zderzenie porsto do żarówki (źródła światła)

    // Wypuszczamy nowy promień w kierunku światła. Przesunięty o włos (0.001),
    // by kula nie rzucała cienia sama na siebie
    const shadowOrigin = P.add(normal.scale(0.001));
    const shadowRay = new Ray(shadowOrigin, lightDir);

    // Prawa optyki: powierzchnia skierowana w stronę źródła światła jest jaśniejsza
    let brightness =
      AMBIENT + (1 - AMBIENT) * Math.max(0, normal.dot(lightDir));

    // Analizowanie czy nasz cel jest przysłonięty (w cieniu)
    for (const object of objects) {
      const t = object.shape.intersect(shadowRay);
      let inShadow = false;

      if (t !== null) {
        inShadow = true;
      }

      if (inShadow == true) {
        brightness = AMBIENT; // Cień jest rysowany poprzez odebranie w tym punkcie oświtlenia
      }
    }

    // Wyciągnięcie barwy - może to być szachownica dla płaszczyzn lub jeden kolor dla kuli
    const surfaceColor =
      bestObject.shape instanceof Plane
        ? bestObject.shape.getColorAt(P)
        : bestObject.color;

    // Przemnożenie koloru obiektu przez obliczone wcześniej oświetlenie
    const localColor = new Vec3(
      brightness * surfaceColor.x,
      brightness * surfaceColor.y,
      brightness * surfaceColor.z,
    );

    // --- Sekcja Przezroczystości (Refrakcja / Złudzenie Szkła) ---

    // Ustalenie czy wpadamy czy wypadamy z obiektu
    const isEntering = ray.direction.dot(normal) < 0;
    const n1 = isEntering ? 1.0 : bestObject.refractiveIndex;
    const n2 = isEntering ? bestObject.refractiveIndex : 1.0;
    const refractNormal = isEntering ? normal : normal.scale(-1);

    if (bestObject.transparency > 0) {
      // Efekt Fresnela - pod kątem szkło jest lustrem. a na wprost możemy patrzeć przez nie
      const cosI = Math.abs(ray.direction.dot(refractNormal));
      const r0 = Math.pow((n1 - n2) / (n1 + n2), 2);
      const fresnel = r0 + (1 - r0) * Math.pow(1 - cosI, 5);

      // Symulowanie światła odbitego
      const reflectedDir = ray.direction.reflect(normal);
      const reflectedOrigin = P.add(normal.scale(0.001));
      const reflectedRay = new Ray(reflectedOrigin, reflectedDir);
      const reflectedColor = traceRay(reflectedRay, depth - 1);

      // Symulowanie światła przenikającego (załamanego)
      const refractedDir = ray.direction.refract(refractNormal, n1, n2);

      let combinedColor: Vec3;
      if (refractedDir !== null) {
        const refractedOrigin = P.add(refractedDir.scale(0.001));
        const refractedRay = new Ray(refractedOrigin, refractedDir);
        const refractedColor = traceRay(refractedRay, depth - 1);

        // Finalne mieszanie odbicia i przejścia światła za pomocą współczynnika Fresnela
        combinedColor = reflectedColor
          .scale(fresnel)
          .add(refractedColor.scale(1 - fresnel));
      } else {
        combinedColor = reflectedColor; // całkowite wewnętrzne odbicie
      }

      // Kombinacja widzialnego lokalnie koloru z przejrzystością
      return localColor
        .scale(1 - bestObject.transparency)
        .add(combinedColor.scale(bestObject.transparency));
    }

    // --- Sekcja Luster / Odblasków ---

    if (bestObject.reflectivity > 0) {
      const reflectedDir = ray.direction.reflect(normal);
      const reflectedOrigin = P.add(normal.scale(0.001));
      const reflectedRay = new Ray(reflectedOrigin, reflectedDir);
      const reflectedColor = traceRay(reflectedRay, depth - 1);

      // Mieszanie koloru z tym odbijanym na podstawie ustalonego współczynnika odblaskowego
      return localColor
        .scale(1 - bestObject.reflectivity)
        .add(reflectedColor.scale(bestObject.reflectivity));
    }

    return localColor;
  } else {
    // Skoro w nic nie uderzyliśmy (brak bestObject) zwracamy otchłań, czyli kolor czarny sceny bazowej
    return new Vec3(0, 0, 0);
  }
}

/**
 * Ustawienie, orientacja i system koordynatów wirtualnej kamery wokół punktu w centrum sceny
 */

function getCameraBasis(
  azimuth: number,
  elevation: number,
  distance: number,
  target: Vec3,
) {
  // Trygonometria pozwalająca krążyć w odpowiedniej orbicie i odległości z wykorzystaniem sin i cos
  const x = distance * Math.cos(elevation) * Math.sin(azimuth);
  const y = distance * Math.sin(elevation);
  const z = distance * Math.cos(elevation) * Math.cos(azimuth);

  const cameraPos = target.add(new Vec3(x, y, z));

  // Stworzenie pełnego wektora front, w prawo i w górę, używając wektora do liczenia "pionów" prostopadłych przy kamerze
  const forward = target.sub(cameraPos).normalize();
  const worldUp = new Vec3(0, 1, 0);
  const right = forward.cross(worldUp).normalize();
  const up = right.cross(forward);

  return { cameraPos, forward, right, up };
}

// ---------- Pętla renderująca (połączenie z warstwą graficzną strony www) ----------

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;
const SAMPLES = 4; // Używamy antyaliasingu (wygładzania), biorąc 4 nieco przesuniętę próbki na piksel w celu rozmazania brzydkich krawędzi

/**
 * Proces "rysowania" całego zdjęcia na podstawie promieni rzuconych w każdy jeden piksel matrycy
 */
function render(azimuth: number, elevation: number, distance: number) {
  const target = new Vec3(0, 0, -3); // Gdzie wlepiony jest nowy obiektyw kamery
  const { cameraPos, forward, right, up } = getCameraBasis(
    azimuth,
    elevation,
    distance,
    target,
  );

  // Skrypt iteruje przez każdą kropkę na ekranie 800x600 (sz/wys)
  for (let py = 0; py < 600; py++) {
    for (let px = 0; px < 800; px++) {
      const index = (py * canvas.width + px) * 4; // Oblicza współrzędne palety RGBA pikseli płótna canvas
      let colorSum = new Vec3(0, 0, 0);

      // Wielokrotne próbkowanie jednego piksela dla płynnych schodków
      for (let s = 0; s < SAMPLES; s++) {
        // Zjawisko wirtualnego przesuwania piksela minimalnie w górę, w dół, na boki dla złapania średniej barwy otoczenia
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

      // Wyliczanie uśrednionego ostatecznego koloru
      const finalColor = colorSum.scale(1 / SAMPLES);

      // Wpisanie barw w tablicę 8-bitową kolorów od 0 (czarny) do 255 (biały/jaskrawy)
      data[index] = 255 * finalColor.x;
      data[index + 1] = 255 * finalColor.y;
      data[index + 2] = 255 * finalColor.z;
      data[index + 3] = 255; // Całkowite zaczernienie alphy (kanał przeźroczystości jest pełny)
    }
  }

  // Finalne wypchnięcie wyników do obiektywu na stronę HTML
  ctx.putImageData(imageData, 0, 0);
}

render(0, 0.1, 5);

// Interakcja ze wskaźnikami DOM
const azimuthSlider = document.getElementById(
  "azimuthSlider",
) as HTMLInputElement;
const elevationSlider = document.getElementById(
  "elevationSlider",
) as HTMLInputElement;
const distanceSlider = document.getElementById(
  "distanceSlider",
) as HTMLInputElement;

// Odświeżanie renderingu w locie przy każdorazowym ruszeniu suwaka użytkownika
function updateFromSliders() {
  const azimuth = parseFloat(azimuthSlider.value);
  const elevation = parseFloat(elevationSlider.value);
  const distance = parseFloat(distanceSlider.value);
  render(azimuth, elevation, distance);
}

azimuthSlider.addEventListener("input", updateFromSliders);
elevationSlider.addEventListener("input", updateFromSliders);
distanceSlider.addEventListener("input", updateFromSliders);

updateFromSliders();
