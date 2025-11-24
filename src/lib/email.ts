import nodemailer from 'nodemailer'
import prisma from './db'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  template?: string
}

async function sendEmail({ to, subject, html, template = 'general' }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Artist Gallery <noreply@artistgallery.com>',
      to,
      subject,
      html,
    })

    // Log email
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: 'sent',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)

    // Log failed email
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return { success: false, error }
  }
}

// Email Templates
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artist Gallery</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #e94560; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #d13a54; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .artwork-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin: 15px 0; }
    .artwork-card img { width: 100%; height: 200px; object-fit: cover; }
    .artwork-card .details { padding: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Artist Gallery</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Artist Gallery. All rights reserved.</p>
      <p>You received this email because you're a member of Artist Gallery.</p>
    </div>
  </div>
</body>
</html>
`

export async function sendWelcomeEmail(to: string, name: string) {
  const html = baseTemplate(`
    <h2>Welcome to Artist Gallery, ${name}! 🎉</h2>
    <p>We're thrilled to have you join our community of art lovers and creators.</p>
    <p>Here's what you can do:</p>
    <ul>
      <li>Browse stunning artworks from talented artists worldwide</li>
      <li>Create your own artist profile and showcase your work</li>
      <li>Connect with fellow art enthusiasts</li>
      <li>Purchase unique pieces directly from artists</li>
    </ul>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/gallery" class="button">Explore the Gallery</a>
    <p>Happy exploring!</p>
    <p>The Artist Gallery Team</p>
  `)

  return sendEmail({ to, subject: 'Welcome to Artist Gallery! 🎨', html, template: 'welcome' })
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string
    items: Array<{ title: string; price: number; image?: string }>
    total: number
    shippingAddress: string
  }
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
    <div class="artwork-card">
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
      <div class="details">
        <strong>${item.title}</strong>
        <p>$${item.price.toFixed(2)}</p>
      </div>
    </div>
  `
    )
    .join('')

  const html = baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Thank you for your purchase! Your order has been confirmed.</p>

    <h3>Order #${orderDetails.orderId}</h3>
    ${itemsHtml}

    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>Total: $${orderDetails.total.toFixed(2)}</strong>
    </div>

    <h3>Shipping Address</h3>
    <p>${orderDetails.shippingAddress}</p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderDetails.orderId}" class="button">View Order</a>

    <p>We'll send you another email when your order ships.</p>
  `)

  return sendEmail({
    to,
    subject: `Order Confirmed - #${orderDetails.orderId}`,
    html,
    template: 'order_confirmation',
  })
}

export async function sendOrderShippedEmail(
  to: string,
  orderDetails: {
    orderId: string
    trackingNumber?: string
    trackingUrl?: string
  }
) {
  const html = baseTemplate(`
    <h2>Your Order Has Shipped! 📦</h2>
    <p>Great news! Your order #${orderDetails.orderId} is on its way.</p>

    ${
      orderDetails.trackingNumber
        ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Tracking Number:</strong> ${orderDetails.trackingNumber}
      </div>
    `
        : ''
    }

    ${
      orderDetails.trackingUrl
        ? `<a href="${orderDetails.trackingUrl}" class="button">Track Your Package</a>`
        : ''
    }

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderDetails.orderId}" class="button">View Order Details</a>
  `)

  return sendEmail({
    to,
    subject: `Your Order Has Shipped - #${orderDetails.orderId}`,
    html,
    template: 'order_shipped',
  })
}

export async function sendArtistSaleNotificationEmail(
  to: string,
  saleDetails: {
    artworkTitle: string
    price: number
    buyerName: string
    orderId: string
  }
) {
  const html = baseTemplate(`
    <h2>Congratulations! You Made a Sale! 💰</h2>
    <p>Your artwork has found a new home!</p>

    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Artwork:</strong> ${saleDetails.artworkTitle}</p>
      <p><strong>Price:</strong> $${saleDetails.price.toFixed(2)}</p>
      <p><strong>Buyer:</strong> ${saleDetails.buyerName}</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${saleDetails.orderId}" class="button">View Sale Details</a>

    <p>Please prepare the artwork for shipping. The buyer's shipping details are available in your dashboard.</p>
  `)

  return sendEmail({
    to,
    subject: `Sale! "${saleDetails.artworkTitle}" has been purchased`,
    html,
    template: 'artist_sale_notification',
  })
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  const html = baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>You requested to reset your password. Click the button below to create a new password.</p>

    <a href="${resetUrl}" class="button">Reset Password</a>

    <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  `)

  return sendEmail({
    to,
    subject: 'Reset Your Password - Artist Gallery',
    html,
    template: 'password_reset',
  })
}

export async function sendNewFollowerEmail(
  to: string,
  followerDetails: { name: string; profileUrl: string }
) {
  const html = baseTemplate(`
    <h2>You Have a New Follower! 👋</h2>
    <p><strong>${followerDetails.name}</strong> started following you on Artist Gallery.</p>

    <a href="${followerDetails.profileUrl}" class="button">View Profile</a>

    <p>Keep creating amazing art!</p>
  `)

  return sendEmail({
    to,
    subject: `${followerDetails.name} is now following you!`,
    html,
    template: 'new_follower',
  })
}

export async function sendContactArtistEmail(
  to: string,
  messageDetails: {
    senderName: string
    senderEmail: string
    subject: string
    message: string
    artworkTitle?: string
  }
) {
  const html = baseTemplate(`
    <h2>New Message from a Collector</h2>
    <p>You've received a new message through Artist Gallery.</p>

    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>From:</strong> ${messageDetails.senderName} (${messageDetails.senderEmail})</p>
      <p><strong>Subject:</strong> ${messageDetails.subject}</p>
      ${messageDetails.artworkTitle ? `<p><strong>Regarding:</strong> ${messageDetails.artworkTitle}</p>` : ''}
    </div>

    <div style="border-left: 3px solid #e94560; padding-left: 15px; margin: 20px 0;">
      <p>${messageDetails.message}</p>
    </div>

    <p>Reply directly to this email to respond to ${messageDetails.senderName}.</p>
  `)

  return sendEmail({
    to,
    subject: `Message from ${messageDetails.senderName}: ${messageDetails.subject}`,
    html,
    template: 'contact_artist',
  })
}
