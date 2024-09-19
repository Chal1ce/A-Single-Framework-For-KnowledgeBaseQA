from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import openai
from openai import OpenAI
import os

app = FastAPI()


# 创建一个全局变量来存储设置
settings = {
    "apiKey": "sk-1bf44c2031c64f34801969d2e3ba0c6c",
    "baseUrl": "https://api.deepseek.com/v1",
    "modelName": "deepseek-chat",
    "embedModel": "",
    "needWebSearch": False,
    "serperApiKey": "",
}

# 新增一个端点来更新设置
class Settings(BaseModel):
    apiKey: str
    baseUrl: str
    modelName: str
    embedModel: str
    needWebSearch: bool
    serperApiKey: str

@app.post("/update_settings")
async def update_settings(new_settings: Settings):
    global settings
    settings.update(new_settings.dict())
    return {"message": "Settings updated successfully"}

class SearchQuery(BaseModel):
    query: str

@app.post("/search_baidu_baike")
async def search_baidu_baike(search_query: SearchQuery):
    url = "https://baike.baidu.com/search/word?word="+search_query.query
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    params = {
        "word": search_query.query,
    }
    
    response = requests.get(url, headers=headers, params=params)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    results = []
    title = soup.find('title')
    keywords = soup.find('meta', attrs={'name': 'keywords'})
    description = soup.find('meta', attrs={'name': 'description'})
    image = soup.find('meta', attrs={'name': 'image'})
    if description:
        content = description.get('content', '').strip()
        if not content.endswith('。'):
            content = '。'.join(content.split('。')[:-1]) + '。'
        description = content
    
    if title and description:
        results.append({
            "title": title.text.strip(),
            "keywords": keywords.get('content', ''),
            "summary": description.strip(),
            "url": response.url,
            "image": image.get('content', '')
        })
    
    return {"results": results}

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_gpt(chat_message: ChatMessage):
    try:
        # 使用全局设置
        client = OpenAI(
            api_key=settings["apiKey"],
            base_url=settings["baseUrl"]
        )
        print(f"使用的设置: {settings}")
        
        def generate():
            try:
                response = client.chat.completions.create(
                    model=settings["modelName"],
                    messages=[
                        {"role": "user", "content": chat_message.message}
                    ],
                    stream=True
                )
                
                for chunk in response:
                    if chunk.choices[0].finish_reason is not None:
                        break
                    if chunk.choices[0].delta.content is not None:
                        yield chunk.choices[0].delta.content
            except Exception as e:
                print(f"在生成响应时发生错误: {str(e)}")
                yield f"错误: {str(e)}"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        print(f"在处理请求时发生错误: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 替换为您的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
