export function getBuildMeta() {
  return {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
  };
}

