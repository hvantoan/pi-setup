<div align="center">

# zuey-pi-setup

**Portable snapshot của setup [`pi`](https://github.com/earendil-works/pi) — clone về là dựng lại nguyên bộ 16 extensions trên máy mới.**

pi `0.85.1` · Node `24` · macOS/Linux · cập nhật 2026-09-15

</div>

---

## Vì sao có repo này

`pi` không có tính năng export/import config. Repo này là cách mang **toàn bộ setup** sang máy khác một cách xác định (deterministic) và không cần copy cache:

- `~/.pi/agent/npm/` (244 MB) — **không cần**, pi tự cài lại từ `settings.json`
- `~/.pi/agent/auth.json` — **không đưa vào repo** (chứa API key + OAuth token), login lại ở máy mới
- `~/.pi/agent/sessions/` (46 MB) và `missions/` — **không đưa vào repo** (history/state, và có thể chứa dữ liệu nội bộ)

Cơ chế: `settings.json` chứa mảng `packages`; pi đọc nó lúc khởi động và `npm install` mọi package còn thiếu. Nên mang được manifest = mang được cả bộ extension.

---

## Quickstart (máy mới)

```bash
# 1) cài pi, đúng version
npm i -g @earendil-works/pi-coding-agent@0.85.1

# 2) clone
git clone https://github.com/mrgoonie/zuey-pi-setup.git
cd zuey-pi-setup

# 3) thử an toàn vào thư mục tạm (không đụng config thật)
./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify

# 4) làm thật
./scripts/pi-setup-restore.sh --install --verify
#    → "✓ verify: 16/16 extension khớp"
```

Sau đó login lại provider (auth không nằm trong repo):

```bash
pi auth check --provider opencode-go    # và /login trong pi cho từng provider
```

Chi tiết đầy đủ, bảng copy/không-copy, xử lý sự cố: **[`docs/pi-setup-migration.md`](./docs/pi-setup-migration.md)**.

---

## Repo có gì

```
zuey-pi-setup/
├── README.md                        ← bạn đang đọc
├── docs/
│   └── pi-setup-migration.md        hướng dẫn chi tiết + số liệu kiểm chứng
├── scripts/
│   ├── pi-setup-backup.sh           đóng gói setup hiện tại của máy đang chạy
│   └── pi-setup-restore.sh          dựng lại setup trên máy mới
└── config/                          snapshot setup (plain file, diff được bằng git)
    ├── .pi-setup-exclude           glob loại trừ — backup tôn trọng file này
    ├── settings.json               manifest 16 extensions + model/theme/compaction
    ├── APPEND_SYSTEM.md            system prompt phụ
    ├── models-store.json           catalog model (khỏi chờ refresh 4h)
    └── extensions/                 extension tự viết, không có trên npm
        ├── pi-footer-cache-tps.ts
        └── pi-footer.json
```

`config/` là **mirror** của 4 mục setup trong `~/.pi/agent`. Mọi thứ khác (cache, secret, history) **không** được đưa vào.

### Extensions local trong `config/extensions/`

| File | Việc nó làm |
|---|---|
| `pi-footer-cache-tps.ts` | đẩy cache-retention + tốc độ sinh token (t/s) vào widget event của `pi-footer` |
| `pi-footer.json` | cấu hình layout cho `pi-footer` |

### Không nằm trong repo (do công cụ khác sinh, tự cài lại được)

| Bị loại | Do ai sinh | Vì sao loại |
|---|---|---|
| `extensions/orca-agent-status.ts`, `orca-prefill.ts`, `orca-titlebar-spinner.ts` | Orca (`@orca-managed-pi-extension`) | 1 239 dòng glue code tích hợp Orca; Orca tự sinh lại khi quản lý pi |
| `extensions/agentkit-agent/`, `extensions/agentkit-hooks-engineer/` | AgentKit (`ak`) | 1.2 MB hook đã sinh + cache chứa **path tuyệt đối** (`native-skill-paths.json` 157 KB); `ak` tự cài lại |
| `missions/`, `memory/`, `skills/` | pi / AgentKit | state theo máy, không phải setup |

### `.pi-setup-exclude`

`scripts/pi-setup-backup.sh --config-dir config` đọc file này (mỗi dòng 1 glob, `#` = comment) và **xoá** mọi file khớp sau khi mirror. Nhờ vậy chạy backup lại cũng không tự thêm `orca-*`/`agentkit-*` trở lại repo.

```bash
./scripts/pi-setup-backup.sh --config-dir config   # → "loại trừ: 82 file khớp .pi-setup-exclude"
```

---

## 16 extensions trong snapshot

| # | Package | Version |
|---|---|---|
| 1 | `pi-web-access` | 0.29.0 |
| 2 | `pi-mcp-adapter` | 2.34.0 |
| 3 | `pi-subagents` | 0.68.0 |
| 4 | `@juicesharp/rpiv-todo` | 2.10.1 |
| 5 | `@juicesharp/rpiv-ask-user-question` | 2.10.1 |
| 6 | `@juicesharp/rpiv-btw` | 2.10.1 |
| 7 | `pi-goal-x` | 0.31.4 |
| 8 | `pi-background-tasks` | 2.5.0 |
| 9 | `@narumitw/pi-usage` | 0.60.8 |
| 10 | `pi-simplify` | 0.2.3 |
| 11 | `pi-powerline-footer` | 0.17.1 |
| 12 | `pi-memory` | 0.4.2 |
| 13 | `pi-worktree` | 1.3.3 |
| 14 | `pi-chime` | 1.2.1 |
| 15 | `pi-footer` | 0.5.1 |
| 16 | `pi-smart-fetch` | 0.3.17 (pinned) |

> Version là **tham khảo tại thời điểm snapshot**; nguồn sự thật là `config/settings.json`. Chỉ `pi-smart-fetch` được pin cứng, phần còn lại floating → máy mới sẽ lấy bản mới nhất. Muốn khớp chính xác, pin lại trong `config/settings.json`.

Provider mặc định: `opencode-go/deepseek-v4.1-flash` (thinking `high`). Model đang bật: xem `enabledModels` trong `config/settings.json`.

---

## Scripts

Không script nào hỏi xác nhận — chạy được trong CI/script. Rủi ro xử lý bằng snapshot + cảnh báo ra `stderr`.

### `pi-setup-backup.sh`

```bash
./scripts/pi-setup-backup.sh                       # → ./pi-setup-portable.tar.gz (chỉ setup)
./scripts/pi-setup-backup.sh --config-dir config    # → cập nhật config/ trong repo này
./scripts/pi-setup-backup.sh --with-state           # kèm skills/ memory/ missions/
./scripts/pi-setup-backup.sh --dry-run
./scripts/pi-setup-backup.sh -o ~/Desktop/pi.tar.gz
```

Tự động: ghi file tạm rồi `mv` (không để lại artifact hỏng khi bị ngắt) · **quét secret** · **cảnh báo symlink trỏ ra ngoài** · nén deterministic (`gzip -n` → cùng nội dung cho cùng SHA-256) · từ chối ghi `--config-dir` vào `$HOME`, `/`, hoặc chính config dir của pi.

### `pi-setup-restore.sh`

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

Trước khi ghi đè, `settings.json` cũ được snapshot thành `settings.json.bak.<timestamp>`. Script có `trap ERR` nên không bao giờ thoát im lặng — luôn in số dòng khi gặp lỗi ngoài dự kiến.

---

## Kiểm chứng

Test bằng cách restore vào một config dir **hoàn toàn mới** qua `PI_CODING_AGENT_DIR`, không đụng setup thật.

| Kiểm tra | Kết quả |
|---|---|
| Thời gian cài lần đầu (16 extensions) | **138–156 s** |
| Module dirs trong `npm/node_modules` | **0 → 182** |
| `--verify` | **16/16 extension khớp** |
| Extension **thực sự chạy** (không chỉ cài) | ✅ 11 `extension_ui_request`, 0 lỗi, đủ surface: `subagent-async`, `mcp`, `goal`, `background-tasks`, `usage`, `pi-footer` |
| `auth.json` trong dir mới | `{}` → không rò secret |
| Chạy lần 2 | log rỗng → idempotent |
| Backup 2 lần liên tiếp | **byte-identical** (deterministic) |
| Config thật bị đụng khi dùng `--scratch` | ✅ không |

---

## Giới hạn đã biết

- **`auth.json` không nằm trong repo** (secret) → phải `/login` lại ở máy mới.
- **`sessions/` và `missions/` không nằm trong repo** → không migrate lịch sử chat/mission. Dùng `--with-state` để tự backup riêng.
- **2 skill là symlink sang AgentKit** (`skills/orchestration`, `skills/orca-per-workspace-env`) → chỉ hoạt động nếu máy mới cài [AgentKit](https://github.com/bestagentkits). Gãy 2 symlink này **không** ảnh hưởng extension nào khác (đã test).
- **`pi` cài global theo từng Node version của nvm** → `nvm use` version khác có thể làm mất lệnh `pi`.
- **3 extension `orca-*.ts` không nằm trong repo** → máy mới chỉ có tích hợp Orca sau khi Orca sinh lại chúng (marker `@orca-managed-pi-extension`). Không ảnh hưởng 16 extension từ npm.
- **2 thư mục `agentkit-*` không nằm trong repo** → AgentKit tự cài lại bằng `ak`.

---

## Repo cá nhân

Đây là bản chụp setup của máy cá nhân tại một thời điểm, **không phải sản phẩm chính thức** của pi hay của bất kỳ package nào được liệt kê. Không kèm giấy phép — mọi quyền thuộc về tác giả; các extension bên thứ ba thuộc giấy phép của chúng.
