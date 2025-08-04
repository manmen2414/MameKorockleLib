# Mameeenn Korockle Library
https://www.topman.co.jp/ky/download/Korockle/6530-010.html

わりと自分用なんでそんなに気にしないでください。
## つかいかた(Node.js)
- `git clone https://github.com/manmen2414/MameKorockleLib`
- `npm i`
```js
//Require
const korockleLib = require("./main/node");
//Import
import * as korockleLib from "./main/node.js";
```

## つかいかた(Web)
- `main`フォルダを持っていく
```html
<script src="YOUR_SCRIPT.js" type="module"></script>
```
```js
import * as korockleLib from "./main/node.js";
```

## 現在完成:
+ [NODE/WEB] HIDへのアクセス
+ [NODE/WEB] LED/音の出力
+ [NODE/WEB] 時間/アラームの設定
+ [NODE/WEB] 各種センサー情報の取得
+ [NODE/WEB] プログラムの書き込み/実行


## 実装予定:
+ [NODE/WEB] メロディーの書き込み/再生
+ [NODE/WEB] メロディーのコードの生成
+ [NODE/WEB] コードを音声形式に変換(不完全)

## 実装中止:
+ [NODE/WEB] プログラムの生成