export type MinMaxRange = { min: number; max: number };

export type ResolvedShootingStarsOptions = {
  spawnInterval: MinMaxRange;
  startArea: { x: MinMaxRange; y: MinMaxRange };
  angle: MinMaxRange;
  speed: MinMaxRange;
  trail: { length: MinMaxRange; width: MinMaxRange; color: string };
  sparkles: {
    count: MinMaxRange;
    spread: number;
    size: MinMaxRange;
    colors: string[];
    visibleDuration: MinMaxRange;
    hiddenInterval: MinMaxRange;
  };
  ambientStars: {
    density: number;
    size: MinMaxRange;
    horizontalSpeed: MinMaxRange;
    color: string;
  };
};

type OptionalGroups<T, K extends keyof T> = Partial<Omit<T, K>> & {
  [P in K]?: Partial<T[P]>;
};

export type ShootingStarsOptions = OptionalGroups<
  ResolvedShootingStarsOptions,
  "trail" | "sparkles" | "ambientStars"
> & { initialElapsed?: number };

export const DEFAULT_SHOOTING_STARS_OPTIONS: ResolvedShootingStarsOptions = {
  spawnInterval: { min: 700, max: 1100 },
  startArea: {
    x: { min: -2.0, max: 0.8 },
    y: { min: -0.3, max: 0.0 },
  },
  angle: { min: 25, max: 25 },
  speed: { min: 60, max: 120 },
  trail: {
    length: { min: 70, max: 150 },
    width: { min: 3, max: 6 },
    color: "#ffffff",
  },
  sparkles: {
    count: { min: 3, max: 7 },
    spread: 70,
    size: { min: 7, max: 20 },
    colors: ["#ffffff", "#ffe6a7", "#ffc6dc", "#bdefff"],
    visibleDuration: { min: 1000, max: 1700 },
    hiddenInterval: { min: 1000, max: 2500 },
  },
  ambientStars: {
    density: 5,
    size: { min: 1, max: 3 },
    horizontalSpeed: { min: 4, max: 12 },
    color: "#ffffff",
  },
};

export function resolveShootingStarsOptions(
  options: ShootingStarsOptions,
): ResolvedShootingStarsOptions {
  const defaults = DEFAULT_SHOOTING_STARS_OPTIONS;
  return {
    spawnInterval: options.spawnInterval ?? defaults.spawnInterval,
    startArea: options.startArea ?? defaults.startArea,
    angle: options.angle ?? defaults.angle,
    speed: options.speed ?? defaults.speed,
    trail: { ...defaults.trail, ...options.trail },
    sparkles: { ...defaults.sparkles, ...options.sparkles },
    ambientStars: { ...defaults.ambientStars, ...options.ambientStars },
  };
}

function random(range: MinMaxRange): number {
  return range.min + Math.random() * (range.max - range.min);
}

function randomCount(range: MinMaxRange): number {
  const min = Math.ceil(range.min);
  const max = Math.floor(range.max);
  return max < min ? 0 : min + Math.floor(Math.random() * (max - min + 1));
}

function transparentTrailColor(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return `${color}00`;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [r, g, b] = color.slice(1);
    return `#${r}${r}${g}${g}${b}${b}00`;
  }
  return "#ffffff00";
}

export class Sparkle {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly size: number;
  readonly color: string;
  private visible = false;
  private elapsed = 0;
  private duration: number;

  constructor(
    private readonly options: ResolvedShootingStarsOptions["sparkles"],
  ) {
    this.offsetX = (Math.random() * 2 - 1) * options.spread;
    this.offsetY = (Math.random() * 2 - 1) * options.spread;
    this.size = random(options.size);
    const base =
      options.colors[Math.floor(Math.random() * options.colors.length)] ??
      "#ffffff";
    this.color = base;
    this.duration = random(options.hiddenInterval);
  }

  update(deltaMs: number): void {
    this.elapsed += deltaMs;
    if (this.elapsed < this.duration) return;
    this.visible = !this.visible;
    this.elapsed = 0;
    this.duration = random(
      this.visible ? this.options.visibleDuration : this.options.hiddenInterval,
    );
  }

  draw(context: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.visible || this.duration <= 0) return;
    const opacity = Math.sin(
      Math.min(1, this.elapsed / this.duration) * Math.PI,
    );
    const centerX = x + this.offsetX;
    const centerY = y + this.offsetY;
    const width = this.size * 0.65;
    const height = this.size;
    const left = centerX - width / 2;
    const top = centerY - height / 2;
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = this.size * 0.8;
    context.beginPath();
    context.moveTo(left + width * 0.5, top);
    context.bezierCurveTo(
      left + width * 0.525,
      top + height * 0.275,
      left + width * 0.625,
      top + height * 0.425,
      left + width,
      top + height * 0.5,
    );
    context.bezierCurveTo(
      left + width * 0.625,
      top + height * 0.575,
      left + width * 0.525,
      top + height * 0.725,
      left + width * 0.5,
      top + height,
    );
    context.bezierCurveTo(
      left + width * 0.475,
      top + height * 0.725,
      left + width * 0.375,
      top + height * 0.575,
      left,
      top + height * 0.5,
    );
    context.bezierCurveTo(
      left + width * 0.375,
      top + height * 0.425,
      left + width * 0.475,
      top + height * 0.275,
      left + width * 0.5,
      top,
    );
    context.closePath();
    context.fill();
    context.restore();
  }
}

export class ShootingStar {
  readonly id: number;
  readonly directionX: number;
  readonly directionY: number;
  readonly trailLength: number;
  readonly trailWidth: number;
  readonly sparkles: Sparkle[];
  x: number;
  y: number;
  speed: number;
  color: string;

