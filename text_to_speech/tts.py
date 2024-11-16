from litellm import transcription
from groq import Groq

client = Groq()
filename = "monkey_speech.m4a"

with open(filename, "rb") as file:
    response = transcription(
      file=(filename, file.read()),
      model="groq/distil-whisper-large-v3-en",
      response_format="verbose_json",
    )
    
    print(response.text)