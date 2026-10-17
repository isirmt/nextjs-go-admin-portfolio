export default async function backendApi(
  backendEndpoint: string,
  init?: RequestInit | undefined,
): Promise<Response> {
  return fetch(
    `/api/auth?api_url=${encodeURIComponent(backendEndpoint)}`,
    init,
  );
}

/**
 * Admin権限を優先し，ない場合は権限なしで呼び出し
 */
export async function fetchAdminOrPublic(
  backendEndpoint: string,
  publicEndpoint: string,
): Promise<Response> {
  let response = await backendApi(backendEndpoint);
  if (response.status === 401 || response.status === 403) {
    response = await fetch(publicEndpoint);
  }
  return response;
}
