import { PrismaClient } from '@prisma/client';
import pdfParse from 'pdf-parse';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header missing' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const formData = await request.formData();
  const chatName = formData.get('chat_name');
  const sysMessage = formData.get('sys_message');
  const chatModel = formData.get('chat_model');
  const openaiKey = formData.get('openai_key');
  const files = formData.getAll('files');

  if (!chatName || !chatModel || !files.length || !openaiKey) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: openaiKey,
    batchSize: 512,
    model: 'text-embedding-3-small',
  });

  try {
    let textChunksData = [];

    for (const file of files) {
      let fileContent = '';

      if (file.type === 'application/pdf') {
        const pdfBuffer = await file.arrayBuffer();
        const pdfData = await pdfParse(pdfBuffer);
        fileContent = pdfData.text;
      } else {
        fileContent = await file.text();
      }

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        overlap: 0,
      });

      const documents = await splitter.createDocuments([fileContent]);
      const documentContents = documents.map((doc) => doc.pageContent);

      for (let i = 0; i < documentContents.length; i += embeddings.batchSize) {
        const batch = documentContents.slice(i, i + embeddings.batchSize);
        const embeddingsBatch = await embeddings.embedDocuments(batch);

        embeddingsBatch.forEach((embedding, index) => {
          textChunksData.push({
            content: batch[index],
            embedding: embedding,
          });
        });
      }
    }

    const newChatbot = await prisma.chatbot.create({
      data: {
        name: chatName,
        model: chatModel,
        systemPrompt: sysMessage,
        fileName: files.length > 0 ? files[0].name : null,
        user: { connect: { id: userId } },
      },
    });

    // Use raw SQL for inserting vector data
    for (const chunk of textChunksData) {
      await prisma.$executeRaw`
        INSERT INTO "TextChunk" ("chatbotId", "content", "embedding")
        VALUES (${newChatbot.id}, ${chunk.content}, ${chunk.embedding}::vector);
      `;
    }

    return new Response(
      JSON.stringify({
        message: 'Chatbot created successfully',
        chatbot: newChatbot,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return new Response(JSON.stringify({ error: 'Failed to create chatbot' }), {
      status: 500,
    });
  }
}
