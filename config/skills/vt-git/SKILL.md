---
name: vt-git
description: "Git commit / pull / push / PR workflow cho mọi repo — tự detect GitHub (gh) hay GitLab (glab) từ remote. Bốn flag: --br (tạo branch mới từ change), --cm (luôn commit trực tiếp tại branch hiện tại), --pull <branch> (fetch + merge <branch> vào branch đang checkout để lấy code mới nhất; tự resolve conflict nếu chắc chắn, không thì hỏi user), --pr <branch> (commit tại branch hiện tại + push + tạo PR/MR vào đúng <branch> đích — BẮT BUỘC truyền branch, KHÔNG hỏi lại user, KHÔNG tự suy đoán default). Tuân thủ Conventional Commits, commits nguyên tử, không lẫn file 'linh tinh' hay plan report/tài liệu rác do session tự sinh (trừ khi user yêu cầu). Đặc thù repo vif (GitLab git.vietinfo.tech:8443) → references/vif.md. Triggers on: git commit, cm, cp, pr, pull, push, merge request, pull request, glab, gh, tạo PR, commit và push, cập nhật code mới nhất, resolve conflict, --br, --cm, --pull, --pr."
---

# Git Workflow — --br / --cm / --pull <branch> / --pr <branch>

Workflow git có hệ thống cho mọi repo (GitHub `gh` hoặc GitLab `glab`, detect từ remote). Bốn flag (`--pull` và `--pr` bắt buộc kèm branch đích):

| Flag | Ý nghĩa | Kết quả |
|------|---------|---------|
| `--br` | **Branch** — tạo branch mới từ change, đặt tên theo change | branch mới, KHÔNG commit |
| `--cm` | **Commit** — commit trực tiếp tại branch hiện tại | 1 commit nguyên tử trên branch |
| `--pull <branch>` | **Pull** — fetch + merge **`<branch>`** vào branch đang checkout | branch hiện tại chứa code mới nhất của `<branch>` |
| `--pr <branch>` | **Pull Request** — commit + push + tạo PR/MR vào **`<branch>` do user chỉ định** | commit + push + PR/MR URL |

## Khám phá repo (chạy đầu tiên)

Không hardcode repo. Đọc từ remote hiện tại:

```bash
git remote get-url origin        # vd https://github.com/org/repo.git hoặc https://git.vietinfo.tech:8443/dtc/iam-service.git
git branch --show-current        # branch hiện tại
git remote show origin           # default branch (HEAD) + remote branches
```

- **Platform**: suy ra từ host của remote URL — `github.com` → `gh`; còn lại → `glab`. Remote `git.vietinfo.tech` → repo vif trên GitLab self-hosted → load `references/vif.md` ngay (quy ước + debug glab).
- **Host GitLab có port**: nếu remote URL có port (vd `git.vietinfo.tech:8443`) → dùng nguyên chuỗi có port cho mọi lệnh glab/config (xem `references/vif.md`).
- **Branch chính (base)**: đọc `HEAD` từ `git remote show origin`; nếu không rõ → ưu tiên `dev` > `master` > `main` theo thứ tự tồn tại trên remote. Nếu đang ở branch feature → base từ đó.
- **Merge style**: kiểm tra `git log` xem repo dùng squash hay merge-commit rồi theo. Repo vif: merge-commit (xem `references/vif.md`).

## Nguyên tắc cốt lõi

### 1. Nguyên tắc branch & commit
- Khi muốn tạo branch mới từ thay đổi: dùng `--br`.
- Khi dùng `--cm`: **luôn commit trực tiếp tại branch hiện tại** mà không cần hỏi lại hay tự động chuyển/tạo branch mới.

