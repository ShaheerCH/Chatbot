import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
    const { email, password } = await request.json();
  
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          chatbots: {
            select: {
              name: true
            }
          }
        }
      });
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
        });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
        });
      }
  
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          chatbots: user.chatbots.map(bot => bot.name),
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      return new Response(
        JSON.stringify({ message: 'Login successful', token }),
        { status: 200 }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to login' }),
        { status: 500 }
      );
    }
  }