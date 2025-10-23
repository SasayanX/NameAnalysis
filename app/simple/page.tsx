"use client";

import React, { useState } from 'react';

export default function SimplePage() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    try {
      // シンプルな姓名判断テスト
      const fullName = lastName + firstName;
      console.log('分析開始:', fullName);
      
      // 基本的な画数計算
      const strokeCount = fullName.length * 2; // 簡単なテスト用
      
      setResult({
        fullName,
        strokeCount,
        message: 'シンプルな姓名判断が完了しました'
      });
      
    } catch (error) {
      console.error('エラー:', error);
      setResult({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          まいにちAI姓名判断
        </h1>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 田中"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 太郎"
              />
            </div>
            
            <button
              onClick={handleAnalyze}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              姓名判断を実行
            </button>
          </div>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">結果</h3>
              <div className="space-y-2">
                <p><strong>お名前:</strong> {result.fullName}</p>
                <p><strong>画数:</strong> {result.strokeCount}画</p>
                <p><strong>メッセージ:</strong> {result.message}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            シンプルな姓名判断テストページ
          </p>
        </div>
      </div>
    </div>
  );
}
