import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { normalizeEmbedding } from '@/lib/normalise';
import pdfParse from 'pdf-parse';

const prisma = new PrismaClient();

export async function POST(request) {
  const formData = await request.formData();
  console.log('hello');

  // Extracting form data
  const chatName = formData.get('chat_name');
  const sysMessage = formData.get('sys_message');
  const chatModel = formData.get('chat_model');
  const temperature = parseFloat(formData.get('temperature'));
  const openaiKey = formData.get('openai_key');
  const files = formData.getAll('files');  // Assuming files are uploaded

  if (!chatName || !chatModel || !files.length || !openaiKey) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  // Initialize OpenAI with the provided key
  const openai = new OpenAI({ apiKey: openaiKey });

  try {
    // Process each file and generate embeddings
    let fileEmbeddings = [];
    for (const file of files) {
      let fileContent = '';

      if (file.type === 'application/pdf') {
        // Extract text from the PDF
        const pdfBuffer = await file.arrayBuffer();
        const pdfData = await pdfParse(pdfBuffer);
        fileContent = pdfData.text;
      } else {
        // Handle other file types (e.g., text files)
        fileContent = await file.text();
      }

      // Generate embeddings using OpenAI
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',  // Use the appropriate model
        input: fileContent,
      });

      const embedding = embeddingResponse.data[0].embedding;
      const normalizedEmbedding = normalizeEmbedding(embedding);
      fileEmbeddings.push(normalizedEmbedding);
    }

    // Convert the embeddings array into a PostgreSQL vector type string
    const embeddingVectors = fileEmbeddings.map(
      (embedding) => `ARRAY[${embedding.join(', ')}]`
    );

    // Store the chatbot and its embeddings in the database
    const newChatbot = await prisma.chatbot.create({
      data: {
        name: chatName,
        model: chatModel,
        systemPrompt: sysMessage,  // Store the system message as-is
        embeddings: embeddingVectors.join(','),  // Store as a vector in PostgreSQL
        fileName: files.length > 0 ? files[0].name : null,  // Simplified file handling
      },
    });

    return new Response(
      JSON.stringify({ message: 'Chatbot created successfully', chatbot: newChatbot }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create chatbot' }),
      { status: 500 }
    );
  }
}



// // export async function findSimilarEmbeddings(queryEmbedding) {
// //     const normalizedEmbedding = normalizeEmbedding(queryEmbedding);
// //     const embeddingVector = `ARRAY[${normalizedEmbedding.join(', ')}]`;
  
// //     const similarFiles = await prisma.$queryRaw`
// //       SELECT id, fileName, embeddings,
// //              embeddings <=> ${embeddingVector}::vector AS similarity
// //       FROM "Chatbot"
// //       ORDER BY similarity
// //       LIMIT 10
// //     `;
  
// //     return similarFiles;
// //   }
