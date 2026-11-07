# Template tạo issue

Dựng description tiếng Việt từ khung chung, rồi áp dụng phần riêng cho loại issue. Giữ một nguồn cho các phần chung; không sao chép template phân tích vào ticket.

Nội dung `<...>` trong mẫu là hướng dẫn soạn, không phải payload. Thay bằng thông tin đã xác nhận. Bỏ phần tùy chọn không liên quan, không đặt số lượng AC cố định và không gửi placeholder chưa điền.

## Khung chung — Task

```markdown
## Mục tiêu
<Kết quả cần đạt và lý do cần thay đổi.>

## Bối cảnh
<Hiện trạng hoặc yêu cầu nguồn đã biết; link nếu có.>

## Phạm vi
- Trong phạm vi: <hành vi hoặc đầu ra cần bàn giao>.
- Ngoài phạm vi: <ranh giới đã xác định, nếu có>.

## Yêu cầu
- <Quy tắc, đầu vào/đầu ra hoặc hành vi đã được yêu cầu.>

## Tiêu chí nghiệm thu
- AC-01: <Tiền điều kiện/hành động và kết quả quan sát được.>

## Cách kiểm chứng
- <Dữ liệu, môi trường và thao tác để kiểm tra AC.>

## Phụ thuộc và tài liệu
- <Ticket, contract, thiết kế hoặc quyết định có liên quan; bỏ nếu không có.>
```

Task tập trung kết quả kỹ thuật/vận hành; không ép thành câu user story. Ghi chú triển khai có thể được đưa riêng nếu đã có quyết định, không thay thế AC.

## Story

Dùng khung chung; diễn đạt Mục tiêu bằng người dùng, nhu cầu và giá trị khi đã biết:

```markdown
## Mục tiêu
Là <vai trò/người dùng>, tôi muốn <nhu cầu>, để <giá trị nhận được>.
```

Không tự bịa persona/lợi ích cho đủ câu. Viết yêu cầu nghiệp vụ trong phần Yêu cầu và AC kiểm chứng kết quả. Dùng checklist cho tình huống đơn giản; dùng Given/When/Then khi có tiền điều kiện hoặc chuyển trạng thái cần làm rõ.

Ví dụ minh họa, không phải contract FMS đã xác nhận:

```gherkin
Feature: Lọc danh sách đơn hàng theo trạng thái
  Scenario: Giữ bộ lọc khi chuyển trang
    Given người dùng đang xem danh sách lọc theo trạng thái Đã xác nhận
    And kết quả có nhiều hơn một trang
    When người dùng chuyển sang trang kế tiếp
    Then danh sách vẫn chỉ hiển thị đơn có trạng thái Đã xác nhận
    And bộ lọc vẫn hiển thị trạng thái Đã xác nhận
```

## Bug

Dùng khung chung. Mục tiêu là hành vi cần khôi phục; thêm các mục sau trước phần Yêu cầu:

```markdown
## Môi trường và tiền điều kiện
- Môi trường: <thông tin đã có>.
- Phiên bản/build, thời điểm: <thông tin đã biết hoặc thiếu sót cần làm rõ>.
- Điều kiện dữ liệu/quyền: <thông tin cần để điều tra>.

## Hiện tượng và ảnh hưởng
- Kết quả thực tế: <quan sát của người báo lỗi hoặc bằng chứng đã đọc>.
- Kết quả mong đợi: <theo yêu cầu nguồn hoặc người báo lỗi>.
- Ảnh hưởng: <đối tượng/chức năng bị tác động; tần suất nếu biết>.

## Tái hiện hoặc bằng chứng
1. <Bước thao tác và đầu vào nếu đã có>.
- Khả năng tái hiện: <ổn định/không ổn định/chưa tái hiện được theo nguồn>.
- Bằng chứng: <ảnh, log đã che dữ liệu nhạy cảm, correlation ID hoặc link>.
```

Không bắt buộc bug đã tái hiện ổn định mới được ghi nhận. Nếu user chỉ yêu cầu ghi nhận backlog với dữ liệu chưa đủ, giữ bằng chứng và thêm “Cần làm rõ” với câu hỏi cụ thể. Không bịa build, bước tái hiện, root cause hoặc AC đã duyệt; không tự đổi trạng thái để đánh dấu backlog.

## Các phần bổ sung theo nội dung thật

| Điều kiện | Nội dung bổ sung |
|---|---|
| API hoặc bàn giao BE–FE | Contract đã xác nhận: method/path, input/output, validation/lỗi, quyền và tương thích; dẫn tài liệu chung thay vì tạo contract mới |
| Thay đổi dữ liệu | Phạm vi dữ liệu cũ, quy tắc chuyển đổi, cách đối chiếu và rollback khi rủi ro cần phục hồi |
| Yêu cầu hiệu năng | Ngưỡng, quy mô dữ liệu và điều kiện đo đã được yêu cầu; không tự đặt con số |
| Quyền/tenant liên quan | Hành vi truy cập được phép/bị từ chối và AC tương ứng; không thêm boilerplate vào mọi issue |
| Subtask | Phần công việc riêng, parent đã xác minh và link tới yêu cầu chung; không chép toàn bộ description parent |
| Epic/type khác theo project | Dùng khung chung phù hợp yêu cầu thực tế; hỏi khi nội dung/type chưa đủ rõ |

## Kiểm tra trước khi gửi

- Giữ summary rõ và đúng title nếu user đã chỉ định; chỉ tự đề xuất dạng `[Phạm vi] Hành động/hiện tượng + đối tượng` khi chưa có title.
- Mỗi yêu cầu quan trọng có kết quả nghiệm thu hoặc câu hỏi mở cụ thể; không lấy “đã sửa code/đã thêm test/chạy không lỗi” làm AC duy nhất.
- Không tự thêm bước triển khai, scope, priority, deadline, estimate, giải pháp hoặc threshold.
- Phân biệt đủ field để tạo với đủ rõ để thực hiện. Không mô tả ticket còn quyết định chặn là sẵn sàng thực hiện.
- Dùng heading, bullet và danh sách đánh số; chỉ dùng định dạng phong phú khi công cụ hỗ trợ. Đọc lại nội dung đã lưu, không phụ thuộc default template UI/automation.

Nguồn hướng dẫn: [Atlassian User Stories](https://www.atlassian.com/agile/project-management/user-stories), [Bug report](https://www.atlassian.com/software/jira/templates/bug-report), [Acceptance Criteria](https://www.atlassian.com/work-management/project-management/acceptance-criteria), [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/).
