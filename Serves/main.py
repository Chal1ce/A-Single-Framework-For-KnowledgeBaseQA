import json
import sqlite3
import os, shutil
import http.client
from datetime import datetime
from typing import List
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from utils import load_config, update_config, search_baidu_baike, create_openai_client, generate_chat_response, generate_mindmap, forgot_password, register, get_user_files,check_file,delete_file
# from Retriver import fusion_query_engine, csv_milvus_retriver, csv_neo4j_retriver, milvus_other_retriver, neo4j_other_retriver
# from ProcessFiles import get_file_type, process_csv_to_neo4j, process_data_to_milvus, process_data_to_neo4j, process_csv_to_milvus

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


conn = http.client.HTTPSConnection("google.serper.dev")
headers = {
    'X-API-KEY': settings["serperApiKey"],
    'Content-Type': 'application/json'
}

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
            raise HTTPException(status_code=401, detail="用户不存在")



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
        raise HTTPException(status_code=400, detail="用名已存在")

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
    return {"message": "设置已成功更"}

class SearchQuery(BaseModel):
    query: str

# 百度百科搜索
@app.post("/search_baidu_baike")
async def search_baidu_baike_endpoint(search_query: SearchQuery):
    results = search_baidu_baike(search_query.query)
    return {"results": results}

class ChatMessage(BaseModel):
    message: str
    useKnowledgeBase: bool

@app.get("/user_files/{username}")
async def get_files(username: str):
    return get_user_files(username)

@app.delete("/delete_file/{username}/{filename}")
async def delete_files(username: str, filename: str):
    return delete_file(username, filename)

