# Kịch bản chuẩn hóa UI/UX SmartRecruit

Ngày: 05/10/2026. Trạng thái: **Target — đề xuất thiết kế, chưa triển khai**.

## 1. Mục tiêu và phạm vi

Làm mới giao diện theo phong cách SaaS tuyển dụng chuyên nghiệp: rõ thông tin, nhẹ thị giác, thao tác nhanh, nhất quán giữa các màn hình. Tối ưu trên React, Tailwind CSS và các component hiện có; giữ nghiệp vụ, đường dẫn và phân quyền đang được sử dụng.

Ba trải nghiệm cần giữ bản sắc:

- **Recruiter:** workspace sáng, xanh dương làm điểm nhấn; ưu tiên xử lý công việc và so sánh ứng viên.
- **Candidate:** portal sáng, xanh emerald làm điểm nhấn; ưu tiên đọc nội dung, theo dõi hồ sơ và hành động tiếp theo.
- **Admin:** workspace tối; ưu tiên khả năng đọc dữ liệu, quản trị và xử lý sự cố.

Không thêm tính năng mới chỉ để lấp đầy bố cục. Các tương tác chưa có dữ liệu hoặc API phải được ghi nhận rõ khi triển khai; không hiển thị thành công giả.

## 2. Cơ sở từ UI hiện có

Đánh giá này dựa trên mã nguồn frontend, chưa phải kiểm thử thị giác trên trình duyệt.

| Quan sát | Vị trí minh họa | Hướng cải tiến |
| --- | --- | --- |
| Ba layout dùng kích thước và cách cuộn khác nhau | `AdminLayout.tsx`, `RecruiterLayout.tsx`, `CandidateLayout.tsx` | Chuẩn hóa khung trang, quy tắc cuộn và responsive |
| Component UI dùng màu tối trực tiếp | `Button.tsx`, `DataTable.tsx`, `index.css` | Dùng token ngữ nghĩa theo theme, tránh sửa màu từng trang |
| Nhiều nhãn 9–11px | `CandidateManagement.tsx`, các sidebar | Tăng cỡ chữ; giảm chữ in hoa và thông tin phụ |
| Sidebar và một số bảng dùng chiều rộng cố định | `RecruiterLayout.tsx`, `CandidateManagement.tsx` | Bổ sung sidebar thu gọn, drawer và bố cục màn hình nhỏ |
| Header Recruiter nằm trong từng trang; Candidate đã có `.candidate-header` | Các trang Recruiter và Candidate | Tách header dùng chung, giữ tìm kiếm theo ngữ cảnh |
| Một số trang có dữ liệu mẫu và số tổng cố định | `RecruiterConsole.tsx`, `ExploreJobs.tsx`, `CandidateManagement.tsx` | Khi triển khai, đồng bộ số liệu, bộ lọc và phân trang với nguồn dữ liệu thật |

## 3. Hệ thống thiết kế mục tiêu

### Màu sắc và theme

Tạo token `canvas`, `surface`, `surface-hover`, `border`, `text-primary`, `text-secondary`, `brand`, `focus`, `success`, `warning`, `danger`. Phạm vi theme đặt tại layout để Admin không làm đổi màu Candidate hoặc Recruiter.

| Vai trò màu | Giao diện sáng | Giao diện tối |
| --- | --- | --- |
| Nền trang | `#F8FAFC` | `#0F1117` |
| Bề mặt card | `#FFFFFF` | `#181C25` |
| Viền | `#E2E8F0` | `#303746` |
| Chữ chính | `#0F172A` | `#F1F5F9` |
| Chữ phụ | `#475569` | `#A8B3C4` |
| Recruiter / Candidate | `#2563EB` / `#047857` | Theo ngữ cảnh Admin |

Đây là bảng màu khởi điểm; kiểm tra độ tương phản ở từng cặp màu trước khi nghiệm thu. Màu trạng thái phải đi cùng chữ hoặc biểu tượng. AI dùng nhãn nhận diện riêng, không dùng màu thành công để ngụ ý kết quả được bảo đảm.

### Typography và khoảng cách

- Dùng Inter hiện có làm font chính; tránh trộn font giữa các vai trò khi không có mục đích rõ ràng.
- Tiêu đề trang: 28–32px desktop, 24px mobile; tiêu đề khối: 18–20px.
- Nội dung: 14–16px; metadata: 12–13px. Thông tin quan trọng không dùng 9–11px.
- Line-height nội dung khoảng 1.5. Số KPI có thể dùng tabular numbers để dễ so sánh.
- Spacing theo hệ 4/8/12/16/24/32px. Padding trang 24–32px desktop, 16px mobile.
- Card radius 12px, control 8px, badge dạng pill. Viền nhẹ, bóng đổ tiết chế; dành elevation rõ cho menu, modal và drawer.
- Icon 18–20px, thống nhất kiểu nét. Vùng tương tác chính và nút icon mục tiêu tối thiểu 44×44px.