### 2. Commit nguyên tử — KHÔNG lẫn "linh tinh"
- Một commit = một mục đích logic (một feature slice, một fix, một chore).
- **Tách** các thay đổi không liên quan thành commit riêng. Ví dụ: đang làm `feat: X` mà format lại config → thành 2 commit (`feat:` + `style:`), không gộp.
- Chỉ stage **chính xác** file thuộc về commit đó — dùng `git add <path>` tường minh, **không** `git add .` / `git add -A` mù quáng.
- Loại trừ cruft: file build artifact (`bin/`, `obj/`, `node_modules/`, `dist/`, `build/`), file tạm (`*.swp`, `*.orig`), log, `.DS_Store`. Chúng phải ở `.gitignore`; nếu lọt vào staged → unstage ngay.
- **KHÔNG commit "tài liệu rác"** — artefact do chính session sinh ra, không phải deliverable: plan artefact (`plans/<date>-<slug>/`, `plans/reports/**`, `plans/journals/**`), file note/handoff/summary/progress tạm mà user không yêu cầu. Mặc định KHÔNG stage — để untracked và liệt kê trong báo cáo. Chỉ commit khi user nói rõ ("commit cả plan/report"), hoặc file là deliverable/tài liệu repo có chủ đích (task "viết plan/docs", README, docs/ thật, CHANGELOG, ADR → type `docs:`). File `.md` mới mà không rõ là rác hay tài liệu → bỏ qua, hỏi user.

### 3. Conventional Commits
Format: `<type>: <description>`

| type | dùng khi |
|------|----------|
| `feat` | feature mới |
| `fix` | sửa bug |
| `refactor` | đổi code không đổi behavior |
| `perf` | tối ưu hiệu năng |
| `docs` | tài liệu, CLAUDE.md, ADR, vault |
| `test` | thêm/sửa test |
| `chore` | tooling, Makefile, CI, script dev |
| `ci` | CI config |
| `style` | format, config (không đổi logic) |

Description: viết thường sau dấu `:`, imperative mood (tiếng Anh) hoặc tóm tắt ngắn gọn. ≤ 72 ký tự ở subject line. Nếu repo có quy ước riêng (vd `feat: FR-NN <Domain>`) → theo repo.

### 4. Branch & PR
- Branch feature: `feat/<slug>`, `fix/<slug>`, `chore/<slug>` (kebab-case, mô tả ngắn gọn change).
- **KHÔNG commit thẳng lên branch chính** khi làm feature — tạo branch trước (xem `--br`/`--cm`/`--pr <branch>`).
- **Thứ tự ưu tiên base branch khi tạo branch mới: `dev` > `master` > `main`.** Nếu đang ở branch feature → base từ đó; nếu không → base từ `dev`; chỉ base từ `master`/`main` khi không có `dev`.
- Repo vif dùng **flow merge 2 tầng `br → dev → master`** — chi tiết `references/vif.md`. **`--pr <branch>` dùng ĐÚNG `<branch>` đó làm target, không áp flow mặc định, KHÔNG suy đoán.**
- Theo merge style của repo (squash hay merge-commit) — kiểm tra `git log`. Repo vif: merge-commit (xem `references/vif.md`).

### 5. Tiền điều kiện / trạng thái cần check trước
- **Build check**: nếu commit chạm code cần build (`.cs`, `.ts`, `.go`, `.py`...) → chạy build/lint của repo đó, phải xanh trước khi commit. Nếu repo có pre-commit hook (`.githooks/pre-commit`, `core.hooksPath`) → đảm bảo đã set.
- **Auth CLI** (chỉ khi `--pr`): `gh auth status` (GitHub) hoặc `glab auth status` (GitLab) phải `✓` cho host của remote. Nếu token expired → báo user chạy `! gh auth login` / `! glab auth login` (interactive, user tự nhập). Repo vif: xem `references/vif.md`.

### 6. Minh bạch — cho user thấy cái gì thay đổi
Sau mỗi lệnh, tóm tắt ngắn:
- Files đã stage/commit (path + dòng +/-).
- Commit hash + subject.
- (--cm) branch hiện tại.
- (--pr `<branch>`) PR/MR URL + source → target branch + title.


---

## Lệnh `--br` — Tạo branch

### Bước
1. **Quan sát trạng thái**
   ```bash
   git status --short
   git diff            # unstaged
   git branch --show-current
   ```
