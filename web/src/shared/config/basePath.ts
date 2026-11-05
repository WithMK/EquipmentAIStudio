/** One path contract for Vite assets and BrowserRouter. No external URLs. */
export function normalizeBasePath(value = '/') {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*\/?$/.test(value))
    throw new Error('Base path must be an absolute local path such as / or /studio/.');
  return value === '/' ? '/' : `${value.replace(/\/$/, '')}/`;
}
