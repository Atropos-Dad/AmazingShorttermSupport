from litellm import completion
from string import Template
from pydantic import BaseModel
import json
import os
from db_handler import get

model = "openrouter/openai/gpt-4o"  # OpenRouter model format

def get_prompt_from_note(title, content):
    categories = get.get_categories() # returns tuples, need to extract category names
    
    # open prompt.txt
    with open("ai_categorize/prompt.txt", "r") as f:
        prompt = Template(f.read())

    return prompt.substitute(categories=categories, user_title=title, user_content=content)    


def get_title_from_note_content(content):
    prompt = get_summarize_prompt_from_content(content)
    try:
        resp = completion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_key=os.getenv("OPENROUTER_KEY"),
        )
        
        try:
            return resp.choices[0].message.content
        except:
            print("Error: could not convert response to dict")
            return None
        
    
    except Exception as e:
        print(f"Error during title extraction: {str(e)}")
        return None

def get_summarize_prompt_from_content(content):
    with open("ai_categorize/summarize.txt", "r") as f:
        prompt = Template(f.read())

    return prompt.substitute(content=content)

def categorize(content):
    # get title from content
    title = get_title_from_note_content(content)
    try:
        prompt = get_prompt_from_note(title, content)
        resp = completion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_key=os.getenv("OPENROUTER_KEY"),
            response_format={ "type": "json_object" },
        )
        
        # to str -> dict
        try:
            resp = json.loads(resp.choices[0].message.content)
            resp['title'] = title
        except:
            print("Error: could not convert response to dict")
            return None
        return resp

    except Exception as e:
        print(f"Error during categorization: {str(e)}")
        return None