2. **Xác định tên branch** từ change:
   - Đọc diff, suy ra loại change (`feat`/`fix`/`chore`/`refactor`/`docs`/`test`).
   - Đặt tên theo quy ước mục 4: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
   - Slug: kebab-case, mô tả ngắn gọn change (vd `feat/auth`, `fix/token-refresh-null`).
3. **Tạo branch** (từ base đã xác định — mục 4; repo vif thường `dev`):
   ```bash
   git checkout -b <branch-name>
   ```
4. **Báo cáo**: branch mới + base branch + change sẽ nằm trên đó. KHÔNG commit.

### Lưu ý
- Nếu đã ở branch feature (không phải branch chính) → báo "đã ở branch X", không tạo mới trừ khi user yêu cầu.
- `--br` chỉ tạo branch, không stage, không commit.

---

## Lệnh `--cm` — Commit (luôn commit tại branch hiện tại)

### Bước
1. **Quan sát trạng thái**
   ```bash
   git status --short
   git diff            # unstaged
   git diff --cached   # đã staged (nếu có)
   git branch --show-current
   ```
2. **Branch thực thi**: Luôn commit trực tiếp trên branch hiện tại (`git branch --show-current`), không tự động chuyển branch hay hỏi lại.
3. **Kiểm tra pre-flight** (nếu chạm code cần build): chạy build/lint của repo → phải xanh. Nếu đỏ → dừng, báo user sửa build trước, KHÔNG commit code lỗi.
4. **Phân nhóm thay đổi** — đọc diff, quyết định có cần tách thành nhiều commit không:
   - Nếu tất cả thay đổi cùng phục vụ 1 mục đích → 1 commit.
   - Nếu có nhóm file "linh tinh" (format, chore kèm feature) → tách: commit feature trước, chore/style sau.
5. **Stage chính xác** — `git add <path1> <path2> ...`, KHÔNG `git add -A`.
   - Loại cruft: kiểm tra `git status --short` không có `bin/` `obj/` `node_modules/` `*.orig` v.v. trong staged. Nếu có → `git restore --staged <path>`.
   - Loại artefact session (plan/report/note tạm do session sinh — mục 2): KHÔNG stage, để untracked; liệt kê vào báo cáo ở bước 8.
6. **Soạn commit message** — theo Conventional Commits (mục 3). Nếu repo có quy ước feature (vd FR) → theo repo.
7. **Commit**
   ```bash
   git commit -m "<type>: <subject>"
   # hoặc multi-line:
   git commit -m "<type>: <subject>" -m "<body chi tiết (tuỳ chọn)>"
   ```
   Pre-commit hook (nếu có) tự format + re-stage. Nếu hook báo có thay đổi sau re-stage → commit vẫn thành công; diffextra là do format.
8. **Báo cáo**: in ra `git show --stat HEAD` (hash, subject, file list + +/-) + branch hiện tại + artefact session đã bỏ qua (nếu có).

### Lưu ý
- Nếu working tree clean → báo "Không có gì để commit", KHÔNG tạo empty commit.
- `--cm` KHÔNG push. Muốn push → dùng `--pr <branch>` hoặc push tay.

---

## Lệnh `--pull <branch>` — Lấy code mới nhất của `<branch>` về branch đang checkout

Mục đích: đồng bộ branch hiện tại với latest code của `<branch>` (thường là `dev`) trước khi làm tiếp / trước khi tạo MR. Merge (KHÔNG rebase) để giữ nguyên history branch đã push — repo vif dùng merge-commit.

### Bước
1. **Bắt buộc có `<branch>`** — `--pull` thiếu branch đích là lỗi tham số: dừng, yêu cầu user gọi lại (vd `--pull dev`). KHÔNG tự đoán `dev`/`master`/`main`, KHÔNG suy từ flow 2 tầng.
   - `<branch>` không tồn tại trên remote → dừng, báo user (gợi ý `git remote show origin`).
2. **Quan sát trạng thái**
   ```bash
   git status --short
   git branch --show-current
   ```
   - Working tree **dirty** → dừng, báo user commit trước (`--cm`) hoặc stash tay. KHÔNG tự stash/commit hộ.
   - Đang ở branch chính (`dev`/`master`/`main`) và `<branch>` khác → vẫn cho phép, nhưng báo rõ đang merge vào branch chính.
