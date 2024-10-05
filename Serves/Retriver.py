from llama_index.graph_stores.neo4j import Neo4jGraphStore
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.core import KnowledgeGraphIndex, StorageContext, ServiceContext, load_index_from_storage
from llama_index.retrievers.fusion_retriever import FUSION_MODES
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.query_engine import QueryFusionRetriever

service_context = ServiceContext.from_defaults(embed_model='', llm='')

def load_neo4j_index(username):
    graph_store = Neo4jGraphStore(
            username = 'neo4j',
            password = '12345678',
            url = 'bolt://localhost:7687',
            database = 'neo4j'
        )
    storage_context = StorageContext.from_defaults(graph_store=graph_store, persist_dir=f'localindex/{username}/neo4j_other_data.index')
    index = load_index_from_storage(
        storage_context=storage_context, 
        service_context=service_context, 
    )
    print("neo4j: 成功从磁盘加载索引")
    return index


def load_milvus_index(username):
    vector_store = MilvusVectorStore(
        index_path=f'localindex/{username}/milvus_other_data.index',
        embedding_model='',
        llm=''
    )
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = load_index_from_storage(
        storage_context=storage_context, 
        service_context=service_context)
    print("milvus: 成功从磁盘加载索引")
    return index

def load_csv_neo4j_index(username):
    graph_store = Neo4jGraphStore(
            username = 'neo4j',
            password = '12345678',
            url = 'bolt://localhost:7687',
            database = 'neo4j'
        )
    storage_context = StorageContext.from_defaults(graph_store=graph_store, persist_dir=f'localindex/{username}/neo4j_csv_data.index')
    index = load_index_from_storage(
        storage_context=storage_context, 
        service_context=service_context, 
    )
    print("neo4j: 成功从磁盘加载索引")
    return index

def load_csv_milvus_index(username):
    vector_store = MilvusVectorStore(
        index_path=f'localindex/{username}/milvus_csv_data.index',
        embedding_model='',
        llm=''
    )
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = load_index_from_storage(
        storage_context=storage_context, 
        service_context=service_context)    
    print("milvus: 成功从磁盘加载索引")
    return index


def csv_milvus_retriver(username):
    index = load_csv_milvus_index(username)
    retriver = index.as_retriever()
    return retriver

def csv_neo4j_retriver(username):
    index = load_csv_neo4j_index(username)
    retriver = index.as_retriever()
    return retriver

def neo4j_other_retriver(username):
    index = load_neo4j_index(username)
    retriver = index.as_retriever()
    return retriver

def milvus_other_retriver(username):
    index = load_milvus_index(username)
    retriver = index.as_retriever()
    return retriver

def fusion_query_engine(retrivers: list):
    # 建立混合检索器
    retriever = QueryFusionRetriever(
        retrivers,
        mode = FUSION_MODES.RECIPROCAL_RANK,
        similarity_top_k=4,
        num_queries=1,
        use_async=False,
        verbose=True,
    )

    query_engine = RetrieverQueryEngine.from_args(
        # node_postprocessors=[reranker],
        ServiceContext = service_context,
        retriever = retriever,
        streaming=True
    )
    return query_engine
