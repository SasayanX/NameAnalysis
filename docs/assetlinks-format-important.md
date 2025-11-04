# assetlinks.json 形式の重要ポイント

## 重要: SHA-256フィンガープリントの形式

**assetlinks.jsonでは、SHA-256フィンガープリントはコロンなしの形式が必要です。**

### ❌ 間違った形式（コロン区切り）
```json
"AB:6E:FC:1C:C4:B1:BB:B3:76:B4:D4:F6:14:BA:E0:7A:FE:CC:87:AF:CF:64:C4:FC:DF:AE:D2:73:25:79:AA:54"
```

### ✅ 正しい形式（コロンなし）
```json
"AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54"
```

## 変換方法

コロン区切り形式からコロンなし形式への変換:
1. すべてのコロン（`:`）を削除
2. 大文字小文字はそのまま（通常は大文字）

**例:**
```
AB:6E:FC:1C:C4:B1:BB:B3:76:B4:D4:F6:14:BA:E0:7A:FE:CC:87:AF:CF:64:C4:FC:DF:AE:D2:73:25:79:AA:54
↓
AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54
```

## 現在のファイル

現在の`public/.well-known/assetlinks.json`と`app/.well-known/assetlinks.json/route.ts`は、既に正しい形式（コロンなし）になっています。

もしGoogle Play Consoleから提供された形式がコロン区切りの場合、必ずコロンなしに変換してから使用してください。

