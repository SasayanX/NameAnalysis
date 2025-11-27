/**
 * 環境変数のサイズをチェックし、Netlify Functionsの4KB制限を超えていないか確認
 */

const env = process.env;
let total = 0;
const envSizes = [];

// 各環境変数のサイズを計算
for (const [key, value] of Object.entries(env)) {
  const keySize = Buffer.byteLength(key, 'utf8');
  const valueSize = Buffer.byteLength(String(value || ''), 'utf8');
  const size = keySize + valueSize;
  
  total += size;
  
  // カスタム環境変数（CI/CD標準変数を除外）のみを記録
  if (!key.startsWith('npm_') && 
      !key.startsWith('NODE_') && 
      !key.startsWith('CI_') && 
      !key.startsWith('NETLIFY_') &&
      key !== 'PATH' &&
      key !== 'PWD' &&
      key !== 'HOME' &&
      key !== 'USER' &&
      key !== 'SHELL' &&
      key !== 'LANG' &&
      key !== 'TERM') {
    envSizes.push({ key, size, valueLength: String(value || '').length });
  }
}

console.log('='.repeat(60));
console.log('環境変数サイズチェック');
console.log('='.repeat(60));
console.log(`総合計: ${total} バイト (制限: 4096 バイト)`);
console.log('');

// サイズの大きい順にソート
envSizes.sort((a, b) => b.size - a.size);

// 上位10個を表示
console.log('大きい環境変数 TOP 10:');
console.log('-'.repeat(60));
envSizes.slice(0, 10).forEach((item, index) => {
  console.log(`${index + 1}. ${item.key}`);
  console.log(`   サイズ: ${item.size} バイト (値の長さ: ${item.valueLength} 文字)`);
});
console.log('');

// 1KB以上の環境変数を警告
const largeVars = envSizes.filter(item => item.size > 1024);
if (largeVars.length > 0) {
  console.log('⚠️  1KB以上の大きな環境変数:');
  console.log('-'.repeat(60));
  largeVars.forEach(item => {
    console.log(`- ${item.key}: ${item.size} バイト`);
  });
  console.log('');
  console.log('推奨: これらの環境変数を外部シークレットストアに移動するか、');
  console.log('      ファイルパスを使用して値をファイルから読み込むようにしてください。');
  console.log('');
}

// 制限を超えている場合はエラー
if (total > 4096) {
  console.error('❌ エラー: 環境変数の総サイズが4KB制限を超えています！');
  console.error(`   現在: ${total} バイト`);
  console.error(`   制限: 4096 バイト`);
  console.error(`   超過: ${total - 4096} バイト`);
  console.error('');
  console.error('対処方法:');
  console.error('1. 大きな環境変数（特にJSON）を削除または短縮');
  console.error('2. ファイルパスを使用（例: FIREBASE_SERVICE_ACCOUNT_KEY_PATH）');
  console.error('3. 外部シークレットストア（AWS Secrets Manager等）を使用');
  process.exit(1);
}

console.log('✅ OK: 環境変数のサイズは制限内です');
console.log('='.repeat(60));

