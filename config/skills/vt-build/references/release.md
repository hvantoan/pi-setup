# `--release` — Tag + GitLab Release note

Core (C1–C6) đã chạy xong, và bước tạo/push tag như `references/bump.md` bước 1–4. Reference này lo phần **sau** khi tag đã lên remote: viết release note, đăng nó, báo cáo.

Thứ tự bắt buộc: **push tag trước** rồi mới tạo release — GitLab Release trỏ vào tag phải tồn tại sẵn.

## 1. Chọn nơi đăng release note

Xác định convention của repo trước, đừng mặc định:

```bash
git ls-files | grep -iE 'CHANGELOG|RELEASES|release-notes|docs/release'
glab release list -R <group/repo>          # đã có release nào chưa
git show <tag-cũ> --format='%b' --no-patch # tag cũ có mang nội dung không
```

| Tình huống | Đăng ở đâu |
|---|---|
| Repo đã có `CHANGELOG.md` được maintain | Thêm mục vào file + commit `docs: changelog v<new>` (theo format file đang dùng) |
| Repo **không có** convention changelog | **GitLab Release** (native, không thêm file vào repo) — mặc định |
| User chỉ định rõ | Theo user |

Repo không có convention mà vẫn tạo `CHANGELOG.md` mới = tự đặt convention mới ngoài yêu cầu → tránh. GitLab Release là platform feature, không cần bảo trì file.

## 2. Viết nội dung release note

Ngôn ngữ: **tiếng Việt** (theo thói quen tài liệu repo vif). Cấu trúc đã dùng tốt:

```markdown
## Tổng quan
<1–3 câu: release này làm gì, cho ai>

**Docker image**: `<registry>/<project>:v<new>` (và `:latest`) — build tự động bởi CI khi push tag.

## Tính năng mới
### <tên feature>
- <endpoint/thay đổi hành vi, kèm route và giá trị validate cụ thể>

## Sửa lỗi
- <route/endpoint>: <triệu chứng trước> → <hành vi sau>

## Thay đổi cơ sở dữ liệu
| Migration | Nội dung |
|---|---|

## Lưu ý khi nâng cấp
- <breaking / default mới / cấu hình chỉ lưu chưa wire / điều kiện biên>

## Nội bộ
- <chore, ci, dependency bump>
```

### Quy tắc nội dung

- **Chỉ viết từ code đã ship, không từ plan/task doc.** Task doc mô tả *dự định*; implementation có thể khác (vd task doc `tasks/1-thiet-lap-chinh-sach-mat-khau.md` viết `PasswordPolicy` entity/`GET /v1/system/password-policy`, thực tế ship `SystemConfig` jsonb + `GET /v1/system/config`). Với mỗi khẳng định trong note, đọc file nguồn tương ứng (`read`/`git show`) rồi mới viết.
- **Verify số liệu trước khi công bố** — đây là chỗ dễ sai nhất. Ví dụ thật: `grep -c 'Rule('` đếm ra 42 trong khi catalog có **40** rule, vì match thêm khai báo record `PermissionRule(` và khai báo helper `private static PermissionRule Rule(`. Đếm bằng câu invocation có indent thật (`grep -c '^        Rule('`) **và** đối chiếu con số code tự công bố (`grep -n 'Toàn bộ .* rule'`, `grep -n 'Guid cho Permission'`). Hai nguồn khớp mới ghi vào note.
- **Nêu rõ phần chưa hoàn chỉnh** (config mới chỉ lưu chưa wire logic, NULL semantics, không backfill) — người nâng cấp cần biết.
- Bảng migration: lấy từ `git show <commit> --name-only | grep Migrations` hoặc thư mục `Migrations/`.

## 3. Đăng release note — `glab`

`glab release create <tag>` **tạo mới hoặc cập nhật** release cho tag đó:

```bash
glab release create v<new> --name "v<new>" --notes-file /tmp/rel-v<new>.md -R <group/repo>
```

