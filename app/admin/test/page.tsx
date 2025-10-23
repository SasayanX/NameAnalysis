"use client";

import React from 'react';

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">テストページ</h1>
      <p className="text-muted-foreground">管理者ダッシュボードのテスト</p>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">漢字データ拡充システム</h2>
        <p>システムが正常に動作しているかテストします。</p>
        
        <div className="mt-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {
              fetch('/api/admin/kanji-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk-import' })
              })
              .then(response => response.json())
              .then(data => {
                alert(`インポート結果: ${JSON.stringify(data)}`);
              })
              .catch(error => {
                alert(`エラー: ${error}`);
              });
            }}
          >
            一括インポートテスト
          </button>
        </div>
      </div>
    </div>
  );
}
