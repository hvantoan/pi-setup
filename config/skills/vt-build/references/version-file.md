# Fallback — repo chưa có tag nào (version file)

Khi `git tag` **rỗng** (nhiều repo vif vẫn version theo file: qlnp, gpmb-web, chat-webapp, ...) → version không lấy từ tag mà từ version file. Đây là nhánh auto khi C1 thấy `git tag` rỗng, không phải flag.

## Bước

1. **Tìm version file** theo thứ tự (chọn cái có dấu vết git bump nhiều nhất):
   `version.txt` → `<Version>` trong `*.csproj`/`Directory.Build.props` → `"version"` trong `package.json` → `version = ...` trong `pyproject.toml`.
2. **Version hiện tại** = nội dung file.
   **Window** = commits kể từ commit cuối sửa file version, cộng working tree:
   ```bash
   git log -1 --format=%H -- <version-file>     # LAST
   git log --oneline <LAST>..HEAD
   git status --short
   ```
   Không phải toàn bộ lịch sử — chỉ từ lần bump trước.
3. **Phân loại + tính version** như Core C3–C4, rồi:
   - **Ghi version mới vào file** (đúng vị trí/format file đang dùng, không reformat cả file).
   - Commit **chỉ file version**: `git commit -m "chore: bump version <new>"` (stage tường minh đường dẫn file, không `git add -A`).
   - Tạo **annotated tag** `git tag -a v<new> -F <file-summary>` — không lightweight.
   - Push **cả commit lẫn tag**: `git push origin HEAD && git push origin v<new>`.
4. **Không có tag VÀ không có version file** → **báo user, không tự invent version**. Đề xuất: chốt version đầu tiên với user, hoặc tạo `version.txt` nếu repo muốn chuyển sang file-based.

## Lưu ý

- Repo đã có tag: **không** phục hồi version file, không ghi version vào file — tag là nguồn duy nhất (trường hợp iam-service: `version.txt` đã xóa khỏi repo dù `Makefile` còn tham chiếu).
- `--release`/`--note` áp dụng bình thường sau khi tag đầu tiên tồn tại; lần bump đầu tiên (chưa có tag) thì chưa có release cũ để so.
- Với repo version theo file, xác nhận branch được phép commit: file version thường bump trên branch chính thức, không phải branch feature — hỏi user nếu đang ở feature branch.
