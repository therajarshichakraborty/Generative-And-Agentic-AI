import tiktoken

print("Loading tokenizer for gpt-4 (cl100k_base)...", flush=True)
enc = tiktoken.encoding_for_model("gpt-4")

text = "Hello world! How are you doing today?"

tokens = enc.encode(text)
print(f"\nOriginal text: {text}", flush=True)
print(f"Token count:   {len(tokens)}", flush=True)
print(f"Token IDs:     {tokens}", flush=True)

print("\nIndividual Token Breakdown:", flush=True)
for token_id in tokens:
    token_str = enc.decode([token_id])
    print(f"  ID {token_id:>6} -> '{token_str}'", flush=True)

decoded_text = enc.decode(tokens)
assert decoded_text == text, "Decoded text does not match original!"
print(f"\nSuccessfully decoded back to: '{decoded_text}'", flush=True)


