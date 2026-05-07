# 人力資源資料庫

## 部署步驟

### 1. 上傳到 GitHub
把這個資料夾的所有檔案上傳到你的 GitHub repository。

### 2. 在 Vercel 設定環境變數
部署時需要設定兩個環境變數：

| 變數名稱 | 說明 |
|---------|------|
| `SHEETS_URL` | 你的 Google Apps Script Web App 網址 |
| `ANTHROPIC_API_KEY` | 你的 Anthropic API Key |

### 3. 取得 Anthropic API Key
前往 https://console.anthropic.com 登入後取得 API Key。

## 檔案結構
```
hrdb/
├── public/
│   └── index.html      # 主頁面
├── api/
│   ├── data.js         # Google Sheets 讀寫 API
│   └── claude.js       # Claude AI API
└── vercel.json         # Vercel 設定
```