### Bố cục chung

```text
Sidebar | Header: breadcrumb / tìm kiếm theo ngữ cảnh / thông báo / tài khoản
        | Tiêu đề trang + mô tả ngắn                       Hành động chính
        | Thông tin tổng quan khi thực sự cần
        | Tabs / tìm kiếm / bộ lọc / sắp xếp
        | Nội dung chính
        | Phân trang hoặc thông tin cập nhật
```

Sidebar desktop 240–256px; header 64px. Form và nội dung dài giới hạn khoảng 960–1120px; bảng quản trị có thể tận dụng chiều ngang lớn hơn. Một trang có một hành động chính nổi bật; các hành động phụ dùng secondary hoặc menu.

## 4. Kịch bản theo vai trò

### A. Recruiter — từ tổng quan đến quyết định tuyển dụng

**Cảnh 1: Mở `/recruiter/console`.**

Hiển thị “Tổng quan tuyển dụng”, mô tả ngắn và nút “Tạo tin tuyển dụng”. Bên dưới là tối đa bốn KPI; mỗi KPI ghi rõ thời gian thống kê. Khối “Cần xử lý” đặt ở vị trí dễ thấy, mỗi mục có số lượng, lý do và hành động cụ thể. Funnel tuyển dụng đứng cạnh hoặc bên dưới theo chiều rộng màn hình. Bảng ứng viên ưu tiên nằm tiếp theo, tránh dồn tất cả thông tin lên đầu trang.

**Cảnh 2: Mở `/recruiter/candidates`.**

Thanh công cụ gồm tìm ứng viên, lọc vị trí, giai đoạn, kỹ năng và sắp xếp. Bộ lọc đang áp dụng xuất hiện thành chip có nút xóa; có “Xóa bộ lọc”. Bảng ưu tiên tên, vị trí ứng tuyển, giai đoạn, mức độ phù hợp AI và hành động. Kỹ năng dài rút gọn thành vài nhãn và “+N”. Header bảng sticky trong vùng cuộn thích hợp; phân trang ghi số bản ghi thực tế.

Chọn ứng viên bằng checkbox sẽ mở thanh thao tác hàng loạt và hiển thị số đã chọn. “Xem hồ sơ” dùng link hoặc nút rõ ràng, có thể thao tác bằng bàn phím. Trên mobile, chuyển thành card với cùng dữ liệu chính.

**Cảnh 3: Mở hồ sơ chi tiết.**

Đầu trang gồm tên, vị trí, giai đoạn và hành động tiếp theo. Nội dung chia tab “Tổng quan”, “CV”, “Đánh giá”, “Lịch sử” theo dữ liệu sẵn có. Desktop dùng hai cột: hồ sơ chính và tóm tắt hỗ trợ ra quyết định; mobile dùng một cột. Điểm AI có giải thích tiêu chí và dữ liệu thiếu khi hệ thống cung cấp; không biến điểm này thành quyết định tự động.

**Cảnh 4: Tạo tin và đánh giá.**

Trang tạo tin chia nhóm thông tin rõ ràng; chỉ dùng stepper nếu thực sự chia nhiều bước. Nhãn luôn hiển thị, ghi trường bắt buộc, lỗi đặt cạnh trường. Có xem trước và lưu nháp nếu nghiệp vụ hỗ trợ. Trước khi đăng, hiển thị bản tóm tắt để kiểm tra.

Với AI feedback, phân biệt “Bản nháp AI”, “Đã chỉnh sửa”, “Đã duyệt”, “Đã gửi” khi các trạng thái này tồn tại. Luồng gửi: xem bản nháp → chỉnh sửa → kiểm tra người nhận và nội dung → gửi → xác nhận kết quả thực tế. Nếu gửi thất bại, giữ nội dung để thử lại.

**Các trang còn lại:** lịch phỏng vấn ưu tiên tuần/ngày và danh sách mobile; analytics luôn có khoảng thời gian và đơn vị; notifications phân biệt chưa đọc, đã đọc và hành động liên quan. Nhật ký audit nằm trong tab riêng để giảm nhiễu.

### B. Candidate — từ khám phá đến theo dõi kết quả

**Cảnh 1: Mở `/explore-jobs`.**

