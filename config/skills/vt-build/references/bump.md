# `--bump` (default) — Annotated tag + push

Core workflow (C1–C6) đã chạy xong: biết tag oracle, window, bậc SemVer, version mới, summary changelog.

## Bước

1. **Chốt version**: `python3 <skill-dir>/scripts/bump_version.py <old> <major|minor|patch>`.
2. **Check trùng**: `git tag -l v<new>` (rỗng) + `git ls-remote --tags origin | grep v<new>` (không có).
3. **Tạo annotated tag** — tag mang luôn summary changelog:
   ```bash
   git tag -a v<new> -F <file-summary>
   # hoặc: git tag -a v<new> -m "<summary changelog>"
   ```
   Dùng `-F` khi summary nhiều dòng — `-m` nhiều dòng phải lặp `-m`, dễ hỏng format.
4. **Push tag** (chỉ tag, không branch):
   ```bash
   git push origin v<new>
   ```
5. **Xác nhận kết quả**:
   ```bash
   git tag --sort=-v:refname | head -1            # phải là v<new>
   git ls-remote --tags origin | grep v<new>      # annotated: có cả <sha> và <sha>^{}
   ```
   Annotated tag trên remote xuất hiện **2 dòng**: dòng tag object và dòng `^{}` peeled trỏ tới commit. Lightweight chỉ có 1 dòng — thiếu `^{}` = đã tạo sai loại tag.

## Báo cáo

Tiếng Việt, ngắn:
- Version cũ (tag oracle) → mới, lý do SemVer (bậc nào, dựa trên change nào).
- Bảng phân loại ngắn: change → type → ảnh hưởng.
- Summary changelog đã đính kèm tag.
- Đã tạo **annotated tag `v<new>` + push lên remote** (kèm output xác nhận).
- **Nếu CI không trigger theo tag** (repo chưa đấu dây CI) → nói rõ tag vừa tạo **chưa được image/build nào sử dụng**; nếu CI có trigger theo tag → nói rõ CI sẽ tự build, skill dừng ở push tag (**không đợi pipeline**).

## Dừng ở đâu

`--bump` **dừng ở push tag**. KHÔNG chạy `make build` / `make release` / `docker push` — CI đọc tag tự build (xem `references/release.md`).
