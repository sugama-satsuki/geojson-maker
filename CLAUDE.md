# CLAUDE.md

## プロジェクト概要

GeoJSON Maker — MapLibre GL (Geolonia) を使った GeoJSON 作図 Web アプリ。
React + TypeScript + Vite。

## コマンド

- `npm run dev` — 開発サーバ起動
- `npm run build` — プロダクションビルド
- `npm test` — ユニットテスト (Vitest)
- `npm run test:coverage` — カバレッジ付きユニットテスト
- `npm run test:e2e` — E2E テスト (Cucumber + Playwright, headless)
- `npm run test:e2e:headed` — E2E テスト (ブラウザ表示あり)
- `npm run lint` — ESLint

## ブランチ運用

- 機能追加・バグ修正は必ず **main から新しいブランチ** を切って作業する
- ブランチ命名: `feature/機能名`, `fix/修正内容`, `refactor/対象`
- main への直接コミットは禁止

## 実装フロー

1. main から新ブランチを作成
2. 実装
3. **ユニットテスト (`npm test`) とE2Eテスト (`npm run test:e2e`) を両方パスさせてからコミット**
4. プッシュして PR を作成
5. CI (GitHub Actions E2E) がパスしたことを確認
6. main にマージ

## テストのルール

### ユニットテスト

- 新しい関数・ユーティリティには必ずユニットテストを書く
- テストファイルは `src/lib/__tests__/` に配置
- `createPointFeature` / `createPathFeature` は `_id` プロパティを含むので、テストでは `expect.stringMatching(/^f-\d+$/)` でパターンマッチする

### E2E テスト

- Cucumber.js + Playwright で日本語 Gherkin シナリオ
- feature ファイルは `e2e/features/` に配置
- ステップ定義は `e2e/step-definitions/` に配置
- **新しい UI 操作を追加したら、対応する E2E シナリオも追加する**
- MapLibre のクリックは `clickMapAtOffset()` ヘルパーを使う（mouse.move → mousedown → mouseup パターンで SwiftShader 対応）
- CI では `page.route()` でベースマップスタイルを空に差し替え、タイル描画をスキップしている（SwiftShader 環境の高速化）

## コミットメッセージ

- 日本語で記述
- 1行目に変更の要約、必要に応じて空行の後に詳細
- 末尾に `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` を付与

## PR 作成

- タイトルは短く（70 文字以内）
- body に `## Summary`（箇条書き）と `## Test plan`（チェックリスト）を含める
- `gh pr create` で作成
- **E2E テスト実行後、結果のスクリーンショットを PR コメントに貼り付ける**

## 問題が起きたら

- テストが落ちたら原因を調査し、修正してから再コミット
- CI で問題が起きたらブランチを切って修正し、PR → CI パス → マージ の流れで対応
- コンフリクトが発生したブランチは `git merge origin/main` で解消し、テスト全パスを確認してからプッシュ

## アーキテクチャ

- `src/components/` — React コンポーネント (`.tsx` + `.css`)
- `src/hooks/` — カスタムフック (`useGeoloniaMap`)
- `src/lib/` — 純粋関数ユーティリティ
- `e2e/` — E2E テスト一式
- `.github/workflows/` — CI 設定

### MapLibre ソース構成

| ソース ID | 用途 |
|-----------|------|
| `geojson-maker-generated-features` | 確定済みフィーチャ |
| `geojson-maker-draft` | ドラフトプレビュー |
| `geojson-maker-highlight` | 選択ハイライト |
