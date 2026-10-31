// Keep API enum codes unchanged; translate only the text presented to people.
export const applicationStatusLabel = (value: string) =>
  (({
    SUBMITTED: "Đã nộp hồ sơ",
    IN_REVIEW: "Đang xem xét",
    SHORTLISTED: "Đã vào danh sách lựa chọn",
    INTERVIEW: "Phỏng vấn",
    OFFERED: "Đã gửi đề nghị",
    REJECTED: "Đã từ chối",
    WITHDRAWN: "Đã rút hồ sơ",
  }) as Record<string, string>)[value] ?? "Chưa xác định"

export const screeningStatusLabel = (value: string) =>
  (({
    NOT_STARTED: "Chưa phân tích",
    PENDING: "Đang chờ phân tích",
    PROCESSING: "Đang phân tích",
    WAITING_QUOTA: "Đang chờ hạn mức AI",
    RETRY_SCHEDULED: "Đã hẹn thử lại",
    COMPLETED: "Đã hoàn tất",
    FAILED: "Phân tích thất bại",
  }) as Record<string, string>)[value] ?? "Chưa xác định"

export const recommendationLabel = (value?: string | null) =>
  (({
    RECOMMENDED: "Phù hợp với tiêu chí",
    REVIEW: "Cần xem xét thêm",
    NOT_RECOMMENDED: "Chưa phù hợp với tiêu chí",
    STRONG_YES: "Rất phù hợp",
    YES: "Phù hợp",
    NEUTRAL: "Trung lập",
    NO: "Chưa phù hợp",
    STRONG_NO: "Rất ít phù hợp",
  }) as Record<string, string>)[value ?? ""] ?? "Chưa có khuyến nghị"

export const screeningFailureLabel = (value?: string | null) =>
  (({
    PROVIDER_NOT_CONFIGURED: "Chưa cấu hình dịch vụ AI",
    PROVIDER_QUOTA_EXHAUSTED: "Đã hết hạn mức AI; hệ thống sẽ tự thử lại",
    PROVIDER_BALANCE_EXHAUSTED: "Tài khoản dịch vụ AI đã hết số dư; cần bổ sung số dư để phân tích tiếp",
    PROVIDER_UNAVAILABLE:
      "Dịch vụ AI đang bận; hệ thống sẽ tự thử lại",
    PROVIDER_REJECTED: "Dịch vụ AI chưa chấp nhận yêu cầu phân tích",
    INVALID_SCREENING_INPUT: "Nội dung CV hoặc tiêu chí chưa hợp lệ",
    INVALID_PROVIDER_RESPONSE: "Chưa đọc được kết quả từ AI; hãy thử lại",
    UNEXPECTED_PROVIDER_FAILURE: "Chưa hoàn tất phân tích; hãy thử lại",
    INPUT_FINGERPRINT_MISMATCH:
      "Dữ liệu đã thay đổi; hãy gửi yêu cầu phân tích mới",
    APPLICATION_NOT_ELIGIBLE: "Hồ sơ không còn đủ điều kiện phân tích",
    QUEUE_FULL: "Hàng đợi đang đầy; hãy thử lại sau",
  }) as Record<string, string>)[value ?? ""] ??
  (value ? "Chưa hoàn tất phân tích; hãy thử lại" : "")
