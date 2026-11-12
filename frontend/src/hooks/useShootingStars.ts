type MinMaxRange = { min: number; max: number };

type ShootingStarsOptions = {
  spawnInterval?: MinMaxRange;
  startArea?: {
    x: MinMaxRange;
    y: MinMaxRange;
  };
  angle?: MinMaxRange; // deg
  speed?: MinMaxRange;
  trail?: {
    length?: MinMaxRange;
    width?: MinMaxRange;
    color?: string;
  };
  sparkles?: {
    count?: MinMaxRange;
    spread?: number;
    size?: MinMaxRange;
    colors?: string[];
    colorVariation?: number;
    visibleDuration?: MinMaxRange;
    hiddenInterval?: MinMaxRange;
  };
  ambientStars?: {
    density?: number; // 1/10,000 px²
    size?: MinMaxRange;
    horizontalSpeed?: MinMaxRange;
    color?: string;
  };
};
