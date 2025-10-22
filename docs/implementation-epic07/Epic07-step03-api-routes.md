# Epic 07 - Step 03: API Routes

## 🎯 Objective
Create API endpoints to expose subscription and contact limit functionality to the frontend.

---

## 📁 API Structure

```
app/api/
├── subscription/
│   ├── status/route.ts              # GET subscription details
│   ├── stats/route.ts               # GET contact usage statistics
│   └── waiting-list/route.ts        # POST join waiting list
├── admin/
│   ├── subscription/
│   │   ├── grant-premium/route.ts   # POST grant premium access
│   │   ├── set-limit/route.ts       # POST set manual limit
│   │   └── refund-contact/route.ts  # POST refund a contact
│   └── waiting-list/
│       ├── route.ts                 # GET all waiting list entries
│       ├── [id]/contact/route.ts    # PATCH mark as contacted
│       └── stats/route.ts           # GET waiting list statistics
```

---

## 1️⃣ User-Facing API Routes

### GET `/api/subscription/status`

**Purpose:** Get current subscription status and contact limits for the logged-in center.

**File: `app/api/subscription/status/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { db } from '@/lib/db/drizzle';
import { trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (user.userType !== 'centre') {
      return NextResponse.json(
        { error: 'Accès réservé aux centres de formation' },
        { status: 403 }
      );
    }

    // Get training center
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.userId, user.id),
    });

    if (!center) {
      return NextResponse.json(
        { error: 'Centre de formation non trouvé' },
        { status: 404 }
      );
    }

    // Get subscription details
    const subscription = await SubscriptionService.getSubscriptionDetails(center.id);

    return NextResponse.json({
      success: true,
      data: {
        tier: subscription.subscriptionTier,
        tierConfig: subscription.tierConfig,
        contacts: {
          used: subscription.contactsUsedCurrentPeriod || 0,
          limit: subscription.effectiveLimit,
          remaining: subscription.contactsRemaining,
        },
        period: {
          startDate: subscription.firstAcceptedContactDate,
          needsReset: subscription.needsReset,
        },
        features: {
          isPremiumAccess: subscription.isPremiumAccess,
          hasManualOverride: subscription.hasManualOverride,
          premiumExpiresAt: subscription.premiumAccessGrantedUntil,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
```

---

### GET `/api/subscription/stats`

**Purpose:** Get detailed contact usage statistics.

**File: `app/api/subscription/stats/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { ContactLimitService } from '@/lib/services/contact-limit-service';
import { db } from '@/lib/db/drizzle';
import { trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (user.userType !== 'centre') {
      return NextResponse.json(
        { error: 'Accès réservé aux centres de formation' },
        { status: 403 }
      );
    }

    // Get training center
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.userId, user.id),
    });

    if (!center) {
      return NextResponse.json(
        { error: 'Centre de formation non trouvé' },
        { status: 404 }
      );
    }

    // Get statistics
    const stats = await ContactLimitService.getContactStats(center.id);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/subscription/waiting-list`

**Purpose:** Add user to subscription waiting list.

**File: `app/api/subscription/waiting-list/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { WaitingListService } from '@/lib/services/waiting-list-service';
import { db } from '@/lib/db/drizzle';
import { trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const waitingListSchema = z.object({
  email: z.string().email('Email invalide'),
  desiredTier: z.enum(['basic', 'pro'], {
    errorMap: () => ({ message: 'Plan invalide' })
  }),
  triggeredBy: z.enum(['limit_reached', 'pricing_page', 'dashboard_cta', 'manual']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const body = await request.json();

    // Validate input
    const validation = waitingListSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, desiredTier, triggeredBy } = validation.data;

    let userId: number | undefined;
    let trainingCenterId: number | undefined;
    let currentContactsUsed: number | undefined;

    // If user is authenticated, get their info
    if (user) {
      userId = user.id;

      if (user.userType === 'centre') {
        const center = await db.query.trainingCenters.findFirst({
          where: eq(trainingCenters.userId, user.id),
        });

        if (center) {
          trainingCenterId = center.id;
          currentContactsUsed = center.contactsUsedCurrentPeriod || 0;
        }
      }
    }

    // Add to waiting list
    const result = await WaitingListService.addToWaitingList(
      {
        email,
        desiredTier,
        triggeredBy,
        currentContactsUsed,
      },
      userId,
      trainingCenterId
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        isNew: result.isNew,
      }
    });
  } catch (error) {
    console.error('Error adding to waiting list:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à la liste d\'attente' },
      { status: 500 }
    );
  }
}
```

---

## 2️⃣ Admin API Routes

### POST `/api/admin/subscription/grant-premium`

**Purpose:** Grant temporary premium access to a center.

**File: `app/api/admin/subscription/grant-premium/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { z } from 'zod';

const grantPremiumSchema = z.object({
  trainingCenterId: z.number(),
  expiresAt: z.string().datetime(),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = grantPremiumSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { trainingCenterId, expiresAt, reason } = validation.data;

    const result = await SubscriptionService.grantPremiumAccess(
      trainingCenterId,
      new Date(expiresAt),
      reason,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error granting premium access:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/admin/subscription/set-limit`

