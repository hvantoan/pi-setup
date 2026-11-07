# `--rollback` — Xóa tag (và release) khi tag sai

Dùng khi tag vừa tạo bị sai: sai version, sai commit, sai format CI, hoặc tag trùng. Tag trỏ vào `HEAD` nên xóa tag **không** sửa lịch sử commit — an toàn.

## ⚠️ Nguyên tắc: chỉ rollback tag chưa được dùng

- Trước khi xóa, **kiểm tra image đã build chưa** (`glab ci list` → pipeline ref tag đó). Nếu CI đã push image `:latest` từ tag này → xóa tag **không** rút lại image đã publish; phải ghi đè `:latest` bằng release đúng. **Hỏi user trước** khi tiếp tục.
- Không xóa tag đã tồn tại lâu / đã được người khác pull — trừ khi user yêu cầu rõ. `--rollback` sinh ra cho tag *vừa tạo nhầm*, không phải để dọn lịch sử.
- Xóa kèm **release note** (nếu có) trước, rồi mới xóa tag: release trỏ vào tag không tồn tại sẽ lỗi hiển thị.

## Bước

1. **Xác nhận với user**: tag nào, lý do, có release/image kèm theo không.
2. **Xóa release note** (nếu có). `--with-tag` (`-t`) xóa luôn tag remote trong cùng lệnh, làm bước 3 không cần nữa:
   ```bash
   glab release view v<tag> -R <group/repo>                       # xác nhận có tồn tại
   glab release delete v<tag> -R <group/repo> -y -t              # xoá release + tag remote
   # chỉ xoá release, giữ tag: glab release delete v<tag> -R <group/repo> -y
   ```
3. **Xóa tag remote** — **bỏ qua nếu bước 2 đã dùng `-t`** (tag remote đã bị xóa cùng release):
   ```bash
   git push origin :refs/tags/v<tag>
   # hoặc: git push --delete origin v<tag>
   ```
   Dùng `:refs/tags/` để chắc chắn nhắm vào tag, không nhầm branch cùng tên.
4. **Xóa tag local**:
   ```bash
   git tag -d v<tag>
   ```
5. **Verify** (cả 3 tầng: tag local, tag remote, release):
   ```bash
   git tag --sort=-v:refname | head -3                        # tag đã biến mất ở local
   git ls-remote --tags origin | grep "refs/tags/v<tag>"      # rỗng = sạch trên remote
   glab release list -R <group/repo>                          # release đã biến mất
   ```
6. **Báo cáo** + nêu hệ quả: nếu CI đã build, image `<registry>:v<tag>` và có thể `:latest` vẫn còn trên registry — nói rõ tag đã xóa nhưng **image chưa bị thu hồi**.

## Lưu ý

- **KHÔNG** `git push --force` branch để "dọn" commit đã push — rollback chỉ đụng tag/release.
- Nếu tag sai chỉ vì **format** (vd thiếu prefix `v` khiến CI validate fail) → vẫn phải xóa và tạo lại đúng format; không sửa tag tại chỗ (annotated tag là object bất biến, sửa = xóa + tạo mới).
- Sau rollback, chạy lại `--check` để chốt version đúng trước khi `--bump`.