Thanh tìm kiếm nổi bật, bộ lọc đơn giản và tổng kết quả. Job card sắp xếp: chức danh → công ty/bộ phận → địa điểm, hình thức, lương nếu có → kỹ năng → hạn nộp → hành động. Nhãn phù hợp AI là thông tin hỗ trợ. Nút lưu có trạng thái rõ, đọc được bằng công nghệ hỗ trợ.

**Cảnh 2: Xem chi tiết và ứng tuyển.**

Nội dung đọc có chiều rộng vừa phải. “Ứng tuyển” nổi bật; thanh hành động mobile có thể sticky nhưng không che nội dung hoặc bàn phím. Trước khi nộp, hiển thị phiên bản CV và thông tin sẽ gửi. Chỉ ghi “Đã ứng tuyển” sau khi nhận kết quả thành công.

**Cảnh 3: Mở `/my-applications`.**

Mỗi hồ sơ cho biết vị trí, ngày nộp, trạng thái, lần cập nhật gần nhất và việc ứng viên cần làm tiếp. Timeline đơn giản, có chữ mô tả; tránh chỉ dùng chấm màu. Tách việc sắp đến hạn như phỏng vấn hoặc phản hồi offer khỏi lịch sử hoạt động.

**Cảnh 4: Hồ sơ, lịch phỏng vấn và offer.**

Upload CV có hướng dẫn loại file/dung lượng theo giới hạn thực tế, tiến trình và lỗi dễ hiểu. Khi trích xuất CV, ứng viên xem và sửa dữ liệu trước khi lưu. Lịch luôn ghi múi giờ. Trang offer làm rõ các thông tin được cung cấp và hạn phản hồi; thao tác chấp nhận/từ chối cần kiểm tra lại lựa chọn. Settings giữ cơ chế quay về trang trước đang có.

### C. Admin — quản trị rõ ràng, dữ liệu dễ đọc

Giữ theme tối nhưng tăng tương phản chữ phụ. Overview ưu tiên vấn đề cần xử lý, sau đó sức khỏe dịch vụ và hoạt động gần đây. Thu gọn các badge dài; chi tiết kỹ thuật mở khi cần. Chỉ hiển thị tuyên bố vận hành hoặc chứng nhận khi có nguồn dữ liệu kiểm chứng.

Danh sách jobs, applications, candidates và users dùng chung mẫu bảng. Users & Roles làm rõ quyền hiện tại và thay đổi sắp áp dụng. Audit có bộ lọc actor, loại sự kiện, thời gian; chi tiết event mở trong drawer nếu phù hợp. Settings chia nhóm, thể hiện phạm vi ảnh hưởng và trạng thái lưu; thao tác xóa hoặc thay đổi quyền quan trọng có xác nhận nêu đúng đối tượng và hậu quả.

## 5. Quy tắc tương tác bắt buộc

- **Loading:** skeleton bám bố cục; nút đang xử lý có nhãn rõ và ngăn gửi trùng.
- **Empty:** giải thích chưa có dữ liệu và đưa hành động phù hợp. Không có kết quả lọc phải khác danh sách chưa có bản ghi.
- **Error:** giữ dữ liệu người dùng đã nhập, thông báo gần nơi phát sinh, có thử lại khi phù hợp.
- **Success:** cập nhật dữ liệu hiển thị; toast chỉ bổ trợ, không thay thế trạng thái trên trang.
- **Disabled:** có lý do khi người dùng cần biết cách tiếp tục.
- **Modal/drawer:** tên truy cập rõ, focus vào trong khi mở và trở về nút mở khi đóng; tránh mất thay đổi chưa lưu.
- **Tìm kiếm/lọc:** hiển thị phạm vi tìm kiếm; giữ bộ lọc khi quay lại từ chi tiết, ưu tiên query params khi phù hợp.
- **Ngôn ngữ:** giữ tiếng Anh hiện có trong đợt chuẩn hóa ban đầu, thống nhất cách đặt tên. Nếu chuyển tiếng Việt, thực hiện toàn bộ qua hệ thống bản dịch riêng.
- **Chuyển động:** ngắn, nhẹ, tôn trọng reduced motion; trạng thái đồng bộ chỉ phản ánh trạng thái thực tế.

## 6. Responsive và khả năng tiếp cận

| Kích thước mục tiêu | Quy tắc |
| --- | --- |
| Từ 1280px | Sidebar đầy đủ, nội dung hai cột khi cần, bảng nhiều cột |
| 768–1279px | Sidebar thu gọn hoặc drawer; giảm cột phụ; toolbar tự xuống dòng |
| Dưới 768px | Menu drawer, nội dung một cột, bộ lọc trong panel, Candidate ưu tiên card |

