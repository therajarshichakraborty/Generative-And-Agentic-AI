import dotenv from "dotenv";
dotenv.config();

import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const DetectCallResponse = z.object({
  is_question_ai: z.boolean()
});

const CodingAIResponse = z.object({
  answer: z.string()
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const StateAnnotation = Annotation.Root({
  user_message: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => ""
  }),
  ai_message: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => ""
  }),
  is_coding_question: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false
  })
});

type State = typeof StateAnnotation.State;

// 4. Node: Detect whether the query is a coding question
async function detectQuery(state: State) {
  const userMessage = state.user_message;

  const SYSTEM_PROMPT = `
  You are an AI assistant. Your job is to detect if the user's query is related
  to coding question or not.
  Return the response in specified JSON boolean only.
  `;

  const result = await client.chat.completions.parse({
    model: "gpt-4o-mini",
    response_format: zodResponseFormat(
      DetectCallResponse,
      "detect_call_response"
    ),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  const isCodingQuestion =
    result.choices[0]?.message.parsed?.is_question_ai ?? false;
  return { is_coding_question: isCodingQuestion };
}

// 5. Conditional Edge: Route based on is_coding_question
function routeEdge(
  state: State
): "solve_coding_question" | "solve_simple_question" {
  if (state.is_coding_question) {
    return "solve_coding_question";
  }
  return "solve_simple_question";
}

// 6. Node: Solve coding question (using gpt-4o)
async function solveCodingQuestion(state: State) {
  const userMessage = state.user_message;

  const SYSTEM_PROMPT = `
  You are an AI assistant. Your job is to resolve the user query based on coding 
  problem he is facing
  `;

  const result = await client.chat.completions.parse({
    model: "gpt-4o",
    response_format: zodResponseFormat(CodingAIResponse, "coding_ai_response"),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  const answer = result.choices[0]?.message.parsed?.answer ?? "";
  return { ai_message: answer };
}

// 7. Node: Solve simple / chat question (using gpt-4o-mini)
async function solveSimpleQuestion(state: State) {
  const userMessage = state.user_message;

  const SYSTEM_PROMPT = `
  You are an AI assistant. Your job is to chat with user
  `;

  const result = await client.chat.completions.parse({
    model: "gpt-4o-mini",
    response_format: zodResponseFormat(CodingAIResponse, "coding_ai_response"),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  const answer = result.choices[0]?.message.parsed?.answer ?? "";
  return { ai_message: answer };
}

// 8. Build the State Graph
const graphBuilder = new StateGraph(StateAnnotation)
  .addNode("detect_query", detectQuery)
  .addNode("solve_coding_question", solveCodingQuestion)
  .addNode("solve_simple_question", solveSimpleQuestion)
  .addEdge(START, "detect_query")
  .addConditionalEdges("detect_query", routeEdge)
  .addEdge("solve_coding_question", END)
  .addEdge("solve_simple_question", END);

export const graph = graphBuilder.compile();

// 9. Execute / Test the Graph
async function callGraph() {
  const initialState: State = {
    user_message: "Hello ji! How do I sort an array in JavaScript?",
    ai_message: "",
    is_coding_question: false
  };

  const result = await graph.invoke(initialState);
  console.log("Final Result:", result);
}

// Run if directly executed
callGraph().catch(console.error);
