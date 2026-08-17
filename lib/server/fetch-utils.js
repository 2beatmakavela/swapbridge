const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeout(resource, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWithRetry(resource, options = {}, retries = DEFAULT_RETRIES, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(resource, options, timeoutMs);
      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        const error = new Error(`HTTP ${response.status} ${response.statusText}${bodyText ? `: ${bodyText.slice(0, 500)}` : ''}`);
        error.status = response.status;
        throw error;
      }
      return response;
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > retries || error.name === 'AbortError') break;
      await sleep(250 * attempt);
    }
  }

  throw lastError;
}