@app.post("/chat")
async def chat_with_gpt(chat_message: ChatMessage):
    try:
        client = create_openai_client(settings)
        print(f"使用的设置: {settings}")
        if chat_message.useKnowledgeBase:
            # 处理使知识库的逻辑
            # csv_neo4j_index = csv_neo4j_retriver(chat_message.username)
            # csv_milvus_index = csv_milvus_retriver(chat_message.username)
            # other_neo4j_index = neo4j_other_retriver(chat_message.username)
            # other_milvus_index = milvus_other_retriver(chat_message.username)
            # query_engine = fusion_query_engine([csv_neo4j_index, csv_milvus_index, other_neo4j_index, other_milvus_index])
            # return StreamingResponse(query_engine.query(chat_message.message), media_type="text/event-stream")
            pass
        else:
            if settings["needWebSearch"]:
                payload = json.dumps({
                    "q": chat_message.message,
                    "gl": "cn",
                    "hl": "zh-cn"
                })
                conn.request("POST", "/search", payload, headers)
                res = conn.getresponse()
                data = res.read()
                data = data.decode("utf-8")
                new_data = [i["snippet"] for i in json.loads(data)["organic"] if "snippet" in i]
                new_data = "\n".join(new_data)
                new_message = "##任务:\n根据网页搜索到的信息,回答我的问题.\n" + "##网页搜索到的信息:\n" + new_data + "\n" + "##问题:\n" + chat_message.message
                print(new_message[:5])
                return StreamingResponse(generate_chat_response(client, settings["modelName"], new_message), media_type="text/event-stream")
            else:
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
async def upload_files(username: str = Form(...), files: List[UploadFile] = File(...)):
    print(f"Received upload request for user: {username}")
    print(f"Number of files: {len(files)}")
    try:
        user_folder = os.path.join("uploads", username)
        os.makedirs(user_folder, exist_ok=True)
        
        uploaded_files = []
        for file in files:
            file_path = os.path.join(user_folder, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            uploaded_files.append(file.filename)
        
        print(f"Successfully uploaded {len(uploaded_files)} files")
        return {"message": f"成功上传 {len(uploaded_files)} 个文件", "files": uploaded_files}
    except Exception as e:
        print(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# 处理上传的文件
@app.post("/process_files")
async def process_files(username: str = Form(...)):
    print(f"开始处理用户 {username} 的文件")
    try:
        user_folder = os.path.join("uploads", username)
        if not os.path.exists(user_folder):
            raise HTTPException(status_code=404, detail="用户文件夹不存在")
        
        files = os.listdir(user_folder)
        if not files:
            raise HTTPException(status_code=404, detail="用户文件夹为空")
        
        # for file in files:
        #     file_path = os.path.join(user_folder, file)
        #     # 根据件类型调用不同的处函数
        #     file_type = get_file_type(file_path)
        #     if file_type == '.csv':
                # 处理CSV文件
                # process_csv_to_neo4j(username, file_path)
                # process_csv_to_milvus(username, file_path)
            #     pass
            # else:
            #     # 处理其他类型文件
            #     # process_data_to_milvus(username, file_path)
            #     # process_data_to_neo4j(username, file_path)
            #     pass

        return {"message": f"成功处理 {len(files)} 个文件"}
    except Exception as e:
        print(f"处理文件时发生错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))



@app.get("/download_file/{username}/{filename}")
async def download_file(username: str, filename: str):
    file_path = os.path.join("uploads", username, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="文件不存在")



# 跨域处理
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 替换为你的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PostCreate(BaseModel):
    title: str
    content: str
    author: str
    category: str

@app.post("/posts/")
async def create_post(post: PostCreate):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        created_at = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO posts (title, content, author, category, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (post.title, post.content, post.author, post.category, created_at))
        conn.commit()
        return {"message": "Post created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/posts/")
async def get_posts(category: str = Query(None), search: str = Query(None)):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        query = "SELECT * FROM posts WHERE 1=1"
        params = []
        if category and category != '全部':
            query += " AND category = ?"
            params.append(category)
        if search:
            query += " AND title LIKE ?"
            params.append(f"%{search}%")
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        posts = cursor.fetchall()
        return [{"id": post[0], "title": post[1], "content": post[2], "author": post[3], "category": post[4], "created_at": post[5]} for post in posts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
        post = cursor.fetchone()
        if post:
            return {"id": post[0], "title": post[1], "content": post[2], "author": post[3], "category": post[4], "created_at": post[5]}
        else:
            raise HTTPException(status_code=404, detail="Post not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

class CommentCreate(BaseModel):
    content: str
    author: str

@app.post("/posts/{post_id}/comments")
async def create_comment(post_id: int, comment: CommentCreate):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        created_at = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO comments (post_id, content, author, created_at)
            VALUES (?, ?, ?, ?)
        """, (post_id, comment.content, comment.author, created_at))
        conn.commit()
        return {"message": "Comment created successfully"}
    except Exception as e:
        conn.rollback()
        print(f"Error creating comment: {str(e)}")  # 添加这行来打印错误信息
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/posts/{post_id}/comments")
async def get_comments(post_id: int):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.post_id, c.content, c.author, c.created_at, c.parent_id,
                   (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as reply_count
            FROM comments c
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        """, (post_id,))
        comments = cursor.fetchall()
        return [{"id": comment[0], "post_id": comment[1], "content": comment[2], "author": comment[3], "created_at": comment[4], "parent_id": comment[5], "reply_count": comment[6]} for comment in comments]
    except Exception as e:
        print(f"Error fetching comments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

class CommentReply(BaseModel):
    content: str
    author: str
    parent_id: int

@app.post("/posts/{post_id}/comments/{comment_id}/reply")
async def reply_to_comment(post_id: int, comment_id: int, reply: CommentReply):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        created_at = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO comments (post_id, content, author, created_at, parent_id)
            VALUES (?, ?, ?, ?, ?)
        """, (post_id, reply.content, reply.author, created_at, comment_id))
        conn.commit()
        return {"message": "Reply created successfully"}
    except Exception as e:
        conn.rollback()
        print(f"Error creating reply: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: int, comment_id: int):
    conn = sqlite3.connect('forum.db')
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM comments WHERE id = ? AND post_id = ?", (comment_id, post_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Comment not found")
        conn.commit()
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        conn.rollback()
        print(f"Error deleting comment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()