import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  isArtist: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, isArtist } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isArtist ? 'ARTIST' : 'USER',
        ...(isArtist && {
          artist: {
            create: {},
          },
        }),
      },
      include: {
        artist: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        artistId: user.artist?.id,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
