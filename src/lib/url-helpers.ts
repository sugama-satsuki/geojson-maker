const URL_PARAM = 'data'

/** URL が長すぎる可能性があると判断する文字数の閾値 */
export const URL_SIZE_WARNING_CHARS = 4000

/** FeatureCollection を Base64 文字列にエンコードする（純粋関数） */
export function featuresToBase64(features: GeoJSON.FeatureCollection): string {
  const json = JSON.stringify(features)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

/** Base64 文字列を FeatureCollection に復元する。失敗時は null を返す（純粋関数） */
export function base64ToFeatures(base64: string): GeoJSON.FeatureCollection | null {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    if (parsed?.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return parsed as GeoJSON.FeatureCollection
    }
    return null
  } catch {
    return null
  }
}

/** FeatureCollection を Base64 エンコードして共有 URL を生成する */
export function encodeFeaturesToURL(features: GeoJSON.FeatureCollection): string {
  const base64 = featuresToBase64(features)
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(URL_PARAM, base64)
  return url.toString()
}

/** URL の `?data=` パラメータから FeatureCollection を復元する。失敗時は null を返す */
export function decodeURLToFeatures(): GeoJSON.FeatureCollection | null {
  const params = new URLSearchParams(window.location.search)
  const base64 = params.get(URL_PARAM)
  if (!base64) return null
  return base64ToFeatures(base64)
}
