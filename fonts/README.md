# fonts/ — JetBrains Mono 1.0.2

Font terminal đi kèm repo này để cài máy mới nhanh (không phải nội dung setup của `pi`).

| | |
|---|---|
| Font | JetBrains Mono **1.0.2** (đọc từ name table trong TTF) |
| Nguồn | <https://github.com/JetBrains/JetBrainsMono> · <https://www.jetbrains.com/lp/mono/> |
| License | **SIL Open Font License 1.1** — xem [`LICENSE.txt`](./LICENSE.txt) |
| Nerd-patched? | **Không** — xem cảnh báo bên dưới |

## Có gì

8 weight, mỗi weight 4 định dạng (32 file):

- **`ttf/`** (1.0 MB) — `Regular` · `Medium` · `Italic` · `Medium-Italic` · `Bold` · `Bold-Italic` · `ExtraBold` · `ExtraBold-Italic`. Đây là phần dùng cho terminal.
- **`web/`** (2.0 MB) — cùng 8 weight ở dạng `woff2`, `woff`, `eot`, chỉ cần khi nhúng font vào web. **Xoá được** nếu bạn chỉ muốn font cho terminal (tiết kiệm 2 MB).

## Cài (macOS)

```bash
# cách 1: mở bằng Font Book
open fonts/JetBrainsMono-1.0.2/ttf/*.ttf

# cách 2: copy thẳng vào thư mục font của user
cp fonts/JetBrainsMono-1.0.2/ttf/*.ttf ~/Library/Fonts/
```

Rồi chọn `JetBrains Mono` trong profile của terminal (iTerm2 / Ghostty / Terminal.app).

## ⚠️ Không phải Nerd Font

Đây là **JetBrains Mono gốc**, không có icon patch. Config statusline trong repo này (`config/extensions/pi-footer.json`) dùng `"iconMode": "nerd"` → các glyph Nerd Font sẽ hiện thành ô vuông (tofu) nếu terminal chỉ có font này.

Muốn icon hiện đúng, cài thêm **JetBrainsMono Nerd Font** (bản đã patch):

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

hoặc tải từ <https://www.nerdfonts.com/font-downloads>. Sau đó chọn font family có chữ `Nerd Font` trong tên. Nếu không muốn cài thêm, đổi `iconMode` sang `emoji` hoặc `text` trong `pi-footer.json`.

## License

Font được phân phối theo **OFL-1.1** (xem [`LICENSE.txt`](./LICENSE.txt)):

- được dùng, sửa, nhúng, phân phối lại kèm license này;
- **không** được bán font như một sản phẩm độc lập;
- bản sửa đổi không được dùng Reserved Font Name (tên "JetBrains Mono") nếu chưa có phép bằng văn bản.

License gốc của JetBrains Mono không có trong thư mục tải về này, nên `LICENSE.txt` được thêm vào đây để việc phân phối lại hợp lệ.
