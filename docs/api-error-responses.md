# API Error Responses

Tài liệu mô tả format error response chuẩn RESTful API cho dự án.

## Format Chuẩn

Tất cả error responses đều tuân theo format sau:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "reason": "Error reason",
  "details": any // optional
}
```

## Các Loại Error

### 1. Validation Error (422)

**Khi nào:** Dữ liệu request không hợp lệ (thiếu field, sai format, etc.)

**Status Code:** `422 Unprocessable Entity`

**Ví dụ:**

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "reason": "UnprocessableEntity",
  "details": [
    {
      "code": "isNotEmpty",
      "path": [
        "email"
      ],
      "message": "email should not be empty"
    },
    {
      "code": "isEmail",
      "path": [
        "email"
      ],
      "message": "email must be an email"
    }
  ]
}
```

---

### 2. Invalid Credentials (401)

**Khi nào:** Email hoặc password không đúng

**Status Code:** `401 Unauthorized`

**Ví dụ:**

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "reason": "InvalidCredentials"
}
```

---

### 3. Unauthorized (401)

**Khi nào:** Không có token hoặc token không hợp lệ

**Status Code:** `401 Unauthorized`

**Ví dụ:**

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "reason": "Unauthorized"
}
```

---

### 4. Forbidden (403)

**Khi nào:** Có token nhưng không đủ quyền truy cập

**Status Code:** `403 Forbidden`

**Ví dụ:**

```json
{
  "statusCode": 403,
  "message": "Access forbidden",
  "reason": "Forbidden"
}
```

---

### 5. Not Found (404)

**Khi nào:** Resource không tồn tại

**Status Code:** `404 Not Found`

**Ví dụ:**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "reason": "NotFound"
}
```

---

### 6. Internal Server Error (500)

**Khi nào:** Lỗi server (database, network, etc.)

**Status Code:** `500 Internal Server Error`

**Ví dụ:**

```json
{
  "statusCode": 500,
  "message": "An error occurred during login",
  "reason": "InternalServerError"
}
```

---

### 7. Bad Request (400)

**Khi nào:** Request không hợp lệ

**Status Code:** `400 Bad Request`

**Ví dụ:**

```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "reason": "BadRequest",
}
```

---

## Error Codes

| Reason                       | Mô tả                                  | Status Code |
| -------------------------- | -------------------------------------- | ----------- |
| `ValidationError`          | Dữ liệu request không hợp lệ           | 422         |
| `InvalidCredentials`       | Email/password sai                     | 401         |
| `Unauthorized`             | Chưa đăng nhập hoặc token không hợp lệ | 401         |
| `Forbidden`                | Không có quyền truy cập                | 403         |
| `NotFound`                 | Resource không tồn tại                 | 404         |
| `InternalServerError`      | Lỗi server                             | 500         |
| `ExternalSystemError`      | Lỗi hệ thống bên ngoài                 | 502         |
| `BusinessRuleViolation`    | Vi phạm quy tắc nghiệp vụ              | 400         |
| `Conflict`                 | Xung đột dữ liệu                       | 409         |
| `UnprocessableEntity`      | Không thể xử lý yêu cầu                | 422         |
| `BadRequest`               | Request không hợp lệ                   | 400         |

---