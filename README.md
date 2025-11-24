# Artist Gallery

A modern, full-stack art marketplace built with Next.js 14, enabling artists to showcase and sell their work directly to collectors worldwide.

## Features

- **Gallery Browsing**: Browse artworks with filtering by category, medium, price range
- **Artist Profiles**: Dedicated pages for artists to showcase their portfolio
- **Shopping Cart**: Full shopping cart functionality with persistent storage
- **Secure Checkout**: Stripe integration for secure payment processing
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
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Email**: Nodemailer
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- SMTP server (or Gmail account)

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
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-app-password"
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
│   ├── stripe.ts         # Stripe integration
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
| `/api/checkout` | POST | Create checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

## Stripe Integration

The application uses Stripe for payment processing:

1. **Checkout Sessions**: Secure hosted checkout pages
2. **Webhooks**: Handle payment events (success, failure)
3. **Connect**: Support for artist payouts (optional)

### Setting up Stripe Webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

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
