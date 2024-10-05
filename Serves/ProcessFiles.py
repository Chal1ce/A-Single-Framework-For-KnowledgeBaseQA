import os
import csv
import yaml
from copy import deepcopy
from llama_parse import LlamaParse
from llama_index.core.schema import TextNode
from llama_index.core.schema import Document
from llama_index.core import SimpleDirectoryReader
from llama_index.core import KnowledgeGraphIndex, StorageContext, ServiceContext, VectorStoreIndex
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.graph_stores.neo4j import Neo4jGraphStore

#----------------------------------------------------------
# 对于非结构化的数据，我个人是比较倾向于使用Unstructured这个库来处理
# 具体请见：https://github.com/Unstructured-IO/unstructured-python-client
#----------------------------------------------------------

# 获取文件类型
def get_file_type(file_path_name):
    # 提取文件扩展名
    _, ext = os.path.splitext(file_path_name)
    ext = ext.lower()  # 将扩展名转换为小写，以便匹配
    return ext

# 一个简单的处理文件函数，若需要特殊处理，可以重新自定义
def process_data_to_milvus(username, milvus_url):
    documents = SimpleDirectoryReader(
        input_files=[f'localindex/{username}/{file}' for file in os.listdir(f'uploads/{username}')]
    ).load_data()

    vector_store = MilvusVectorStore(
        uri=milvus_url, dim=1536, overwrite=False # 如果为 True，则覆盖现有数据
    )
    # 将 uri 设置为本地文件，例如 ./milvus.db ，是最便捷的方法，因为它会自动利用 Milvus Lite 将所有数据存储在该文件中。
    # 如果您拥有大规模数据，可以在 Docker 或 Kubernetes 上搭建一个性能更强的 Milvus 服务器。在此设置中，请使用服务器 URI，例如 http://localhost:19530 ，作为您的 uri 
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(
        documents, storage_context=storage_context
    )
    index.persist(f'localindex/{username}/milvus_other_data.index')
    return True


def process_data_to_neo4j(username):
    documents = SimpleDirectoryReader(
        input_files=[f'uploads/{username}/{file}' for file in os.listdir(f'uploads/{username}')]
    ).load_data()

    graph_store = Neo4jGraphStore(
        username = 'neo4j',
        password = '123456',
        url = 'http://localhost:7474',
        database = 'neo4j'
    )
    storage_context = StorageContext.from_defaults(graph_store=graph_store)
    service_context = ServiceContext.from_defaults(embed_model='', llm='')

    print("建立索引中，需要很长一段时间")
    index = KnowledgeGraphIndex.from_documents(
        documents,
        storage_context=storage_context,
        service_context=service_context,
        max_triplets_per_chunk=10,
        include_embeddings=True,
        show_progress = True,
        max_object_length = 1024
    )
    index.persist(f'localindex/{username}/neo4j_other_data.index')
    return True


def process_csv_to_milvus(username, file_path_name, milvus_url):
    
    with open(f'uploads/{username}/{file_path_name}', 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        # 读取CSV文件的第一行作为列名
        headers = next(csv_reader)
        print(f"CSV文件的列名为: {headers}")
        data = list(csv_reader)
        docs = [ 
            Document(
                text = ":".join(headers[i] + t[i] for i in range(len(headers))),
                metadata_seperator="",
                metadata_template="{key}:{value}",
            ) for t in data 
        ]

    vector_store = MilvusVectorStore(
        uri=milvus_url, dim=1536, overwrite=False # 如果为 True，则覆盖现有数据
    )
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(
        docs, storage_context=storage_context
    )
    index.persist(f'localindex/{username}/{file_path_name}_milvus_csv.index')
    return True


def process_csv_to_neo4j(username, file_path_name):
    with open(f'uploads/{username}/{file_path_name}', 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        # 读取CSV文件的第一行作为列名
        headers = next(csv_reader)
        print(f"CSV文件的列名为: {headers}")
        data = list(csv_reader)
        docs = [ 
            Document(
                text = ":".join(headers[i] + t[i] for i in range(len(headers))),
                metadata_seperator="",
                metadata_template="{key}:{value}",
            ) for t in data 
        ]

    graph_store = Neo4jGraphStore(
        username = 'neo4j',
        password = '123456',
        url = 'http://localhost:7474',
        database = 'neo4j'
    )
    storage_context = StorageContext.from_defaults(graph_store=graph_store)
    service_context = ServiceContext.from_defaults(embed_model='', llm='')

    print("建立索引中，需要很长一段时间")
    index = KnowledgeGraphIndex.from_documents(
        docs,
        storage_context=storage_context,
        service_context=service_context,
        max_triplets_per_chunk=10,
        include_embeddings=True,
        show_progress = True,
        max_object_length = 1024
    )
    index.persist(f'localindex/{username}/{file_path_name}_neo4j_csv.index')
    return True

