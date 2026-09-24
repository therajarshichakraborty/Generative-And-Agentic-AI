import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { OpenAIEmbeddings } from "@langchain/openai"
import { QdrantVectorStore } from "@langchain/qdrant"
import { env } from "../env.js"
import path from "node:path"

async function generateEmbeddings(filepath) {
    const loader = new PDFLoader(filepath);
    const document = await loader.load();

    const embeddings = new OpenAIEmbeddings({
        configuration: {
            baseURL: "https://openrouter.ai/api/v1"
        },
        model: "text-embedding-3-small",
        apiKey: env.OPENROUTER_API_KEY,
    })

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings,{
      url: 'http://localhost:6333',
      collectionName: 'dsa-docs',
    })

    await vectorStore.addDocuments(document)
    console.log("Documents indexed successfully")
}

await generateEmbeddings(path.join(import.meta.dirname, "hp.pdf"))

