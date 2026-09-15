#!/usr/bin/env bash
#
# pi-setup-backup.sh — đóng gói phần "setup" của pi để mang sang máy khác
#
# Mặc định chỉ lấy SETUP (không lấy state/lịch sử):
#   settings.json (manifest toàn bộ extension), APPEND_SYSTEM.md,
#   models-store.json, extensions/
# Phần STATE (skills/, memory/, missions/) chỉ lấy khi truyền --with-state.
#   → missions/ chứa lịch sử mission theo project (có thể có tên khách hàng,
#     đường dẫn nội bộ) nên KHÔNG nằm trong bản mặc định.
#
# KHÔNG bao giờ lấy: auth.json (secret), npm/ (cache, pi tự cài lại), sessions/
#
# Dùng:
#   ./pi-setup-backup.sh                          # → <repo>/pi-setup-portable.tar.gz
#   ./pi-setup-backup.sh --config-dir config      # → ghi plain file vào config/ (để commit)
#   ./pi-setup-backup.sh --with-state             # kèm skills/ memory/ missions/
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$(basename "$SCRIPT_DIR")" = "scripts" ]; then
	ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
	ROOT="$SCRIPT_DIR"
fi

AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"

# Setup: đủ để dựng lại y hệt bộ extension.
ITEMS_SETUP=(settings.json APPEND_SYSTEM.md models-store.json extensions)
# State: dữ liệu theo máy/project — phải opt-in.
ITEMS_STATE=(skills memory missions)

OUT="$ROOT/pi-setup-portable.tar.gz"
CONFIG_DIR=""
WITH_STATE=0
QUIET=0
DRY_RUN=0

# Pattern nhạy cảm — chặn trường hợp vô tình đưa secret vào artifact.
SECRET_RE='((^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{32,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|"?(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)"?[[:space:]]*[:=][[:space:]]*"[^"]{12,}")'

info() { [ "$QUIET" -eq 1 ] || printf '%s\n' "$*"; }
emit() { printf '%s\n' "$*"; }
warn() { printf '⚠  %s\n' "$*" >&2; }
die() { printf '✗  %s\n' "$*" >&2; exit 1; }

usage() {
	cat <<'EOF'
Dùng: pi-setup-backup.sh [tùy chọn]

  -o, --output FILE     File tarball đầu ra (mặc định: <repo>/pi-setup-portable.tar.gz)
      --config-dir DIR  Ghi plain file vào DIR (dùng cho thư mục config/ được git track)
                        Tôn trọng <DIR>/.pi-setup-exclude (glob loại trừ, mỗi dòng 1 mục)
      --with-state      Kèm cả state: skills/, memory/, missions/  (mặc định KHÔNG)
      --dry-run         Chỉ in ra sẽ làm gì
  -q, --quiet           Chỉ in 1 dòng tóm tắt
  -h, --help            In hướng dẫn này

Biến môi trường:
  PI_CODING_AGENT_DIR   Thư mục config của pi (mặc định ~/.pi/agent)
EOF
}

while [ $# -gt 0 ]; do
	case "$1" in
		-o | --output) [ $# -ge 2 ] || die "-o cần tham số FILE"; OUT="$2"; shift 2 ;;
		--config-dir) [ $# -ge 2 ] || die "--config-dir cần tham số DIR"; CONFIG_DIR="$2"; shift 2 ;;
		--with-state) WITH_STATE=1; shift ;;
		--dry-run) DRY_RUN=1; shift ;;
		-q | --quiet) QUIET=1; shift ;;
		-h | --help) usage; exit 0 ;;
		*) usage >&2; die "tham số không hợp lệ: $1" ;;
	esac
done

command -v tar >/dev/null 2>&1 || die "thiếu lệnh 'tar'"
[ -d "$AGENT_DIR" ] || die "không thấy thư mục config: $AGENT_DIR"

ITEMS=("${ITEMS_SETUP[@]}")
[ "$WITH_STATE" -eq 1 ] && ITEMS+=("${ITEMS_STATE[@]}")

INCLUDE=()
for item in "${ITEMS[@]}"; do
	if [ -e "$AGENT_DIR/$item" ]; then
		INCLUDE+=("$item")
	fi
done
[ "${#INCLUDE[@]}" -gt 0 ] || die "không có gì để backup trong $AGENT_DIR"
[ -f "$AGENT_DIR/settings.json" ] || warn "không thấy settings.json — artifact sẽ không có danh sách extension!"

