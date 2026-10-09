# Checklist tiếp thu upstream — quyết định apply hay không

> **Đã apply 2026-10-07:** A1 A2 A3(phương án a) A4 A5 B1 B2(chỉ `pi-footer`) B3 B5 C1 C3.
> Không apply: C2 C4 C5 C6 (không tick). Chi tiết ở `docs/pi-setup-migration.md` (mục *Compaction* + `pi-setup-patch-extensions.mjs`).
> **pi đã lên `1.0.4` trong lúc làm** → toàn bộ giả định dưới đây đã được kiểm lại trên 1.0.4 (API extension, công thức trigger/trần tóm tắt, key `modelOverrides`, giá trị `fullscreen*`, anchor `pi-footer`) — không mục nào stale.
> Sửa lại một luận điểm sai: `config/models.json` **đã commit** dùng `"$NINEROUTER_API_KEY"` (env) → **lịch sử git không lộ key**; chỉ bản live (rewrite 06/10) chứa key literal. Vì vậy A4 = loại khỏi snapshot, và **đổi key là tuỳ chọn**, không bắt buộc.

> File này **chưa được commit** (`docs/upstream-adoption-checklist.md` đang ở trạng thái untracked)
> → không ảnh hưởng snapshot `config/`. Tick trực tiếp các ô `- [ ]` bên dưới (GitHub, VS Code,
> Obsidian… đều render và click được), hoặc bỏ tick và điền khối **QUYẾT ĐỊNH** ở cuối.
> Mặc định mục nào không tick = không apply.

**Bối cảnh:** upstream `mrgoonie/zuey-pi-setup@27327e0` (21/09/2026) vs repo này `894aca4`.
Merge base `c87d77d` (16/09) → upstream thêm **1** commit, mình thêm **10**; hai nhánh tách hẳn.

**Bằng chứng dùng chung** (đã kiểm trên máy này: pi `0.87.1`, Node 24):

| Sự kiện | Nguồn kiểm |
|---|---|
| Key override compaction = `${provider}/${id}` (khớp tuyệt đối) | `dist/core/settings-manager.js` |
| Trigger gốc | `contextTokens > contextWindow - reserveTokens` |
| Trần tóm tắt | $\min(\lfloor 0.8 \times \text{reserveTokens} \rfloor,\ \text{model.maxTokens})$; lượt turn-prefix dùng $0.5\times$ |
| `9router/ol/deepseek-v4.1-flash` không tồn tại | `pi -p --model …` → `Warning: … not found … Using custom model id` + `404 model_not_found` |
| Proxy 9router (`127.0.0.1:20128/v1/models`) | `flash` (ctx 1.000.000), `ocg/deepseek-v4.1-flash` (ctx **1.000.000**, max_out 384.000), `openrouter/z-ai/glm-5.3-flash`; **không có `ol/*`** |
| `config/models.json` khai | chỉ `ocg/deepseek-v4.1-flash`, `contextWindow: 128000`, `maxTokens: 16384` |
| `pi-footer@0.5.1` chưa vá | `pi-setup-patch-extensions.mjs --check` → exit 1; anchor `render()` khớp **đúng 1 lần** |
| `pi-goal-x@0.31.9` khác `0.31.6` | `renderUI` tự chụp `goalCwd`; `getLedgerEvents` dùng `storage` → script của họ exit 2 |
| `steeringMode` default | `getSteeringMode()` → đã là `one-at-a-time` |
| `images.blockImages`, `terminal.showTerminalProgress` default | `false` |
| API policy extension dùng | `session_compact_failed`, `session_compact`, `agent_settled`, `ctx.getContextUsage()`, `ctx.compact()` — có trong 0.87.1 |

---

## A. Lỗi config đang có trên máy (upstream chỉ ra, không phải việc của họ)

