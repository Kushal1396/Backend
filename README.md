# FormPhotoAI Backend API

A scalable Node.js + Express backend for processing passport photos, document photos, and various image manipulation tasks.

## 🚀 Features

### 📸 Passport Photo Maker
- AI-powered face detection using MediaPipe
- Automatic cropping and centering
- Background removal with white background
- Passport-standard sizing (35mm x 45mm, 600 DPI)

### 📝 Document Photo Generator
Generate 6 different formats from a single upload:
- **Passport Photo** (827 x 1063 px)
- **Resume Photo** (600 x 800 px)
- **LinkedIn Profile** (400 x 400 px)
- **Square Profile** (500 x 500 px)
- **Form Upload** (300 x 400 px)
- **Signature Size** (300 x 100 px)

### 🎨 Image Processing Tools
- **Background Change/Removal** - Remove or replace with custom color
- **Image Resize** - Custom dimensions with aspect ratio options
- **Image Compression** - Quality control (1-100)
- **Format Conversion** - JPEG, PNG, WebP

### 📄 PDF Converter
- Convert single or multiple images to PDF
- Multiple page sizes (A4, Letter, Legal, A3, A5)
- Smart image fitting and centering

## 🛠️ Tech Stack

- **Node.js** + **Express** - Server framework
- **Sharp** - High-performance image processing
- **MediaPipe** - AI face detection
- **@imgly/background-removal** - Background removal
- **PDFKit** - PDF generation
- **MongoDB** - Error and usage logging
- **Helmet** + **CORS** - Security
- **Express Rate Limit** - Rate limiting

## 📦 Installation

1. **Clone and navigate to the project:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your MongoDB Atlas connection string
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/formphotoai
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Passport Photo

#### Generate Passport Photo
```http
POST /api/passport/generate
Content-Type: multipart/form-data

image: [file]
```

**Response:** JPEG image (downloadable)

---

### Document Photos

#### Generate All Formats
```http
POST /api/document/generate
Content-Type: multipart/form-data

image: [file]
```

**Response:**
```json
{
  "status": "success",
  "message": "Document photos generated successfully",
  "data": {
    "passport": {
      "name": "Passport Photo",
      "dimensions": "827x1063",
      "data": "base64_encoded_image",
      "mimeType": "image/jpeg"
    },
    "resume": { ... },
    "linkedin": { ... },
    "square": { ... },
    "formUpload": { ... },
    "signature": { ... }
  }
}
```

#### Generate Specific Format
```http
POST /api/document/generate/:format
Content-Type: multipart/form-data

image: [file]
```

**Formats:** `passport`, `resume`, `linkedin`, `square`, `formUpload`, `signature`

**Response:** JPEG image (downloadable)

---

### Image Tools

#### Change/Remove Background
```http
POST /api/image/change-background
Content-Type: multipart/form-data

image: [file]
backgroundColor: #FFFFFF (optional, omit for transparent)
```

**Response:** JPEG (with color) or PNG (transparent)

#### Resize Image
```http
POST /api/image/resize
Content-Type: multipart/form-data

image: [file]
width: 800
height: 600
maintainAspectRatio: true (optional)
```

**Response:** Resized JPEG image

#### Compress Image
```http
POST /api/image/compress
Content-Type: multipart/form-data

image: [file]
quality: 80 (1-100, default: 80)
```

**Response:** Compressed image

#### Convert Format
```http
POST /api/image/convert
Content-Type: multipart/form-data

image: [file]
format: png (jpeg, png, or webp)
```

**Response:** Converted image

---

### PDF Tools

#### Convert Images to PDF
```http
POST /api/pdf/image-to-pdf
Content-Type: multipart/form-data

images: [file1, file2, ...] (max 10)
pageSize: A4 (optional: A4, LETTER, LEGAL, A3, A5)
```

**Response:** PDF file (downloadable)

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests/15 min (general), 20 uploads/15 min
- **File Validation** - Type and size limits (10MB max)
- **Input Sanitization** - NoSQL injection prevention
- **Error Logging** - MongoDB error tracking

## ⚡ Performance

- **Auto Cleanup** - Temporary files deleted after processing
- **Sharp Processing** - Optimized image operations
- **Concurrent Handling** - Efficient request management
- **Buffer-based Processing** - No excessive disk I/O

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middlewares/      # Security, upload, rate limiting
│   ├── models/          # MongoDB schemas
│   └── app.js           # Express app setup
├── uploads/             # Temporary file storage
├── server.js            # Entry point
├── package.json
└── .env.example
```

## 🧪 Testing

Use **Postman**, **curl**, or your frontend to test endpoints:

```bash
# Example: Generate passport photo
curl -X POST http://localhost:5000/api/passport/generate \
  -F "image=@/path/to/photo.jpg" \
  --output passport-photo.jpg
```

## 🌐 Frontend Integration

Update your frontend API base URL to:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

Example fetch:
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(`${API_BASE_URL}/api/passport/generate`, {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
// Use blob for download or preview
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `UPLOAD_RATE_LIMIT_MAX` | Max uploads per window | `20` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🚨 Error Handling

All errors are logged to MongoDB with:
- Endpoint and method
- Error message and stack trace
- User IP and User-Agent
- Timestamp

Errors return JSON:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 📄 License

ISC

## 👨‍💻 Development

```bash
# Install nodemon for auto-reload
npm install -g nodemon

# Run in development mode
npm run dev
```

---

**Built with ❤️ for FormPhotoAI**
