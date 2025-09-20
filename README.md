<h1 align="center">Mameeenn Korockle Library</h1>

## コロックルってなんやねん
https://www.topman.co.jp/ky/download/Korockle/6530-010.html
https://www.topman.co.jp/ky/download/Korockle/itm/itm_info/product-introduction.html

このライブラリはほぼ自分用なんで質低いと思います。
## つかいかた(Node.js)
- `git clone https://github.com/manmen2414/MameKorockleLib`
- `npm i`
```js
// Require
const korockleLib = require("./main/node");
// Import
import * as korockleLib from "./main/node.js";
```

## つかいかた(Web)
- `main`フォルダを持っていく
```html
<script src="YOUR_SCRIPT.js" type="module"></script>
```
```js
import * as korockleLib from "./main/web.js";
```

なお後方互換性とか全く考えてないのでアップデートは命取りになります。
<sub>申し訳ない</sub>


## コロックルを取得する
```js
const korockle = await korockleLib.Korockle.get();
```

## 各種操作
```js
// LED(0~10の値)
const red = new korockleLib.Color(10,0,0);
await korockle.led(red);
// LED(RGB)
const blueRGB = korockleLib.Color.fromRGB("0000ff");
await korockle.led(blueRGB);
// サウンド1
await korockle.sound(1);
// メロディー1回を3ノーツ目から再生
await korockle.melody("once",3);
// 時刻を10時に設定
await korockle.setTime(10,0);
// 現在時刻を設定
await korockle.setTimeNow();
// 現在時刻を設定(このタイミングでは書き込まず、時刻が0秒になったタイミングで書き込む)
await korockle.setTimeNow(true);
// センサー情報の取得
const sensors = await korockle.getInfo();
console.log(`Button: ${sensors.isButtonClicking}`)
console.log(`Temperature: ${sensors.temp}`)
```

## プログラム/メロディ
```js
// 何もしないプログラム
const programBytes = [1,2]
// プログラム書き込み
await korockle.writeProgram(programBytes);
// プログラム実行
await korockle.execute();
// プログラム停止
await korockle.stopProgram();

// ドの音を鳴らすメロディ
const melodyBytes = [ 4, 65, 0 ];
// メロディ書き込み
await korockle.writeMelody(programBytes);
// メロディ演奏
await korockle.melody("once");
// メロディ停止
await korockle.melody("stop");
```

## プログラムの作成
```js
import { KorockleProgram, LED, Sound } from "./programBuilder/export.js";
const program = new KorockleProgram()
  // メインルーチンの挙動
  .mainRoutine((main) =>
    // 開始ブロック
    main.start
      .setTo(new LED().setColor(10, 10, 10).setTime(1))
      .setTo(new Sound().setSound(1))
      // 終了ブロック
      .setTo(main.end)
);
// [ 1, 2, 23, 5, 10, 36, 7, 2 ]
const programByte = program.build();
```

## メロディの作成
```js
const {MelodyBuilder, Note, NOTE_SCALES, BPMS, NOTE_LENGTHS} = korockleLib;
const melody = new MelodyBuilder(BPMS[120])
// 1拍分のド
melody.addNoteV(NOTE_SCALES.DO, NOTE_LENGTHS.FOUR)
// 0.5拍分のレ
melody.addNote(new Note(NOTE_SCALES.RE, NOTE_LENGTHS.EIGHT))
// 0.5拍分の休み
melody.addNoteV(NOTE_SCALES.REST, NOTE_LENGTHS.EIGHT)
// 2拍分のミ
melody.addNoteV(NOTE_SCALES.MI, NOTE_LENGTHS.TWO)
// ビルド
const melodyByte = melody.build();
```

## ライセンス
一応MIT。

問題があったら消えるかもしれない。