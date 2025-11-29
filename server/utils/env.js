export function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return process.env.PRODUCTION_URL;
  }
  return process.env.LOCAL_URL;
}