Bảng dữ liệu Admin cần nhiều cột được cuộn ngang trong vùng bảng, không làm cả trang tràn ngang. Kiểm tra ở 360, 390, 768, 1024 và 1440px; kiểm tra nội dung tên dài, tiếng Việt và zoom 200%.

Mục tiêu nghiệm thu: tương phản chữ thường ít nhất 4.5:1; chữ lớn 3:1; focus dễ thấy; label gắn với input; nút icon có tên; thông báo lỗi không chỉ dựa vào màu. Toàn bộ luồng chính dùng được bằng bàn phím. Kiểm tra thực tế trước khi tuyên bố đạt chuẩn accessibility.

## 7. Kịch bản triển khai trên mã hiện có

1. **Chốt baseline:** chụp các màn hình đại diện của ba vai trò ở desktop/mobile, ghi hành vi hiện có và route cần giữ. Phân biệt dữ liệu mẫu với tích hợp thật.
2. **Chuẩn hóa nền tảng:** cập nhật `frontend/src/index.css` với token theo theme; nâng cấp Button, Input, Select, Card, StatusBadge, Modal, Drawer, States và Pagination. Giữ API component tương thích khi có thể.
3. **Chuẩn hóa layout:** chỉnh ba layout và sidebar; tách PageHeader/Toolbar dùng chung. Kiểm tra component sidebar được định nghĩa trong trang có còn dùng trước khi loại bỏ.
4. **Làm màn hình mẫu:** Recruiter Candidates, Candidate My Applications và Admin Overview. Duyệt độ rõ thông tin, responsive và các trạng thái trước khi nhân rộng.
5. **Nhân rộng theo luồng:** jobs → candidate detail → evaluation/feedback → calendar; explore jobs → profile → interviews/offers; sau đó các trang quản trị còn lại.
6. **Kiểm tra và bàn giao:** build frontend, chạy kiểm thử liên quan, duyệt hình ảnh và kiểm tra thao tác thật trên các route đại diện. Chỉ thêm kiểm thử hành vi cho thay đổi có ý nghĩa như bộ lọc, focus, điều hướng và submit.

Không đổi backend/API hoặc refactor nghiệp vụ ngoài phần cần cho UI nếu chưa nằm trong phạm vi triển khai. Không thêm thư viện UI lớn chỉ để thay đổi hình thức. Có thể tận dụng SVG và các component đang có, đồng thời thống nhất cách dựng icon.

## 8. Tiêu chí hoàn thành

- Cùng loại control có cùng kích thước, khoảng cách, typography và trạng thái ở mọi trang.
- Admin tối, Recruiter sáng xanh dương, Candidate sáng emerald hoạt động độc lập và nhất quán.
- Mỗi trang có tiêu đề rõ, hành động chính rõ, nội dung được xếp theo nhu cầu của vai trò.
- Không tràn ngang toàn trang trên kích thước kiểm tra; menu mobile mở/đóng và điều hướng được.
- Có loading, empty, error, success ở các luồng dùng dữ liệu; không có phản hồi thành công giả.
- Lọc, tổng bản ghi, phân trang và trạng thái chọn đồng bộ với dữ liệu đang hiển thị.
- Các route và hành vi hiện có được giữ, trừ thay đổi có chủ đích được ghi lại.
- Kiểm tra keyboard, focus, contrast, zoom và nội dung dài; lưu ảnh trước/sau của màn hình mẫu.

## 9. Prompt giao việc có thể dùng ngay

> Chuẩn hóa UI/UX frontend SmartRecruit theo tài liệu này. Bắt đầu bằng việc kiểm tra UI đang chạy và ghi baseline. Giữ React, Tailwind, nghiệp vụ và route hiện có. Tạo token ngữ nghĩa theo theme, nâng cấp component dùng chung và responsive layout. Giữ Admin tối, Recruiter sáng xanh dương, Candidate sáng emerald. Tăng độ dễ đọc, giảm nhãn quá nhỏ, thống nhất header, spacing, bảng và form. Làm ba trang mẫu Candidates của Recruiter, My Applications của Candidate và Overview của Admin trước khi nhân rộng. Bổ sung đầy đủ trạng thái tương tác, khả năng dùng bàn phím và phản hồi dựa trên kết quả thực tế. Với hành vi cần API chưa có, ghi nhận thiếu sót thay vì mô phỏng thành công. Kiểm tra build, hành vi liên quan và hình ảnh tại các kích thước mục tiêu; bàn giao danh sách thay đổi cùng ảnh trước/sau.
