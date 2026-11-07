---
name: vt-build
description: "Version & release cho mọi repo vif theo SemVer. Flag-driven: --bump (annotated tag + push), --release (tag + GitLab Release note), --note (chỉ release note cho tag có sẵn), --rc (release candidate), --check (dry-run), --rollback (xóa tag/release). Không đợi CI pipeline — dừng sau khi push tag + summary. Chi tiết từng flag nằm trong references/ (--release → references/release.md). Flow tag-based (vd iam-service): load tag gần nhất → check changelog sau tag → phân loại feat/fix/breaking → tạo annotated tag kèm summary changelog → push. Repo chưa có tag → fallback version file (version.txt/package.json/pyproject.toml). Quy ước 0.x pre-1.0, KHÔNG bump máy móc +1. Triggers on: bump version, bumb ver, tăng version, update version, version cho release, tạo release note, release note, SemVer, đẩy version lên, lên version mới, set version, release bằng tag, --release, --bump, --rc, --rollback."
---

# Version & Release — vif (tag-based, SemVer)

**build và release bằng annotated git tag `vX.Y.Z`** (vd `v0.7.0`); version hiện tại = tag gần nhất. Không hardcode "toàn bộ dự án vif" — **xác định convention của chính repo đang chạy** (có tag không, có version file không) trước khi làm gì.

## Flag → reference

| Flag | Ý nghĩa | Reference |
|---|---|---|
| *(không flag)* / `--bump` | Bump version: annotated tag + push | `references/bump.md` |
| `--release` | Bump + tạo **GitLab Release (release note)** | `references/release.md` |
| `--note` | Chỉ tạo/cập nhật release note cho tag **đã có** (không bump) | `references/note.md` |
| `--rc` | Tag release candidate `vX.Y.Z-rcN` (không ghi đè `:latest`) | `references/rc.md` |
| `--check` | Dry-run: phân tích + in version đề xuất, **không tạo gì** | `references/check.md` |
| `--rollback` | Xóa tag (và release) local + remote khi tag sai | `references/rollback.md` |
| — *(auto, không phải flag)* | Repo **chưa có tag nào** → fallback version file | `references/version-file.md` |

Nhiều flag cùng lúc: `--release --rc` = RC + release note. Flag chưa có trong bảng → hỏi user, KHÔNG tự đoán.

## Phạm vi

- **Làm**: load tag gần nhất (hoặc version file) → check changelog sau tag → phân loại change theo SemVer → tính version mới → tạo **annotated tag** mang version mới + summary changelog → push tag → (nếu `--release`/`--note`) đăng release note → báo cáo.
- **Không làm**: không chạy build; không sửa code; không ghi/commit file version (trừ fallback repo chưa có tag); không tạo branch mới.
- **Tiền điều kiện**: tag đánh trên commit đã push/merge lên branch chính. Change còn uncommitted hoặc chưa có MR → skill `vt-git` (`--cm`, `--pr <branch>`) làm trước, quay lại đây sau khi merge.

## Khi nào dùng

- User yêu cầu "bump version", "tăng version", "update version", "lên version cho release".
- User muốn "tạo release note" / "release" cho tag → `--release`, hoặc `--note` nếu tag đã tồn tại.
- User đưa code change và muốn biết version nên lên bao nhiêu theo chuẩn → `--check`.

## Lưu ý: `make release` KHÔNG phải git release

Một số repo vif có target `make release` (vd iam-service: `release: build push` = `docker build` + `docker push` registry). Nó KHÔNG commit/tag/push git — đừng chạy nó khi bump version, và đừng nhầm nó với bước tạo tag. Chạy image publish là quyết định riêng (cần registry login, side effect ngoài git).

---

## Core — dùng chung cho mọi flag

### C1. Khám phá repo + load version hiện tại

Chạy đầu tiên, không hardcode:

```bash
git remote get-url origin        # xác định repo vif hay không
git branch --show-current        # branch hiện tại
git tag --sort=-v:refname | head -1   # oracle: tag cao nhất theo version = version hiện tại
git ls-files | grep -E 'version\.txt|package\.json|pyproject\.toml'  # repo có version file không
```

- **Oracle version: dùng `git tag --sort=-v:refname | head -1`** — KHÔNG dùng `git describe --tags --abbrev=0` làm oracle: describe giải theo graph distance tới tag gần nhất *reachable* từ HEAD, nên trên branch không chứa tag mới nhất nó trả tag cũ hơn → version thấp/trùng. (`describe` chỉ dùng ở C2 để detect window.)
- **Có tag** → version hiện tại = tag oracle (bỏ prefix `v` khi tính). Tag convention của vif: prefix `v`. Nếu repo dùng convention khác → theo convention của repo đó.
- **Không có tag nào** → load `references/version-file.md`.
- **Có cả tag lẫn version file** (vd iam-service đang chuyển đổi: Makefile vẫn đọc `version.txt` nhưng file đã bị xóa khỏi repo) → version gốc là **tag**, không phục hồi version file.

### C2. Check code changelog sau tag

Window = mọi thay đổi có code kể từ tag gần nhất **reachable từ HEAD**:

```bash
TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)   # tag gần nhất trên history của HEAD; rỗng = chưa có tag reachable
if [ -z "$TAG" ]; then echo "KHONG_CO_TAG"; else git log --oneline $TAG..HEAD; fi
git status --short                       # working tree
```

- **Nếu `TAG` rỗng** → **KHÔNG kết luận "window trống"**. Hai trường hợp con:
  - Repo **không có tag nào** (C1: `git tag` rỗng) → theo `references/version-file.md`.
  - Có tag (oracle ≠ rỗng) nhưng **không tag nào reachable từ HEAD** (branch feature cắt trước tag đầu tiên) → window = toàn bộ commits trên HEAD (`git log --oneline HEAD`), và **xác nhận user**: tag nên đánh trên branch chính thức đang chứa tag hiện có.
