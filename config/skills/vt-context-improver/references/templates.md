# OMP Context & Rules Templates

Tài liệu này cung cấp các mẫu cấu trúc chuẩn cho Oh My Pi (OMP) CLI, áp dụng nguyên tắc tách biệt giữa Context (`AGENTS.md`/`CLAUDE.md`), Sticky Rules (`RULES.md`), và tận dụng cú pháp `@` import.

---

## Template 1: OMP Native Cặp đôi (.omp/AGENTS.md + .omp/RULES.md)

*Khuyến nghị cho mọi dự án mới hoặc khi chuẩn hóa hoàn toàn theo OMP.*

### File 1: `.omp/AGENTS.md` (Durable Background & Instructions)

```markdown
# <Tên Dự Án>

<Mô tả 1-2 câu về dự án, vai trò của service/app, mục tiêu chính.>

## Công nghệ chính
- Runtime: <Node 22 / .NET 8 / Go 1.23 / Python 3.12>
- Framework: <Next.js 15 / FastEndpoints / FastAPI>
- Cơ sở dữ liệu: <PostgreSQL 16 / MongoDB / Redis>

## Lệnh làm việc (Commands)

| Thao tác | Lệnh | Ghi chú |
|---|---|---|
| Cài đặt | `<npm install / dotnet restore>` | |
| Chạy dev | `<npm run dev / dotnet run>` | Port `<port>` |
| Build | `<npm run build / ./docker/build.sh>` | Có cô lập RAM nếu cần |
| Chạy Test | `<npm test / dotnet test>` | Filter test cụ thể: `<flag>` |
| Lint / Format | `<npm run lint / dotnet format>` | Chạy trước khi commit |

## Cấu trúc thư mục (Architecture)

```text
src/
├── Features/       # Slice chức năng (Endpoint + DTO + Validator)
├── Shared/         # Domain models, Contracts dùng chung
└── Infrastructure/ # DB context, messaging, external clients
```

## Quy ước Code (Conventions)
- **Formatting**: Indent 4 spaces, Egyptian brackets `{ }`.
- **DI / Pattern**: <Primary constructor / Clean Architecture / VSA>.
- **Error Handling**: <Result envelope / custom exception handling>.

## Tài liệu chi tiết (@ imports)
- Thiết kế Database: @docs/database-schema.md
- Quy trình tích hợp API: @docs/api-contracts.md
```

### File 2: `.omp/RULES.md` (Sticky Invariants - Luôn gắn ở mọi turn)

```markdown
# Quy tắc bất biến (Sticky Rules)

- Luôn giao tiếp và giải thích bằng tiếng Việt có dấu.
- Tuyệt đối KHÔNG commit trực tiếp lên branch main/master/dev khi chưa có xác nhận.
- KHÔNG bao giờ sửa migration đã apply; luôn tạo migration mới khi thay đổi schema.
- Không hardcode bí mật, connection string hoặc API token vào mã nguồn.
- Mọi logic thêm mới phải đi kèm kiểm thử tương ứng.
```

---

## Template 2: Standalone CLAUDE.md / AGENTS.md (Chuẩn OMP)

*Dùng khi repo cần tương thích cả Claude Code và OMP CLI, hoặc repo đã có sẵn `CLAUDE.md` ở root.*

```markdown
# CLAUDE.md — <Tên Dự Án>

<Mô tả ngắn gọn về service/hệ thống.>

## Critical Warnings (Cảnh báo sống còn)
- Runtime: <Phiên bản cụ thể, chú ý EOL hoặc breaking changes>.
- Môi trường: <Yêu cầu Docker, cấu hình OOM, biến môi trường bắt buộc>.

## Lệnh làm việc

```bash
# Build & Test
<lệnh build>
<lệnh test kèm filter>

# Dev
<lệnh chạy dev server>
```

## Cấu trúc & Quy ước
- **Kiến trúc**: <Mô hình tổ chức source code>.
- **Design Pattern**: <Các pattern bắt buộc tuân theo>.
- **Quy tắc đặt tên**: <PascalCase / camelCase quy định cụ thể>.

## Tài liệu chuyên sâu (OMP @ imports)
Chi tiết kiến trúc và hợp đồng:
@docs/architecture.md
@docs/deployment.md
```

---

## Template 3: Subdirectory / Package Context (`packages/*/AGENTS.md`)

*Dùng trong mô hình Monorepo hoặc thư mục con cần quy ước đặc thù riêng mà không đè root.*

```markdown
# <Package / Submodule Name>

<Vai trò của submodule này trong toàn bộ hệ thống.>

## Scope & Dependencies
- Module này phụ thuộc vào: `<Core / Shared>`
- Module này KHÔNG được phép import trực tiếp từ: `<UI / WebApp>`

## Lệnh riêng của package
```bash
npm run test -- --filter=<package-name>
npm run build --workspace=<package-name>
```

## Quy ước riêng của module
- <Quy tắc đặt tên schema / entity riêng>.
- <Quy ước export / public API của package>.
```

---

## Nguyên tắc viết Template OMP

1. **Ngắn gọn (< 300 dòng)**: Đừng biến file thành sách giáo khoa.
2. **Copy-paste ready**: Các lệnh phải chạy được ngay trong bash/terminal.
3. **Không văn mẫu**: Bỏ các câu sáo rỗng như "Viết code sạch", "Tối ưu hiệu năng".
4. **Chia để trị**: Dùng `@docs/...` khi nội dung một phần vượt quá 50 dòng.
