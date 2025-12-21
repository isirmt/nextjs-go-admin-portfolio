export default async function backendApi(
  backendEndpoint: string,
  init?: RequestInit | undefined,
): Promise<Response> {
  return fetch(
    `/api/auth?api_url=${encodeURIComponent(backendEndpoint)}`,
    init,
  );
}
