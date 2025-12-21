export const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`key ${key} is required.`);
  }
  return value;
};
