# Template: Comment Jira BE → FE mô tả API mới

Dùng khi BE hoàn thành API của một feature và cần thông báo cho FE qua comment
Jira. Copy khung dưới, thay phần trong `[...]` bằng dữ liệu thật từ code —
không bịa endpoint/field. Mô tả tiếng Việt có dấu; tên field, path, curl giữ
nguyên như code.

Người được tag: tìm account qua `jira_search_assignable_users`, mention bằng
`[~accountid:<accountId>]`.

Curl luôn dùng `http://localhost:<port>` làm base URL — FE import vào
Postman/Insomnia chạy được ngay; muốn đổi môi trường chỉ cần replace đúng một
chuỗi `localhost:<port>`. Điền `<port>` thật của service trong project.

---

```markdown
## [TICKET-KEY] [Tên feature] — API đã sẵn sàng cho FE

[~accountid:<accountId>] — BE đã xong **[N] API [mô tả ngắn]**: [luồng drill-down nếu có]. Tất cả đều là **[METHOD]** có body, gắn Bearer token như các API [domain] hiện tại. Anh xem nhé, có gì chưa rõ cứ comment hỏi mình.

**Quy ước chung:**

| Field / Giá trị | Quy ước |
|-----------------|---------|
| `[filterId]` | Filter dữ liệu — **có thể để trống/`null`**, lúc đó BE trả dữ liệu toàn merchant; truyền id cụ thể thì chỉ tính của [scope] đó |
| `pageIndex` / `pageSize` | Mặc định 1 / mặc định theo server nếu để 0 |
| `id = "unassigned"` | Bucket "[tên bucket chưa gán]", luôn nằm cuối list |
| `[quantityField]` | Đơn vị **[đơn vị]** |
| `[amountField]` | Đơn vị **đồng** |
| [Field/quy tắc khác] | [Quy tắc lọc đặc biệt, VD: chỉ trả dòng còn nợ > 0] |

---

### 1. `[METHOD] [path]` — [Màn/bước]: [mô tả 1 dòng]

```bash
curl -X [METHOD] "http://localhost:<port>/[path]" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "[field]": "<value>",
    "pageIndex": 1,
    "pageSize": 20
  }'
```

**Input:**

| Param | Bắt buộc | Kiểu | Mô tả |
|-------|:--------:|------|-------|
| `[name]` | Có/Không | [type] | [mô tả ngắn, ghi giá trị đặc biệt như "unassigned"] |

**Output:**

| Field | Mô tả |
|-------|-------|
| `[field]` | [mô tả ngắn] |

> Lặp lại khối trên cho từng endpoint. Nếu response giống API trước chỉ khác
> input, ghi "Output giống API X; [điểm khác]" thay vì lặp lại bảng.

---

### Xử lý lỗi

| Status | Nguyên nhân |
|:------:|-------------|
| 400 | [Thiếu field bắt buộc / quyền scope — message: "..."] |
| 401 | Token không hợp lệ |
| 404 | [Entity cha không tồn tại — message theo wording BE trả về] |
| 500 | Lỗi server |
```

## Checklist trước khi đăng

- [ ] Method, path, tên field JSON trong curl và bảng khớp đúng code BE.
- [ ] Field optional/bucket đặc biệt (`null`, `"unassigned"`) đã ghi rõ behavior.
- [ ] Message lỗi dùng đúng wording BE trả về (check biến `Err*` trong usecase).
- [ ] Tag đúng người FE bằng `[~accountid:...]`.
- [ ] Không có secret/token thật, host nội bộ, hay dữ liệu nhạy cảm.
