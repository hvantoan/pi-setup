# Template Report — Jira Task Analysis

Lưu tại `plans/tasks/<ticket>-<slug>.md`. Điền từ nguồn đã đọc, không để placeholder trong report. Giữ các mục chính; bỏ mục tùy chọn không liên quan hoặc ghi “Không áp dụng” khi cần giải thích. Phân biệt “không có dữ liệu”, “chưa thu thập” và “không lấy được”.

# Phân tích task <TICKET-KEY> — <Tiêu đề tiếng Việt ngắn>

> Generated: <YYYY-MM-DD> | Input: <link/issue key Jira> | Trạng thái ticket: <To Do / In Progress / Done / ...>
> Nguồn: <chỉ Jira MCP, comments, repo/docs thật sự đã đọc — nêu skill đã dùng (ak-scout, ak-gkg, ...) và file/symbol đã đối chiếu; ghi giới hạn/trang bị cắt nếu có>

## 1. Tóm tắt

<3-5 câu: task làm gì, cho ai, mục tiêu, kết quả mong muốn. Không bịa — chỉ nói những gì có trong Jira/code đã đọc.>

## 2. Thông tin ticket

| Mục | Giá trị |
|---|---|
| Type | <Bug / Task / Story / Epic / Sub-task> |
| Status | <status hiện tại> |
| Priority | <giá trị thật từ Jira / chưa thu thập / không lấy được> |
| Assignee | <tên> |
| Reporter | <tên> |
| Components | <component1, component2> |
| Labels | <label1, label2> |
| Fix version | <version / —> |
| Epic / Parent | <EPIC-xxx / —> |
| Created / Updated | <YYYY-MM-DD / YYYY-MM-DD> |
| Due date | <YYYY-MM-DD / —> |
| Thời gian đã log | <tổng đã xác minh / không có dữ liệu / chưa thu thập / không lấy được> |

## 3. Mô tả yêu cầu

<Chép/tóm lược description gốc của ticket, bao gồm các yêu cầu chức năng, tiêu chí chấp nhận nếu có.>

## 4. Phân tích

### 4.1 Yêu cầu rõ ràng
- <điều 1 — yêu cầu đã rõ ràng từ ticket/code>
- <điều 2>

### 4.2 Yêu cầu mơ hồ / cần clarify
- <điều 1 — mô tả thiếu → cần hỏi user/PO>
- <điều 2>

### 4.3 Phạm vi ảnh hưởng (nếu liên quan code)
- <Service / API / database / file hoặc flow đã xác minh — nêu skill nguồn và đường dẫn đã đọc>
- <Business rule hiện tại rút ra từ code/docs đã đọc — chỉ ghi khi truy về được nguồn, kèm đường dẫn>
- Chỉ nêu tenant, soft-delete, transaction/migration khi liên quan từ nguồn đã đọc; ghi rõ phần chưa kiểm tra thay vì bịa danh sách file.

### 4.4 Rủi ro / cạm bẫy
- <rủi ro 1 — data cũ, migration, breaking change, permission, ...>
- <rủi ro 2>

### 4.5 Phụ thuộc
- Blocked by: <ticket1, ticket2>
- Blocks: <ticket1>
- Epic liên quan: <EPIC-xxx>

## 5. Câu hỏi mở

<Liệt kê quyết định/câu hỏi còn thiếu; nếu không có, ghi không còn câu hỏi từ dữ liệu đã đọc.>

## 6. Đề xuất bước tiếp theo

- <bước 1 — hướng xử lý khả thi, chưa implement>
- <bước 2>

---
*Report chỉ phục vụ phân tích — không phải plan implement.*
