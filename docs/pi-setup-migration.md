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

Rồi `/login` lại từng provider. **Xong** — pi tự cài đủ 16 extensions.

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
| `settings.json` | 4 KB | ✅ **bắt buộc** | 16 packages, `enabledModels`, theme, compaction, thinkingBudgets, retry |
| `APPEND_SYSTEM.md` | 4 KB | ✅ | system prompt phụ |
| `extensions/` | 56 KB | ✅ (lọc) | extension tự viết local. `orca-*.ts` (Orca sinh) và `agentkit-*` (AgentKit sinh) bị loại — xem `.pi-setup-exclude` |
| `models-store.json` | 28 KB | ✅ | catalog model; có sẵn thì khỏi chờ refresh 4 giờ |
| `skills/` | — | ⚠️ opt-in | symlink sang AgentKit (`~/.agents/skills`) |
| `memory/` | — | ⚠️ opt-in | ghi chú cá nhân |
| `missions/` | 136 KB | ❌ **mặc định loại** | state của `pi-goal-x`; chứa tên project/khách hàng + đường dẫn nội bộ |
| `trust.json` | 4 KB | ❌ | chứa path tuyệt đối của máy cũ → script có `--with-trust` nếu cần |
| `auth.json` | 4 KB | ❌ | **secret** (API key + OAuth access/refresh token) → `/login` lại |
| `npm/` | 244 MB | ❌ | pi tự cài lại |
| `sessions/` | 46 MB | ❌ | history; copy riêng bằng `rsync` nếu muốn `pi --resume` |

`missions/`/`memory/`/`skills/` **không** nằm trong bản mặc định vì chúng là *state*, không phải *setup*. Muốn backup kèm: `./scripts/pi-setup-backup.sh --with-state`.

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
3. Chạy pi headless 1 lần → pi tự cài 16 extension (~150 s),
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

## Hai script

Cả hai **không hỏi xác nhận** — rủi ro được xử lý bằng snapshot + cảnh báo ra `stderr`, để chạy được trong script/CI.

### `scripts/pi-setup-backup.sh`

```bash
./scripts/pi-setup-backup.sh                      # → ./pi-setup-portable.tar.gz (chỉ setup)
./scripts/pi-setup-backup.sh --config-dir config   # → ghi plain file vào config/ (để commit)
./scripts/pi-setup-backup.sh --with-state          # kèm skills/ memory/ missions/
./scripts/pi-setup-backup.sh -o ~/Desktop/pi.tar.gz
./scripts/pi-setup-backup.sh --dry-run
```

Script tự:

- ghi ra file tạm rồi `mv` → không để lại artifact hỏng nếu bị ngắt;
- **quét secret** (`sk-*`, `ghp_*`, `BEGIN PRIVATE KEY`, `api_key=…`) và cảnh báo;
- **cảnh báo symlink trỏ ra ngoài** config dir;
- ở chế độ `--config-dir`, tôn trọng `<DIR>/.pi-setup-exclude` (glob loại trừ) → artifact public không bị thêm lại file nhạy cảm;
- nén **deterministic** (`gzip -n`) → cùng nội dung cho cùng SHA-256, kiểm tra được giữa 2 máy;
- từ chối ghi `--config-dir` vào `$HOME`, `/`, hoặc chính thư mục config của pi.

### `scripts/pi-setup-restore.sh`

| Tùy chọn | Tác dụng |
|---|---|
| `--from-config DIR` | restore từ `config/` (plain file) |
| `--bundle FILE` | restore từ `.tar.gz` |
| `--target DIR` | đích khác `~/.pi/agent` |
| `--scratch` | đích là thư mục tạm — **an toàn để thử** |
| `--install` | chạy pi headless 1 lần để tự cài extension (~150 s) |
| `--verify` | so số extension đã cài với `settings.json` |
| `--with-trust` | copy cả `trust.json` |
| `--dry-run` | chỉ in ra, không ghi |

Nếu không chỉ định nguồn, script tự dùng `<repo>/pi-setup-portable.tar.gz`, rồi tới `<repo>/config`.

Script đặt `trap ERR` nên **không bao giờ thoát im lặng** — gặp lỗi ngoài dự kiến sẽ in `✗ lỗi không mong đợi tại pi-setup-restore.sh dòng <N>`.

---

## Kiểm chứng (đã test thật)

Cách test: restore vào một config dir **hoàn toàn mới** qua biến `PI_CODING_AGENT_DIR`, không đụng setup thật.

### Đường tarball (bundle 37 KB, có cả state)

| Kiểm tra | Kết quả |
|---|---|
| Thời gian cài lần đầu | **156 s** |
| Module dirs trong `npm/node_modules` | **182** (16 extension + transitive deps) |
| Lỗi trong log | **0** |
| `diff <(pi list máy gốc) <(pi list dir mới)` | **16/16 TRÙNG KHỚP 100%** |
| `auth.json` trong dir mới | `{}` → **không rò secret** |
| Chạy lần 2 | log rỗng (0 byte) → **idempotent** |

### Đường `--from-config config` (payload của repo, chỉ setup)

| Kiểm tra | Kết quả |
|---|---|
| Restore vào dir mới | ✅ `settings.json APPEND_SYSTEM.md models-store.json extensions` |
| Cài extension | ✅ **138 s** và **192 s** ở 2 lần chạy khác nhau (tuỳ tốc độ npm), module dirs `0 → 182` |
| `--verify` | ✅ **`16/16 extension khớp`** |
| Extension có **chạy** không (không chỉ cài) | ✅ khởi động pi trong dir vừa restore: **11 `extension_ui_request`**, 0 lỗi, thấy đủ surface `subagent-async`, `mcp`, `goal`, `background-tasks`, `usage`, `pi-footer` |
| `pi list` trong bản restore | ✅ 16 package |
| Config thật có bị đụng không | ✅ không (không sinh `settings.json.bak` mới) |

### Các test khác

| Test | Kết quả |
|---|---|
| Backup mặc định không chứa `missions/`, `memory/`, `skills/` | ✅ chỉ 4 mục setup |
| Backup 2 lần → `cmp` | ✅ **byte-identical** (deterministic) |
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
- [ ] Cài AgentKit nếu cần 2 skill symlink