- [x] **A1 — Sửa `defaultModel` đang trỏ vào model không tồn tại** · Đề xuất: **ÁP**
  - Vì sao: `settings.json` → `"ol/deepseek-v4.1-flash"`, nhưng `models.json` chỉ khai `ocg/deepseek-v4.1-flash`; proxy cũng không còn `ol/*` (`models.json` mtime 06/10, `settings.json` 28/09 → dấu vết đổi tên `ol` → `ocg`). Hiện mỗi lần khởi động với default này là warning + `404 model_not_found`.
  - Việc làm: `"defaultModel": "ocg/deepseek-v4.1-flash"`.
  - Rủi ro: ~0. *Loại trừ lẫn nhau:* chỉ chọn `ocg/` **hoặc** khôi phục `ol/` bên proxy — không làm cả hai.

- [x] **A2 — Sửa 2 key `compaction.modelOverrides` đang chết** · Đề xuất: **ÁP**
  - Vì sao: key hiện tại `"9router/ol/deepseek-v4.1-flash"` + `"9router/flash"`; model bạn thực chạy là `9router/ocg/deepseek-v4.1-flash` → **không khớp key nào** → rơi về `reserveTokens` toàn cục `16384` → trần tóm tắt $=\min(13107, 16384)=$ **13.107 token**, đúng nguyên nhân upstream ghi là vỡ session dài.
  - Ghi chú: `"9router/flash"` **không sai** (model `flash` có thật, 1M window) — chỉ là không phải model bạn đang chạy.
  - Rủi ro: chỉ quyết định model nào được override; hành vi chỉ đổi sau khi A3 chốt giá trị.

- [x] **A3 — Chốt window + `maxTokens` + reserve** · Đề xuất: **ÁP phương án (a)**
  - Vì sao: bạn khai `contextWindow: 128000` trong khi proxy báo mô hình thật **1.000.000**. `reserveTokens: 700000` cho thấy ý định ban đầu là window 1M — nhưng với window *khai báo* 128K thì `tokens > 128000 - 700000` **không bao giờ đúng → tắt hẳn compaction** (nếu key có khớp).
  
  | Phương án                      | `contextWindow` | `maxTokens` | reserve cho `ocg/…` | Trần tóm tắt | Nén ở              |
  | ------------------------------ | --------------- | ----------- | ------------------- | ------------ | ------------------ |
  | **(a) đúng proxy — đề xuất**   | 1000000         | 64000       | 64000               | 51.200       | 40% = 400K (do B1) |
  | (b) giữ kiểm soát chi phí 128K | 128000          | 64000       | 16384 (mặc định)    | 51.200       | 75% = 96K (do B1)  |
  
  - Rủi ro (a): context dài hơn ⇒ nhiều token mỗi request (cần xác nhận gói OCG không giới hạn cứng 128K).
  - Rủi ro (b): phí 872K context đã trả tiền.

- [x] **A4 — `config/models.json` đang vào repo PUBLIC kèm `apiKey`** · Đề xuất: **ÁP**
  - Vì sao: `hvantoan/pi-setup` là repo **PUBLIC** (fork của `mrgoonie/zuey-pi-setup`); `config/models.json` được track và chứa 1 dòng `apiKey` (endpoint `127.0.0.1:20128`); `.pi-setup-exclude` hiện **không** loại file này.
  - Đánh giá: khoá trỏ proxy localhost nên rủi ro thấp, nhưng **đã nằm trong lịch sử git public** → coi như đã lộ.
  - Việc làm: thêm `models.json` vào `.pi-setup-exclude`; **cân nhắc đổi key 9router**.
  - Rủi ro khi đổi key: phải cập nhật lại `models.json` (live) — nằm ngoài repo sau khi exclude.

- [x] **A5 — Đồng bộ `config/` ← live sau khi apply** · Đề xuất: **ÁP**
  - Vì sao: chính commit `894aca4` đã gặp cảnh 3 bản copy lệch nhau.
  - Việc làm: `./scripts/pi-setup-backup.sh --config-dir config`.
  - Rủi ro nếu bỏ: lần restore sau sẽ ghi đè mất thay đổi vừa làm.

---

## B. Tiếp thu từ upstream (đã xác minh chạy được trên pi 0.87.1)

