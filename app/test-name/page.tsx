"use client";

import React, { useState } from 'react';

export default function TestNamePage() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    try {
      // 未対応漢字のテスト用
      const testName = lastName + firstName;
      console.log('テスト名前:', testName);
      
      // フィードバックAPIをテスト
      const response = await fetch('/api/kanji-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: testName,
          userInput: testName,
          suggestedStrokeCount: 0,
          suggestedReading: '',
          isOldForm: false
        })
      });
      
      const data = await response.json();
      setResult(data);
      
    } catch (error) {
      console.error('エラー:', error);
      setResult({ error: error.message });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">姓名判断テスト</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">姓</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="例: 哉田"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">名</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="例: 哉太"
          />
        </div>
        
        <button
          onClick={handleAnalyze}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          鑑定実行
        </button>
        
        {result && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">結果</h3>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">テスト用漢字</h2>
        <div className="grid grid-cols-4 gap-2">
          {['哉', '鬱', '龍', '國', '學', '會', '發', '縣'].map((kanji) => (
            <button
              key={kanji}
              onClick={() => setFirstName(kanji)}
              className="p-2 border rounded hover:bg-gray-100"
            >
              {kanji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
