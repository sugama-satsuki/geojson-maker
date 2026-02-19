# CLAUDE.md

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

## PR 作成

- タイトルは短く（70 文字以内）
- body に `## Summary`（箇条書き）と `## Test plan`（チェックリスト）を含める
- `gh pr create` で作成
- **E2E テスト実行後、結果のスクリーンショットを PR コメントに貼り付ける**

## 問題が起きたら

- テストが落ちたら原因を調査し、修正してから再コミット
- CI で問題が起きたらブランチを切って修正し、PR → CI パス → マージ の流れで対応
- コンフリクトが発生したブランチは `git merge origin/main` で解消し、テスト全パスを確認してからプッシュ

# Global Rules

- Do NOT include `Co-Authored-By` lines in commit messages.
- Do NOT open pull requests unless explicitly instructed to do so.
- **Always work in a git worktree** — never work directly in the main worktree. Create a new worktree under `.worktrees/` before making any changes:
  ```bash
  git worktree add .worktrees/<repo>-<branch-name> -b <branch-name>
  cd .worktrees/<repo>-<branch-name>
  ```
- **Always verify CI passes before pushing** — run lint, build, and tests before `git push`.
- **Never push directly to main/master** — always work on a feature branch and push that branch.
- **Run `npm install` after creating a worktree** — worktrees do not share `node_modules`.
