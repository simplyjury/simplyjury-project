# Dashboard Role-Based Display System

## Overview

The SimplyJury application implements a role-based dashboard system that automatically detects user types (jury vs center) and displays the appropriate interface and navigation. This document explains the implementation details for future enhancements.

## User Types

- **jury**: Individual professionals who serve as jury members for certifications
- **centre**: Training centers that request jury services

## Role Detection Logic

### Primary Detection Methods

The system uses a hierarchical approach to determine user type:

1. **URL Parameter** (highest priority): `?profile=jury`
2. **Profile Data Existence**: Checks if jury profile data exists
3. **User Database Field**: Falls back to `users.user_type` field

### Implementation Code

```typescript
// Consistent logic used across all components
const isJury = searchParams.get('profile') === 'jury' || 
               (juryProfile?.data && !searchParams.get('profile')) ||
               (user?.userType === 'jury' && !searchParams.get('profile'));

const userType: 'jury' | 'center' = isJury ? 'jury' : 'center';
```

## Components Affected

### 1. Dashboard Page (`/app/(dashboard)/dashboard/page.tsx`)

**Purpose**: Shows different dashboard content based on user type

**Logic**:
```typescript
export default function DashboardPage() {
  const searchParams = useSearchParams();
  const profile = searchParams.get('profile');
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  const isJury = profile === 'jury' || 
                 (juryProfile?.data && !profile) || 
                 (user?.userType === 'jury' && !profile);
  
  if (isJury) {
    return <JuryDashboard />;
  }
  
  return <CenterDashboard />;
}
```

**Dashboard Components**:
- **JuryDashboard**: Shows stats, requests, missions, evaluations
- **CenterDashboard**: Shows team settings, subscriptions, member management

### 2. Sidebar Navigation (`/components/ui/sidebar-navigation.tsx`)

**Purpose**: Displays different menu items based on user type

**Logic**:
```typescript
export function SidebarNavigation({ isOpen = true, onClose, className }) {
  const searchParams = useSearchParams();
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfile?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));
  
  const userType: 'jury' | 'center' = isJury ? 'jury' : 'center';
  const navigationSections = getNavigationSections(userType, isCertificateur);
}
```

**Navigation Differences**:

**Jury Navigation**:
- Tableau de bord → `/dashboard?profile=jury`
- Mes demandes
- Messagerie
- Missions réalisées
- Mes évaluations
- Mon profil
- Paramètres

**Center Navigation**:
- Tableau de bord → `/dashboard`
- Rechercher un jury
- Messagerie
- Mes demandes
- Mes certifications (if certificateur)
- Sessions réalisées
- Avis donnés
- Paramètres
- Passer au Pro

### 3. Layout Header (`/app/(dashboard)/layout.tsx`)

**Purpose**: Shows appropriate page titles and handles freemium banners

**Logic**:
```typescript
function Header({ onMenuToggle }) {
  const searchParams = useSearchParams();
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfile?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));
  
  const { title, subtitle } = getPageTitle(pathname, isJury);
}
```

**Page Title Differences**:
- Different subtitles for same routes based on user type
- Jury-specific routes have appropriate descriptions

### 4. Profile Page (`/app/(dashboard)/dashboard/profile/page.tsx`)

**Purpose**: Shows different profile interfaces based on user type

**Logic**:
```typescript
export default function ProfilePage() {
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfileResponse } = useSWR('/api/profile/jury', fetcher);
  const { data: centerProfileResponse } = useSWR('/api/profile/center', fetcher);
  
  const isJury = user?.userType === 'jury' || juryProfileResponse?.data;
  const apiEndpoint = isJury ? '/api/profile/jury' : '/api/profile/center';
}
```

## Authentication Flow

### Sign-in Redirect Logic (`/app/(login)/actions.ts`)

```typescript
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  // ... authentication logic ...
  
  // Check if user needs to complete profile
  if (!foundUser.profileCompleted) {
    if (foundUser.userType === 'centre') {
      redirect('/profile/center');
    } else if (foundUser.userType === 'jury') {
      redirect('/profile/jury');
    }
  }

  // Redirect based on user type
  if (foundUser.userType === 'jury') {
    redirect('/dashboard?profile=jury');
  } else {
    redirect('/dashboard');
  }
});
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  user_type VARCHAR(20) DEFAULT 'centre',
  profile_completed BOOLEAN DEFAULT FALSE,
  -- other fields...
);
```

**user_type values**:
- `'centre'`: Training center user (default)
- `'jury'`: Jury member user

## URL Structure

### Dashboard URLs

- **Center Users**: `/dashboard` (clean URL)
- **Jury Users**: `/dashboard?profile=jury` (with parameter)

### Profile URLs

- **Both Types**: `/dashboard/profile` (auto-detects user type)

## Active State Detection

For sidebar navigation with query parameters:

```typescript
// Handle active state for URLs with query parameters
let isActive = false;
if (item.href.includes('?')) {
  const [path, query] = item.href.split('?');
  const params = new URLSearchParams(query);
  isActive = pathname === path && searchParams.get('profile') === params.get('profile');
} else {
  isActive = pathname === item.href;
}
```

## Data Fetching Strategy

### Consistent Hook Usage

All components fetch both profile types to avoid React hooks order violations:

```typescript
// Always fetch both, determine which to use based on user type
const { data: user } = useSWR('/api/user', fetcher);
const { data: centerProfile } = useSWR('/api/profile/center', fetcher);
const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);

// Then determine user type and use appropriate data
const isJury = /* detection logic */;
const activeProfile = isJury ? juryProfile?.data : centerProfile?.data;
```

## Future Enhancement Guidelines

### Adding New Role-Specific Features

1. **Update Detection Logic**: Ensure all components use the consistent `isJury` detection pattern
2. **Navigation Updates**: Add new menu items to appropriate user type in `getNavigationSections()`
3. **Page Titles**: Update `getPageTitle()` function with role-specific titles
4. **API Endpoints**: Create separate endpoints for different user types when needed
5. **Component Separation**: Create separate components for complex role-specific features

### Adding New User Types

1. **Database**: Add new `user_type` values
2. **Detection Logic**: Extend the detection logic to handle new types
3. **Navigation**: Create new navigation sections
4. **Components**: Create type-specific dashboard and profile components
5. **Authentication**: Update redirect logic for new user types

### Best Practices

1. **Consistent Detection**: Always use the same detection logic across components
2. **Fallback Strategy**: Maintain the hierarchical detection approach (URL → Profile → Database)
3. **Hook Order**: Always call all hooks in the same order to avoid React violations
4. **Type Safety**: Use TypeScript unions for user types: `'jury' | 'center' | 'newType'`
5. **Testing**: Test role switching and ensure proper isolation between user types

## Security Considerations

- Role detection is client-side for UI purposes only
- Server-side API endpoints must validate user permissions independently
- Never rely solely on client-side role detection for access control
- Each API endpoint should verify user type against database records

## Troubleshooting

### Common Issues

1. **Wrong Dashboard Displayed**: Check URL parameters and profile data existence
2. **Navigation Not Updating**: Verify consistent detection logic across components
3. **React Hooks Errors**: Ensure hooks are called in same order regardless of user type
4. **Active States Wrong**: Check query parameter handling in navigation components

### Debug Steps

1. Check `user.userType` in database
2. Verify profile data exists for the user type
3. Inspect URL parameters
4. Check console for SWR fetch errors
5. Verify API endpoints return correct data structure
