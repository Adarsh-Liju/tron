import ollama from 'ollama'

const MODEL = 'qwen2.5:3b'

const response = await ollama.chat({
  model: MODEL,
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)