from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from utils import load_config, update_config, search_baidu_baike, create_openai_client, generate_chat_response, generate_mindmap

app = FastAPI()

# 创建一个全局变量来存储设置
settings = load_config()

# 新增一个端点来更新设置
class Settings(BaseModel):
    apiKey: str
    baseUrl: str
    modelName: str
    embedModel: str
    needWebSearch: bool
    serperApiKey: str

# 更新设置
@app.post("/update_settings")
async def update_settings_endpoint(new_settings: Settings):
    update_config(new_settings.dict())
    global settings
    settings = load_config()
    return {"message": "设置已成功更新"}

class SearchQuery(BaseModel):
    query: str

# 百度百科搜索
@app.post("/search_baidu_baike")
async def search_baidu_baike_endpoint(search_query: SearchQuery):
    results = search_baidu_baike(search_query.query)
    return {"results": results}

class ChatMessage(BaseModel):
    message: str

    
@app.post("/chat")
async def chat_with_gpt(chat_message: ChatMessage):
    try:
        client = create_openai_client(settings)
        print(f"使用的设置: {settings}")
        
        return StreamingResponse(generate_chat_response(client, settings["modelName"], chat_message.message), media_type="text/event-stream")
    except Exception as e:
        print(f"在处理请求时发生错误: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))


# 总结生成思维导图
@app.post("/summary_to_mindmap")
async def summary_to_mindmap(chat_message: ChatMessage):
    try:
        client = create_openai_client(settings)
        print(f"使用的设置: {settings}")
        
        return generate_mindmap(client, settings["modelName"], chat_message.message)
    except Exception as e:
        print(f"在处理请求时发生错误: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

# 跨域处理
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 替换为你的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
