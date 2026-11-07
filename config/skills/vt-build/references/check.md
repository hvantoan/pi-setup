# `--check` — Dry-run: chỉ phân tích, không tạo gì

Trả lời "version nên lên bao nhiêu?" và "có gì trong release này?" mà **không** tạo tag, không push, không đăng release note.

## Bước

Chạy Core **C1–C5** (khám phá repo → window → phân loại → áp dụng SemVer → tính version). Bỏ C6–C7 (không tạo tag).

## Báo cáo

```text
Version hiện tại : v0.7.0        (tag oracle, branch dev)
Window           : v0.7.0..HEAD  (13 commits, working tree sạch)
Phân loại        : feat → MINOR  (1c514aa dynamic password policy)
                   fix  → PATCH  (14fd4cb admin login non-superadmin)
                   bậc cao nhất: MINOR
Version đề xuất  : v0.8.0
Release note dự kiến: <summary changelog C6>
```

Kết thúc bằng: "Chưa tạo gì. Chạy `--bump` để tag, `--release` để kèm release note."

## Trường hợp đặc biệt

- **Window trống** (C2) → "không có change mới sau `v<tag>`, không bump".
- **Chỉ có `chore`/`docs`/`ci`/`test`** (C3) → "không bump theo SemVer; nếu vẫn muốn → PATCH, xác nhận với user".
- **Nghi ngờ breaking** → nêu rõ nghi ngờ + dấu hiệu cụ thể đã thấy trong diff, đề xuất MINOR/MAJOR và chờ user chốt trước khi `--bump`.

`--check` **không có side effect nào** — không `git tag`, không `git push`, không `glab release`. Chạy được trên repo chưa commit hết (nhưng nhớ: change uncommitted không được tính vào tag — C2).
