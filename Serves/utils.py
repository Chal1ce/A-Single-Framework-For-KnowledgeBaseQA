import yaml
import requests
from bs4 import BeautifulSoup
from PIL import Image
import io
from openai import OpenAI

# 加载配置文件
def load_config():
    with open("config.yml", "r") as config_file:
        return yaml.safe_load(config_file)

# 更新配置文件
def update_config(new_settings):
    settings = load_config()
    settings.update(new_settings)
    with open("config.yml", "w") as config_file:
        yaml.dump(settings, config_file)

# 百度百科搜索
def search_baidu_baike(query):
    url = f"https://baike.baidu.com/search/word?word={query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    params = {"word": query}
    
    response = requests.get(url, headers=headers, params=params)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    results = []
    title = soup.find('title')
    keywords = soup.find('meta', attrs={'name': 'keywords'})
    description = soup.find('meta', attrs={'name': 'description'})
    
    if description:
        content = description.get('content', '').strip()
        if not content.endswith('。'):
            content = '。'.join(content.split('。')[:-1]) + '。'
        description = content

    try:
        res = requests.get(url)
        if res.status_code == 200:
            img = io.BytesIO(res.content)
            img = Image.open(img)
        else:
            img = "../public/404.svg"
    except:
        img = "../public/404.svg"
    
    if title and description:
        results.append({
            "title": title.text.strip(),
            "keywords": keywords.get('content', ''),
            "summary": description.strip(),
            "url": response.url,
            "image": img
        })
    
    return results

# 创建OpenAI客户端
def create_openai_client(settings):
    return OpenAI(
        api_key=settings["apiKey"],
        base_url=settings["baseUrl"]
    )

# 问答流式聊天回复
def generate_chat_response(client, model, message):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": message}
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

# 总结生成思维导图需要的markdown格式
def generate_mindmap(client, model, message):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", 
                 "content": "##角色：\n你是一个markdown专家，将用户输入的文本总结转换为markdown的形式。\n##输出格式：\n# 标题，## 子标题，- 列表"},
                {"role": "user", "content": message}
            ],
            stream=False
        )
        
        return response.choices[0].message.content.replace("\n#", "#").replace("\n##", "##").replace("\n-", "-")
    except Exception as e:
        print(f"在生成响应时发生错误: {str(e)}")
        return f"错误: {str(e)}"