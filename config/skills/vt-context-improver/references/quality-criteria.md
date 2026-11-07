# OMP Context & Rules Quality Criteria

## Scoring Rubric (100 Points)

### 1. Commands & Workflows (20 Points)

**20 points**: Toàn diện, chính xác và có thể copy-paste chạy ngay.
- Đầy đủ lệnh: Build, Test (kèm filter/isolation nếu có), Run, Lint/Format, Deploy/Docker.
- Quy trình cô lập tài nguyên (nếu có, ví dụ build qua Docker để tránh OOM).
- Tham số thực tế, không dùng placeholder mơ hồ (`npm run <test>`).

**15 points**: Hầu hết các lệnh quan trọng đều có, thiếu một vài lệnh phụ hoặc ghi chú môi trường.

**10 points**: Chỉ có lệnh cơ bản (build/test), không có workflow phát triển chi tiết.

**5 points**: Rất ít lệnh, nhiều lệnh sai hoặc không chạy được.

**0 points**: Không có hướng dẫn lệnh nào.

---

### 2. Architecture Clarity & Tech Stack (20 Points)

**20 points**: Bản đồ codebase sắc bén, rõ ràng.
- Phiên bản công nghệ cụ thể (.NET 8, React 19, PostgreSQL 16, v.v.).
- Mô tả sơ đồ thư mục chính và vai trò của từng thành phần (VSA, Clean Architecture, Monorepo...).
- Điểm vào (entry points), luồng dữ liệu chính và ranh giới chia sẻ code (Rule of Three, boundary...).

**15 points**: Kiến trúc rõ ràng, thiếu chi tiết về luồng dữ liệu hoặc boundary.

**10 points**: Chỉ liệt kê thư mục sơ sài.

**5 points**: Mô tả mơ hồ, chung chung.

**0 points**: Không có thông tin kiến trúc.

---

### 3. Sticky Rules Separation (`RULES.md`) (15 Points)

**15 points**: Phân tách hoàn hảo giữa Context và Invariants.
- Các quy tắc bất biến, nghiêm ngặt (cấm commit trực tiếp, quy ước ngôn ngữ, không sửa migration cũ...) được đưa vào `.omp/RULES.md`.
- `RULES.md` ngắn gọn, súc tích, không chứa tài liệu giải thích dài dòng.
- Không để các rule sống còn bị chìm trong file context hàng trăm dòng.

**10 points**: Có nêu rõ quy tắc nghiêm ngặt trong context file nhưng chưa tách sang `.omp/RULES.md`.

**5 points**: Quy tắc quan trọng bị rải rác lộn xộn trong nhiều đoạn văn bản.

**0 points**: Không có quy ước hoặc quy tắc kiểm soát hành vi quan trọng.

---

### 4. Modularity & `@` Imports (15 Points)

**15 points**: Tận dụng tối đa tính năng `@` import của OMP.
- File context root tinh gọn (< 300 dòng), dễ nạp và tiết kiệm token.
- Tài liệu chi tiết (database schema, API specs, deployment deep-dive) được tách ra `docs/*.md` và nhúng bằng cú pháp `@docs/...`.
- Đường dẫn `@` import chính xác, không đệ quy quá 5 hop.

**10 points**: File tương đối gọn gàng, nhưng chưa dùng cú pháp `@` import cho các tài liệu chi tiết.

**5 points**: File nguyên khối (monolithic) bắt đầu phình to (400–800 dòng) nhưng chưa modular hóa.

**0 points**: File phình to quá mức (> 800 dòng), chứa toàn bộ tài liệu dự án, gây lãng phí nghiêm trọng context window.

---

### 5. Memory Hygiene & Anti-Bloat (15 Points)

**15 points**: Vệ sinh sạch sẽ, không có "rác" session.
- Không chứa ghi chú sửa bug nhất thời ("Đã sửa lỗi null pointer ở commit xyz").
- Không chứa log tạm thời, ghi chép cá nhân của một phiên làm việc cụ thể.
- Hiểu và phân biệt rõ: kiến thức động thuộc về OMP Autonomous Memory (`learn` tool, `learned.md`, Mnemopi), không nhét vào context files.

**10 points**: Đa số sạch sẽ, có 1–2 ghi chú lỗi cũ nhưng chưa dọn dẹp.

**5 points**: Chứa nhiều ghi chú fix bug vụn vặt làm loãng hướng dẫn chính.

**0 points**: Biến file context thành nhật ký sửa lỗi hoặc bãi rác ghi chép sau mỗi lượt chat.

---

### 6. Currency, Actionability & Conciseness (15 Points)

**15 points**: Súc tích, thực tế 100%, không văn mẫu AI.
- Không có lời khuyên chung chung ("Hãy viết code sạch", "Hãy đặt tên biến rõ nghĩa").
- Mọi hướng dẫn đều có thể thực thi ngay, đường dẫn file và tên hàm/class đều có thật.
- Phản ánh đúng trạng thái hiện tại của codebase.

**10 points**: Đa phần thực tế, còn một vài câu văn mẫu hoặc hướng dẫn chưa tối ưu.

**5 points**: Nhiều đoạn giải thích dài dòng, nhiều thông tin đã lỗi thời.

**0 points**: Toàn bộ là văn mẫu lý thuyết suông, không áp dụng được vào codebase.

---

## Bảng xếp loại chất lượng

| Điểm | Xếp loại | Ý nghĩa |
|------|----------|---------|
| **90–100** | **Hạng A** | Xuất sắc. Chuẩn OMP: Gọn gàng, có sticky rules, modular, lệnh chính xác. |
| **70–89** | **Hạng B** | Khá tốt. Đầy đủ thông tin nhưng cần tách `RULES.md` hoặc dùng `@` imports để gọn hơn. |
| **50–69** | **Hạng C** | Trung bình. Thiếu lệnh, file bắt đầu phình to, hoặc có lẫn rác session learnings. |
| **30–49** | **Hạng D** | Kém. Lỗi thời, nhiều thông tin sai lệch, thiếu lệnh chạy quan trọng. |
| **0–29** | **Hạng F** | Không đạt. Thiếu file, file rỗng, hoặc hoàn toàn sai lệch so với codebase. |

---

## OMP Red Flags cần cảnh báo ngay

1. **Shadowing ngầm**: Có cả `.omp/AGENTS.md` (priority 100) và `CLAUDE.md` (priority 10) dẫn đến nội dung `CLAUDE.md` bị bỏ qua mà người dùng không biết.
2. **Quy tắc cứng bị trôi**: Các quy tắc nghiêm ngặt (vd: "không tự ý push", "tiếng Việt có dấu") để trong `CLAUDE.md` dài 500 dòng → chắc chắn model sẽ quên sau 10–20 turns chat. **Bắt buộc chuyển sang `.omp/RULES.md`**.
3. **Cú pháp `@` import bị lỗi**: Nhúng `@path` nhưng file đích không tồn tại, hoặc nhúng quá 5 hop đệ quy.
4. **Context Bloat từ lệnh cũ của Claude Code**: File chứa đầy các dòng do shortcut `#` của Claude nhét vào. Cần chuyển các bài học này vào `learned.md` (OMP Memory) hoặc loại bỏ.
