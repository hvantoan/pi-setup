# `--rc` — Release candidate `vX.Y.Z-rcN`

RC để test trước khi release chính thức. Tag format: `vX.Y.Z-rcN` (vd `v0.9.0-rc1`, `v0.9.0-rc2`, …).

## Khác biệt so với `--bump`

| | Release chính thức | RC |
|---|---|---|
| Tag | `v0.9.0` | `v0.9.0-rc1` |
| Image `:<tag>` | có | có |
| Image `:latest` | **có** | **không** (tránh ghi đè production) |
| Image `:rc-latest` | không | có |

Nguồn: `.gitlab-ci.yml` của repo — đọc lại để chắc (`grep -n 'CI_COMMIT_TAG\|rc-latest' .gitlab-ci.yml`), đừng giả định.

## ⚠️ Oracle phải loại prerelease

`git tag --sort=-v:refname | head -1` xếp `v0.9.0-rc2` **cao hơn** `v0.8.0` (SemVer: prerelease đứng trước release cùng bộ số, nhưng `0.9.0-rc2 > 0.8.0`). Nếu đã push RC, oracle ngây thơ trả về RC → lần bump sau tính sai gốc.

**Oracle đúng cho release version (loại prerelease):**

```bash
git tag --sort=-v:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -1
```

**Tag RC gần nhất của một version** (để biết `N` kế tiếp):

```bash
git tag -l 'v0.9.0-rc*' | sort -V | tail -1     # → v0.9.0-rc2 ⇒ RC kế tiếp là rc3
```

## Bước

1. **Xác định base version**: RC của version nào. Lấy từ user; nếu không nói → version **kế tiếp** theo SemVer từ oracle release (C4): window có feat → `0.9.0` ⇒ RC là `v0.9.0-rcN`.
2. **Tính N**: đếm **tên tag distinct** rồi +1. Annotated tag trên remote xuất hiện **2 dòng** (tag object + `^{}` peeled) nên `grep -c` trả gấp đôi — luôn `sort -u`:
   ```bash
   BASE=v0.9.0
   git ls-remote --tags origin | grep -o "refs/tags/${BASE}-rc[0-9]*" | sort -u | wc -l
   # hoặc gọn hơn (chỉ tag local đã fetch):
   git tag -l "${BASE}-rc*" | sort -V | tail -1     # → v0.9.0-rc2 ⇒ N kế tiếp = 3
   ```
   N bắt đầu từ 1. Chạy `git fetch --tags` trước nếu máy chưa có tag RC của người khác.
3. **Window cho RC**: giống C2 nhưng so với **tag release gần nhất**, không phải RC trước — RC là snapshot của toàn bộ thay đổi so với release đang chạy production.
4. **Tạo + push annotated tag**:
   ```bash
   git tag -a v<base>-rc<N> -F <file-summary>
   git push origin v<base>-rc<N>
   ```
5. **KHÔNG đợi CI**: báo cáo xong là dừng — CI tự build image `:<tag>` + `:rc-latest` (không `:latest`). Chỉ kiểm tra pipeline khi user yêu cầu (vd log Kaniko có `--destination ...:rc-latest` và không có `:latest`).
6. **(tuỳ chọn) release note cho RC**: nếu user muốn → `references/release.md`, ghi rõ trong note đây là **bản thử nghiệm**, không dùng production.

## Lưu ý

- RC **không** thay thế release chính thức; sau khi RC pass → `--bump` cho `v<base>` (bỏ hậu tố `-rcN`), lúc đó tag release và RC cùng trỏ vùng commit — bình thường.
- Không dùng `--rc` khi repo chưa đấu dây CI đọc format RC (kiểm tra regex trước) — tag sai format làm pipeline fail.
- `:rc-latest` là con trỏ dùng chung cho mọi RC; RC mới nhất ghi đè. Không coi `:rc-latest` là bản ổn định.
