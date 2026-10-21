# pi-setup

Snapshot/restore repo for a personal [pi](https://github.com/earendil-works/pi-coding-agent)
(`@earendil-works/pi-coding-agent@1.3.0`) agent setup: config, extensions,
statusline, model-fallback, advisor config. Public mirror of
`upstream: mrgoonie/zuey-pi-setup`.

## Layout

- `scripts/pi-setup-backup.sh` — `~/.pi/agent` → `config/` or `.tar.gz` bundle
- `scripts/pi-setup-restore.sh` — `config/` or bundle → `~/.pi/agent`
- `scripts/pi-setup-verify-advisor.mjs` — validates `advisor.json` against the
  installed `pi-advisor-flow` CONFIG_SCHEMA (unknown keys are silently ignored)
- `scripts/pi-setup-patch-extensions.mjs` — patches third-party extension files
- `config/` — the mirrored setup; `config/.pi-setup-exclude` decides what a
  backup must NOT copy in (secrets, tool-generated files)
- `backups/pi-setup-portable.tar.gz` — the tracked public bundle
- `fonts/`, `screenshots/` — assets for the README

## Commands (bash only — Git Bash on Windows, never PowerShell)

```bash
# Rehearse a restore into a temp dir (touches nothing real)
./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify

# Real restore / backup / verify
./scripts/pi-setup-restore.sh --install --verify
./scripts/pi-setup-backup.sh --config-dir config      # refresh the snapshot
./scripts/pi-setup-backup.sh                           # build portable bundle
node scripts/pi-setup-verify-advisor.mjs --live        # repo vs live advisor.json
```

## Invariants

See `RULES.md`. Highlights: this repo is public — every config change must be
checked against `config/.pi-setup-exclude`; scripts never prompt; `*.sh` is LF.

## Docs

- Migration guide (detailed, Vietnamese): @docs/pi-setup-migration.md
- Upstream adoption checklist: @docs/upstream-adoption-checklist.md
- Community recommendations research: @docs/pi-community-recommendations.md