3. **Fetch + merge**
   ```bash
   git fetch origin <branch>
   git merge origin/<branch> --no-edit
   ```
   - `Already up to date.` → báo "đã là mới nhất", xong.
   - Merge sạch (không conflict) → sang bước 5.
4. **Xử lý conflict** — chỉ khi `git merge` để lại conflict. Liệt kê file conflict:
   ```bash
   git status --short        # UU / AA / DU / UD / AU / UA
   ```
   Phân loại và xử lý theo thứ tự:
   | Loại file conflict | Cách xử lý |
   |--------------------|-----------|
   | Lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `go.sum`, `composer.lock`, `Cargo.lock`, `poetry.lock`, `uv.lock`) | KHÔNG sửa marker tay: lấy phía ours rồi regenerate (`npm install` / `pnpm install` / `go mod tidy` / ...). Không regenerate được → hỏi user |
   | Generated/build artifact (`dist/`, `build/`, `*.min.*`, `*.snap` generated) | Lấy theirs (`git checkout --theirs <path>`) rồi regenerate nếu repo có lệnh build. Không chắc → hỏi user |
   | Conflict chỉ do format/whitespace | Resolve bằng cách chạy formatter/lint của repo trên file đó |
   | Conflict logic rõ ràng (một phía chỉ thêm dòng, hai phía sửa disjoint, diff đọc hiểu được ngay) | Resolve, giữ cả hai thay đổi đúng nghĩa |
   | Hai phía sửa cùng một logic/biểu thức mà không suy ra được ý định | **KHÔNG đoán** → giữ nguyên trạng thái merge, hỏi user |
   - Sau mỗi file resolve: `git add <path>` (tường minh, không `git add -A`).
   - Xong hết → hoàn tất merge:
     ```bash
     git commit --no-edit      # merge commit, giữ subject mặc định "Merge ..."
     ```
   - Nếu có file không tự resolve được → **giữ nguyên merge đang dở** (KHÔNG `git merge --abort` trừ khi user yêu cầu), báo user: danh sách file conflict + đoạn conflict + 2 lựa chọn của từng file, chờ user quyết.
5. **Verify sau merge** — nếu merge chạm code cần build (`.cs`, `.ts`, `.go`, `.py`...) → chạy build/lint của repo, phải xanh. Đỏ do conflict resolve sai → báo user, không tự commit tiếp.
6. **Báo cáo**: branch hiện tại, `<branch>` đã merge, số file thay đổi + `+/-` (`git diff HEAD@{1} --stat` sau merge), danh sách conflict đã resolve (nếu có), kết quả build. Lưu ý: `git show --stat HEAD` trên merge commit KHÔNG in `--stat` (chỉ header) — luôn dùng `git diff HEAD@{1} --stat`.

### Lưu ý
- KHÔNG push sau khi pull (không nằm trong phạm vi `--pull`). Muốn push/MR → `--pr <branch>`.
- KHÔNG dùng `git pull` trần (không truyền branch, dễ pull nhầm target) và KHÔNG `--rebase` mặc định trên branch đã push.
- Conflict kiểu "modify/delete" (`DU`/`UD`): giữ bản modify nếu file vẫn còn được dùng, xoá nếu upstream đã remove có chủ đích — không chắc thì hỏi user.

---

## Lệnh `--pr <branch>` — Commit + Push + PR (GitHub) / MR (GitLab)

### Bước
1. **Bắt buộc có `<branch>`** — `--pr` thiếu branch đích là **lỗi tham số**: dừng ngay, yêu cầu user gọi lại kèm branch (vd `--pr dev`). KHÔNG hỏi lại kiểu "merge vào branch nào?", KHÔNG tự chọn `dev`/`master`/`main`, KHÔNG suy đoán từ branch hiện tại hay từ flow 2 tầng. Branch đích là input do user cấp, không phải thứ để đi hỏi.
   - `<branch>` không tồn tại trên remote → dừng, báo user (gợi ý `git remote show origin`), KHÔNG tạo MR vào branch không tồn tại, KHÔNG fallback sang branch khác.
