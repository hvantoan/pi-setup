# Hướng dẫn migrate setup `pi` sang máy khác

> Cập nhật: **2026-09-15** · pi `0.85.1` · Node `v24.19.0`
> Repo: `zuey-pi-setup` — công cụ + snapshot setup, dùng để dựng lại nguyên bộ extension `pi` trên máy khác.

---

## TL;DR

**Máy mới:**

```bash
npm i -g @earendil-works/pi-coding-agent@0.85.1   # cài pi trước (đúng version)
git clone https://github.com/mrgoonie/zuey-pi-setup.git
cd zuey-pi-setup
./scripts/pi-setup-restore.sh --install --verify
```

Rồi `/login` lại từng provider. **Xong** — pi tự cài đủ 18 extensions.

**Không cần** copy thư mục `npm/` (244 MB cache) hay `auth.json` (secret).

---

## Nguyên tắc: `settings.json` là manifest

`~/.pi/agent/settings.json` chứa mảng `packages` liệt kê mọi extension. Khi khởi động, pi tự đọc mảng này và `npm install` mọi package còn thiếu vào `~/.pi/agent/npm/`.

Hệ quả quan trọng:

- Mang **toàn bộ extension** sang máy khác = chỉ cần mang `settings.json` + các file setup khác.
- `npm/` (244 MB) và `sessions/` (46 MB) là cache/history, **không** phải config → bỏ lại.
- Chạy lần 2 không cài lại gì (idempotent).