# --- Cảnh báo symlink trỏ RA NGOÀI config dir (VD skills -> ~/.agents/skills của AgentKit).
# Trong artifact symlink giữ nguyên dạng tương đối, nên máy mới phải có sẵn đích đó.
EXT_LINKS=""
for item in "${INCLUDE[@]}"; do
	while IFS= read -r link; do
		[ -n "$link" ] || continue
		real="$(cd "$(dirname "$link")" && realpath "$(readlink "$link")" 2>/dev/null || true)"
		case "$real" in
			"$AGENT_DIR"/*) : ;;
			*) EXT_LINKS="$EXT_LINKS  ${link#"$AGENT_DIR"/} -> $(readlink "$link")
" ;;
		esac
	done < <(find "$AGENT_DIR/$item" -type l 2>/dev/null)
done
if [ -n "$EXT_LINKS" ]; then
	warn "có symlink trỏ ra ngoài config dir — máy mới phải có sẵn đích:"
	printf '%s' "$EXT_LINKS" >&2
fi

# --- Quét secret trên nội dung sẽ đóng gói ---
scan_secrets() { # $1 = thư mục chứa nội dung
	if grep -rEIl "$SECRET_RE" "$1" >/dev/null 2>&1; then
		warn "phát hiện chuỗi giống secret:"
		grep -rEIl "$SECRET_RE" "$1" >&2 || true
		warn "KIỂM TRA LẠI trước khi đưa artifact lên nơi không tin cậy."
		return 1
	fi
	info "→ quét secret: sạch"
	return 0
}

pkg_count() {
	if [ -f "$AGENT_DIR/settings.json" ] && command -v python3 >/dev/null 2>&1; then
		python3 -c 'import json,sys;print(len(json.load(open(sys.argv[1])).get("packages",[])))' "$AGENT_DIR/settings.json" 2>/dev/null || echo '?'
	else
		echo '?'
	fi
}

# Danh sách loại trừ cho chế độ --config-dir: đọc <CONFIG_DIR>/.pi-setup-exclude
# (mỗi dòng 1 glob đường dẫn tương đối trong CONFIG_DIR; '#' bắt đầu comment).
# Nhờ file này, artifact công khai không bị script tự thêm lại file nhạy cảm.
EXCLUDES=()
load_excludes() {
	local f="$CONFIG_DIR/.pi-setup-exclude"
	[ -f "$f" ] || return 0
	local line
	while IFS= read -r line || [ -n "$line" ]; do
		line="${line%%#*}"
		line="$(printf '%s' "$line" | tr -d '[:space:]')"
		[ -n "$line" ] && EXCLUDES+=("$line")
	done <"$f"
}

# Xoá những file khớp EXCLUDES trong $CONFIG_DIR. Trả về số file đã loại.
prune_excluded() {
	[ "${#EXCLUDES[@]}" -gt 0 ] || {
		printf '0\n'
		return 0
	}
	local removed=0 rel pat f
	while IFS= read -r -d '' f; do
		rel="${f#"$CONFIG_DIR"/}"
		for pat in "${EXCLUDES[@]}"; do
			# shellcheck disable=SC2254
			case "$rel" in
				$pat)
					rm -f "$f"
					removed=$((removed + 1))
					break
					;;
			esac
		done
	done < <(find "$CONFIG_DIR" -type f -print0 2>/dev/null)
	printf '%s\n' "$removed"
}

# =====================================================================
# Chế độ 1: ghi plain file vào --config-dir (mirror để git track)
# =====================================================================
if [ -n "$CONFIG_DIR" ]; then
	case "$CONFIG_DIR" in
		"$HOME" | / | "$AGENT_DIR") die "từ chối ghi vào '$CONFIG_DIR' — chọn thư mục riêng, ví dụ ./config" ;;
	esac

	STAGE="$(mktemp -d)"
	trap 'rm -rf "$STAGE"' EXIT
	for item in "${INCLUDE[@]}"; do
		cp -R "$AGENT_DIR/$item" "$STAGE/$item"
	done
	scan_secrets "$STAGE" || true

	if [ "$DRY_RUN" -eq 1 ]; then
		info ""
		info "[dry-run] sẽ mirror vào: $CONFIG_DIR"
		for item in "${INCLUDE[@]}"; do info "  $item"; done
		exit 0
	fi

	mkdir -p "$CONFIG_DIR"
	for item in "${INCLUDE[@]}"; do
		rm -rf "${CONFIG_DIR:?}/$item" # mirror: xoá bản cũ của CHÍNH mục này rồi copy lại
		cp -R "$AGENT_DIR/$item" "$CONFIG_DIR/$item"
	done

	load_excludes
	EXCLUDED="$(prune_excluded)"

	# Cảnh báo file lạ còn sót ở cấp cao nhất (không tự xoá). Bỏ qua dotfile.
	STALE=()
	while IFS= read -r entry; do
		name="$(basename "$entry")"
		[ -z "$name" ] && continue
		case "$name" in .*) continue ;; esac
		found=0
		for item in "${INCLUDE[@]}"; do
			[ "$name" = "$(basename "$item")" ] && found=1
		done
		[ "$found" -eq 0 ] && STALE+=("$name")
	done < <(find "$CONFIG_DIR" -maxdepth 1 -mindepth 1 2>/dev/null)
	if [ "${#STALE[@]}" -gt 0 ]; then
		warn "trong $CONFIG_DIR còn mục không thuộc phạm vi backup (không tự xoá): ${STALE[*]}"
	fi

	info ""
	info "✓ đã ghi config: $CONFIG_DIR"
	info "  mục:      ${INCLUDE[*]}"
	if [ "${#EXCLUDES[@]}" -gt 0 ]; then
		info "  loại trừ: $EXCLUDED file khớp .pi-setup-exclude (${EXCLUDES[*]})"
	fi
	info "  packages: $(pkg_count)"
	if [ "$WITH_STATE" -eq 0 ]; then
		info "  (không gồm state: skills/ memory/ missions/ — thêm --with-state nếu cần)"
	fi
	exit 0
fi

# =====================================================================
# Chế độ 2 (mặc định): đóng gói thành tarball
# =====================================================================
mkdir -p "$(dirname "$OUT")"
TMP="$OUT.tmp.$$"
SCAN_DIR="$(mktemp -d)"
cleanup() { rm -f "$TMP"; rm -rf "$SCAN_DIR"; }
trap cleanup EXIT

# Ghi ra file tạm rồi mv → không để lại artifact hỏng nếu bị ngắt giữa chừng.
# 'gzip -n' bỏ timestamp → cùng nội dung thì cùng sha256 (kiểm tra được giữa 2 máy).
tar -cf - -C "$AGENT_DIR" "${INCLUDE[@]}" | gzip -n >"$TMP"
tar -xzf "$TMP" -C "$SCAN_DIR"
scan_secrets "$SCAN_DIR" || true

if [ "$DRY_RUN" -eq 1 ]; then
	info ""
	info "[dry-run] sẽ ghi bundle: $OUT"
	for item in "${INCLUDE[@]}"; do info "  $item"; done
	exit 0
fi

mv "$TMP" "$OUT"

# --- Tóm tắt ---
FILE_COUNT="$(tar -tzf "$OUT" | grep -vc '/$' || true)"
if SIZE_BYTES="$(stat -f%z "$OUT" 2>/dev/null)"; then :; else SIZE_BYTES="$(stat -c%s "$OUT" 2>/dev/null || echo 0)"; fi
SIZE="$(awk -v b="$SIZE_BYTES" 'BEGIN { printf "%.1f KB", b / 1024 }')"
if command -v shasum >/dev/null 2>&1; then
	SHA="$(shasum -a 256 "$OUT" | cut -d' ' -f1)"
else
	SHA="$(sha256sum "$OUT" | cut -d' ' -f1)"
fi

if [ "$QUIET" -eq 1 ]; then
	emit "$OUT  $SHA"
else
	emit ""
	emit "✓ bundle:  $OUT"
	emit "  size:    $SIZE ($SIZE_BYTES byte, $FILE_COUNT file)"
	emit "  gồm:     ${INCLUDE[*]}"
	emit "  packages: $(pkg_count) (từ settings.json)"
	emit "  sha256:  $SHA"
	if [ "$WITH_STATE" -eq 1 ]; then
		emit "  ⚠ bundle CÓ state (memory/ missions/) — không nên đưa lên nơi công khai"
	else
		emit "  (không gồm state: skills/ memory/ missions/)"
	fi
fi
