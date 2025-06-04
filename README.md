# ① 課題名

Claude Code Action で Trello 風タスク管理アプリ開発

## ② 課題内容（どんな作品か）

- Trello 風タスク管理アプリ
- Claude Code Action の技術検証を目的として Claude Code Action のみで実装。
- Claude Code Action は、GitHub Actions で GitHub 上の Issue や PR で@claude とメンションし、開発タスクを Claude Code に依頼できる自律型 AI コーディングエージェント。5/22 に開催された、Anthropic の開発者向けイベント Code with Claude で発表された機能で、AI コーディング界隈で今最も注目を浴びている技術の一つ。

## ③ アプリのデプロイ URL

- https://gs-t-sat-11.github.io/lesson03_assignment/
- アプリよりどちらかというと Issue や PR のやりとりのほうが大事なのでリンク貼っておきます。
  - https://github.com/gs-t-sat-11/lesson03_assignment/issues?q=is%3Aissue%20state%3Aclosed
  - https://github.com/gs-t-sat-11/lesson03_assignment/pulls?q=is%3Apr+is%3Aclosed

## ④ アプリのログイン用 ID または Password（ある場合）

- なし

## ⑤ 工夫した点・こだわった点

- Claude Code Action のみで実装した点

## ⑥ 難しかった点・次回トライしたいこと（又は機能）

- Claude API の使用料金が痛いので、MAX プランで使用するのが公式で OK かどうかを調べた上で、MAX プランでの設定をしてみる。

## ⑦ フリー項目（感想、シェアしたいこと等なんでも）

- 自律型 AI コーディングエージェントを初めて触ったが、非常に使用感が良かった。おそらく Claude 4 のコーディング性能によるところも大きいと思う。
- Vibe Coding 時に、依頼の際に 1 回 1 回コミットが残るので、AI が誤って破壊的な修正を行った時に戻りやすいのも良い点。
- 大規模プロジェクトなどで並列して使用するのは良さそうだが、小規模だとコンフリクトする懸念があるため Claude Code や Cursor を使う方がよいかも。

## ⑧ 参考資料

- [Claude Code Action の使い方](https://zenn.dev/acntechjp/articles/3f361da473eac8)
