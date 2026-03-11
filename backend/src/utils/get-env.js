export const getEnv = (key, defaultValue) => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} not set`);
    }
    return defaultValue;
  }

  return value;
};
