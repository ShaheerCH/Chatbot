import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET all users (for debugging, not typically exposed in production)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        chatbots: {
          select: {
            name: true
          }
        }
      }
    });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
    });
  }
}

// Signup (POST)
export async function POST(request) {
  const { name, email, password } = await request.json();

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      include: {
        chatbots: {
          select: {
            name: true
          }
        }
      }
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        chatbots: newUser.chatbots.map(bot => bot.name),
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return new Response(
      JSON.stringify({ message: 'User created successfully', token }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500 }
    );
  }
}