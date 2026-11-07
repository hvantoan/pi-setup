# VIF GitLab — `git.vietinfo.tech:8443`

Đặc thù của các repo vif trên GitLab self-hosted. Chỉ áp dụng khi remote là `git.vietinfo.tech`.

## Quy ước repo vif

- Remote: `https://git.vietinfo.tech:8443/<group>/<repo>.git` (port `:8443` bắt buộc trong mọi config).
- Base branch ưu tiên: `dev` > `master` > `main`.
- Flow merge 2 tầng: `br` → `dev` → `master`. Branch feature merge vào `dev` trước; sau đó `dev` merge vào `master`. KHÔNG merge `br` thẳng vào `master`. Repo không có `dev` → `br → master` trực tiếp. **`--pr <branch>` dùng ĐÚNG `<branch>` user truyền làm target, không áp flow mặc định.**
- Merge style: merge-commit mặc định — KHÔNG squash trừ khi user yêu cầu (`glab mr create --squash-before-merge=false`).

## Debug glab — host self-hosted có port

Repo vif host trên port `:8443` nên remote là `https://git.vietinfo.tech:8443/<group>/<repo>.git`. glab match remote với config bằng **chuỗi host bao gồm port**, nên dễ lỗi hai lớp:

### Lớp 1 — Token expired vs sai key (401 invalid_token)

Triệu chứng: `glab auth status` báo 401 dù user vừa cấp token mới. Nguyên nhân: file `~/.config/glab-cli/config.yml` có nhiều entry trong `hosts:` (vd cũ còn key `git.vietinfo.tech:8443` do login qua URL có port), token mới nằm dưới key đó nhưng default `host:` trỏ key khác đang giữ token cũ.

**Debug — test token trực tiếp bằng curl** (isolate glab config khỏi token validity):

```bash
curl -sk -o /dev/null -w "HTTP %{http_code}\n" \
  -H "PRIVATE-TOKEN: <token>" https://git.vietinfo.tech:8443/api/v4/user
# 200 = token OK, 401 = expired/thu hồi
```

**Fix — ghi đè token lên key đúng (non-interactive)**:

```bash
glab auth login --hostname git.vietinfo.tech:8443 --token "glpat-xxxx"
# rồi verify: glab auth status --hostname git.vietinfo.tech:8443
```

Nếu user tự login interactive: `! glab auth login` rồi chọn host `git.vietinfo.tech:8443`.

### Lớp 2 — Remote host mismatch ("none of the git remotes correspond to GITLAB_HOST")

Triệu chứng: token OK, `glab auth status ✓`, nhưng `glab mr create` (kể cả với `--repo`) fail với "none of the git remotes configured for this repository correspond to the GITLAB_HOST environment variable. GITLAB_HOST is currently set to git.vietinfo.tech". Nguyên nhân: default `host:` trong config là `git.vietinfo.tech` (không port) không khớp remote `git.vietinfo.tech:8443` (có port) → glab không detect repo.

**Fix — đồng bộ 3 chỗ khớp remote (bao gồm port)** trong `~/.config/glab-cli/config.yml`:

```yaml
host: git.vietinfo.tech:8443          # default host — PHẢI khớp remote (có port)
hosts:
    git.vietinfo.tech:8443:           # key trong hosts: — PHẢI khớp remote (có port)
        token: glpat-xxxx
        api_protocol: https
        api_host: git.vietinfo.tech:8443   # endpoint API
        git_protocol: https
        user: toanhv
```

Quy tắc: **default `host:` + key trong `hosts:` + `api_host:` đều dùng chuỗi `git.vietinfo.tech:8443` (có port)**, đúng như host trong remote URL. Không mix key có/không port — glab sẽ dùng nhầm entry và token sai.

### Sau khi sửa

- `glab auth status --hostname git.vietinfo.tech:8443` → `✓ Logged in as toanhv`.
- `glab mr create` chạy bình thường, không cần `--repo`.
- Nếu có recovery file leftover (`~/.config/glab-cli/recover/...`) → xoá tay.
