# Changelog

## 1.2.0 — 2026-11-07

- Thêm `references/codebase-analysis.md`: bảng chọn skill `ak-*`/skill chủ convention đã cài (`ak-scout`, `ak-gkg`, `ak-explain`, `ak-ask`, `ak-databases`, `senior-project-discovery`, `vt-fastendpoint`, `ak-react-best-practices`/`ak-web-frameworks`) để đọc codebase và business rule hiện tại khi phân tích.
- Giữ ranh giới chỉ-đọc: bỏ qua mọi bước skill đòi ghi file/cài đặt/mutation; business rule chỉ vào report khi truy về được file/symbol/docs nguồn.
- Cập nhật `SKILL.md` mode table và `report-template.md` để nạp reference có điều kiện và trích dẫn skill/file đã đối chiếu trong mục Nguồn và 4.3.

## 1.1.0 — 2026-10-03

- Thêm router `--analysis`, `--add issue`, `--add comment` và nhận diện yêu cầu tự nhiên tương ứng; giữ cách gọi phân tích không có flag.
- Tách workflow theo chế độ, nạp reference theo nhu cầu và giới hạn quyền ghi riêng từng nhánh.
- Thêm khung tạo issue chung, phần Story/Task/Bug và các mục contract có điều kiện; phân biệt ghi nhận backlog với sẵn sàng thực hiện.
- Kiểm tra project/type, required fields, allowed values/context; giữ nội dung nguyên văn, JSM visibility và đọc lại sau ghi.
- Không tự retry thao tác ghi chưa rõ kết quả; đối soát receipt/key/comment ID trước và báo giới hạn xác minh.
- Phân biệt dữ liệu rỗng, chưa thu thập và lỗi đọc; không làm theo instructions nhúng trong Jira.
- Thêm case consumer cho routing, quyền đọc/ghi, template, visibility và lỗi thao tác ghi. Kết quả kiểm chứng được lưu riêng, không coi case được khai báo là đã đạt.

## 1.0.0 — 2026-10-03

- Đổi tên skill `fms:jira-task-analysis` thành `vt-jira`; giữ workflow đọc/phân tích và report tại `plans/tasks/`.
