# iLovePDF Clone - Setup Guide

This guide will help you set up the complete iLovePDF clone platform with web, mobile, and backend components.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment (for mobile)
- Supabase account
- Git

## Project Structure

```
pdf/
├── backend/          # Node.js + Express API
├── web/             # React web application
├── mobile/          # React Native mobile app
├── shared/          # Shared utilities and types
└── docs/            # Documentation
```

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Go to the SQL editor and run the schema from `backend/database/schema.sql`

### Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. (Optional) Configure Google OAuth:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### Set up Storage

1. Go to Storage in Supabase dashboard
2. The `files` bucket should be created automatically by the schema
3. Configure storage policies if needed

## 2. Backend Setup

```bash
cd backend
npm install
```

### Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_jwt_secret_key
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
```

### Start the Backend

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 3. Web Application Setup

```bash
cd web
npm install
```

### Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### Start the Web App

```bash
npm run dev
```

The web app will be available at `http://localhost:3000`

## 4. Mobile Application Setup

### Prerequisites

- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

```bash
cd mobile
npm install
```

### Environment Configuration

1. Update `src/lib/supabase.js` with your Supabase credentials
2. Update `src/lib/api.js` with your backend URL

### iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Setup

```bash
npm run android
```

## 5. Database Configuration

### Create Admin User

After setting up authentication, create your first admin user:

1. Register a user through the web or mobile app
2. In Supabase SQL editor, run:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## 6. Testing the Setup

### Backend API

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

### Web Application

1. Open `http://localhost:3000`
2. Register a new account
3. Upload a PDF file
4. Try merging or splitting PDFs

### Mobile Application

1. Launch the app on your device/emulator
2. Register or login
3. Test file upload and PDF operations

## 7. Production Deployment

### Backend Deployment

1. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)
2. Update environment variables for production
3. Set up proper CORS origins

### Web Deployment

1. Build the application:
   ```bash
   cd web
   npm run build
   ```
2. Deploy to Vercel, Netlify, or your preferred hosting
3. Update environment variables

### Mobile Deployment

1. Build release versions for iOS and Android
2. Submit to App Store and Google Play Store

## 8. Configuration Options

### File Upload Limits

Adjust in `backend/.env`:
```env
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
```

### Rate Limiting

Configure in `backend/.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Storage Limits

Update user limits in `shared/types/index.js`

## 9. Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS configuration in `backend/src/server.js`
2. **File Upload Fails**: Check file size limits and allowed types
3. **Authentication Issues**: Verify Supabase credentials
4. **Mobile Build Errors**: Ensure React Native environment is properly set up

### Logs

- Backend logs: Check console output
- Web app: Check browser developer tools
- Mobile: Check Metro bundler and device logs

## 10. Next Steps

- Set up monitoring and analytics
- Implement additional PDF operations
- Add subscription management
- Set up automated backups
- Configure CDN for file delivery

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check Supabase documentation
4. Create an issue in the project repository