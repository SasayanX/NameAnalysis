// Service Workerとスクリプトの検証
export function validateScripts() {
  // Service Worker登録スクリプトの検証
  const swScript = `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('SW registered: ', registration);
          })
          .catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  `

  try {
    new Function(swScript)
    console.log("✅ Service Worker script syntax is valid")
  } catch (error) {
    console.error("❌ Service Worker script has syntax error:", error)
  }
}

// 動的スクリプト生成の安全な関数
export function createSafeScript(code: string): string {
  // 括弧の対応をチェック
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length

  if (openParens !== closeParens) {
    console.warn("⚠️ Parentheses mismatch detected in script")
    return `console.error('Script syntax error: parentheses mismatch');`
  }

  // 基本的な構文チェック
  try {
    new Function(code)
    return code
  } catch (error) {
    console.error("Script syntax error:", error)
    return `console.error('Script execution prevented due to syntax error');`
  }
}
