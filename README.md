## TODO アプリケーション

Rails API + Vue.js で構築されたTODOアプリケーションです。

### 使用方法

以下のコマンドで、 Rails APIサーバーと Vue.jsフロントエンドを起動してください。

```bash
cd todo-api
bundle install
rails db:migrate
rails server -p 3000
```

```bash
cd todo-frontend
npm install
npm run dev
```


ブラウザで http://localhost:3001 にアクセスしてください。

（※アプリケーションを再起動してもデータは保持されます）