- [x] **B1 — `config/extensions/compaction-policy.ts`** · Đề xuất: **ÁP**
  - Vì sao: nén ở **40%** window khi ≥500K token, **75%** dưới ngưỡng; floor **60 s**; **backoff 10 phút** sau lần nén lỗi; trigger gốc vẫn làm backstop. `reserveTokens` chỉ là **một** con số nên không thể vừa là 40% của 1M vừa là 75% của 128K.
  - Việc làm: lấy file từ upstream vào `config/extensions/` rồi copy sang `~/.pi/agent/extensions/`.
  - Rủi ro: chạy mỗi `agent_settled`; lỗi chỉ `console.error`, trigger gốc còn nguyên.

- [x] **B2 — `scripts/pi-setup-patch-extensions.mjs`, chỉ entry `pi-footer`** · Đề xuất: **ÁP một phần**
  - Vì sao: `pi-footer@0.5.1` trên máy chưa vá; `render()` gọi `ctx.getContextUsage()`; sau `/reload` ctx cũ bị coi là stale và pi **fatal** (chuỗi `stale after session replacement` có trong core 0.87.1) → pi thoát ra shell.
  - Loại trừ plugin: entry `pi-goal-x` **không copy** — bản cài của bạn là `0.31.9`, code đã đổi → exit 2. Muốn thì phải viết lại anchor.
  - Rủi ro: patch nằm trong `node_modules` → **mất sau mỗi `pi update`** (`--check` để phát hiện).

- [x] **B3 — Thêm `extensions/*.bak*` vào `.pi-setup-exclude`** · Đề xuất: **ÁP**
  - Vì sao: giữ backup `*.bak-*` của script vá khỏi repo public (upstream gặp đúng chuyện này). Giữ luôn glob `extensions/herdr-*.ts` của bạn.
  - Rủi ro: không có (glob hẹp trong `extensions/`).

- [x] **B4 — Nguyên tắc "reserve phải scale theo window"** · Đề xuất: **ÁP** (đã nằm trong A3)
  - Vì sao: global 16384 giữ nguyên (cũng là reserve trigger cho model nhỏ), chỉ nâng cho model ≥500K qua `modelOverrides` — và **không** dùng 700000.

- [x] **B5 — Học quy trình, ghi vào docs (không phải key)** · Đề xuất: **ÁP**
  - Tách "khi nào nén" khỏi "tóm tắt dài bao nhiêu", kèm số đo thật; script vá phải có anchor + đếm match + backup + exit code + **không đoán**; ghi rõ cái cố ý **không** vào repo (credential) + glob loại trừ.

---

## C. Tuỳ chọn / gu (không phải bug)

- [x] **C1 — `tuiMode: "fullscreen"` + `fullscreenScrollbar`/`fullscreenExitOutput`** · Đề xuất: **TUỲ**
  - Đổi cách cuộn/thoát TUI; bạn đang `regular` + `config/kitty.conf` riêng. Không liên quan bug.

- [ ] **C2 — `terminal.showTerminalProgress: true`** · Đề xuất: **TUỲ**
  - Mặc định `false`; bật = hiện tiến trình ra terminal. Thuần thị giác.

- [x] **C3 — `images.blockImages: true`** · Đề xuất: **BỎ**
  - Mặc định `false`; bạn có `@injaneity/pi-computer-use` (đọc UI) → chặn ảnh phá luồng đó.

- [ ] **C4 — `enabledModels`** · Đề xuất: **TUỲ**
  - `models-store.json` của bạn có ~78 model (opencode-go 27, azure 41, codex 8, deepseek 2). Chỉ làm gọn menu `/model`, không đổi hành vi.

- [ ] **C5 — Thêm package: `pi-multix` / thêm lại `pi-browser-use` + `@pi-unipi/notify`** · Đề xuất: **TUỲ**
  - Bạn đã bỏ `pi-browser-use` + `@pi-unipi/notify` (`c0c3536`) rồi bỏ `devin` (`2ac744f`) → hiện không có gì thay thế cho browser-agent và thông báo ngoài.
  - Cần credential ngoài repo: `~/.unipi/config/notify/config.json` (Gotify/Telegram), `~/.multix/.env`.
  - **Không** thêm `@pinet/model-aware-compaction` — xem D2.

