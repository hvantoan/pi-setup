# `--note` — Release note cho tag đã có (không bump)

Dùng khi tag **đã tồn tại** (đã release trước đó, hoặc user chỉ muốn note cho tag cũ) và chỉ cần tạo/cập nhật release note. KHÔNG tạo tag mới.

## Bước

1. **Xác định tag đích**: từ user, hoặc tag oracle `git tag --sort=-v:refname | head -1`.
2. **Kiểm tra tag có trên remote**: `git ls-remote --tags origin | grep v<tag>` → phải có (annotated: 2 dòng). Không có → báo user, đề xuất `--bump`.
3. **Dựng window của chính tag đó** (không phải `$TAG..HEAD`): tag trước nó là `git tag --sort=-v:refname | grep -A1 'v<tag>$' | tail -1`, hoặc `git describe --tags --abbrev=0 v<tag>^`:
   ```bash
   PREV=$(git describe --tags --abbrev=0 v<tag>^ 2>/dev/null || echo "")
   [ -z "$PREV" ] && git log --oneline v<tag> || git log --oneline $PREV..v<tag>
   ```
4. **Phân loại + viết note** theo `references/release.md` mục 1–2 (chỉ viết từ code đã ship; verify số liệu).
5. **Đăng**: `glab release create <tag> --name "<tag>" --notes-file <file> -R <group/repo>` (create = create-or-update). Sửa note đã đăng → API PUT, xem `references/release.md` mục 3.
6. **Verify + báo cáo**: URL release + nội dung đã đăng (`glab api ... | jq -r '.description'`).

`--note` **không đụng git**: không tạo tag, không commit, không push. Tag đã tồn tại là điểm neo.
