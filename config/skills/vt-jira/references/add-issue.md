# Tạo issue Jira

Tạo một issue từ nội dung người dùng yêu cầu. Đọc `issue-templates.md` cùng thư mục để dựng description; dùng MCP map cho schema và lỗi. Không dùng report phân tích làm template tạo issue.

## 1. Chốt target và metadata

1. Lấy project do người dùng chỉ định; nếu thiếu, hỏi project. Không suy project từ repo, ticket đang phân tích hoặc ví dụ trong skill.
2. Lấy issue type người dùng yêu cầu. Nếu chưa có và nhiều type phù hợp, hỏi lựa chọn; không mặc định Task để bỏ qua quyết định này.
3. Gọi `jira_get_project_issue_types` cho project, dùng type ID thật với `jira_get_create_fields`. Type không hỗ trợ thì đưa các lựa chọn hợp lệ, chưa tạo. Với subtask, dùng tên API theo schema tool và xác minh parent bằng `jira_get_issue`; kiểm tra quan hệ project/type hợp lệ.
4. Đọc các field required, schema, default và allowed values. Chỉ hỏi phần bắt buộc còn thiếu mà user/context/schema không giải quyết được. Không tự đặt priority, assignee, deadline, version hoặc estimate.
5. Dùng allowed values đúng context của project/type. Với select chưa đủ option, gọi `jira_get_field_options`; truyền context ID đã xác định nếu có. Tool Cloud có thể mặc định global context: nếu chưa chứng minh option thuộc context target, không lấy global làm bằng chứng hợp lệ. Dùng discovery tool có sẵn hoặc hỏi phần chưa xác định. Không hardcode `customfield_*`, option ID, component hoặc fix version từ project khác.

## 2. Chuẩn bị nội dung

- Giữ summary được người dùng chỉ định. Chỉ tự soạn summary ngắn từ nội dung đã có khi họ chưa chỉ định tiêu đề.
- Điền khung chung và phần bổ sung theo loại trong `issue-templates.md`. Chỉ chuẩn hóa trình bày; giữ nguyên yêu cầu, dữ liệu, AC và ranh giới.
- Tách thông tin đã xác nhận, quan sát và câu hỏi mở. Không tự thêm root cause, giải pháp kỹ thuật, test threshold hoặc yêu cầu cho đủ template.
- Phân biệt “đủ field để tạo” với “sẵn sàng thực hiện”. Nếu thiếu quyết định ảnh hưởng contract, hỏi trước khi tạo. Nếu user chỉ yêu cầu ghi nhận backlog với giới hạn đã rõ, có thể tạo và ghi mục “Cần làm rõ”; không bịa AC/build/bước tái hiện và không tự chuyển trạng thái.
- Khi yêu cầu/nội dung/field đã đầy đủ và user yêu cầu tạo, gọi tool; không yêu cầu xác nhận hình thức. Nếu chỉ được yêu cầu soạn nháp, hoặc nội dung tự soạn còn quyết định chưa duyệt, trả bản nháp/câu hỏi và chưa ghi Jira.

## 3. Tạo qua MCP

Gọi một `jira_create_issue` với project, summary, issue type, description và các field được yêu cầu hoặc required/default hợp lệ. Dùng đúng schema đang có: `description` của MCP nhận Markdown; `additional_fields` là JSON string. Không gửi ADF object vào tham số Markdown hoặc dùng payload MCP trực tiếp cho REST v3.

Chỉ đặt assignee cho issue mới khi người dùng yêu cầu hoặc field bắt buộc được xác định; đây không cấp quyền assign ticket có sẵn. Không tự tạo comment, issue links, sprint, transition hoặc issue con bổ sung.

## 4. Xác minh và bàn giao

- Lấy key/ID/link từ receipt thật. Gọi `jira_get_issue` trên issue vừa tạo, yêu cầu fields đủ để so sánh summary, project/type, description, parent và những field đã gửi.
- Đối chiếu ý nghĩa nội dung và dữ liệu; chấp nhận chuẩn hóa định dạng của Jira nhưng không bỏ mất AC, câu hỏi mở, trường hoặc quyền hiển thị. Nếu chỉ có rendered/ADF, đọc nội dung tương đương; không khẳng định render đẹp nếu chưa quan sát.
- Nếu có sai lệch hoặc không thể đọc lại, báo issue đã tạo nhưng chưa xác minh/không khớp, chỉ rõ receipt và điểm khác. Nhánh này không có quyền sửa ticket để che sai lệch.
- Trả key/link, type/project, tóm tắt nội dung và những điểm còn cần làm rõ. Không nói sẵn sàng thực hiện khi ticket còn quyết định chặn.
- Khi create timeout hoặc mất receipt, áp dụng đối soát trong MCP map trước bất kỳ lần ghi khác; không tự tạo lại.
