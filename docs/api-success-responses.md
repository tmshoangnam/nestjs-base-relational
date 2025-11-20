# API Success Responses

Tài liệu mô tả format success response chuẩn RESTful API cho dự án.

## Format Chuẩn

Success responses tuân theo format sau:
Object:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {} // optional
}
```
List:
```json
{
  "data": [
    {}, {}...
  ],
  "hasNextPage": true
}
```

## Các Loại Success

### 1. Create Success (201)

**Khi nào:** Tạo mới resource thành công

**Status Code:** `201 Created`

**Ví dụ:**

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "New Resource"
  }
}
```

---

### 2. Retrieve Success (200)

**Khi nào:** Lấy thông tin resource thành công

**Status Code:** `200 OK`

**Ví dụ:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Existing Resource"
  }
}
```

---

### 3. List Success (200)

**Khi nào:** Lấy danh sách resource thành công

**Status Code:** `200 OK`

**Ví dụ:**

```json
{
  "data": [
    {}, {}...
  ],
  "hasNextPage": true
}
```

---

### 4. Update Success (200)

**Khi nào:** Cập nhật resource thành công

**Status Code:** `200 OK`

**Ví dụ:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Updated Resource"
  }
}
```

---

### 5. Delete Success (204)

**Khi nào:** Xóa resource thành công

**Status Code:** `204 No Content`

**Ví dụ:**

```json
{
  "statusCode": 204,
  "message": "Success",
  "data": null
}
```

---