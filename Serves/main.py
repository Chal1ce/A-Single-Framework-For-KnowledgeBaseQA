from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import io
import base64
from PIL import Image
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

    try:
        # 发送HTTP请求获取图片数据
        res = requests.get(url)

        # 检查请求是否成功
        if res.status_code == 200:
            # 将图片数据转化为BytesIO对象
            img = io.BytesIO(res.content)
            # 将BytesIO对象转换为base64格式
            img = Image.open(img)

        else:
            # 如果请求失败，则使用默认图片
            img = "../public/404.svg"

    except:
        # 如果请求失败，则使用默认图片
        img = "../public/404.svg"
    
    if title and description:
        results.append({
            "title": title.text.strip(),
            "keywords": keywords.get('content', ''),
            "summary": description.strip(),
            "url": response.url,
            "image": img
        })
        print(results)
    
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



@app.post("/summary_to_mindmap")
async def summary_to_mindmap(chat_message: ChatMessage):
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
                        {"role": "system", 
                         "content": "##角色：\n你是一个markdown专家，将用户输入的文本总结转换为markdown的形式。\n##输出格式：\n# 标题，## 子标题，- 列表"},
                        {"role": "user", "content": chat_message.message}
                    ],
                    stream=False
                )
                
                print(response.choices[0].message.content)
                return response.choices[0].message.content.replace("\n#", "#").replace("\n##", "##").replace("\n-", "-")
            except Exception as e:
                print(f"在生成响应时发生错误: {str(e)}")
                return f"错误: {str(e)}"

        return generate()

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
