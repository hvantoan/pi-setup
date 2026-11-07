# Template Bàn Giao BE → FE

Khung nội dung khi BE chuyển giao một release (diff `PREV..TAG`) hoặc một PR/MR
(diff `BASE...HEAD`, chế độ `--pr`). Điền nội dung thật từ diff — không chép commit message.
Mục nào không có thay đổi thì ghi rõ "không có" — đừng bỏ mục, FE cần biết là đã kiểm tra.

---

## Release `[TAG]` — Bàn giao FE

**@FE** — Từ `[PREV]` lên `[TAG]` có **[N]** thay đổi FE cần biết: **[a]** thay đổi phá vỡ,
**[b]** API mới, **[c]** thay đổi hành vi. Mình ghi rõ phần FE cần sửa ở dưới. Anh/chị xem nhé.

<!-- Chế độ --pr: thay 2 block trên bằng:
## PR `#[prId]` — Bàn giao FE `[headRef] → [baseRef]`

**@FE** — PR #[prId] "[title]" có **[N]** thay đổi FE cần biết: **[a]** thay đổi phá vỡ,
**[b]** API mới, **[c]** thay đổi hành vi. Review/implement theo phần dưới trước khi merge.
-->

---

### 1. Thay đổi phá vỡ (breaking) — cần sửa code

> Không có breaking change trong release này.

| Endpoint / contract | Trước | Sau | FE cần sửa gì |
|---|---|---|---|
| `[METHOD path]` | [shape/hành vi cũ] | [shape/hành vi mới] | [đổi field, đổi status, đổi quyền...] |

---

### 2. API mới

Với mỗi endpoint, dùng **đúng khối format của `skill://be-fe-api-comment/references/jira-comment-template.md`**
(`METHOD path` + mô tả 1 dòng + Auth/quyền + curl + bảng input + bảng output). Không chép lại
format đó vào đây — chỉ liệt kê endpoint nào là mới trong release này.

| Endpoint | Quyền | Dùng để làm gì |
|---|---|---|
| `[METHOD path]` | `[permission / anonymous]` | [1 dòng] |

---

### 3. Đổi hành vi trên API đã có

| Endpoint | Trước | Sau | Ảnh hưởng FE |
|---|---|---|---|
| `[METHOD path]` | [hành vi/giới hạn cũ] | [hành vi mới] | [cần kiểm tra/đổi gì] |

> **Bắt buộc ghi cả HTTP status và shape body, riêng cho từng endpoint.** Cùng một lỗi nghiệp vụ
> có thể trả shape khác nhau: vd policy mật khẩu fail ở `POST /v1/me/password` → 422 ProblemDetails
> (`code` = `password_weak` / `business_rule_violation`), còn ở `POST /v1/users/{id}/password` →
> 200 `success:false` + `errors[]`. FE bắt lỗi theo một cách sẽ hỏng ở nửa số endpoint còn lại.

---

### 4. Quyền & mã lỗi thay đổi

**Quyền mới:**

| Code | Mô tả | Gán cho |
|---|---|---|
| `[admin:x:y]` | [mô tả] | [role] |

**Mã lỗi mới / đổi status:**

| Code | Status | Khi nào | FE xử lý |
|---|---|---|---|
| `[code]` | `[status]` | [điều kiện] | [gợi ý ngắn — FE quyết định cuối] |

---

### 5. Ghi chú triển khai

- **Mốc deploy:** `[TAG]` / `PR #[prId]` ([đã merge hay cần merge trước]) — [env/registry nếu có]
- **Migration:** [có/không; bắt buộc chạy trước khi FE test]
- **Base URL:** `[BASE_URL]`
- **Thứ tự triển khai:** [BE trước / FE trước / đồng thời] — chỉ ghi khi có ràng buộc thật.

---

### 6. Checklist FE

- [ ] [Việc cụ thể bắt buộc — vd đổi tên field `x` → `y` ở form đổi mật khẩu]
- [ ] [Việc cụ thể nên làm — vd ẩn menu theo quyền `admin:system:read`]
