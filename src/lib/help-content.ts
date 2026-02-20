/** ヘルプガイドの1項目 */
export type HelpItem = {
  label: string
  description: string
  shortcut?: string
}

/** ヘルプガイドのセクション */
export type HelpSection = {
  title: string
  items: HelpItem[]
}

/** 全セクションのコンテンツ定義 */
export const HELP_SECTIONS: HelpSection[] = [
  {
    title: '描画モード',
    items: [
      { label: 'ポイント', description: '地図をクリックしてポイントを配置します' },
      { label: 'ライン', description: '地図を複数回クリックして線を描画し、✓ ボタンで確定します（最低2点）' },
      { label: 'ポリゴン', description: '地図を複数回クリックして図形を描画し、✓ ボタンで確定します（最低3点）' },
      { label: 'シンボル', description: '強調スタイルのポイントを配置します' },
    ],
  },
  {
    title: '選択・編集',
    items: [
      { label: 'フィーチャ選択', description: '地図上のフィーチャをクリックすると選択（ハイライト）されます' },
      { label: 'マルチ選択', description: 'Shift+クリックで複数のフィーチャを追加選択できます' },
      { label: 'ラバーバンド選択', description: '描画モードなしの状態で地図上をドラッグすると、範囲内のフィーチャを一括選択できます' },
      { label: '頂点編集', description: 'ライン/ポリゴンを選択すると頂点が点で表示され、ドラッグして位置を変更できます' },
      { label: '削除', description: 'フィーチャを選択して削除ボタン（🗑）をクリックすると削除されます。複数選択時は一括削除です' },
    ],
  },
  {
    title: '操作・ショートカット',
    items: [
      { label: '元に戻す', description: '直前のフィーチャ追加・削除・編集を取り消します', shortcut: 'Ctrl+Z' },
      { label: 'やり直す', description: '取り消した操作をやり直します', shortcut: 'Ctrl+Shift+Z' },
      { label: 'URL共有', description: 'URLをクリップボードにコピーします。そのURLを開くと現在のデータが復元されます' },
      { label: 'リセット', description: 'すべてのフィーチャを削除して初期状態に戻します' },
    ],
  },
  {
    title: 'インポート / エクスポート',
    items: [
      { label: 'CSVインポート', description: 'lat/lng/latitude/longitude/緯度/経度 列を含む CSV ファイルからポイントを一括インポートします' },
      { label: 'GeoJSONインポート', description: 'GeoJSON ファイル（FeatureCollection / Feature）をインポートします。既存データの置換かマージを選択できます' },
      { label: 'GeoJSONコピー', description: '現在の GeoJSON をクリップボードにコピーします' },
      { label: 'GeoJSONダウンロード', description: '現在の GeoJSON をファイルとしてダウンロードします' },
    ],
  },
]

/**
 * ショートカット文字列を OS に合わせてフォーマットする
 * Mac の場合: Ctrl → ⌘、Shift → ⇧、Alt → ⌥ に変換し「+」を除去
 * Windows/Linux の場合: そのまま返す
 */
export function formatShortcut(shortcut: string, isMac: boolean): string {
  if (!isMac) return shortcut
  return shortcut
    .replace('Ctrl', '⌘')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace(/\+/g, '')
}

/**
 * 現在の OS に合わせたキーボードショートカット一覧を返す
 */
export function getShortcutItems(isMac: boolean): HelpItem[] {
  return [
    {
      label: '元に戻す',
      description: '直前の操作を取り消します',
      shortcut: formatShortcut('Ctrl+Z', isMac),
    },
    {
      label: 'やり直す',
      description: '取り消した操作をやり直します',
      shortcut: formatShortcut('Ctrl+Shift+Z', isMac),
    },
  ]
}
