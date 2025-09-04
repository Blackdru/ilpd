# iLovePDF Clone - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /auth/logout
Logout user.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### User Management

#### GET /users/profile
Get current user profile. (Protected)

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### PUT /users/profile
Update user profile. (Protected)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### GET /users/stats
Get user statistics. (Protected)

**Response:**
```json
{
  "stats": {
    "totalFiles": 25,
    "totalStorage": 104857600,
    "recentActivity": 5,
    "storageLimit": 5368709120,
    "filesLimit": 1000
  }
}
```

### File Management

#### POST /files/upload
Upload a single file. (Protected)

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "uuid",
    "filename": "document.pdf",
    "path": "user_id/timestamp-document.pdf",
    "type": "application/pdf",
    "size": 1048576,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### POST /files/upload-multiple
Upload multiple files. (Protected)

**Request:** Multipart form data with `files` field (array)

**Response:**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "id": "uuid",
      "filename": "document1.pdf",
      "path": "user_id/timestamp-document1.pdf",
      "type": "application/pdf",
      "size": 1048576,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /files
Get user files with pagination. (Protected)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `type` (optional): Filter by file type

**Response:**
```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "path": "user_id/timestamp-document.pdf",
      "type": "application/pdf",
      "size": 1048576,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /files/:id
Get file by ID. (Protected)

**Response:**
```json
{
  "file": {
    "id": "uuid",
    "filename": "document.pdf",
    "path": "user_id/timestamp-document.pdf",
    "type": "application/pdf",
    "size": 1048576,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### GET /files/:id/download
Download file. (Protected)

**Response:** File binary data

#### DELETE /files/:id
Delete file. (Protected)

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

### PDF Operations

#### POST /pdf/merge
Merge multiple PDFs. (Protected)

**Request Body:**
```json
{
  "fileIds": ["uuid1", "uuid2", "uuid3"],
  "outputName": "merged-document.pdf"
}
```

**Response:**
```json
{
  "message": "PDFs merged successfully",
  "file": {
    "id": "uuid",
    "filename": "merged-document.pdf",
    "path": "user_id/processed/timestamp-merged-document.pdf",
    "type": "application/pdf",
    "size": 2097152,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### POST /pdf/split
Split PDF into pages. (Protected)

**Request Body:**
```json
{
  "fileId": "uuid",
  "pages": [1, 2, 3],
  "outputName": "split-document.pdf"
}
```

**Response:**
```json
{
  "message": "PDF split successfully",
  "files": [
    {
      "id": "uuid1",
      "filename": "split-document_page_1.pdf",
      "path": "user_id/processed/timestamp-split-document_page_1.pdf",
      "type": "application/pdf",
      "size": 524288,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /pdf/compress
Compress PDF. (Protected)

**Request Body:**
```json
{
  "fileId": "uuid",
  "quality": 0.7,
  "outputName": "compressed-document.pdf"
}
```

**Response:**
```json
{
  "message": "PDF compressed successfully",
  "file": {
    "id": "uuid",
    "filename": "compressed-document.pdf",
    "path": "user_id/processed/timestamp-compressed-document.pdf",
    "type": "application/pdf",
    "size": 786432,
    "created_at": "2023-01-01T00:00:00Z"
  },
  "originalSize": 1048576,
  "compressedSize": 786432,
  "compressionRatio": "25.0%"
}
```

#### POST /pdf/convert/images-to-pdf
Convert images to PDF. (Protected)

**Request Body:**
```json
{
  "fileIds": ["uuid1", "uuid2"],
  "outputName": "converted-images.pdf"
}
```

**Response:**
```json
{
  "message": "Images converted to PDF successfully",
  "file": {
    "id": "uuid",
    "filename": "converted-images.pdf",
    "path": "user_id/processed/timestamp-converted-images.pdf",
    "type": "application/pdf",
    "size": 1572864,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### GET /pdf/info/:fileId
Get PDF information. (Protected)

**Response:**
```json
{
  "file": {
    "id": "uuid",
    "filename": "document.pdf",
    "type": "application/pdf",
    "size": 1048576
  },
  "info": {
    "pageCount": 10,
    "title": "Document Title",
    "author": "Author Name",
    "subject": "Document Subject",
    "creator": "Creator",
    "producer": "Producer",
    "creationDate": "2023-01-01T00:00:00Z",
    "modificationDate": "2023-01-01T00:00:00Z",
    "fileSize": 1048576,
    "filename": "document.pdf"
  }
}
```

### Admin Endpoints

#### GET /admin/users
Get all users (Admin only)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /admin/stats
Get system statistics (Admin only)

**Response:**
```json
{
  "stats": {
    "totalUsers": 1000,
    "totalFiles": 5000,
    "totalStorage": 53687091200,
    "recentActivity": 150,
    "newUsersThisMonth": 50,
    "popularOperations": {
      "merge": 100,
      "split": 75,
      "compress": 50,
      "convert": 25
    }
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": ["Detailed error information"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- 100 requests per 15 minutes per IP address
- Higher limits for authenticated users

## File Upload Limits

- Maximum file size: 50MB
- Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
- Maximum 10 files per upload request