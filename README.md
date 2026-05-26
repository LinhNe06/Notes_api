# Chạy Backend

Sau khi clone repo từ GitHub:

```powershell
pnpm install
```

Tạo file `.env`:

```env
PORT=9999
MONGODB_URI=mongodb://127.0.0.1:27017/notes_app

S3_ENDPOINT=your_endpoint
S3_REGION=auto
S3_BUCKET=your_bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_PUBLIC_BASE_URL=your_public_url
```

Thêm file Firebase service account vào thư mục gốc:

```text
firebase-service-account.json
```

Chạy MongoDB local, sau đó chạy server:

```powershell
pnpm dev
```

Server chạy tại:

```text
http://localhost:9999
```

Android emulator dùng URL:

```text
http://10.0.2.2:9999/
```