- **Chỉ khi `TAG` có giá trị và `git log --oneline $TAG..HEAD` rỗng + working tree sạch** → mới kết luận "window trống, không bump".
- Chỉ tính change **đã commit** (đã nằm trên `HEAD`); change uncommitted → báo user commit trước, không tính vào tag.

> Release tag thường đánh trên **branch chính thức** (dev/master/main theo repo), không đánh trên branch feature tạm. Nếu đang ở branch feature có commits chưa merge, hoặc `git describe` ≠ oracle — HEAD không chứa tag mới nhất → version tính từ oracle có thể đã tồn tại trên remote → **xác nhận với user trước khi tag**.

### C3. Phân loại change

Đọc từng commit message (conventional commits) + diff. Với commit không có type → scan diff để suy ra.

| Loại change | Ví dụ | Ảnh hưởng SemVer |
|---|---|---|
| `feat` — thêm tính năng, **backward-compatible** | endpoint mới, param mới, field mới, schema additive | **MINOR** |
| `feat!` hoặc `BREAKING CHANGE:` | xóa/thay đổi endpoint, đổi contract, xóa field, migration phá vỡ | **MAJOR** (qua 1.0) / **MINOR** (đang 0.x) |
| `fix` | sửa bug, sửa hành vi sai | **PATCH** |
| `refactor` / `perf` / `style` — không đổi behavior | tách class, đổi tên nội bộ, format | không bắt buộc bump (nếu user muốn → PATCH) |
| `docs` / `test` / `chore` / `ci` — riêng nội bộ | tài liệu, test, tooling, CI | **không bump** (nội bộ) |

Xử lý hỗn hợp:
- Có cả `fix` lẫn `feat` → lấy bậc **cao nhất** (feat MINOR thắng fix PATCH).
- Chỉ có `refactor`/`docs`/`test`/`chore` → không bump, báo user.

Phân loại dựa trên **contract/behavior**, không chỉ message: commit ghi `feat` nhưng có dấu hiệu phá vỡ (đổi/xóa route, đổi shape request/response, đổi semantics field, migration drop) → coi là breaking. Grep dấu hiệu: `git log $TAG..HEAD --format='%h %s%n%b' | grep -iE 'BREAKING|feat!|fix!'`.

### C4. Áp dụng SemVer

**Đang ở `0.x` (MAJOR = 0, pre-1.0):** MAJOR cố định 0 → MINOR đóng vai trò "feature level".
- Feature / breaking → **MINOR** (reset PATCH về 0): `0.2.13 → 0.3.0`
- Fix → **PATCH**: `0.2.13 → 0.2.14`

**Từ `1.0` trở lên:**
- Breaking → **MAJOR**: `1.2.3 → 2.0.0`
- Feature → **MINOR**: `1.2.3 → 1.3.0`
- Fix → **PATCH**: `1.2.3 → 1.2.4`

### C5. Tính version mới

Dùng script helper (chỉ làm phép tính semver thuần — phân loại vẫn là quyết định của Claude):

```bash
python3 <skill-dir>/scripts/bump_version.py 0.2.13 minor   # → 0.3.0
python3 <skill-dir>/scripts/bump_version.py 0.2.13 patch   # → 0.2.14
python3 <skill-dir>/scripts/bump_version.py 1.2.3 major    # → 2.0.0
```

Kiểm tra tag chưa tồn tại trước khi tạo: `git tag -l v<new>` (rỗng = ok) và `git ls-remote --tags origin | grep v<new>`.

Trước khi tạo tag: nếu window có **breaking change** hoặc nghi ngờ phân loại → xác nhận version mới với user trước (một câu, không dài dòng).

### C6. Chuẩn bị summary changelog

Tóm tắt ngắn gọn các change trong window (đã lọc bỏ commit merge/`docs`/`chore`/`ci` nội bộ). Định dạng gợi ý:

```text
Release v0.7.1

Feat:
- <tên feature>

Fix:
- <mô tả bug đã sửa>

Chore:
- <tooling / ci nếu đáng kể>
```

### C7. An toàn (mọi flag)

- Tag trỏ vào `HEAD` hiện tại — an toàn, không sửa lịch sử; nếu sai → `--rollback`.
- **Chỉ tạo/push tag** (hoặc commit file version ở fallback) — không commit code, không lẫn file khác.
- **Tag**: dùng `v<new>`, annotated (`-a -F <file>` hoặc `-a -m`) — tuyệt đối không lightweight tag.
- **Không commit file version** — tag trỏ thẳng vào `HEAD` hiện tại, đó là release point.
- Nếu push tag bị từ chối (ai đó đã push tag cùng tên) → báo user, **không force**.
- Chỉ push tag lên remote; **KHÔNG push branch**.
- Nếu user nói "bump theo tôi / làm như cũ" nhưng trái SemVer → vẫn theo chuẩn, nêu rõ lý do; chỉ lệch khi user xác nhận rõ ràng.
- Không thêm prerelease vào version khi user chưa yêu cầu (trừ `--rc`) — chỉ tăng số có sẵn.
- Không đụng version của dependency (chỉ version của chính dự án) và không sửa code build pipeline khi user chưa yêu cầu.
- **KHÔNG đợi CI pipeline** — skill dừng sau khi push tag (+ release note nếu `--release`/`--note`) + báo cáo summary. CI đọc tag tự build; chỉ kiểm tra pipeline khi user yêu cầu.
- Vẫn **đọc `.gitlab-ci.yml` trước khi tag** để đảm bảo format tag CI chấp nhận — xem `references/release.md` mục 5 và `references/rc.md`.
