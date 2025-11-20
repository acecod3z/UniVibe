# UniVibe - Developer Handoff & Technical Specifications

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (Utility-first, Design Tokens)
- **State Management**: React Context + SWR/TanStack Query (Recommended)
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend (Recommended)
- **API**: FastAPI (Python) or Node.js (Express/NestJS)
- **Database**: PostgreSQL (User data, Posts, Relations)
- **Caching**: Redis (Session management, Feed caching, Matchmaking queue)
- **Storage**: AWS S3 or MinIO (Media uploads)
- **Real-time**: Socket.io or WebRTC (Messaging, Video Match)

## 2. Design System Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | Gradient (`#2dd4bf` -> `#8b5cf6`) | Main Brand, CTAs |
| `secondary` | `#8b5cf6` | Accents, Active States |
| `accent` | `#fbbf24` | Notifications, Badges |
| `background` | `#f8fafc` (Light) / `#0f172a` (Dark) | Page Background |
| `foreground` | `#0f172a` (Light) / `#f8fafc` (Dark) | Text Content |

### Typography
- **Headings**: `Space Grotesk` (Geometric Sans)
- **Body**: `Inter` (Clean, Readable)

## 3. Core Data Models (Schema Draft)

### User
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  university_domain VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_hash VARCHAR(64), -- Hashed ID data for uniqueness
  profile_data JSONB, -- { name, bio, avatar, interests }
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Post
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_text TEXT,
  media_url VARCHAR(255),
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. ID Verification Microservice (ML Architecture)

### Workflow
1. **Upload**: User uploads ID image (Client -> API).
2. **Preprocessing**:
   - Deskew and crop card area (OpenCV).
   - Check image quality/blur.
3. **Text Extraction (OCR)**:
   - Extract Name, University, Expiry Date (Tesseract / AWS Textract).
   - **Validation**: Check if University matches email domain. Check if Date > Now.
4. **Template Matching**:
   - Compare against known ID templates for that University (Siamese Network / Feature Matching).
5. **Decision**:
   - `Confidence > 0.9`: Auto-approve.
   - `Confidence > 0.7`: Flag for manual review.
   - `Confidence < 0.7`: Reject with reason.
6. **Cleanup**:
   - **CRITICAL**: Delete raw image immediately after processing.
   - Store only `verification_hash` (SHA-256 of ID number + Salt) to prevent re-use.

### API Endpoint Example
```python
POST /api/v1/verify/id
Content-Type: multipart/form-data
Body: { image: File, university_id: string }

Response:
{
  "status": "processing" | "approved" | "rejected",
  "confidence": 0.95,
  "request_id": "req_123"
}
```

## 5. Safety & Moderation
- **Text**: Pre-screen all posts/messages with LLM-based toxicity filter (e.g., OpenAI Moderation API or local BERT model).
- **Images**: Scan for NSFW content before storage (AWS Rekognition / NudeNet).
- **Reporting**: "Report" action triggers priority review queue.
- **Shadowban**: Soft-block abusive users (content visible only to them).

## 6. Deployment Strategy
- **Containerization**: Docker for all services (Frontend, API, ML Worker).
- **CI/CD**: GitHub Actions -> Vercel (Frontend) / AWS ECS (Backend).
- **Secrets**: Use environment variables for all keys. NEVER commit `.env`.
