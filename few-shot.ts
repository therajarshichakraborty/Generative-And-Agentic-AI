import OpenAI from "openai";
import {env} from "./env.js";

const openai = new OpenAI({
  apiKey:env.OPENAI_API_KEY
});

async function runFewShotPrompt() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that classifies text sentiment into Positive, Negative, or Neutral."
        },
        {
          role: "user",
          content: "I love the new design of your app! It is so intuitive."
        },
        {
          role: "assistant",
          content: "Sentiment: Positive"
        }
      ]
    });

    response.choices.forEach((choice) => console.log(choice.message.content));
  } catch (err) {
    console.error(err);
  }
}

await runFewShotPrompt();