  constructor(
    id: number,
    width: number,
    height: number,
    options: ResolvedShootingStarsOptions,
  ) {
    this.id = id;
    this.x = random(options.startArea.x) * width;
    this.y = random(options.startArea.y) * height;
    const angle = (random(options.angle) * Math.PI) / 180;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.speed = random(options.speed);
    this.trailLength = random(options.trail.length);
    this.trailWidth = random(options.trail.width);
    this.color = options.trail.color;
    this.sparkles = Array.from(
      { length: randomCount(options.sparkles.count) },
      () => new Sparkle(options.sparkles),
    );
  }

  update(deltaMs: number): void {
    this.x += (this.directionX * this.speed * deltaMs) / 1000;
    this.y += (this.directionY * this.speed * deltaMs) / 1000;
    for (const sparkle of this.sparkles) sparkle.update(deltaMs);
  }

  draw(context: CanvasRenderingContext2D): void {
    const tailX = this.x - this.directionX * this.trailLength;
    const tailY = this.y - this.directionY * this.trailLength;
    const gradient = context.createLinearGradient(tailX, tailY, this.x, this.y);
    gradient.addColorStop(0, transparentTrailColor(this.color));
    gradient.addColorStop(1, this.color);
    context.strokeStyle = gradient;
    context.lineWidth = this.trailWidth;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(this.x, this.y);
    context.stroke();
    for (const sparkle of this.sparkles) sparkle.draw(context, this.x, this.y);
  }

  isOutside(width: number, height: number, spread: number): boolean {
    const margin = this.trailLength + spread;
    return (
      (this.directionX >= 0 ? this.x > width + margin : this.x < -margin) ||
      (this.directionY >= 0 ? this.y > height + margin : this.y < -margin)
    );
  }

  isVisible(width: number, height: number, spread: number): boolean {
    const margin = this.trailLength + spread;
    return (
      this.x >= -margin &&
      this.x <= width + margin &&
      this.y >= -margin &&
      this.y <= height + margin
    );
  }
}

class AmbientStar {
  x: number;
  y: number;
  readonly size: number;
  readonly speedX: number;

  constructor(
    width: number,
    height: number,
    options: ResolvedShootingStarsOptions["ambientStars"],
  ) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.max(1, Math.round(random(options.size)));
    this.speedX = random(options.horizontalSpeed);
  }

  update(deltaMs: number, width: number): void {
    this.x += (this.speedX * deltaMs) / 1000;
    if (this.x > width + this.size) this.x = -this.size;
    if (this.x < -this.size) this.x = width + this.size;
  }

  draw(context: CanvasRenderingContext2D, sprite: HTMLCanvasElement): void {
    context.drawImage(
      sprite,
      this.x - sprite.width / 2,
      this.y - sprite.height / 2,
    );
  }
}

function createAmbientSprite(size: number, color: string): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = size + 16;
  sprite.height = size + 16;
  const context = sprite.getContext("2d");
  if (context) {
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 4;
    context.beginPath();
    context.arc(sprite.width / 2, sprite.height / 2, size / 2, 0, Math.PI * 2);
    context.fill();
  }
  return sprite;
}

export class ShootingStarsScene {
  readonly stars = new Map<number, ShootingStar>();
  private ambientStars: AmbientStar[] = [];
  private ambientSprites = new Map<number, HTMLCanvasElement>();
  private nextId = 1;
  private timeUntilSpawn: number;
  private width = 0;
  private height = 0;

  constructor(private readonly options: ResolvedShootingStarsOptions) {
    this.timeUntilSpawn = random(options.spawnInterval);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    const count = Math.max(
      0,
      Math.round(
        ((width * height) / 10_000) * this.options.ambientStars.density,
      ),
    );
    while (this.ambientStars.length < count) {
      this.ambientStars.push(
        new AmbientStar(width, height, this.options.ambientStars),
      );
    }
    this.ambientStars.length = count;
  }

  spawn(): ShootingStar | null {
    if (this.width <= 0 || this.height <= 0) return null;
    const star = new ShootingStar(
      this.nextId++,
      this.width,
      this.height,
      this.options,
    );
    this.stars.set(star.id, star);
    return star;
  }

  prewarm(durationMs: number): void {
    for (let elapsed = 0; elapsed < durationMs; elapsed += 50) {
      this.update(Math.min(50, durationMs - elapsed));
    }
  }

  update(deltaMs: number): void {
    if (this.width <= 0 || this.height <= 0) return;
    this.timeUntilSpawn -= deltaMs;
    if (this.timeUntilSpawn <= 0) {
      this.spawn();
      this.timeUntilSpawn = Math.max(1, random(this.options.spawnInterval));
    }
    for (const ambient of this.ambientStars)
      ambient.update(deltaMs, this.width);
    for (const [id, star] of this.stars) {
      star.update(deltaMs);
      if (star.isOutside(this.width, this.height, this.options.sparkles.spread))
        this.stars.delete(id);
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, this.width, this.height);
    for (const ambient of this.ambientStars) {
      let sprite = this.ambientSprites.get(ambient.size);
      if (!sprite) {
        sprite = createAmbientSprite(
          ambient.size,
          this.options.ambientStars.color,
        );
        this.ambientSprites.set(ambient.size, sprite);
      }
      ambient.draw(context, sprite);
    }
    for (const star of this.stars.values()) {
      if (
        star.isVisible(this.width, this.height, this.options.sparkles.spread)
      ) {
        star.draw(context);
      }
    }
  }
}
