# Artist Gallery

A modern, full-stack art marketplace built with Next.js 14, enabling artists to showcase and sell their work directly to collectors worldwide.

## Features

- **Gallery Browsing**: Browse artworks with filtering by category, medium, price range
- **Artist Profiles**: Dedicated pages for artists to showcase their portfolio
- **Shopping Cart**: Full shopping cart functionality with persistent storage
- **Secure Checkout**: SumUp integration with OAuth for secure payment processing
- **Artist Dashboard**: Complete dashboard for artists to manage artworks, view sales, and track analytics
- **Email Notifications**: Automated emails for order confirmations, shipping updates, and sale notifications
- **Authentication**: Secure authentication with NextAuth.js (credentials + Google OAuth)
- **Favorites**: Save favorite artworks for later
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: SumUp (OAuth)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Email**: Resend
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SumUp merchant account
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jgalan247/artistgallery.git
cd artistgallery
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
SUMUP_CLIENT_ID="your-sumup-client-id"
SUMUP_CLIENT_SECRET="your-sumup-client-secret"
SUMUP_REDIRECT_URI="http://localhost:3000/api/auth/sumup"
SUMUP_MERCHANT_EMAIL="your-merchant-email"
SUMUP_MERCHANT_CODE="your-merchant-code"
SUMUP_REFRESH_TOKEN="your-refresh-token"
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="Artist Gallery <noreply@yourdomain.com>"
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Public pages
│   ├── api/               # API routes
│   └── dashboard/         # Artist dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── gallery/          # Gallery-specific components
│   ├── cart/             # Cart components
│   └── forms/            # Form components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── db.ts             # Database client
│   ├── email.ts          # Email service
│   ├── sumup.ts          # SumUp OAuth integration
│   └── utils.ts          # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── middleware.ts          # Next.js middleware
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/artworks` | GET | List artworks with filters |
| `/api/artworks` | POST | Create new artwork |
| `/api/artworks/[id]` | GET | Get artwork details |
| `/api/artworks/[id]` | PUT | Update artwork |
| `/api/artworks/[id]` | DELETE | Delete artwork |
| `/api/artists` | GET | List artists |
| `/api/favorites` | GET/POST/DELETE | Manage favorites |
| `/api/checkout` | POST | Create SumUp checkout session |
| `/api/checkout/callback` | GET | Handle SumUp payment callback |
| `/api/webhooks/sumup` | POST | SumUp webhook handler |
| `/api/auth/sumup` | GET | SumUp OAuth flow |

## SumUp Integration

The application uses SumUp for payment processing with OAuth authentication:

1. **OAuth Flow**: Secure authentication with SumUp API
2. **Checkout API**: Create hosted checkout pages
3. **Webhooks**: Handle payment events (completed, failed, refunded)
4. **Callbacks**: Process payment results after redirect

### Setting up SumUp

1. Create a SumUp developer account at https://developer.sumup.com
2. Create an application to get your Client ID and Client Secret
3. Configure the redirect URI to `http://localhost:3000/api/auth/sumup`
4. Complete OAuth flow to get your refresh token
5. Configure webhook URL to `https://your-domain.com/api/webhooks/sumup`

### OAuth Flow

To connect your SumUp account:
1. Navigate to `/api/auth/sumup?action=connect`
2. Authorize the application with SumUp
3. The refresh token will be stored for future API calls

## Email Templates

The email system includes templates for:
- Welcome emails
- Order confirmations
- Shipping notifications
- Sale notifications (for artists)
- Password reset

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the application:
```bash
npm run build
npm start
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
