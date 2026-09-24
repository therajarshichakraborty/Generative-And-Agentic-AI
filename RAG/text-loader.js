import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import path from "node:path";
import OpenAI from "openai"

async function textLoaderEmbeddings(filepath) {
  const loader = new TextLoader(filepath);
  const document = await loader.load();
  console.log(document);

  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    model: "text-embedding-3-small",
    apiKey: ""
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "ai-generated-poem",
    },
  );

  await vectorStore.addDocuments(document);
  console.log("Document indexed successfully");
}


await textLoaderEmbeddings(path.join(import.meta.dirname, "test.txt"));