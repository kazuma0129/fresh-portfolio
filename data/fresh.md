[fresh](https://github.com/denoland/fresh/) という deno で web アプリ|サイトが作れるライブラリがメジャーリリースされたらしいというのを知り、fresh を触りたいがために自分の portfolio サイトを作り直した。このサイトがそう

## 雑な経緯

- Vue3 系への移行で消耗した
- Vuetify から解放されたい
- React 触りたい
- Deno 触りたい
- Deno deploy したい
- リポジトリのコミットログで絵文字を使うのがしんどくなってきた、ので新しくしたい

作り直す前のはこんな感じ: https://github.com/kazuma0129/nuxt-portfolio

最初は Vue2.x で作り始めて、途中で Nuxt2.x に移行して、最終的に Nuxt3.x に成り果てていた。Vue2.x から Vue3.x への移行が結構しんどかった。
ref: https://github.com/kazuma0129/nuxt-portfolio/pull/26

サイトはペライチだから Vue でもええやんって自分でも思うけども、技術ブログをモノレポでやりたいと思っていた時期もあったりなかったりしたので Nuxt に移行したと思います。

## fresh にして超個人的に良かったポイント

- prettier,eslint からの解放
- 「TypeScript で書くぞ！」を意識しなくていい
- deno deploy 最高だな

### prettier,eslint からの解放

deno にはビルトインで formatter と linter がついてくるので、わざわざ prettier や eslint をインストールしなくても良い。最高だ。プロジェクトをイニシャライズしたその瞬間から formatter の恩恵を受けられる。deno の福利厚生ですね。

###　「TypeScript で書くぞ！」を意識しなくて良い

公式もこうおっしゃっています。👇

https://deno-ja.vercel.app/manual@v1.8.3/typescript/configuration

> TypeScript には設定可能なオプションが用意されていますが、Deno は Deno で TypeScript を簡単に使えるように努力しています。多くのオプションがあるとその目的は難しくなります。これを簡単にするために Deno は TypeScript を "ただ動く" ように設定し、追加の設定は必要ないようにしています。

最高ですね。ありがとうございます。その通りです。リポジトリには tsconfig を置いていません。

### deno deploy 最高だな

もう全部これでええやんと思いました。

deno deploy のサイト https://deno.com/deploy で GitHub のアカウントと連携してリポジトリ指定するだけでした。

前は firebase hosting にデプロイしていました。firebase も良かったのですが、deno deploy の方が体験が良かったです。master へのコミットをトリガーにデプロイする GitHub Actions もぽちぽちして簡単に設定できたので良かったです。firebase hosting を結構使っていたときは手動で firebase deploy してたりだった（パイプライン張るのがめんどくさかった）ので、この辺いい感じになったのは嬉しいです。

あと、カスタムドメインの設定とかも簡単でした。deno deploy のサイトがシンプルでとにかくめっちゃ良い。

## fresh にこれが欲しい

- レイアウト
- ドキュメント

### レイアウト

検討中みたいですね。ref: https://github.com/denoland/fresh/issues/491#issuecomment-1181769820

とはいえ欲しいので、ドキュメント化されていないですが力技で実装できるみたいです。

https://github.com/denoland/fresh/pull/494 で指摘されているように、fresh では暗黙的に `routes/_app.tsx` を読むらしく、これをいい感じにハックすることで routes 毎に任意のレイアウトを適用したりすることも可能みたいです。

ちなみに、このサイトではダークモードを実装するために上記を利用し、`<body>`にアクセスしてクラスを追加してます。

### ドキュメント

上で少し触れましたが、挙動について文書化されていないものがあったりするみたいです。`_app.tsx`とかドキュメントに無かったですもんね。。。

## 以後

素人目で見てみて、作りやすくて軽くて使いやすいしシンプルだしロゴが可愛いので今後にも期待
