/** 内部プロパティキー（ユーザー編集不可） */
export const INTERNAL_PROPERTY_KEYS = new Set(['_id', 'drawMode'])

/** 内部キーを除いたユーザープロパティを返す */
export function getUserProperties(
  properties: GeoJSON.GeoJsonProperties,
): Record<string, string> {
  if (!properties) return {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (!INTERNAL_PROPERTY_KEYS.has(key)) {
      result[key] = String(value ?? '')
    }
  }
  return result
}

/** 内部キーを保持しつつユーザープロパティをマージする */
export function mergeUserProperties(
  existing: GeoJSON.GeoJsonProperties,
  userProps: Record<string, string>,
): Record<string, string> {
  const internal: Record<string, string> = {}
  if (existing) {
    for (const key of INTERNAL_PROPERTY_KEYS) {
      if (key in existing) {
        internal[key] = existing[key] as string
      }
    }
  }
  return { ...internal, ...userProps }
}

/** プロパティキーのバリデーション */
export function validatePropertyKey(
  key: string,
  existingKeys: string[],
): string | null {
  const trimmed = key.trim()
  if (trimmed === '') return 'キーを入力してください'
  if (INTERNAL_PROPERTY_KEYS.has(trimmed)) return '予約済みキーです'
  if (existingKeys.includes(trimmed)) return '既に存在するキーです'
  return null
}
