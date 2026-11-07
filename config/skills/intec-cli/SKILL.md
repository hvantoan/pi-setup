---
name: intec-cli
description: "Sử dụng `intec` CLI (repo intec-kit) để đồng bộ skills/agents/rules vào 4 harness pi, omp, codex, claude qua copy + .intec-lock.json. Use when the user mentions: intec install/update/status/new/remove, apply kit, sync skill sang agent, cài kit máy mới, manifest kit. Không dùng cho: build CLI intec-kit (đó là dev repo), hay quản lý skill không qua manifest."
---

<!-- skill-standard-exempt: Vietnamese headings (Khi dùng / Done khi) carry the activation boundary and done criteria -->

# intec CLI — đồng bộ kit vào agent harnesses

`intec` (Node/TS, repo `intec-kit`) đọc `kit.manifest.json` ở root repo và copy
resource vào thư mục của từng harness, kèm `.intec-lock.json` ghi hash. Chạy qua
`node dist/cli.js <cmd>` trong repo, hoặc `intec <cmd>` nếu đã `npm link` /
cài global.

## Khi dùng

- User muốn apply/update kit sau khi sửa skill trong repo.
- Onboard máy mới: `init` → `install`.
- Thêm/gỡ skill trong kit: `new`, `remove`, hoặc sửa `kit.manifest.json` tay.
- Kiểm tra drift: `status`.
- Không dùng cho: chỉnh sửa nội dung skill (đó là edit file trong `skills/`),
  hay cấu hình agent (settings.json, MCP) — CLI không đụng vào chúng.

## Commands

| Lệnh | Tác dụng | Ghi chú |
|---|---|---|
| `intec init` | Detect 4 harness, sinh `intec.config.json` | Chạy đầu tiên trên máy mới |
| `intec list` | Liệt kê resource trong manifest | Read-only |
| `intec status` | Bảng per-agent: `applied`/`outdated`/`missing`/`local-modified`/`extra` | Read-only |
| `intec install` | Copy kit → agents + ghi lockfile | `--agent`, `--skill`, `--dry-run`, `--force` |
| `intec update` | `git pull --ff-only` rồi install | **Fail nếu repo dirty**; `--no-pull` bỏ pull |
| `intec remove <name>` | Gỡ khỏi manifest + xoá bản cài trên agent | Chỉ xoá khi hash khớp lockfile; `--delete-source` xoá cả source |
| `intec new <name>` | Scaffold `skills/<name>/SKILL.md` + đăng ký manifest | `--type skill|agent|rule` |

Flags: `--agent pi,omp,codex,claude` · `--skill a,b` · `--dry-run` · `--force` ·
`--no-pull` · `--home <dir>` (test với HOME giả).

## Layout đích (mặc định)

| Harness | skill | agent | rule |
|---|---|---|---|
| pi | `~/.pi/agent/skills` | `~/.pi/agent/agents` | `~/.pi/agent/rules` |
| omp | `~/.omp/agent/skills` | `~/.omp/agent/agents` | `~/.omp/agent/rules` |
| codex | `~/.codex/skills` | — (skip, TOML-registered) | — (skip) |
| claude | `~/.claude/skills` | `~/.claude/agents` | — (skip) |

Override qua `intec.config.json`: `{ "agents": { "pi": { "dirs": {"skill": "x"}, "enabled": false } } }`.
Harness không có trên máy → skip êm, không lỗi.

## Manifest

```json
{ "type": "skill", "path": "skills/vt-git",
  "targets": ["pi","omp","codex","claude"], "installAs": "vif-git" }
```

- `targets` vắng = mọi agent. `installAs` đổi tên thư mục đích.
- Resource có trong manifest nhưng không target agent đó → không cài.
- Entry trong lockfile nhưng không còn trong manifest → **prune** ở lần apply kế
  (trừ khi local-modified → giữ + warn; thêm `--force` để prune luôn).

## Quy tắc an toàn (đừng vi phạm)

- **Không sửa file đích bằng tay rồi chạy `install`** — `local-modified` sẽ skip;
  phải `--force` để ghi đè, và bảo vệ này bền qua nhiều lần install.
- **`update` cần repo sạch** (đã commit/stash) vì nó `git pull --ff-only`; đang
  dev dở → dùng `--no-pull` hoặc `install` trực tiếp.
- `remove` không xoá file user đã sửa (hash ≠ lockfile) — báo `local-modified`,
  giữ nguyên. Gỡ luôn: `remove <name> --force` (hoặc `install --force` sau đó —
  entry vẫn còn trong lockfile nên prune được).
- `remove` từ chối `--agent` (sửa manifest global) nhưng nhận `--home <dir>`;
  khi thử nghiệm phải truyền `--home` để không prune nhầm harness thật.
- Sau khi `remove`, nếu muốn xoá luôn `skills/<name>/` trong repo thì chạy lại
  với `--delete-source` (lần đầu chỉ gỡ manifest + agent copies).
- CLI **không** đụng `~/.agents/skills` — không dùng nó làm trung gian.

## Done khi

- `intec status` toàn `applied` (hoặc `skipped` có lý do: unsupported type,
  local-modified) cho các agent hiện diện.
- `.intec-lock.json` ở mỗi harness root có `entries` khớp manifest targets.
- Verify skill load được: hỏi agent trong session mới xem có skill vừa cài.