2. Thực hiện commit trên branch hiện tại tương tự `--cm` (build check → stage → commit).
3. **Push**
   ```bash
   git push -u origin HEAD
   ```
   Dùng `HEAD` để đẩy branch hiện tại đúng tên, `-u` set upstream cho lần đầu.
4. **Check auth CLI theo platform**
   - GitHub: `gh auth status` — token fail → báo user chạy `! gh auth login`. KHÔNG tạo PR khi chưa auth.
   - GitLab: `glab auth status` — token fail → báo user chạy `! glab auth login` (interactive, tự nhập token). Repo vif (`git.vietinfo.tech:8443`): xem `references/vif.md` trước khi quy kết token expired.
5. **Thu thập thông tin cho PR/MR**
   - Source branch: `git branch --show-current`.
   - Target branch: **`<branch>` user truyền vào `--pr`**. Không default, không fallback.
   - Title: dùng commit subject đầu tiên (hoặc tổng hợp nếu nhiều commit).
   - Description: tóm tắt thay đổi từ `git log <branch>..HEAD --oneline` + `git diff <branch>...HEAD --stat` (`<branch>` = target user truyền vào `--pr`).
6. **Tạo PR/MR** — chọn lệnh theo platform đã detect:

   **GitHub (`gh`):**
   ```bash
   BRANCH="<branch>"   # branch đích user truyền vào --pr
   gh pr create \
     --base "$BRANCH" \
     --head "$(git branch --show-current)" \
     --title "<title>" \
     --body "<description markdown>"
   ```
   - `gh` tự detect repo từ remote. Merge style (squash/merge-commit) quyết lúc merge trên UI — KHÔNG merge thay user.
   - Template `.github/PULL_REQUEST_TEMPLATE.md` → `gh` tự dùng; nếu không → body tự viết.

   **GitLab (`glab`):**
   ```bash
   BRANCH="<branch>"   # branch đích user truyền vào --pr
   glab mr create \
     --source-branch "$(git branch --show-current)" \
     --target-branch "$BRANCH" \
     --title "<title>" \
     --description "<description markdown>" \
     --remove-source-branch=false \
     --squash-before-merge=false \
     --yes
   ```
   - `--squash-before-merge=false`: theo merge style của repo (vif dùng merge-commit — `references/vif.md`). Đổi thành `true` chỉ khi user yêu cầu hoặc repo dùng squash.
   - `--remove-source-branch=false`: giữ branch sau merge mặc định; set `true` nếu user muốn tự xoá.
   - Template `.gitlab/merge_request_templates/` → `glab` tự dùng; nếu không → description tự viết.

7. **Báo cáo**: PR/MR URL (gh in URL; glab in `!<id> <title> (<url>)`), source → target, số commit, file stat.

### Mô tả PR/MR gợi ý (markdown)
```markdown
## Tóm tắt
<1-2 câu mô tả mục đích>

## Thay đổi
- <bullet điểm chính, trích từ commit subjects>

## Checklist
- [x] build/lint xanh
- [x] commit nguyên tử, Conventional Commits
- [ ] test (nếu áp dụng)
```

### Lưu ý
- KHÔNG set auto-merge / tự merge — để user review rồi merge tay trên UI.
- PR/MR đã tồn tại cho branch này → báo user URL hiện có thay vì tạo mới: GitHub `gh pr list --head <branch>`; GitLab `glab mr list --source-branch <branch>`.
- Nếu push bị reject (remote ahead) → KHÔNG `--force` mặc định. Pull rebase trước: `git pull --rebase origin <branch>` rồi push lại. Chỉ force khi user yêu cầu và branch là cá nhân (không share).
- KHÔNG chạy `--pr` mà không có `<branch>`; KHÔNG hỏi lại user "merge vào branch nào" — thiếu thì báo lỗi tham số và chờ user gọi lại.


---

