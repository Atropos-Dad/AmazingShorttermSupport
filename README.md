# Notehold

Notehold is a little app that helps you take better notes using your voice! 
It's primarily a proof of concept, and was created in a few hours for a hackathon.

It will transcribe your voice, generate a summary/title, and categorize it with it's urgency and into a category based on the ones you provide it with (or it will just put it in a general category if you don't provide any).

## Installation
1. Clone the repo
2. Install requirements.txt
3. You will need both a groq key and a openrouter key, which you can get from the following links:
    - [Groq](https://groq.io/)
    - [OpenRouter](https://openrouter.ai/)
  
We use groq for the transcription and openrouter for the summarization. But under the hood we use litellm, so changing openrouter to another model should be trivial. 
4. Create a .env file in the root directory with the following variables:
    ```
    GROQ_API_KEY=your_groq_key
    OPENROUTER_KEY=your_openrouter_key
    ```
5. Run main.py! 

## Where to now?
This should probably be a native app or a mobile app! Integration with pre-existing pre-existing siri/alexa/google assistant would be cool too!

## Todo:
- More it clearer when app is recording
- Verifiy and deal with weird output from LLMs
    // this could be tackled by making the prompts more specific/longer too!
    - [ ] Check if the output of title summary is surrounded by quotes
- add markdown note output/integrations with other apps
- add keyboard shortcuts to record notes quickly
- add a way to manually add a note to a specific file
- make it more model agnostic (.env variable for model selection)
