# Hướng dẫn migrate setup `pi` sang máy khác

> Cập nhật: **2026-10-07** · pi `1.0.4` · Node `v24`
> Repo: `pi-setup` — công cụ + snapshot setup, dùng để dựng lại nguyên bộ extension `pi` trên máy khác.

---

## TL;DR

**Máy mới:**

```bash
npm i -g @earendil-works/pi-coding-agent@1.0.4   # cài pi trước (đúng version)
git clone https://github.com/hvantoan/pi-setup.git
cd pi-setup
./scripts/pi-setup-restore.sh --install --verify
```

Rồi `export NINEROUTER_API_KEY=...` (key của 9router) — **xong**, pi tự cài đủ 20 extensions. Provider built-in khác thì `/login`.

**Không cần** copy thư mục `npm/` (244 MB cache) hay `auth.json` (secret).

> **Windows:** mọi lệnh ở đây chạy trong **Git Bash** (không PowerShell/cmd), Node cài qua `fnm` thay vì `nvm`, và icon statusline cần **Nerd Font** — xem [Windows (Git Bash)](#windows-git-bash).

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
| `settings.json` | 4 KB | ✅ **bắt buộc** | 20 packages, theme, compaction, thinkingBudgets, retry |
| `APPEND_SYSTEM.md` | 4 KB | ✅ | system prompt phụ |
| `models.json` | 1.6 KB | ❌ **credential** | khai báo provider **9router** (baseUrl `http://127.0.0.1:20128/v1`, `api: openai-completions`) + model `ocg/deepseek-v4.1-flash` (`contextWindow` 1.000.000, `maxTokens` 64.000 — khớp `context_length`/`max_completion_tokens` mà gateway báo). **Bản live chứa `apiKey` dạng literal** (bản commit cũ dùng `$NINEROUTER_API_KEY`, nên lịch sử git vẫn sạch) → `models.json` nằm trong `.pi-setup-exclude`, máy mới tự khai lại provider. Không có file này thì `9router` là provider lạ, `pi --list-models` không thấy model nào |
| `extensions/` | 1.4 MB | ✅ (lọc) | extension tự viết local (`pi-footer.json`, `pi-footer-cache-tps.ts`, `compaction-policy.ts`). `orca-*.ts` (Orca sinh), `agentkit-*` (AgentKit sinh) và `herdr-agent-state.ts` (herdr sinh) bị loại — xem `.pi-setup-exclude` |
| `extensions/pi-footer.json` | 1.3 KB | ✅ **mặc định** | layout statusline (gồm context bar) — opt-out bằng `--no-statusline` |
| `model-fallback/config.json` | — | ✅ **mặc định** | rule của `pi-model-fallback`, ở thư mục `model-fallback/` (không trong `extensions/`) nên liệt kê riêng; **chỉ lấy file config** — `state.json` cùng thư mục là state theo máy (entry + mốc cooldown), không đưa vào artifact |
| `extensions/*/hooks/` | 544 KB | ⚠️ opt-in | `--hooks` (mặc định đã nằm trong `extensions/` khi không lọc) |
| `models-store.json` | 61 KB | ✅ | catalog model; có sẵn thì khỏi chờ refresh 4 giờ |
| `~/.config/kitty/kitty.conf` | 456 B | ✅ **mặc định** | config terminal kitty, nằm **NGOÀI** config dir → lấy qua `EXTERNAL_CONFIGS`, thành `kitty.conf` + dòng tương ứng trong `external-configs.txt` |
| `99extensions.json` | — | ➖ không có | config họ 99percentpeople (`@99percentpeople/pi-todo`) ở gốc config dir; chỉ sinh ra sau khi dùng `/99settings` nên snapshot này không có. Script vẫn liệt kê, nên nó tự được lấy khi bạn dùng tính năng đó |
| `~/.unipi/config/notify/config.json` | — | ❌ **credential** | config `@pi-unipi/notify` (package này **đã bỏ khỏi snapshot**, thêm lại bằng tay nếu cần): chứa token Gotify + botToken/chatId Telegram → **cố ý** không đưa vào; chạy `/unipi:notify-set-gotify` + `/unipi:notify-set-tg` trên chính máy đó |
| `~/.pi-lens/config.json` | 136 B | ✅ **mặc định** | config `pi-lens`, nằm **NGOÀI** config dir → lấy qua `EXTERNAL_CONFIGS`, vào artifact thành `pi-lens-config.json` + manifest `external-configs.txt` (⚠️ **không** đặt tên artifact là `pi-lens.json`: trùng basename legacy của pi-lens → bị đọc như project config deprecated, xem README) |
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
pi-setup/
├── README.md                        English README (bản mặc định, GitHub hiển thị)
├── README.vi.md                     README tiếng Việt
├── .gitattributes                   ← giữ LF cho *.sh (tránh CRLF khi clone trên Windows)
├── docs/
│   └── pi-setup-migration.md        ← file này (hướng dẫn chi tiết)
├── scripts/
│   ├── pi-setup-backup.sh           ← đóng gói setup hiện tại
│   ├── pi-setup-restore.sh          ← dựng lại trên máy mới
│   ├── pi-setup-verify-advisor.mjs  ← kiểm tra advisor.json theo schema thật
│   └── pi-setup-patch-extensions.mjs  ← vá stale-ctx của pi-footer trong node_modules
└── config/                          ← snapshot setup, đọc/diff được
    ├── .pi-setup-exclude           ← glob loại trừ (backup tôn trọng file này)
    ├── settings.json
    ├── APPEND_SYSTEM.md
    ├── advisor.json
    ├── models-store.json
    ├── pi-lens-config.json         ← ~/.pi-lens/config.json (ngoài config dir)
    ├── kitty.conf                  ← ~/.config/kitty/kitty.conf (ngoài config dir)
    ├── external-configs.txt        ← manifest: file nào đặt về đâu khi restore
    ├── model-fallback/config.json
    └── extensions/
        ├── compaction-policy.ts     ← trigger nén theo % window (40%/75%, xem mục Compaction)
        ├── pi-footer-cache-tps.ts
        └── pi-footer.json
```

`models.json` **không** nằm trong `config/`: bản live đang chứa `apiKey` literal → `.pi-setup-exclude` loại nó. Máy mới khai lại provider 9router bằng tay (xem *Bước 3*).

`config/` là **mirror** của `~/.pi/agent` (chỉ các mục setup). Cập nhật lại sau khi bạn đổi setup:

```bash
./scripts/pi-setup-backup.sh --config-dir config
git add -A && git commit -m "chore(setup): refresh pi config snapshot" && git push
```

---

## Bước 1 — máy mới: cài pi

```bash
nvm install 24 && nvm use 24                        # pi cài global theo từng Node version
npm i -g @earendil-works/pi-coding-agent@1.0.4
pi --version                                        # phải ra 1.0.4
```

```bash
# Windows (Git Bash) — thường dùng fnm thay nvm
fnm install 24 && fnm use 24
npm i -g @earendil-works/pi-coding-agent@1.0.4
pi --version                                        # phải ra 1.0.4
```

> pi cài **theo từng Node version** của `nvm`/`fnm`. Nếu sau này `nvm use` / `fnm use` sang version khác mà không thấy lệnh `pi`, đó là lý do — cài lại global cho version đó.

## Bước 2 — restore

```bash
git clone https://github.com/hvantoan/pi-setup.git
cd pi-setup

# an toàn: thử vào thư mục tạm trước, không đụng config thật
./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify

# làm thật
./scripts/pi-setup-restore.sh --install --verify
```

Script sẽ:

1. Snapshot `settings.json` hiện có thành `settings.json.bak.<YYYYmmdd-HHMMSS>` (nếu đã tồn tại),
2. Copy 4 mục setup vào `~/.pi/agent`,
3. Chạy pi headless 1 lần → pi tự cài 20 extension (~150–220 s; **88 s** trên Windows + Git Bash),
4. Verify số extension khớp với `settings.json`.

## Bước 3 — login lại provider

`auth.json` không nằm trong repo (secret). Setup này dùng **9router** (local gateway tại `http://127.0.0.1:20128/v1`); provider khai báo trong `~/.pi/agent/models.json`:

```json
{ "providers": { "9router": {
    "baseUrl": "http://127.0.0.1:20128/v1",
    "api": "openai-completions",
    "apiKey": "$NINEROUTER_API_KEY",
    "models": [ { "id": "ocg/deepseek-v4.1-flash", "name": "ocg/deepseek-v4.1-flash",
                  "contextWindow": 1000000, "maxTokens": 64000 } ] } } }
```

`apiKey` nhận `$NAME` / `${NAME}` (pi tự interpolate, xem `docs/models.md`), literal, hoặc `!command` — dùng dạng env thì không có key nào trong git:

```bash
export NINEROUTER_API_KEY=...             # thêm vào ~/.zshrc / ~/.bashrc nếu muốn giữ
pi auth check --provider 9router          # phải ra `ready`
```

Provider built-in khác (nếu bạn dùng) thì `/login` trong pi. Kiểm tra model đã thấy chưa: `pi --list-models` (phải có `9router/ocg/deepseek-v4.1-flash`).

> ⚠ `models.json` **không** được backup (bản live đang ghi `apiKey` literal) → máy mới phải tạo lại file này.
> `contextWindow` / `maxTokens` phải khớp gateway (`curl 127.0.0.1:20128/v1/models†`): hiện là **1.000.000** / **384.000**. Khai thấp hơn (ví dụ 128000) làm pi nén ở ~11% window thật và trần bản tóm tắt bị `maxTokens` chặn.

† field gateway trả về là `context_length` / `max_completion_tokens`.

---

## Windows (Git Bash)

Script là **bash** → trên Windows chạy trong **Git Bash** (hoặc WSL). PowerShell/cmd không chạy được.

| Khác biệt | Chi tiết |
|---|---|
| Cài Node | Dùng [`fnm`](https://github.com/Schniz/fnm). `pi` cài global **theo từng Node version** → chỉ có trong shell đã `fnm use` (đường dẫn kiểu `.../fnm_multishells/<id>/pi`) |
| Đếm package / `--verify` | Dùng **`node`** (không cần `python3`) — Windows hay thiếu `python3` hoặc gặp stub Microsoft Store |
| `shasum` | Không có trong Git Bash → script tự dùng `sha256sum` |
| Path cho `pi` con | MSYS tự convert `PI_CODING_AGENT_DIR` (`/c/Users/...`, `/tmp/...` → `C:/Users/...`) |
| `config/pi-lens.json` | Đích là `%USERPROFILE%\.pi-lens\config.json` |
| CRLF | bash của Git Bash chịu CRLF; repo vẫn có `.gitattributes` (`*.sh text eol=lf`) cho chắc |
| `tar` | Trong Git Bash là GNU tar (`/usr/bin/tar`), không phải `C:\Windows\System32\tar.exe` |
| Symlink | Repo chỉ **đọc/backup** symlink có sẵn → không cần Developer Mode |
| **Font terminal** | `iconMode: "nerd"` cần **Nerd Font bản Mono**. Dùng JetBrains Mono **gốc** (bản trong `fonts/`) → icon vỡ thành ◆/✦/`?` vì thiếu **11/11** codepoint PUA. Sửa: trỏ terminal vào `DankMono Nerd Font Mono` (hoặc Nerd Font khác), hoặc đổi `iconMode` sang `emoji`/`text` |

Số đo thật trên **Windows 11 + Git Bash (MSYS2, bash 5.3)**: restore `20/20`, cài **88 s**, module dirs `0 → 203`.

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

Hàng 3 còn có widget đọc key `pi-lens-lsp` (do **pi-lens** publish). Từ pi-lens **4.3.0** giá trị đó được rút gọn bằng option native `ui.compactLspStatus: true` trong `~/.pi-lens/config.json` (= `config/pi-lens-config.json` trong repo, lấy về qua `EXTERNAL_CONFIGS`): hiện `LSP ✓` (xanh) khi có server, `LSP ✗` (đỏ) khi có server lỗi, `LSP ✗` (mờ) khi không có server nào — vừa có server chạy vừa có server lỗi thì `LSP ✓ · LSP ✗`. Vì là **config chứ không phải vá bundle**, `pi update` không ghi đè. Đã A/B trên footer thật cùng một thư mục: `false` → `LSP Inactive`, `true` → `LSP ✗` (xem mục *pi-lens (LSP)* bên dưới).


---

## MCP servers (built-in)

pi ≥ 1.0 có MCP **built-in**: server user-level ở `~/.pi/agent/mcp.json`, server project ở `<project>/.pi/mcp.json`, `/mcp` trong session, `pi mcp add|list|remove` trên shell. Setup này từng dùng `pi-mcp-adapter` vì hồi đó đó là cách duy nhất để có MCP; adapter **không còn** trong `settings.json` nữa. Thứ nó cung cấp — hàng chục tool schema gom sau một proxy tool duy nhất — MCP built-in tự làm được qua exposure kiểu **codemode**, nên mức tiết kiệm token giữ nguyên sau khi đổi.

10 server được chuyển từ config của Claude Code (`~/.claude.json` → `~/.pi/agent/mcp.json`; shape của entry `mcpServers` giống hệt nhau), 3 path cũ được sửa trên đường đi (2 server CCS trỏ vào `~/.ccs/mcp/` không tồn tại → `~/research/ccs/lib/mcp/`; `pencil` trỏ VSCode extension `0.6.54` trong khi bản cài là `0.6.55`), và từng server đã được kiểm bằng `pi mcp list`:

| Server | Transport | Tools | Ghi chú |
|---|---|---|---|
| `context7` | stdio | 2 | `resolve-library-id`, `query-docs` |
| `notebooklm-mcp` | stdio | 39 | |
| `jira` | stdio | 63 | `env` chứa `JIRA_URL` + `JIRA_API_TOKEN` — lý do file này không vào repo |
| `firecrawl` | stdio | 28 | self-hosted, `FIRECRAWL_API_URL=http://192.168…` |
| `exa` | http | 2 | remote, `https://mcp.exa.ai/mcp` |
| `gitnexus` | stdio | 17 | |
| `pencil` | stdio | 9 | MCP server của VSCode extension |
| `db-tms` | stdio | 1 | |
| `ccs-image-analysis` | stdio | 0 | connect được nhưng server không publish tool nào |
| `ccs-websearch` | stdio | 0 | tương tự |

Cả 10 đều connect (`pi mcp list` → 10 × `connected`, 123 tool). Lưu ý phần **CHƯA migrate**: adapter còn đọc các file `.mcp.json` per-project (trong các repo làm việc của máy này, vd `fms-dev`, `tms-postgres`, `db-duongthuy`) và các entry project-scope trong `~/.claude.json` (`gemini`, `gitnexus`, `vi-portal`, `postgres-vi-gpmb-dev`). Pi built-in đọc chúng ở `<project>/.pi/mcp.json` — tạo một file cho mỗi repo cần dùng (và project config chỉ có hiệu lực sau khi project đã được trust).

Về backup/restore: `mcp.json` nay nằm trong `ITEMS`/`ITEMS_SETUP` của hai script — tức **được mang theo** trong tarball riêng tư — nhưng `config/.pi-setup-exclude` loại nó khỏi repo public vì chứa token thật (`JIRA_API_TOKEN`, `JIRA_URL` nội bộ) — cùng cơ chế như `models.json`. Máy mới khai lại bằng `pi mcp add`, hoặc tự copy `~/.pi/agent/mcp.json` riêng:

```bash
pi mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem .   # user-level
pi mcp add -l tools --env API_KEY='${TOOLS_KEY}' -- uvx tools-mcp           # project-level
pi mcp list                                                                 # trạng thái + số tool
```

---

## `pi-model-fallback`

Extension fallback model theo **rule**: khi provider trả về HTTP status khớp rule (mặc định `429`, `500`, `502`, `503`, `504`), pi chuyển sang model fallback của rule đó và ghi **state bền** để các session sau vẫn dùng model mới cho tới khi hết cooldown (`429` → 72 giờ, `5xx` → 10 phút; header `Retry-After` / `x-ratelimit-reset*` ghi đè khi có). Rule khớp theo thứ tự, rule đầu tiên thắng. `autoRetry` (mặc định bật) đưa lại prompt lỗi thành follow-up sau khi đổi model.

```bash
/model-fallback:status   # đang bật hay không, entry bền nào active, path config/state
/model-fallback:reset    # xoá state bền + quay về model trước fallback
```

Config: `~/.pi/agent/model-fallback/config.json` → **backup mặc định** (script báo cáo trong phần *config extension*), do tool `model_fallback_config` đọc/validate/ghi. File **cùng thư mục với `state.json`** — mà `state.json` là state theo máy — nên script chỉ liệt kê đúng file config; restore cũng chỉ ghi file đó. Nếu chưa có file, extension chạy bằng default của package (`zai` → `deepseek/deepseek-v4-flash`).

---

## Compaction: 2 knob, không phải 1

Hai câu hỏi khác nhau, gộp làm một là cách session dài chết với `Compaction failed: Summarization failed: generation hit the token cap and the summary is incomplete`:

| Knob | Ở đâu | Máy này |
|---|---|---|
| **Khi nào nén** | extension local `extensions/compaction-policy.ts`: **40%** window khi ≥500K token, **75%** dưới ngưỡng, tối đa 1 request/60 s, **backoff 10 phút** sau lần nén lỗi (không mua lại đúng lỗi đó mỗi turn) | window `ocg/deepseek-v4.1-flash` = 1M → nén ở **400K** |
| **Tóm tắt được dài bao nhiêu** | pi core: $\min(\lfloor 0.8 \times \text{reserveTokens} \rfloor,\ \text{model.maxTokens})$ cho lượt tóm tắt ($0.5\times$ cho lượt turn-prefix) | `modelOverrides["9router/ocg/deepseek-v4.1-flash"].reserveTokens = 64000`, `maxTokens = 64000` → trần **51.200** token |

Trigger gốc của pi (`contextTokens > contextWindow - reserveTokens`) **vẫn bật** và đóng vai backstop: với reserve toàn cục `16384` nó chỉ nổ sát trần, tức là sau khi policy đã nén xong. Vì vậy `reserveTokens` toàn cục phải giữ **nhỏ** — nó chỉ chịu được 40% của 1M *hoặc* 75% của 128K, không thể cả hai.

> ⚠ Đừng đặt `reserveTokens` lớn hơn window (bản cũ có `700000` cho model khai `contextWindow: 128000`): `contextTokens > 128000 - 700000` không bao giờ đúng → **tắt hẳn** compaction, và $0.8 \times 700000$ cũng bị `maxTokens` chặn nên trần tóm tắt không tăng.
> Key của `modelOverrides` là `${provider}/${id}` **khớp tuyệt đối, phân biệt hoa thường** (`docs/compaction.md` của pi) — đổi id model trong `models.json` thì phải đổi key ở đây, nếu không override im lặng không áp.

Kiểm nhanh: `/compact` thủ công, hoặc để session dài tới 40% → log có `Compacting at N% (policy: 40%)`.

---

## Scripts

Hai script setup **không hỏi xác nhận** — rủi ro được xử lý bằng snapshot + cảnh báo ra `stderr`, để chạy được trong script/CI. Hai script còn lại: một chỉ **đọc** (`pi-setup-verify-advisor.mjs`), một vá file trong package bên thứ ba đã cài (`pi-footer`) và **dừng thay vì đoán** khi code đổi định dạng.

### `pi-setup-verify-advisor.mjs`

`advisor.json` là file cấu hình duy nhất trong repo mà **sai tên key vẫn im lặng**: `pi-advisor-flow` giữ nguyên key lạ rồi chỉ notify `contains unrecognized key(s) ... They were preserved but ignored`, và key đó **không có hiệu lực**. Tên key thật nằm trong `CONFIG_SCHEMA` của bundle, không nằm ở tài liệu — nên script trích schema từ chính bundle đang cài rồi kiểm tra lại:

```bash
node scripts/pi-setup-verify-advisor.mjs            # config/advisor.json trong repo
node scripts/pi-setup-verify-advisor.mjs --live     # + ~/.pi/agent/advisor.json, và so 2 file
```

Bắt: key lạ, sai type, giá trị ngoài enum, ref không có dạng `provider/model`, JSON hỏng/thiếu file, snapshot lệch bản đang chạy.

| Exit | Nghĩa |
|---|---|
| `0` | sạch |
| `1` | config sai (kể cả JSON hỏng, thiếu file, snapshot lệch) |
| `2` | lỗi môi trường (không thấy bundle `pi-advisor-flow`, bundle đổi định dạng, tham số sai) |


### `pi-setup-patch-extensions.mjs`

`pi-footer` giữ `ExtensionContext` trong hàm chạy **về sau**: `render()` → `collectStatuslineData(ctx, …)` → `ctx.getContextUsage()`. `/reload` (và `newSession()`, `fork()`, `switchSession()`) invalidate runner cũ, mà pi coi **mọi** truy cập ctx cũ là lỗi fatal → tiến trình pi chết ngay tại đó:

```
Error: This extension ctx is stale after session replacement or reload.
```

| Vá | Cách sửa |
|---|---|
| `pi-footer` | bọc đúng chỗ dùng ctx trong `render()` bằng `try/catch`, trả `[]` cho frame đó; `session_start` kế tiếp gắn lại footer với ctx mới |

```bash
node scripts/pi-setup-patch-extensions.mjs           # vá (idempotent, backup trước khi ghi)
node scripts/pi-setup-patch-extensions.mjs --check   # chỉ báo trạng thái: 0 = đã vá, 1 = còn thiếu
```

| Exit | Nghĩa |
|---|---|
| `0` | đã vá (hoặc vừa vá xong) |
| `1` | còn thiếu khi `--check`, hoặc ghi xong mà không thấy guard → tự khôi phục bản gốc từ backup |
| `2` | lỗi môi trường: không thấy package, hoặc anchor không khớp (script **không** đoán) |

> ⚠ Bản vá nằm trong `node_modules` → **chạy lại sau mỗi `pi update`** hoặc cài lại package.
> Script gốc của upstream còn vá `pi-goal-x`, nhưng bản vá đó nhắm `0.31.6`; máy này chạy **0.31.9** — `renderUI` đã tự chụp `goalCwd` và `getLedgerEvents` đọc `storage`, nên anchor cũ không còn khớp → entry đó **đã bị bỏ khỏi script** (xem header file). Muốn vá lại thì phải viết anchor cho 0.31.9.

### `scripts/pi-setup-backup.sh`

Mặc định chỉ lấy **setup**: `settings.json`, `APPEND_SYSTEM.md`, `models-store.json`, `models.json`, `mcp.json`, `model-fallback/config.json`, `extensions/` (kèm luôn statusline `extensions/pi-footer.json`) — `models.json` và `mcp.json` rồi lại bị `.pi-setup-exclude` loại khi build bundle public (xem *MCP servers (built-in)*).

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
- **báo cáo config extension** trong phần tóm tắt: statusline (`pi-footer.json`) và model-fallback (`model-fallback/config.json`) có được backup hay không;
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

Dòng status LSP nay do config `ui.compactLspStatus` quyết định (không còn vá bundle) — restore đã ghi kèm `pi-lens-config.json` về `~/.pi-lens/config.json` qua `external-configs.txt`, nên không còn bước vá nào sau restore.

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

### Đường `--from-config config` (số cũ đo trên payload 20 package — 2026-09-15)

| Kiểm tra | Kết quả |
| --- | --- |
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json advisor.json extensions` + config ngoài `~/.pi-lens/config.json`, `~/.config/kitty/kitty.conf` |
| Cài 20 extension | ✅ **246 s**, module dirs `0 → 203` |
| `--verify` | ✅ **`20/20 extension khớp`** |
| Extension có **chạy** không | ✅ 18 `extension_ui_request`, 0 lỗi load, thấy `pi-lens-lsp` |
| `pi list` trong bản restore | ✅ 20 package |
| Snapshot bản config ngoài cũ | ✅ tự tạo `config.json.bak.<timestamp>` trước khi ghi đè |

### Snapshot 19 package

| Kiểm tra | Kết quả |
|---|---|
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json advisor.json extensions` |
| Cài 19 extension | ✅ **209 s**, module dirs `0 → 185` |
| `--verify` | ✅ **`19/19 extension khớp`** |
| `pi list` trong bản restore | ✅ 19 package |
| `advisor.json` được restore | ✅ có |

### Snapshot 18 package

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
git clone https://github.com/hvantoan/pi-setup.git /tmp/verify-clone
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

### Windows 11 + Git Bash (MSYS2, bash 5.3)

| Kiểm tra | Kết quả |
|---|---|
| Restore thật (`--from-config config --install --verify`) | ✅ **20/20**, cài **88 s**, module dirs `0 → 203` |
| Config ngoài config dir | ✅ ghi đúng `%USERPROFILE%\.pi-lens\config.json`, khớp `config/pi-lens-config.json` |
| MSYS convert path cho `pi` con | ✅ `/tmp/...` → `C:/Users/.../Temp/...` |
| Tạo lại bundle trên Windows | ✅ 9 file, 7.9 KB, sạch (không có `._*` AppleDouble như bản tạo trên macOS) |
| Đếm package bằng `node` (không cần `python3`) | ✅ ra `20` |
| Script CRLF | ✅ bash 5.3.15 chịu CRLF (test bằng bản copy CRLF, exit 0) |

---

## Xử lý sự cố

| Triệu chứng | Xử lý |
|---|---|
| Thiếu extension sau khi restore | `pi update --all`, hoặc `pi list` xem cái nào thiếu |
| Extension local không load | kiểm tra file còn trong `~/.pi/agent/extensions/`, rồi `/reload` hoặc restart pi |
| `pi` không tự cài (npm bị chặn) | cài thủ công từng package trong `settings.json` |
| `no credentials` / 401 | `/login`, hoặc `pi auth check --provider <name>` |
| Model không hiện | `pi --list-models`; kiểm tra provider còn trong `models.json` và `pi auth check --provider <name>`. Setup này **không** đặt `enabledModels` nên không có filter model nào |
| `command not found: pi` sau khi `nvm use` | pi cài theo từng Node version → `npm i -g @earendil-works/pi-coding-agent` lại |
| Icon statusline hiện ◆/✦/`?` thay vì icon | terminal đang dùng font **không patch** → cài Nerd Font bản **Mono** rồi trỏ terminal vào đó, hoặc đổi `iconMode` sang `emoji`/`text` (xem [Windows (Git Bash)](#windows-git-bash)) |
| `pi` không thấy sau `fnm use` (Windows) | pi cài theo từng Node version của fnm → cài lại global trong shell đó |
| PowerShell/cmd báo lỗi cú pháp khi chạy script | script là bash → chạy trong **Git Bash** hoặc WSL |
| `--verify` in `?/20` | `node` không có trong PATH, hoặc artifact không có `settings.json` (`node -v` để kiểm tra) |
| Script thoát mà không rõ lỗi | đã có ERR trap in số dòng; trừ khi bạn tự sửa script |

---

## Lưu ý riêng của setup này

**2 skill là symlink sang AgentKit.** `~/.pi/agent/skills/` chứa symlink trỏ ra ngoài config dir:

```
skills/orchestration          -> ../../../.agents/skills/orchestration
skills/orca-per-workspace-env -> ../../../.agents/skills/orca-per-workspace-env
```

Đây là skill của **AgentKit** (`ak` CLI), không phải pi. Chúng chỉ hoạt động nếu máy mới đã cài AgentKit. Nếu chưa, 2 symlink này gãy — **không ảnh hưởng extension nào khác** (đã test đúng tình huống gãy: pi vẫn khởi động 0 lỗi, đủ extension). Chúng cũng **không** nằm trong repo (state, không phải setup).

**3 extension `orca-*.ts` KHÔNG nằm trong repo.** `orca-agent-status.ts`, `orca-prefill.ts`, `orca-titlebar-spinner.ts` mang marker `@orca-managed-pi-extension` — do Orca sinh ra để tích hợp pi với Orca (gọi hook `127.0.0.1`, token đọc từ env `ORCA_AGENT_HOOK_TOKEN`, không hardcode secret). Chúng bị loại khỏi repo public vì là glue code tích hợp; Orca tự sinh lại khi quản lý pi trên máy mới.

**2 thư mục `agentkit-*` KHÔNG nằm trong repo.** AgentKit (`ak` CLI) tự cài `~/.pi/agent/extensions/agentkit-agent/` + `agentkit-hooks-engineer/` (1.2 MB, 79 file). Bên trong có cache chứa **path tuyệt đối** (`native-skill-paths.json` 157 KB, `native-skill-hashes.json` 280 KB) → máy-specific, không hợp lệ để đưa lên repo. `ak` tự cài lại trên máy mới.

**`pi-advisor-flow`.** Flow Executor/Advisor cho ý kiến thứ hai từ model mạnh hơn, có cổng review trước plan / sau lỗi lặp / trước khi kết thúc. Lệnh: `/advisor`, `/advisor-models`, `/advisor-settings`.

Config toàn cục ở `~/.pi/agent/advisor.json` — ở **gốc** config dir, không trong `extensions/`, nên `ITEMS_SETUP` của backup script phải liệt kê riêng. **Không có project override trong 0.8.x**: tài liệu upstream ghi rõ *"Repository-controlled project `advisor.json` files are not applied"* — file `<project>/.pi/advisor.json` chỉ bị báo key lạ rồi bỏ qua, không có hiệu lực.

Extension này công bố thêm 2 status key `advisor-scout` + `advisor-usage`; cả hai đã vào `hiddenKeys` và có widget `external-status` inline → statusline vẫn **3 hàng** kể cả khi Advisor đang chạy (đã test với cả 11 key cùng có giá trị).

**`@tmustier/pi-session-recap` không có config/state.** Không đọc-ghi file nào trong `~/.pi/agent/` nên không cần thêm mục nào vào backup. Nó công bố 1 status key `session-recap` (chỉ khi đang soạn recap) — đã nằm trong `hiddenKeys` + có widget inline, nên statusline giữ 3 hàng.

> tmux: cần `set -g focus-events on` trong `~/.tmux.conf` rồi `tmux source-file ~/.tmux.conf` thì extension mới biết bạn đã quay lại.

**`pi-lens` (LSP).** `pi` không có LSP built-in nên đây là extension. Config ở `~/.pi-lens/config.json` — **ngoài** config dir — với `widget.visible: false` (tắt đúng widget hiện danh sách file từng gây khó chịu), `format.enabled: false` và `autofix.enabled: false` (chỉ xin LSP, không xin tự sửa/format code; mặc định package là `true`).

Nó công bố status key `pi-lens-lsp` (`LSP Active: ts` / `LSP Inactive`) → đã vào `hiddenKeys` + có widget inline, nên vẫn thấy được LSP chạy hay không mà statusline giữ 3 hàng.

Mặc định giá trị đó liệt kê tên server (`LSP Active: typescript, jsonc, …`). Option `ui.compactLspStatus: true` (pi-lens **4.3.0+**, upstream #3099, đặt trong `~/.pi-lens/config.json` = `config/pi-lens-config.json`) gom nó thành một glyph trạng thái: `LSP ✓` (xanh) khi có server, `LSP ✗` (đỏ) khi có server lỗi, `LSP ✗` (mờ) khi không có — vừa chạy vừa lỗi thì `LSP ✓ · LSP ✗`. Đây là **config, không phải vá bundle** → `pi update` không ghi đè; đã A/B trên footer thật (`false` → `LSP Inactive`, `true` → `LSP ✗`).

Config ngoài config dir được mang theo bằng `EXTERNAL_CONFIGS` + manifest `external-configs.txt` (dùng dạng `~`, không lộ path máy); restore tự `mkdir -p` và snapshot bản cũ.

### `.pi-setup-exclude`

`scripts/pi-setup-backup.sh --config-dir config` đọc `config/.pi-setup-exclude` (mỗi dòng 1 glob, `#` = comment) và xoá mọi file khớp sau khi mirror. Nhờ vậy chạy backup lại cũng **không** tự thêm `orca-*`/`agentkit-*` trở lại repo:

```
loại trừ: 95 file khớp .pi-setup-exclude (extensions/orca-*.ts extensions/agentkit-* extensions/herdr-*.ts advisor-outcomes.jsonl advisor-outcomes-salt extensions/*.bak* models.json mcp.json)   # đo 2026-10-07
```

Ngoài 3 nhóm file do công cụ khác sinh (`orca-*`, `agentkit-*`, `herdr-*` — mỗi thứ tự cài lại trên máy mới) còn loại state của `pi-advisor-flow` (`advisor-outcomes.jsonl`, `advisor-outcomes-salt`) và:

- `extensions/*.bak*` — file backup sinh ra khi sửa extension trực tiếp trên máy, không phải setup;
- `models.json` — bản live chứa `apiKey` literal của 9router (bản commit cũ dùng `$NINEROUTER_API_KEY` nên lịch sử git vẫn sạch);
- `mcp.json` — MCP built-in, bản live chứa token thật (`JIRA_API_TOKEN`, `JIRA_URL` nội bộ), máy mới khai lại bằng `pi mcp add` (xem *MCP servers (built-in)*).

**Không có gì thuộc AgentKit trong repo này.** Bộ skill `ak-*` trong `~/.agents/skills` migrate riêng bằng CLI `ak`.

**`/reload` cần bản vá `pi-footer`.** Không vá thì `/reload` (và `newSession`/`fork`/`switchSession`) làm pi thoát ra shell với `Error: This extension ctx is stale after session replacement or reload` — xem `pi-setup-patch-extensions.mjs`. Bản vá nằm trong `node_modules` → **chạy lại script sau mỗi `pi update`**.

**`9router` là gateway local.** Gateway phải đang chạy ở `127.0.0.1:20128` trước khi khởi động pi, và `models.json` phải khai `contextWindow`/`maxTokens` khớp `GET /v1/models` — nếu không, pi nén context theo con số khai báo, không theo con số thật.

**Repo cá nhân, snapshot không bảo hành.** Đây là bản chụp setup của một máy tại một thời điểm; không phải sản phẩm chính thức của pi.

---

## Checklist

- [ ] Máy mới: Node đúng version (`nvm` — hoặc `fnm` trên Windows) → `npm i -g @earendil-works/pi-coding-agent@1.0.4`
- [ ] **Windows:** đang ở trong **Git Bash** (không PowerShell/cmd)
- [ ] `git clone https://github.com/hvantoan/pi-setup.git`
- [ ] `./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify` (thử an toàn)
- [ ] `./scripts/pi-setup-restore.sh --install --verify` → phải ra `20/20 extension khớp`
- [ ] **Windows/font:** terminal đã dùng **Nerd Font** (bản Mono) hoặc `iconMode` đã đổi sang `emoji`/`text` — nếu không, icon statusline sẽ vỡ
- [ ] Tạo lại `~/.pi/agent/models.json` (không nằm trong snapshot: bản live chứa key literal) với `contextWindow: 1000000` / `maxTokens: 64000`
- [ ] `export NINEROUTER_API_KEY=...` (hoặc lưu vào shell rc) rồi `pi auth check --provider 9router` → `ready`
- [ ] Thử 1 extension, ví dụ `/btw <câu hỏi>` (cần TUI mode)
- [ ] Kiểm tra `/model-fallback:status` (config `model-fallback/config.json` đã được restore kèm; backup tự cập nhật khi bạn đổi rule qua tool `model_fallback_config`)
- [ ] Chạy `/advisor-settings` để cấu hình Executor/Advisor (sau đó backup tự kèm `advisor.json`)
- [ ] Cài AgentKit nếu cần skill symlink
- [ ] `pi mcp list` thấy 10 server `connected` (MCP built-in, không còn `pi-mcp-adapter`)
- [ ] `~/.pi-lens/config.json` có `ui.compactLspStatus: true` (restore đã ghi kèm `pi-lens-config.json`)
- [ ] Vá stale-ctx của `pi-footer`: `node scripts/pi-setup-patch-extensions.mjs` (chạy lại sau **mỗi** lần `pi update`)
- [ ] Kiểm compaction: `compaction.modelOverrides` phải có key `9router/ocg/deepseek-v4.1-flash`, và `extensions/compaction-policy.ts` phải nằm trong `~/.pi/agent/extensions/`
