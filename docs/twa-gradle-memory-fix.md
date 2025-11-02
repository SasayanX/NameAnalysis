# TWA Gradle メモリエラー対処法

## 問題

`bubblewrap build`実行時に以下のエラーが発生：

```
Error occurred during initialization of VM
Could not reserve enough space for 1572864KB object heap
```

## 原因

Gradleデーモンのメモリ割り当てが不足している。`gradle.properties`の`org.gradle.jvmargs`が`-Xmx1536m`（1536MB）に設定されているが、システムの利用可能メモリが不足している。

## 解決策

`twa/gradle.properties`のメモリ設定を削減：

```properties
org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m
```

## 注意事項

⚠️ **`bubblewrap update`を実行すると`gradle.properties`が上書きされる可能性があります。**

`bubblewrap update`実行後は、必ずメモリ設定を確認・修正してください。

## 手動修正手順

1. `twa/gradle.properties`を開く
2. `org.gradle.jvmargs=-Xmx1536m`を`org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m`に変更
3. Gradleデーモンを停止: `.\gradlew.bat --stop`
4. 再度ビルドを実行: `bubblewrap build`

## 代替案

もし512MBでもビルドが失敗する場合は、さらに削減：

```properties
org.gradle.jvmargs=-Xmx384m -XX:MaxMetaspaceSize=384m
```

または、より多くのメモリが利用可能な場合は、少し増やす：

```properties
org.gradle.jvmargs=-Xmx768m -XX:MaxMetaspaceSize=512m
```

