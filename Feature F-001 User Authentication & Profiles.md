# Feature F-001: User Authentication & Profiles

**Priority:** P0 (Must Have)  
**Status:** MVP  
**Dependencies:** None  
**Estimated Effort:** 2-3 weeks

---

## Overview
Complete user authentication system with social login, profile management, and security features powered by Supabase Auth.

---

## Requirements

### Authentication Flow
- **F-001.1:** Email/password registration and login via Supabase Auth
- **F-001.2:** OAuth social login (Google, Facebook, Apple)
- **F-001.3:** Email verification for new accounts
- **F-001.4:** Password reset functionality
- **F-001.5:** Two-factor authentication (2FA) option

### User Profile
- **F-001.6:** Personal profile creation with:
  - Profile photo upload
  - Full name, display name, bio
  - Birth date, location (optional)
  - Privacy settings (public/private profile)
- **F-001.7:** Profile editing capabilities
- **F-001.8:** Account deletion with data export option

---

## Technical Implementation

### Tech Stack
- **Auth Provider:** Supabase Auth
- **Database:** PostgreSQL (users table)
- **Storage:** Supabase Storage (profile photos)
- **Security:** Row Level Security (RLS) policies

### Database Schema
```sql
-- Extended Supabase auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  birth_date DATE,
  location TEXT,
  privacy_level TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view public profiles"
  ON public.profiles FOR SELECT
  USING (privacy_level = 'public' OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### API Endpoints
```typescript
// Next.js API Routes
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/profile/:userId
PUT    /api/profile/:userId
DELETE /api/profile/:userId
POST   /api/profile/:userId/avatar
```

### Supabase Configuration
```typescript
// Enable OAuth providers in Supabase Dashboard
- Google OAuth
- Facebook OAuth
- Apple OAuth

// Email templates (Supabase Dashboard)
- Confirmation email
- Password reset email
- Magic link email
```

---

## User Flows

### Registration Flow
1. User visits landing page
2. Clicks "Sign Up"
3. Enters email and password (or chooses OAuth)
4. Receives verification email
5. Clicks verification link
6. Redirected to profile setup
7. Uploads photo and fills in details
8. Account created, redirected to dashboard

### Login Flow
1. User visits login page
2. Enters email/password or clicks OAuth button
3. If 2FA enabled, enters code
4. Redirected to dashboard

### Profile Edit Flow
1. User navigates to profile settings
2. Edits fields (name, bio, photo)
3. Clicks "Save"
4. Changes reflected immediately
5. Success notification shown

---

## UI/UX Requirements

### Registration Page
- Clean, minimal form design
- Social login buttons prominently displayed
- Password strength indicator
- Clear error messages
- Mobile-responsive (full-screen on mobile)

### Profile Page
- Avatar display (circular, 200x200px)
- Editable fields with inline editing
- Privacy toggle (public/private)
- Account deletion button (with confirmation modal)
- Mobile-optimized layout

### Design Specifications
- Form inputs: 44px min height (mobile)
- Button size: 48px min height
- Font size: 16px minimum (prevent mobile zoom)
- Color contrast: WCAG AA compliant
- Error states: Red (#DC2626)
- Success states: Green (#10B981)

---

## Validation Rules

### Email
- Valid email format (RFC 5322)
- Maximum 255 characters
- Case-insensitive

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Display Name
- 2-50 characters
- Alphanumeric and spaces only
- No profanity (basic filter)

### Bio
- Maximum 500 characters
- No HTML tags allowed

### Avatar
- Accepted formats: JPEG, PNG, WEBP
- Maximum file size: 5MB
- Automatically resized to 500x500px
- Compressed to <200KB

---

## Security Considerations

- All passwords hashed with bcrypt (via Supabase)
- JWT tokens for session management
- HTTP-only cookies for token storage
- CSRF protection enabled
- Rate limiting: 5 failed login attempts = 15-minute lockout
- Email verification required before full account access
- 2FA uses TOTP (Time-based One-Time Password)
- Account deletion is permanent after 30-day grace period

---

## Acceptance Criteria

✅ Users can register and login within 30 seconds  
✅ Session persists across page refreshes  
✅ Mobile-responsive auth forms work on iOS and Android  
✅ Error messages are clear and actionable  
✅ OAuth login works for Google, Facebook, and Apple  
✅ Password reset emails arrive within 1 minute  
✅ Profile photos upload successfully and display correctly  
✅ Privacy settings are enforced (private profiles not viewable)  
✅ Account deletion removes all user data (GDPR compliant)  

---

## Testing Checklist

### Unit Tests
- [ ] Email validation function
- [ ] Password strength checker
- [ ] Display name sanitization
- [ ] Avatar upload handler

### Integration Tests
- [ ] Complete registration flow
- [ ] Email/password login
- [ ] OAuth login (Google, Facebook, Apple)
- [ ] Password reset flow
- [ ] Profile update
- [ ] Account deletion

### E2E Tests
- [ ] User signs up, verifies email, logs in
- [ ] User edits profile and changes persist
- [ ] User enables 2FA and logs in with code
- [ ] User deletes account and cannot log in

### Manual Tests
- [ ] Mobile responsiveness on iOS and Android
- [ ] Accessibility with screen reader
- [ ] Keyboard navigation works
- [ ] Error states display correctly

---

## Error Handling

### Common Errors
| Error | Message | HTTP Code |
|-------|---------|-----------|
| Email already exists | "This email is already registered. Try logging in." | 409 |
| Invalid credentials | "Invalid email or password." | 401 |
| Email not verified | "Please verify your email before logging in." | 403 |
| Weak password | "Password must be at least 8 characters with uppercase, lowercase, number, and special character." | 400 |
| Avatar too large | "Profile photo must be under 5MB." | 413 |
| Rate limit exceeded | "Too many attempts. Please try again in 15 minutes." | 429 |

---

## Success Metrics

- Registration completion rate: >70%
- Email verification rate: >85%
- OAuth vs email/password split: Track for optimization
- Average time to complete registration: <2 minutes
- Profile photo upload success rate: >95%
- Failed login rate: <5%

---

## Future Enhancements (Post-MVP)

- Magic link authentication (passwordless)
- Biometric login (Touch ID, Face ID)
- Multi-device session management
- Profile verification badges
- Custom profile themes
- Profile visit analytics

---

## Notes

- Supabase Auth handles most heavy lifting (session management, token refresh)
- Focus on seamless UX and clear error messaging
- Ensure mobile experience is flawless (primary usage expected)
- Consider adding "Continue with Apple" for iOS users (App Store requirement for social login)