## Quick reference — lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
|-------------|-------------|-------|
| pre-commit hook sửa file rồi commit vẫn OK | hook format + re-stage | bình thường, không cần can thiệp |
| `git commit` báo "nothing to commit" | working tree clean | báo user, bỏ qua |
| push reject / non-fast-forward | remote ahead | `--pull <branch>` (merge) → push lại; branch cá nhân chưa share có thể `git pull --rebase origin <branch>` |
| `git merge` báo "Already up to date" | branch đã có latest | bình thường, báo user, không phải lỗi |
| `--pull` working tree dirty | có change chưa commit | dừng, user commit (`--cm`) hoặc stash trước rồi gọi lại |
| conflict chỉ ở lockfile / file generated | merge marker trong file sinh tự động | lấy ours rồi regenerate, KHÔNG sửa marker tay |
| conflict hai phía sửa cùng logic | không suy ra được ý định | KHÔNG đoán — giữ merge state, hỏi user |
| `--pull` không kèm branch | thiếu input bắt buộc | dừng, báo lỗi tham số, chờ user gọi lại `--pull <branch>` |
| `glab mr create` 401 / invalid_token | token expired hoặc config sai key | xem `references/vif.md` (debug glab); test token bằng `curl` trước khi quy kết expired |
| `glab mr create` "already exists" | MR cho branch đã có | `glab mr list --source-branch <branch>` lấy URL, không tạo mới |
| `glab mr create` "none of the git remotes correspond to GITLAB_HOST" | default `host:` trong config không khớp remote (mismatch port) | xem `references/vif.md` — host có port |
| `glab auth status` 401 dù vừa cấp token mới | config có duplicate host entry, token mới nằm dưới key sai | `glab auth login --hostname <host> --token <token>` ghi đè lên key đúng |
| `gh pr create` báo đã có PR cho branch | PR tồn tại | `gh pr list --head <branch>` lấy URL, không tạo mới |
| staged có `bin/` `obj/` `node_modules/` | thiếu .gitignore / cruft | `git restore --staged <path>`, thêm vào `.gitignore` |
| staged có `plans/` artefact, report/summary/note `.md` do session sinh | tài liệu rác, không phải deliverable | `git restore --staged <path>`, để untracked; chỉ commit khi user yêu cầu |
| commit chứa cả feature + format lẫn lộn | vi phạm nguyên tử | `git reset HEAD~1` (soft) → tách stage lại thành 2 commit |
| `--pr` không kèm branch / agent định hỏi lại target | thiếu input bắt buộc | dừng, báo lỗi tham số, chờ user gọi lại `--pr <branch>` |


## Don't

- ❌ `git add .` / `git add -A` mù quáng — luôn stage tường minh.
- ❌ Commit code không build được.
- ❌ Gộp "linh tinh" (format, file tạm) vào commit feature.
- ❌ Commit plan/report/journal/handoff/summary do session tự sinh khi user không yêu cầu — để untracked, liệt kê trong báo cáo; chỉ commit deliverable `docs:` user đã chốt.
- ❌ `--force` push lên branch share / branch chính.
- ❌ Tự merge PR/MR thay user.
- ❌ Đoán branch cho `--pull` / `--pr` khi user không truyền — thiếu branch là lỗi tham số, hỏi lại chỉ để lấy branch.
- ❌ `--pull` khi working tree dirty (tự ý stash/commit hộ user).
- ❌ Resolve conflict bằng cách chọn bừa một phía hoặc sửa marker tay ở lockfile/file generated.
- ❌ `git merge --abort` khi conflict chưa tự resolve — giữ nguyên state và hỏi user.
- ❌ Sửa commit đã push lên branch share (cần rebase cẩn thận, báo user trước).
- ❌ Chạy `--pr` không kèm branch, hoặc hỏi lại user "merge vào branch nào" — thiếu branch là lỗi tham số, báo lỗi và chờ user gọi lại.

## Skill liên quan

- **vt-build** — sau khi MR được merge vào branch chính: bump version / annotated tag / GitLab Release (`--bump`, `--release`, `--note`, `--rc`, `--check`, `--rollback`). Skill này dừng ở MR; tag/release là phạm vi của `vt-build`.
