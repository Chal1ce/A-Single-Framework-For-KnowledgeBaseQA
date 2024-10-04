from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import sqlite3
import os, shutil
from utils import load_config, update_config, search_baidu_baike, create_openai_client, generate_chat_response, generate_mindmap, forgot_password, register

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


@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    # 连接到数据库
    conn = sqlite3.connect('../user.db')
    cursor = conn.cursor()

    print(f"尝试登录：用户名 = {username}, 密码 = {password}")

    # 查询用户
    query = "SELECT * FROM users WHERE username=? AND password=?"
    print(f"执行查询：{query}")
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    print(f"查询结果：{user}")

    # 关闭数据库连接
    conn.close()

    if user:
        return {"message": "登录成功"}
    else:
        # 添加更多诊断信息
        # 查询用户名是否存在
        conn = sqlite3.connect('../user.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        user_exists = cursor.fetchone()
        conn.close()

        if user_exists:
            print(f"用户名存在，但密码不匹配。数据库中的用户信息：{user_exists}")
            raise HTTPException(status_code=401, detail="密码错误")
        else:
            print(f"用户名不存在：{username}")
            raise HTTPException(status_code=401, detail="用户名不存在")



@app.post("/register")
async def register(username: str = Form(...), password: str = Form(...)):
    # 连接到数据库
    conn = sqlite3.connect('../user.db')
    cursor = conn.cursor()

    # 检查用户名是否已存在
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    existing_user = cursor.fetchone()

    print("existing_user:", existing_user)

    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 插入新用户
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()

    # 关闭数据库连接
    conn.close()

    return {"message": "注册成功"}


@app.post("/forgot-password")
async def forgot_password(username: str = Form(...), password: str = Form(...)):
    conn = sqlite3.connect('../user.db')
    cursor = conn.cursor()

    try:
        # 检查用户是否存在
        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        # 更新密码
        cursor.execute("UPDATE users SET password=? WHERE username=?", (password, username))
        conn.commit()
        return {"message": "密码重置成功，请使用新密码登录。"}
    except sqlite3.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"数据库错误：{str(e)}")
    finally:
        conn.close()


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


# 处理用户上传的文件
@app.post("/upload")
async def process_file(
    file: UploadFile = File(...),
    username: str = Form(...)
):
    # 创建用户目录
    # 判断用户名是否为空或空字符串
    print("username:", username)
    if not username or username.strip() == "":
        username = "undefined"
    user_dir = f"uploads/{username}"
    os.makedirs(user_dir, exist_ok=True)
    
    # 保存文件
    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # # 处理文件内容
    # file_content = ""
    # with open(file_path, "r", encoding="utf-8") as f:
    #     file_content = f.read()
    
    # 这里可以添加更多的文件处理逻辑，比如解析文件内容、存储到数据库等
    return {"message": "文件上传成功", "file_name": file.filename, "file_size": file.size}

# 跨域处理
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 替换为你的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
