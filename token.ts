import { get_encoding } from "tiktoken";

const encoder = get_encoding("gpt2");
const tokens = encoder.encode("Hello, how are you?");

console.table(tokens);

const decoded = new TextDecoder().decode(encoder.decode(tokens));
console.table(decoded);
