import sqlite3

# 连接到数据库（如果不存在则创建）
conn = sqlite3.connect('forum.db')
cursor = conn.cursor()

# 创建帖子表
cursor.execute('''
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# 创建评论表
cursor.execute('''
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TEXT NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (parent_id) REFERENCES comments (id)
)
''')

# 提交更改并关闭连接
conn.commit()
conn.close()

print("论坛数据库初始化完成。")