- `--notes-file` **có** ở `glab release create`; giữ nội dung trong file để tránh hỏng markdown khi truyền qua shell.
- Output đúng: `✓ Release created: url=https://<host>/<group>/<repo>/-/releases/v<new>`.

### Cập nhật release đã đăng (sửa note)

`glab release update` **KHÔNG tồn tại** ở glab 1.89.0 (chỉ `create`/`delete`/`download`/`list`/`upload`/`view`) → dùng API:

```bash
# `-F` (magic field) đọc nội dung file khi value là @<path>. `-f` (raw-field) KHÔNG đọc file — chỉ ghi literal "@/path".
glab api --method PUT "projects/<url-encoded-path>/releases/v<new>" -F "description=@/tmp/rel-v<new>.md"
```

- Path project phải **URL-encode dấu `/`**: `dtc/iam-service` → `dtc%2Fiam-service`.
- **KHÔNG** dùng `--input file.json` cho PUT này → HTTP 415 (thiếu content-type). Dùng `-F description=@file`.
- Gọi lại `glab release create <tag>` cũng update được, cách API dùng khi chỉ muốn sửa note.

### Verify đã đăng

```bash
glab api projects/<url-encoded-path>/releases/v<new> | jq '{tag_name, name, created_at, url: ._links.self}'
glab api projects/<url-encoded-path>/releases/v<new> | jq -r '.description' | grep -n '<chuỗi vừa sửa>'
```

## 4. CI — KHÔNG đợi pipeline

Skill **dừng sau khi push tag + đăng release note** — không poll `glab ci list`, không chờ job `success`. CI đọc tag và tự build image `<registry>/<project>:v<new>` (và `:latest`) theo `.gitlab-ci.yml`.

- Repo có CI đọc tag (mục 5) → báo user "CI sẽ tự build từ tag `v<new>`" rồi kết thúc.
- `grep -n 'CI_COMMIT_TAG' .gitlab-ci.yml` rỗng → repo **chưa đấu dây CI** → **nói rõ với user: tag đã tạo nhưng chưa build ra image nào**; không tự chạy build thay CI.
- Chỉ kiểm tra pipeline khi user yêu cầu → `glab ci list -R <group/repo> | head -8` (Ref = `v<new>`); pipeline `failed` → `glab ci trace <job-id>`, báo user — sửa pipeline ngoài phạm vi skill.

## 5. Định dạng tag CI chấp nhận

Repo có CI trigger theo tag có regex riêng — tag sai format làm pipeline **fail ngay job validate**. Đọc `.gitlab-ci.yml` trước khi tag:

```bash
grep -n 'CI_COMMIT_TAG' .gitlab-ci.yml
```

Ví dụ iam-service: release `^v?[0-9]+\.[0-9]+\.[0-9]+$` → `:<tag>` + `:latest`; RC `^v?[0-9]+\.[0-9]+\.[0-9]+-rc\.?[0-9]+$` → `:<tag>` + `:rc-latest` (không `:latest`).

- Có CI đọc tag → skill **dừng ở push tag + release note**, CI tự build image (không đợi pipeline). KHÔNG chạy `make build`/`make release` (làm lại việc CI đã làm, dễ đẩy image sai tag).
- Repo đang chuyển đổi sang tag-based nhưng `Makefile` vẫn đọc file version đã xóa (iam-service: `head -n 1 version.txt` → `VERSION=dev`) → `make release` push `:dev` và `:latest` **sai**, không bao giờ mang tag. Báo user dùng tag qua CI; **KHÔNG tự sửa Makefile/pipeline** (ngoài phạm vi skill).

## 6. Báo cáo

- Version cũ → mới + lý do SemVer; bảng phân loại change.
- URL release note đã đăng.
- Nêu rõ CI sẽ tự build từ tag (skill không đợi pipeline) — hoặc nói rõ tag chưa được build nếu repo chưa đấu dây CI.
- Cảnh báo nâng cấp đáng chú ý từ note.
