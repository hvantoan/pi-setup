# OMP Context & Rules Update Guidelines

## Nguyên tắc cốt lõi: Phân định đúng tầng lưu trữ

Trong OMP CLI, context window là tài nguyên cực kỳ đắt đỏ. Mọi dòng chữ được nạp vào phải có lý do xác đáng. Hãy dùng cây quyết định dưới đây trước khi thêm bất kỳ thông tin nào:

```text
Thông tin mới cần lưu trữ là gì?
 │
 ├── 1. Quy tắc cứng, bắt buộc tuân thủ 100%, không được phép vi phạm qua các lượt chat?
 │    └── ➜ ĐƯA VÀO: `.omp/RULES.md` (Sticky Invariants)
 │         (Ví dụ: "Luôn dùng tiếng Việt có dấu", "Cấm commit thẳng dev", "Không sửa migration cũ")
 │
 ├── 2. Hướng dẫn lâu dài về kiến trúc, lệnh build/test, tech stack, quy ước code của dự án?
 │    ├── > Nếu ngắn gọn (< 50 dòng) ➜ ĐƯA VÀO: `.omp/AGENTS.md` hoặc `CLAUDE.md`
 │    └── > Nếu tài liệu dài, chi tiết ➜ ĐƯA RA: `docs/<ten-tai-lieu>.md` và dùng `@docs/...`
 │
 ├── 3. Bài học kinh nghiệm trong phiên làm việc, lỗi runtime vừa khắc phục, phát hiện debug?
 │    └── ➜ ĐƯA VÀO: OMP Autonomous Memory bằng tool `learn` (lưu vào `learned.md`)
 │         (TUYỆT ĐỐI KHÔNG nhét vào CLAUDE.md/AGENTS.md gây phình context!)
 │
 └── 4. Thông tin hiển nhiên từ code hoặc lời khuyên lập trình chung chung?
      └── ➜ BỎ QUA: Không lưu vào đâu cả.
```

---

## Nên thêm gì vào Context Files (`AGENTS.md` / `CLAUDE.md`)

### 1. Lệnh và Quy trình thực tế mới phát hiện
Nếu dự án có quy trình chạy đặc thù mà developer mới phải mất công mò mẫm:
```markdown
## Build & Run

- Build cô lập RAM qua Docker: `./docker/build.sh` (tránh OOM host)
- Chạy unit tests: `./docker/test.sh`
- Chạy integration test trên host: `dotnet test tests/IAM.IntegrationTests`
```

### 2. Mô hình kiến trúc & Ranh giới chia sẻ code
```markdown
## Kiến trúc VSA
- Mỗi slice chức năng là độc lập: Endpoint + Request + Response + Validator.
- Rule of Three: Không tách shared code khi chưa xuất hiện ở ít nhất 3 nơi.
```

### 3. Cấu hình môi trường đặc thù
```markdown
## Cấu hình
- Cần chạy Redis với hậu tố `?family=0` nếu môi trường hỗ trợ IPv6.
- Connection string lấy từ User Secrets trong môi trường Development.
```

---

## Nên đưa gì vào Sticky Rules (`.omp/RULES.md`)

Chỉ đưa các quy tắc **bất biến**, ngắn gọn, có tính kỷ luật cao:
```markdown
# Sticky Rules

- Luôn trả lời bằng tiếng Việt có dấu.
- Tuyệt đối không tự ý commit/push khi người dùng chưa yêu cầu.
- Không sửa file migration đã apply trong database.
- Không log dữ liệu nhạy cảm (passwords, tokens, keys) ra console.
```

---

## TUYỆT ĐỐI KHÔNG đưa vào Context Files

### 1. Rác nhật ký sửa bug (Bug fix logs)
❌ **Sai**:
```markdown
## Bug Fix 2026-08-20
Đã sửa lỗi null exception ở hàm ValidateUser() bằng cách thêm kiểm tra if (user == null).
```
👉 **Đúng**: Dùng tool `learn` của OMP nếu cần ghi nhớ cho session sau, hoặc ghi vào commit message.

### 2. Giải thích lý thuyết chung
❌ **Sai**:
```markdown
JWT (JSON Web Token) là chuẩn mở RFC 7519 dùng để truyền tải thông tin an toàn giữa các bên dưới dạng JSON object...
```
👉 **Đúng**:
```markdown
Auth: JWT với thuật toán RS256, truyền qua header `Authorization: Bearer <token>`.
```

### 3. Lời khuyên sáo rỗng
❌ **Sai**:
```markdown
- Hãy viết code dễ đọc, dễ bảo trì.
- Luôn kiểm tra lỗi cẩn thận.
```
👉 **Đúng**: Bỏ hẳn, model mặc định đã hiểu những điều này.

---

## Quy trình Đề xuất Thay đổi (Diff Format)

Khi đề xuất thay đổi cho người dùng:

1. **Chỉ rõ file và mục đích**:
   - Tên file đích: `.omp/AGENTS.md`, `CLAUDE.md`, hoặc `.omp/RULES.md`
   - Lý do (Why): Giải thích 1 câu ngắn gọn tại sao thay đổi này giúp các phiên OMP sau làm việc tốt hơn.

2. **Hiển thị khối diff rõ ràng**:
```diff
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -15,4 +15,7 @@
 ## Lệnh làm việc
+
+# Chạy test cô lập
+./docker/test.sh
```

3. **Hỏi xác nhận trước khi thực hiện**:
   Chỉ ghi file hoặc sửa file sau khi người dùng đồng ý phương án đề xuất.