**Purpose:** Set manual contact limit override.

**File: `app/api/admin/subscription/set-limit/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { z } from 'zod';

const setLimitSchema = z.object({
  trainingCenterId: z.number(),
  newLimit: z.number().min(0).max(100),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères'),
  expiresAt: z.string().datetime().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = setLimitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { trainingCenterId, newLimit, reason, expiresAt } = validation.data;

    const result = await SubscriptionService.setManualLimitOverride(
      trainingCenterId,
      newLimit,
      reason,
      expiresAt ? new Date(expiresAt) : null,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error setting manual limit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/admin/subscription/refund-contact`

**Purpose:** Refund a contact (customer service).

**File: `app/api/admin/subscription/refund-contact/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { ContactLimitService } from '@/lib/services/contact-limit-service';
import { z } from 'zod';

const refundSchema = z.object({
  trainingCenterId: z.number(),
  juryRequestId: z.number(),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { trainingCenterId, juryRequestId, reason } = validation.data;

    const result = await ContactLimitService.refundContact(
      trainingCenterId,
      juryRequestId,
      reason,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        contactsUsed: result.contactsUsed,
      }
    });
  } catch (error) {
    console.error('Error refunding contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

### GET `/api/admin/waiting-list`

**Purpose:** Get all waiting list entries with filters.

**File: `app/api/admin/waiting-list/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { WaitingListService } from '@/lib/services/waiting-list-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const desiredTier = searchParams.get('desiredTier') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const entries = await WaitingListService.getWaitingList({
      status,
      desiredTier,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

### PATCH `/api/admin/waiting-list/[id]/contact`

**Purpose:** Mark waiting list entry as contacted.

**File: `app/api/admin/waiting-list/[id]/contact/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { WaitingListService } from '@/lib/services/waiting-list-service';
import { z } from 'zod';

const contactSchema = z.object({
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const entryId = parseInt(params.id);
    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { notes } = validation.data;

    const result = await WaitingListService.markAsContacted(
      entryId,
      user.id,
      notes
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error marking as contacted:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

### GET `/api/admin/waiting-list/stats`

**Purpose:** Get waiting list statistics for admin dashboard.

**File: `app/api/admin/waiting-list/stats/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { WaitingListService } from '@/lib/services/waiting-list-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const stats = await WaitingListService.getWaitingListStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching waiting list stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ Integration with Existing Jury Request Flow

### Update: `/api/jury/request/[id]/respond`

**Modify existing route to increment contact usage when jury accepts.**

**File: `app/api/jury/request/[id]/respond/route.ts`**

Add this logic after a jury accepts a request:

```typescript
import { ContactLimitService } from '@/lib/services/contact-limit-service';

// ... existing code ...

// After updating jury_request status to 'accepted'
if (status === 'accepted') {
  // Increment contact usage for the training center
  await ContactLimitService.incrementContactUsage(
    juryRequest.trainingCenterId,
    juryRequest.id
  );
}

// ... rest of existing code ...
```

---

### Update: `/api/jury/request` (Create Request)

**Add validation to check contact limits before allowing request creation.**

**File: `app/api/jury/request/route.ts`**

Add this validation at the beginning:

```typescript
import { ContactLimitService } from '@/lib/services/contact-limit-service';

// ... existing code ...

// Check if center can contact jury
const limitCheck = await ContactLimitService.canContactJury(center.id);

if (!limitCheck.canContact) {
  return NextResponse.json(
    { 
      error: limitCheck.reason,
      contactsRemaining: limitCheck.contactsRemaining,
      showUpgradePrompt: true,
    },
    { status: 403 }
  );
}

// ... proceed with request creation ...
```

---

## ✅ Testing Checklist

### API Endpoint Tests:

- [ ] GET `/api/subscription/status` returns correct data
- [ ] GET `/api/subscription/stats` calculates stats correctly
- [ ] POST `/api/subscription/waiting-list` handles duplicates
- [ ] POST `/api/admin/subscription/grant-premium` requires admin role
- [ ] POST `/api/admin/subscription/set-limit` validates input
- [ ] POST `/api/admin/subscription/refund-contact` updates counter
- [ ] GET `/api/admin/waiting-list` filters work correctly
- [ ] PATCH `/api/admin/waiting-list/[id]/contact` updates status
- [ ] GET `/api/admin/waiting-list/stats` returns accurate counts

### Integration Tests:

- [ ] Request creation blocked when limit reached
- [ ] Contact counter increments on jury acceptance
- [ ] Contact counter does NOT increment on pending/declined requests
- [ ] Admin can override limits successfully
- [ ] Premium access grants correct limit

---

## 🚀 Next Steps

After completing this step:
1. Create all API route files
2. Test each endpoint with Postman/Thunder Client
3. Verify authentication and authorization
4. Test error handling and edge cases
5. Proceed to **Step 04: Frontend Components**