Cơ chế này có trong `docs/packages.md` của pi và đã được kiểm chứng thực tế — xem [Kiểm chứng](#kiểm-chứng-đã-test-thật).

---

## Copy gì / không copy gì

| Mục trong `~/.pi/agent/` | Size | Vào repo? | Lý do |
|---|---|---|---|
| `settings.json` | 4 KB | ✅ **bắt buộc** | 18 packages, `enabledModels`, theme, compaction, thinkingBudgets, retry |
| `APPEND_SYSTEM.md` | 4 KB | ✅ | system prompt phụ |
| `extensions/` | 1.3 MB | ✅ (lọc) | extension tự viết local + config của chúng. `orca-*.ts` (Orca sinh) và `agentkit-*` (AgentKit sinh) bị loại — xem `.pi-setup-exclude` |
| `extensions/pi-footer.json` | 1.3 KB | ✅ **mặc định** | layout statusline (gồm context bar) — opt-out bằng `--no-statusline` |
| `extensions/provider-fallback.json` | — | ✅ **mặc định** | config của `pi-provider-fallback`, tạo bởi `/fallback-config` |
| `extensions/*/hooks/` | 544 KB | ⚠️ opt-in | `--hooks` (mặc định đã nằm trong `extensions/` khi không lọc) |
| `models-store.json` | 28 KB | ✅ | catalog model; có sẵn thì khỏi chờ refresh 4 giờ |
| `advisor.json` | — | ✅ **mặc định** | config `pi-advisor-flow`, ở **gốc** config dir (không trong `extensions/`) nên liệt kê riêng; chỉ có sau `/advisor` hoặc `/advisor-settings` |
| `advisor-outcomes.jsonl`, `advisor-outcomes-salt` | — | ❌ | log outcome + salt theo máy của `pi-advisor-flow` → nằm trong `.pi-setup-exclude` |
| `skills/` | 24 MB | ⚠️ opt-in | `--skills` — dereference symlink sang AgentKit (`~/.agents/skills`) |
| `memory/` | — | ⚠️ opt-in | `--memory` |
| `missions/` | 184 KB | ⚠️ opt-in | `--missions` — state của `pi-goal-x`; chứa tên project/khách hàng + đường dẫn nội bộ |
| `trust.json` | 4 KB | ❌ | chứa path tuyệt đối của máy cũ → script có `--with-trust` nếu cần |
| `auth.json` | 4 KB | ⚠️ opt-in | `--auth` — **secret** (API key + OAuth access/refresh token); mặc định không lấy, `/login` lại trên máy mới |
| `npm/` | ~250 MB | ❌ | pi tự cài lại |
| `sessions/` | 57 MB | ⚠️ opt-in | `--sessions` — history chat; restore rồi thì `pi --resume` |

`missions/`/`memory/`/`skills/`/`auth.json`/`sessions/` **không** nằm trong bản mặc định vì chúng là *state* hoặc *secret*, không phải *setup*. Bật từng cái bằng flag tương ứng, hoặc `--with-state` (= `--skills --memory --missions`).

---

## Repo có gì

```
zuey-pi-setup/
├── README.md
├── docs/
│   └── pi-setup-migration.md        ← file này (hướng dẫn chi tiết)
├── scripts/
│   ├── pi-setup-backup.sh           ← đóng gói setup hiện tại
│   └── pi-setup-restore.sh          ← dựng lại trên máy mới
└── config/                          ← snapshot setup, đọc/diff được
    ├── .pi-setup-exclude           ← glob loại trừ (backup tôn trọng file này)
    ├── settings.json
    ├── APPEND_SYSTEM.md
    ├── models-store.json
    └── extensions/
        ├── pi-footer-cache-tps.ts
        └── pi-footer.json
```

`config/` là **mirror** của `~/.pi/agent` (chỉ 4 mục setup). Cập nhật lại sau khi bạn đổi setup:

```bash
./scripts/pi-setup-backup.sh --config-dir config
git add -A && git commit -m "chore(setup): refresh pi config snapshot" && git push
```

---

## Bước 1 — máy mới: cài pi

```bash
nvm install 24 && nvm use 24                        # pi cài global theo từng Node version
npm i -g @earendil-works/pi-coding-agent@0.85.1
pi --version                                        # phải ra 0.85.1
```

> pi cài **theo từng Node version** của nvm. Nếu sau này `nvm use` sang version khác mà không thấy lệnh `pi`, đó là lý do — cài lại global cho version đó.

## Bước 2 — restore

```bash
git clone https://github.com/mrgoonie/zuey-pi-setup.git
cd zuey-pi-setup

# an toàn: thử vào thư mục tạm trước, không đụng config thật
./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify

# làm thật
./scripts/pi-setup-restore.sh --install --verify
```

Script sẽ:

1. Snapshot `settings.json` hiện có thành `settings.json.bak.<YYYYmmdd-HHMMSS>` (nếu đã tồn tại),
2. Copy 4 mục setup vào `~/.pi/agent`,
3. Chạy pi headless 1 lần → pi tự cài 18 extension (~150–200 s),
4. Verify số extension khớp với `settings.json`.

## Bước 3 — login lại provider

`auth.json` không nằm trong repo (secret). Các provider của setup này:

```bash
pi auth check --provider opencode-go      # chẩn đoán
pi auth check --provider deepseek
pi auth check --provider openai-codex
```

Trong pi: `/login`, hoặc `pi auth login` theo hướng dẫn `/login`. Kiểm tra model đã thấy chưa: `pi --list-models`.

---

## Statusline: context bar (0–100%)

Statusline là `pi-footer`, config ở `~/.pi/agent/extensions/pi-footer.json`. Widget **`context-bar`** hiển thị thanh tiến độ context theo **context window của từng model**:

```json
{ "type": "context-bar", "options": { "contextBarMode": "medium", "contextConditionalColors": true, "hideWhenZero": true } }
```

Render thật (gọi trực tiếp `render()` của widget, context 200k):

```
 25%  [████░░░░░░░░░░░░] 50k/200k (25%)      fg=blue
 71%  [███████████░░░░░] 142k/200k (71%)     fg=yellow   ← ≥ contextWarningPercent (70)
 92%  [███████████████░] 184k/200k (92%)     fg=red      ← ≥ contextDangerPercent (90)
```

Context 1M ở 25% → `[████░░░░░░░░░░░░] 250k/1m (25%)` (thang chia theo model, không phải số cố định). Chưa biết context length → `?`.

Đổi kiểu bar: `contextBarMode` ∈ `default` (32 ô) · `medium` (16 ô, đang dùng) · `short` (10 ô) · `short-only` (10 ô, không số). Muốn hiện token thô: đổi type thành `context-length` / `context-remaining` / `context-window`.

Config này **được backup mặc định** (nằm trong `extensions/`); `--no-statusline` để opt-out.

---

## `pi-provider-fallback`

Khi model đang dùng gặp lỗi **transient / quota / model-unavailable**, extension tự chuyển sang model fallback kế tiếp (ưu tiên **cùng provider** trước, rồi provider khác) và **chạy lại prompt bị lỗi**; nếu model mới có context window nhỏ hơn thì kích hoạt compaction trước. Swap giữ cho cả session, model gốc phục hồi khi shutdown hoặc `/reload`.

```bash
/fallback-config     # TUI chọn fallback model cho từng provider (tự lưu mỗi action)
/fallback-status     # xem config hiện tại
```

Config: `~/.pi/agent/extensions/provider-fallback.json` → **backup mặc định** (script báo cáo trong phần *config extension*). File chỉ tồn tại sau lần đầu chạy `/fallback-config`. Nếu đặt `PI_PROVIDER_FALLBACK_CONFIG` trỏ ra ngoài config dir, script sẽ cảnh báo là backup không tự thấy được.

---

## Hai script

Cả hai **không hỏi xác nhận** — rủi ro được xử lý bằng snapshot + cảnh báo ra `stderr`, để chạy được trong script/CI.

### `scripts/pi-setup-backup.sh`

Mặc định chỉ lấy **setup**: `settings.json`, `APPEND_SYSTEM.md`, `models-store.json`, `extensions/` (kèm luôn statusline `extensions/pi-footer.json`).

```bash
./scripts/pi-setup-backup.sh                       # → ./pi-setup-portable.tar.gz (chỉ setup)
./scripts/pi-setup-backup.sh --config-dir config    # → ghi plain file vào config/ (để commit)
./scripts/pi-setup-backup.sh --exclude-file config/.pi-setup-exclude   # bundle đã lọc
./scripts/pi-setup-backup.sh --skills --hooks       # thêm skills + hooks
./scripts/pi-setup-backup.sh --no-statusline        # KHÔNG lấy config statusline
./scripts/pi-setup-backup.sh --with-state           # = --skills --memory --missions
./scripts/pi-setup-backup.sh -o ~/Desktop/pi.tar.gz
./scripts/pi-setup-backup.sh --dry-run
```

| Tùy chọn lọc | Tác dụng |
|---|---|
| `--exclude-file F` | loại mọi path khớp glob trong `F` (mỗi dòng 1 pattern, `#` = comment) — áp cho **cả** tarball lẫn `--config-dir`. Bundle trong `backups/` dùng đúng cơ chế này |
| `--config-dir DIR` | đọc thêm `<DIR>/.pi-setup-exclude` khi mirror |

| Opt-in (mặc định **không** lấy) | Lấy gì | Ghi chú |
|---|---|---|
| `--auth` | `auth.json` | ⚠ **credential** — không đưa artifact lên nơi công khai |
| `--skills` | `skills/` | dereference symlink → tự chứa (~24 MB, 108 skill) |
| `--hooks` | thư mục `hooks/` trong `~/.pi/agent` | 544 KB; **không** đụng `~/.claude/hooks` (có `.env`); ghi đè `.pi-setup-exclude` cho đường dẫn hooks |
| `--memory` | `memory/` | |
| `--missions` | `missions/` | ⚠ có thể chứa tên project/khách hàng |
| `--sessions` | `sessions/` | ~57 MB |

| Opt-out | Tác dụng |
|---|---|
| `--no-statusline` | không lấy `pi-footer.json` / `powerline-footer/theme.json` → máy mới dùng layout mặc định |

Script tự:

- ghi ra file tạm rồi `mv` → không để lại artifact hỏng nếu bị ngắt;
- **quét secret** (`sk-*`, `ghp_*`, `BEGIN PRIVATE KEY`, `api_key=…`) và cảnh báo — bỏ qua placeholder trong tài liệu (`password: "securePassword123"`, `{CLIENT_SECRET}`) để cảnh báo còn lại mới đáng đọc;
- **cảnh báo symlink trỏ ra ngoài** config dir (gợi ý dùng `--skills`);
- **báo cáo config extension** trong phần tóm tắt: statusline (`pi-footer.json`) và provider-fallback (`provider-fallback.json`) có được backup hay không;
- ở chế độ `--config-dir`, tôn trọng `<DIR>/.pi-setup-exclude` (glob loại trừ), dọn cả thư mục rỗng còn sót → artifact public không bị thêm lại file nhạy cảm; ở chế độ tarball thì dùng `--exclude-file` cùng cú pháp;
- nén **deterministic** (`gzip -n`) → cùng nội dung cho cùng SHA-256, kiểm tra được giữa 2 máy;
- từ chối ghi `--config-dir` vào `$HOME`, `/`, hoặc chính thư mục config của pi.

### `scripts/pi-setup-restore.sh`

| Tùy chọn | Tác dụng |
|---|---|
| `--from-config DIR` | restore từ `config/` (plain file) |
| `--bundle FILE` | restore từ `.tar.gz` |
| `--target DIR` | đích khác `~/.pi/agent` |
| `--scratch` | đích là thư mục tạm — **an toàn để thử** |
| `--install` | chạy pi headless 1 lần để tự cài extension (~150–200 s) |
| `--verify` | so số extension đã cài với `settings.json` |
| `--with-trust` | copy cả `trust.json` |
| `--dry-run` | chỉ in ra, không ghi |

Nếu không chỉ định nguồn, script tự dùng `<repo>/pi-setup-portable.tar.gz`, rồi tới `<repo>/config`.

Trước khi ghi đè, `settings.json` **và** `auth.json` (nếu nguồn có file) được snapshot thành `*.bak.<timestamp>` — auth là credential nên ghi đè mà không sao lưu là không thể khôi phục.

Script đặt `trap ERR` nên **không bao giờ thoát im lặng** — gặp lỗi ngoài dự kiến sẽ in `✗ lỗi không mong đợi tại pi-setup-restore.sh dòng <N>`.

---

## Kiểm chứng (đã test thật)

Cách test: restore vào một config dir **hoàn toàn mới** qua biến `PI_CODING_AGENT_DIR`, không đụng setup thật.

### Đường tarball (bundle đầy đủ — đo với snapshot 16 package, trước khi thêm `pi-provider-fallback`)

| Kiểm tra | Kết quả |
|---|---|
| Thời gian cài lần đầu | **156 s** |
| Module dirs trong `npm/node_modules` | **182** (16 extension + transitive deps) |
| Lỗi trong log | **0** |
| `diff <(pi list máy gốc) <(pi list dir mới)` | **16/16 TRÙNG KHỚP 100%** |
| `auth.json` trong dir mới | `{}` → **không rò secret** |
| Chạy lần 2 | log rỗng (0 byte) → **idempotent** |

### Đường `--from-config config` (payload hiện tại — 18 package)

| Kiểm tra | Kết quả |
|---|---|
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json extensions` |
| Cài 18 extension | ✅ **210 s**, module dirs `0 → 184` |
| `--verify` | ✅ **`18/18 extension khớp`** |
| Extension có **chạy** không | ✅ 16 `extension_ui_request`, **0 lỗi**, thấy cả `advisor-scout` + `advisor-usage` |
| `pi list` trong bản restore | ✅ 18 package |

### Cùng đường đó ở snapshot 17 package

| Kiểm tra | Kết quả |
|---|---|
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json extensions` |
| Cài 17 extension | ✅ **136 s**, module dirs `0 → 183` |
| `--verify` | ✅ **`17/17 extension khớp`** |
| Extension có **chạy** không (không chỉ cài) | ✅ khởi động pi trong dir vừa restore: **11 `extension_ui_request`**, 0 lỗi |
| `pi list` trong bản restore | ✅ 17 package |
| Config thật có bị đụng không | ✅ không (không sinh `settings.json.bak` mới) |

### Cùng đường đó, đo lần đầu (khi còn 16 package)

| Kiểm tra | Kết quả |
|---|---|
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json extensions` |
| Cài extension | ✅ **138 s** và **192 s** ở 2 lần chạy khác nhau (tuỳ tốc độ npm), module dirs `0 → 182` |
| `--verify` | ✅ **`16/16 extension khớp`** |
| Extension có **chạy** không (không chỉ cài) | ✅ khởi động pi trong dir vừa restore: **11 `extension_ui_request`**, 0 lỗi, thấy đủ surface `subagent-async`, `mcp`, `goal`, `background-tasks`, `usage`, `pi-footer` |
| `pi list` trong bản restore | ✅ 16 package |
| Config thật có bị đụng không | ✅ không (không sinh `settings.json.bak` mới) |

### Clone từ repo public (đo ở snapshot 16 package)

```bash
git clone https://github.com/mrgoonie/zuey-pi-setup.git /tmp/verify-clone
cd /tmp/verify-clone
./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify
```

| Kiểm tra | Kết quả |
|---|---|
| Clone chứa đúng payload public | ✅ 11 file; **0** file `orca-*`, `agentkit-*`, `native-skill-*` |
| Thời gian cài | ✅ **153 s**, module dirs `0 → 182` |
| `--verify` | ✅ **`16/16 extension khớp`** (exit 0) |
| Bản restore có chạy thật | ✅ 11 `extension_ui_request`, **0 lỗi** |

### Các test khác

| Test | Kết quả |
|---|---|
| Backup mặc định không chứa `missions/`, `memory/`, `skills/` | ✅ chỉ 4 mục setup |
| Backup 2 lần → `cmp` | ✅ **byte-identical** (deterministic) |
| Quét secret: `sk-proj-…` thật (test) | ✅ báo đúng file |
| Quét secret: PEM key có thân base64 | ✅ báo |
| Quét secret: PEM header trần · `{CLIENT_SECRET}` · `password: "currentPassword"` · fixture `ghp_aaaa…` | ✅ **im** (nhận là placeholder) |
| `--config-dir $HOME` | ✅ từ chối, exit 1 |
| Không tìm thấy nguồn | ✅ báo rõ đã thử đường dẫn nào, exit 1 |
| Bundle hỏng | ✅ ERR trap chỉ đúng số dòng |

---

## Xử lý sự cố

| Triệu chứng | Xử lý |
|---|---|
| Thiếu extension sau khi restore | `pi update --all`, hoặc `pi list` xem cái nào thiếu |
| Extension local không load | kiểm tra file còn trong `~/.pi/agent/extensions/`, rồi `/reload` hoặc restart pi |
| `pi` không tự cài (npm bị chặn) | cài thủ công từng package trong `settings.json` |
| `no credentials` / 401 | `/login`, hoặc `pi auth check --provider <name>` |
| Model không hiện | `pi --list-models`; kiểm tra `enabledModels` trong `settings.json` |
| `command not found: pi` sau khi `nvm use` | pi cài theo từng Node version → `npm i -g @earendil-works/pi-coding-agent` lại |
| Script thoát mà không rõ lỗi | đã có ERR trap in số dòng; trừ khi bạn tự sửa script |

---

## Lưu ý riêng của setup này

**2 skill là symlink sang AgentKit.** `~/.pi/agent/skills/` chứa symlink trỏ ra ngoài config dir:

```
skills/orchestration          -> ../../../.agents/skills/orchestration
skills/orca-per-workspace-env -> ../../../.agents/skills/orca-per-workspace-env
```

Đây là skill của **AgentKit** (`ak` CLI), không phải pi. Chúng chỉ hoạt động nếu máy mới đã cài AgentKit. Nếu chưa, 2 symlink này gãy — **không ảnh hưởng extension nào khác** (đã test đúng tình huống gãy: pi vẫn khởi động 0 lỗi, đủ 16 extension). Chúng cũng **không** nằm trong repo (state, không phải setup).

**3 extension `orca-*.ts` KHÔNG nằm trong repo.** `orca-agent-status.ts`, `orca-prefill.ts`, `orca-titlebar-spinner.ts` mang marker `@orca-managed-pi-extension` — do Orca sinh ra để tích hợp pi với Orca (gọi hook `127.0.0.1`, token đọc từ env `ORCA_AGENT_HOOK_TOKEN`, không hardcode secret). Chúng bị loại khỏi repo public vì là glue code tích hợp; Orca tự sinh lại khi quản lý pi trên máy mới.

**2 thư mục `agentkit-*` KHÔNG nằm trong repo.** AgentKit (`ak` CLI) tự cài `~/.pi/agent/extensions/agentkit-agent/` + `agentkit-hooks-engineer/` (1.2 MB, 79 file). Bên trong có cache chứa **path tuyệt đối** (`native-skill-paths.json` 157 KB, `native-skill-hashes.json` 280 KB) → máy-specific, không hợp lệ để đưa lên repo. `ak` tự cài lại trên máy mới.

**`pi-advisor-flow`.** Flow Executor/Advisor cho ý kiến thứ hai từ model mạnh hơn, có cổng review trước plan / sau lỗi lặp / trước khi kết thúc. Lệnh: `/advisor`, `/advisor-models`, `/advisor-settings`.

Config toàn cục ở `~/.pi/agent/advisor.json` — ở **gốc** config dir, không trong `extensions/`, nên `ITEMS_SETUP` của backup script phải liệt kê riêng (project override bằng `<project>/.pi/advisor.json`).

Extension này công bố thêm 2 status key `advisor-scout` + `advisor-usage`; cả hai đã vào `hiddenKeys` và có widget `external-status` inline → statusline vẫn **3 hàng** kể cả khi Advisor đang chạy (đã test với cả 11 key cùng có giá trị).

### `.pi-setup-exclude`

`scripts/pi-setup-backup.sh --config-dir config` đọc `config/.pi-setup-exclude` (mỗi dòng 1 glob, `#` = comment) và xoá mọi file khớp sau khi mirror. Nhờ vậy chạy backup lại cũng **không** tự thêm `orca-*`/`agentkit-*` trở lại repo:

```
loại trừ: 82 file khớp .pi-setup-exclude (extensions/orca-*.ts extensions/agentkit-*)
```

**Không có gì thuộc AgentKit trong repo này.** Bộ skill `ak-*` trong `~/.agents/skills` migrate riêng bằng CLI `ak`.

**Repo cá nhân, snapshot không bảo hành.** Đây là bản chụp setup của một máy tại một thời điểm; không phải sản phẩm chính thức của pi.

---

## Checklist

- [ ] Máy mới: Node đúng version (nvm) → `npm i -g @earendil-works/pi-coding-agent@0.85.1`
- [ ] `git clone https://github.com/mrgoonie/zuey-pi-setup.git`
- [ ] `./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify` (thử an toàn)
- [ ] `./scripts/pi-setup-restore.sh --install --verify` → phải ra `16/16 extension khớp`
- [ ] `/login` cho `opencode-go`, `deepseek`, `openai-codex`
- [ ] `pi auth check --provider opencode-go` → OK
- [ ] Thử 1 extension, ví dụ `/btw <câu hỏi>` (cần TUI mode)
- [ ] Chạy `/fallback-config` để cấu hình fallback model (sau đó backup tự kèm `provider-fallback.json`)
- [ ] Chạy `/advisor-settings` để cấu hình Executor/Advisor (sau đó backup tự kèm `advisor.json`)
- [ ] Cài AgentKit nếu cần skill symlink