- [ ] **C6 — Cập nhật `README.md` / `docs/pi-setup-migration.md`** · Đề xuất: **ÁP nếu B1/B2 được tick**
  - Thêm mục "compaction: 2 knob", cách dùng script vá, cảnh báo `/reload`, đổi số package nếu C5 đổi.

---

## D. Không tiếp thu (ghi lại để khỏi mở lại)

| Mục | Lý do |
|---|---|
| D1 `steeringMode: "one-at-a-time"` | pi 0.87.1 default **đã** là `one-at-a-time` → key vô nghĩa |
| D2 `@pinet/model-aware-compaction` (+ block config của nó) | Trùng ngưỡng với B1, `onError` re-arm ngay sau lỗi → upstream phải tắt (`enabled: false`) |
| D3 Entry `pi-goal-x` trong patch script | Bạn ở `0.31.9`, khác `0.31.6` của họ → exit 2 (xem B2) |
| D4 Bỏ `skills: ["!**/.agents/**"]` | Upstream bỏ key này **không** kèm lý do trong commit → không đủ bằng chứng |
| D5 `models-store.json`, provider `opencode-go`, `enabledModels` của họ | Catalog/provider riêng máy họ, không áp dụng cho 9router |

---

## QUYẾT ĐỊNH (điền nếu không muốn tick — vẫn phải gửi lại)

```text
Tick:                 # vd: A1 A2 A3a A4 A5 B1 B2(pi-footer) B3 B5 C6
Window:               # 1M  |  128K
maxTokens:            # 64000 | giữ 16384
reserve cho 9router/ocg/deepseek-v4.1-flash:   # 64000 | 16384 | khác
Patch script:         # pi-footer only | port goal-x 0.31.9 | none
Đổi apiKey 9router:   # yes | no
C5 packages:          # notify | browser-use | multix | none
Ghi chú:
```

---

## Phụ lục 1 — Patch chính xác

```jsonc
// ~/.pi/agent/models.json
"ocg/deepseek-v4.1-flash": { "contextWindow": 1000000, "maxTokens": 64000 }

// ~/.pi/agent/settings.json
"defaultModel": "ocg/deepseek-v4.1-flash",
"compaction": {
  "enabled": true,
  "reserveTokens": 16384,          // giữ nhỏ: đây cũng là reserve trigger cho model nhỏ
  "keepRecentTokens": 20000,
  "modelOverrides": {
    "9router/ocg/deepseek-v4.1-flash": { "reserveTokens": 64000 }
  }
}
```

```bash
# B1 — lấy extension nén từ upstream
git show upstream/main:config/extensions/compaction-policy.ts > config/extensions/compaction-policy.ts
cp config/extensions/compaction-policy.ts ~/.pi/agent/extensions/

# B2 — patch script (chỉ pi-footer)
git show upstream/main:scripts/pi-setup-patch-extensions.mjs > scripts/pi-setup-patch-extensions.mjs
node scripts/pi-setup-patch-extensions.mjs --check   # 0 = đã vá, 1 = còn thiếu, 2 = anchor không khớp

# B3 + A4 — loại trừ
printf '\nextensions/*.bak*\nmodels.json\n' >> config/.pi-setup-exclude

# A5 — đồng bộ lại snapshot
./scripts/pi-setup-backup.sh --config-dir config
```

## Phụ lục 2 — Sau khi bạn chốt, tôi chạy gì để chứng minh

1. `pi -p "say ok"` → hết warning model-not-found, không lỗi load extension.
2. `node scripts/pi-setup-patch-extensions.mjs --check` → exit 0.
3. Session dài (hoặc `/compact` thủ công) → log có `Compacting at N% (policy: 40%)`.
4. `diff ~/.pi/agent/settings.json config/settings.json` → rỗng (backup đã bắt kịp).
5. `./scripts/pi-setup-restore.sh --from-config config --scratch --install --verify` → `N/N extension khớp`.
