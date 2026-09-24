//@ts-nocheck
import OpenAI from "openai";
const openai = new OpenAI();

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
        },
        {
          role: "user",
          content:
            "The delivery took three weeks and the packaging was damaged."
        },
        {
          role: "assistant",
          content: "Sentiment: Negative"
        },
        {
          role: "user",
          content: "The package arrived today."
        },
        {
          role: "assistant",
          content: "Sentiment: Neutral"
        },
        {
          role: "user",
          content: "The product works fine, but it is nothing special."
        }
      ],
      temperature: 0.3
    });

    console.log("Model Output:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

await runFewShotPrompt();
