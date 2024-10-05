# 《构建和评估高级的RAG模型应用》

## 1、检索方式

LlamaIndex官方示例文档：

[](https://docs.llamaindex.ai/en/stable/examples/node_postprocessor/MetadataReplacementDemo.html)

### 句子窗口检索

#### **工作流**

**解析句子 → 抽取节点 → 建立索引 → 设置检索器、查询引擎 → 检索**

将文档中的每个句子都单独嵌入，然后根据检索到的句子前后拓展k个句子大小的上下文窗口。如图所示，检索到的句子是绿色的部分，然后根据这个句子前后拓展多个句子（黑色部分），将黑色部分和绿色部分的句子输入到LLM中。

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/D0A10C20-BF21-48DA-839F-342F95953452_2/lT4z1vh2gcp7G2UHOrQxDgH9wLs3wayx6i2wQ5Lyw4Mz/Image.png)

句窗检索是基于SentenceWindowNodeParser实现的，SentenceWindowNodeParser可以将文档解析为一个单句一个节点。每个节点还包含一个 "窗口"，其中包含节点句子两侧的句子。

#### **代码实现：**

```other
# 导包，这里是基于llama-index这个包实现
import os
from llama_index import ServiceContext, VectorStoreIndex, StorageContext
from llama_index.node_parser import SentenceWindowNodeParser
from llama_index.indices.postprocessor import MetadataReplacementPostProcessor
from llama_index.indices.postprocessor import SentenceTransformerRerank
from llama_index import load_index_from_storage
```

```other
def build_sentence_window_index(
    documents,
    llm,
    embed_model="bge-large-zh-v1.5",
    sentence_window_size=5,
    save_dir="saving_test",
):
    # 创建句窗节点解析器，需要自己设置拓展上下文句子窗口的大小
    node_parser = SentenceWindowNodeParser.from_defaults(
        window_size=sentence_window_size,
        window_metadata_key="window",
        original_text_metadata_key="original_text",
    )

    # ServiceContext封装了用于创建索引和运行查询的资源
    # ServiceContext是llamaIndex的pipeline中索引和查询阶段常用的资源包。
    # 可以用它来设置全局配置以及pipeline特定部分的本地配置。
    sentence_context = ServiceContext.from_defaults(
        llm=llm,
        embed_model=embed_model,
        node_parser=node_parser,
    )

    # 创建索引，用来快速获取句子文本
    if not os.path.exists(save_dir):
        sentence_index = VectorStoreIndex.from_documents(
            documents, service_context=sentence_context
        )
        sentence_index.storage_context.persist(persist_dir=save_dir)
    else:
        sentence_index = load_index_from_storage(
            StorageContext.from_defaults(persist_dir=save_dir),
            service_context=sentence_context,
        )

    return sentence_index


# 创建句窗查询引擎
def get_sentence_window_query_engine(
    sentence_index, similarity_top_k=6, rerank_top_n=2
):

    # 用 MetadataReplacementPostProcessor 可以将句子替换为句子窗口
    postproc = MetadataReplacementPostProcessor(target_metadata_key="window")

    # 对检索到的前n个句子进行重排名
    rerank = SentenceTransformerRerank(
        top_n=rerank_top_n, model="BAAI/bge-reranker-base"
    )

    # 创建查询引擎，对于句子节点的处理可以将句子替换为句子和它的上下文
    sentence_window_engine = sentence_index.as_query_engine(
        similarity_top_k=similarity_top_k, node_postprocessors=[postproc, rerank]
    )
    return sentence_window_engine
```

```other
from llama_index.llms import OpenAI

# 基于上面的代码创建索引和搜索引擎
index = build_sentence_window_index(
    [document],
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    save_dir="./sentence_index",
)
query_engine = get_sentence_window_query_engine(index, similarity_top_k=6)
```

### 自动合并检索

与句窗检索相似，都是从更细粒度的检索之后，拓展到上下文，这个是将大文本块分解成小文本块，然后检索时检索小文本块，再根据小文本块拓展到其所属的大文本块中，最终将大文本块喂给大模型。

这里是基于llama_index的AutoMergingRetriever实现的，官方文档：

[](https://docs.llamaindex.ai/en/stable/examples/retrievers/auto_merging_retriever.html#auto-merging-retriever)

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/49DFCDEE-B3AC-45C7-AF77-44FEA02DA535_2/bN4FfntxxNnUhgRAvdjgSWMPwJO32Dyv20thuLKGoXEz/Image.png)

当同一父块下有较多的子块与检索文本相关时，会合并这些子块，返回这些子块所属的父块。

#### 代码实现

```other
# 导包
import os
from llama_index import (
    ServiceContext,
    StorageContext,
    VectorStoreIndex,
    load_index_from_storage,
)
from llama_index.node_parser import HierarchicalNodeParser
from llama_index.node_parser import get_leaf_nodes
from llama_index import StorageContext, load_index_from_storage
from llama_index.retrievers import AutoMergingRetriever
from llama_index.indices.postprocessor import SentenceTransformerRerank
from llama_index.query_engine import RetrieverQueryEngine
```

```other
# 构建自动合并索引
def build_automerging_index(
    documents,
    llm,
    embed_model="local:BAAI/bge-small-en-v1.5",
    save_dir="merging_index",
    chunk_sizes=None,
):
    # 设置父块子块的大小
    chunk_sizes = chunk_sizes or [2048, 512, 128]
    # 将文档分解成多个节点，这些节点根据给定的chunk_sizes大小进行分块
    node_parser = HierarchicalNodeParser.from_defaults(chunk_sizes=chunk_sizes)
    # 获取文本块的节点
    nodes = node_parser.get_nodes_from_documents(documents)
    # 从分块的文档中获取叶子节点
    leaf_nodes = get_leaf_nodes(nodes)
    # ServiceContext是llamaIndex的pipeline中索引和查询阶段常用的资源包。
    # 可以用它来设置全局配置以及pipeline特定部分的本地配置。
    merging_context = ServiceContext.from_defaults(
        llm=llm,
        embed_model=embed_model,
    )
    # 存储上下文
    storage_context = StorageContext.from_defaults()
    storage_context.docstore.add_documents(nodes)

    # 创建索引，包含叶子节点和上下文信息
    if not os.path.exists(save_dir):
        automerging_index = VectorStoreIndex(
            leaf_nodes, storage_context=storage_context, service_context=merging_context
        )
        automerging_index.storage_context.persist(persist_dir=save_dir)
    else:
        automerging_index = load_index_from_storage(
            StorageContext.from_defaults(persist_dir=save_dir),
            service_context=merging_context,
        )
    return automerging_index
```

```other
# 构建自动合并搜索引擎
def get_automerging_query_engine(
    automerging_index,
    similarity_top_k=12,
    rerank_top_n=6,
):
    # 基础检索器，用来对文档做第一次检索，为后面合并做准备
    base_retriever = automerging_index.as_retriever(similarity_top_k=similarity_top_k)
    # AutoMergingRetriever可以查看叶节点集，并递归合并引用父节点
    retriever = AutoMergingRetriever(
        base_retriever, automerging_index.storage_context, verbose=True
    )
    # 对检索结果的前n个进行重排
    rerank = SentenceTransformerRerank(
        top_n=rerank_top_n, model="BAAI/bge-reranker-base"
    )
    # 构建引擎，结合了检索器和重排序器，用于处理查询并返回最终结果。
    auto_merging_engine = RetrieverQueryEngine.from_args(
        retriever, node_postprocessors=[rerank]
    )
    return auto_merging_engine
```

```other
# 基于上面的代码进行使用
from llama_index.llms import OpenAI

index = build_automerging_index(
    [document],
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    save_dir="./merging_index",
)
query_engine = get_automerging_query_engine(index, similarity_top_k=6)
```

## 2、评估指标

### 答案相关性

即反馈函数的输出，评估答案与所给查询的相关性。最终会输出两部分，一部分是相关性分数（0-1），另一部分是评估产生此得分的依据。这里的反馈函数是可以自己定义的，也可以使用传统的评估，取决于自己的需求

### 上下文相关性

给定一个查询，查看从向量数据库中检索到的每个上下文片段，评估该上下文片段与所提出的问题的相关性。相关性分数（0-1）

### 基础性（**答案准确性**）

在检索上下文后，LLM 生成答案。一些情况下， LLM 往往会偏离事实，对正确的答案进行夸张或扩展。为验证回答的准确性，我们应将回复分为独立语句，并在检索上下文中独立查证每个语句的出处来源。

这里是通过Trulens_eval来实现以上三种评估指标，TruLens 是一个用于评估语言模型应用(如 RAG)的性能的开源库。通过 TruLens，我们还可以利用语言模型本身来评估输出、检索质量等。

trulens官网：[https://www.trulens.org/](https://www.trulens.org/)

trulens_eval文档：[https://www.trulens.org/trulens_eval/install/](https://www.trulens.org/trulens_eval/install/)

## 3、评估指标与句窗结合案例

案例材料下载：

[案例材料.zip](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/AD8F24D5-27C9-4312-A1DE-619E24037A09_2/69qv8rzi2iZLDhfyKYxvU8iCvPv15oUmhVqsWIHx8wIz/AD8F24D5-27C9-4312-A1DE-619E24037A09_2.zip)

1、定义句窗检索函数

2、使用Trulens设置验证pipeline

```other
from trulens_eval import Tru
from utils import get_prebuilt_trulens_recorder

# 打开文件，将问题添加进问题集
eval_questions = []
with open('generated_questions.text', 'r') as file:
    for line in file:
        # Remove newline character and convert to integer
        item = line.strip()
        eval_questions.append(item)

# 定义验证函数，对每个问题进行验证
def run_evals(eval_questions, tru_recorder, query_engine):
    for question in eval_questions:
        with tru_recorder as recording:
            response = query_engine.query(question)

# 先清空之前的验证记录，存放记录的数据库会被重新初始化
Tru().reset_database()
```

3、建立索引及句窗检索引擎

先查看窗口为1时的检索效果

```other
from llama_index.llms import OpenAI

# 建立索引
sentence_index_1 = build_sentence_window_index(
    documents,
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    embed_model="local:BAAI/bge-small-en-v1.5",
    sentence_window_size=1,
    save_dir="sentence_index_1",
)

# 设置引擎
sentence_window_engine_1 = get_sentence_window_query_engine(
    sentence_index_1
)

# 建立验证记录器
tru_recorder_1 = get_prebuilt_trulens_recorder(
    sentence_window_engine_1,
    app_id='sentence window engine 1'
)
```

运行时会显示哪一个步骤运行完成了

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/9C137900-BEE8-4723-9A15-D453339E6C86_2/crPFrpzOEeOqFQghSs0j0RymbgOhyGivxEcbUclFoHoz/Image.png)

然后开始对结果进行验证，这里可以使用dashboard来可视化验证结果

```other
run_evals(eval_questions, tru_recorder_1, sentence_window_engine_1)
Tru().run_dashboard()
```

运行完通过点击所给的链接即可以看到结果

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/C20046D8-4D24-4027-8515-2CEAE8ADFF99_2/WxJ033HRWiaQFY5eKBmQeIh0trF1Q5fVMfO3YGJPIqUz/Image.png)

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/382DC12C-5B7E-49BF-A40B-A779D7D29809_2/h1BLHyLZlR4XT52HD4b6QkSOjDRqpWqu16s1l6XOnnAz/Image.png)

点击右边的selet app还可以进入这个检索器的页面查看详情记录，然后点击具体的某一条检索问句，可以查看这个问句的具体评分，包括它检索出来的文本、评分来源等等。

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/5B42D252-3ACE-4F77-A9D6-E70F4E7656F3_2/HWRaWRGVxkgIhunBbu0eJKRuv4NwKD3TaoZyVsqJ6noz/Image.png)

下图是该句子的输入和检索结果

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/43CCEDDF-F0A1-43CF-8517-B261731A0223_2/BfvAcqGxDTet2E1gdXFLqNlxV0x9STxjnYBJLcBxtAUz/Image.png)

下图是该检索结果的评分和支撑依据，双击表格中的某一部分可以看到全文

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/6519E9C3-0A72-4193-8231-AAD89B47F0B8_2/AOf3yUK6PLEG43y5Gye5sxCzUlj5vzQxEAkbbKWXvbwz/Image.png)

当句子窗口为1时，检索出来的文本基础性不是很理想。

句子窗口为3时

```other
sentence_index_3 = build_sentence_window_index(
    documents,
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    embed_model="local:BAAI/bge-small-en-v1.5",
    sentence_window_size=3,
    save_dir="sentence_index_3",
)
sentence_window_engine_3 = get_sentence_window_query_engine(
    sentence_index_3
)

tru_recorder_3 = get_prebuilt_trulens_recorder(
    sentence_window_engine_3,
    app_id='sentence window engine 3'
)

run_evals(eval_questions, tru_recorder_3, sentence_window_engine_3)

Tru().run_dashboard()
```

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/8AB5B625-8742-4FF4-87B6-0FA10ED9FCDF_2/ASoHyMlJOaUFxOnzHCuXpjtXJ9n9Qe8XEwjAoaixAokz/Image.png)

通过对比可以看到，增加句子窗口的大小时，各项指标都有所增加。而进入页面查看具体信息可以看到，通过增加上下文文本的方式，让检索评分有了更靠谱的依据。

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/84C7D405-AB57-43BF-80CC-14457C5AA8FB_2/w50PszdKRBLTt1yqQSq7Off8fK4j4uZ4JBhZSMhOefUz/Image.png)

#### 其他

关注上下文相关性的原因：上下文太小，有时会导致上下文相关性低。LLM没有足够的上下文生成摘要，只能用本身的知识去填补。

找出足够的窗口大小来获取足够的上下文，如果窗口太小，会导致没有足够的上下文来支撑LLM的推理，如果窗口太大，会引入过多的无关文本，影响最终LLM的推理结果。

相似度检索通常在一个小的块上能有更好的工作效果，而LLM则需要更多地上下文和更大的块来综合获得一个好的答案。

逐渐增加窗口大小可以慢慢找到差不多最合适的窗口大小，随着增加句子窗口的大小，上下文相关性将达到一个临界值。基础性也将增加，超过这个临界值后，上下文相关性与基础性将会趋于平稳或者减少。

## 4、评估指标与自动合并检索案例

[案例材料.zip](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/0BCA447F-DD23-4C82-A606-3CB016F20D3B_2/65AYx6fHPPQ1USK6xOwEkqDKe1xsJvMRovtjoK2Ha7cz/0BCA447F-DD23-4C82-A606-3CB016F20D3B_2.zip)

1、定义自动合并检索函数

2、设置记录存储

```other
from trulens_eval import Tru

Tru().reset_database()
```

2层分块检索效果（2048 → 512）

建立检索、引擎、记录器

```other
auto_merging_index_0 = build_automerging_index(
    documents,
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    embed_model="local:BAAI/bge-small-en-v1.5",
    save_dir="merging_index_0",
    chunk_sizes=[2048,512],
)

auto_merging_engine_0 = get_automerging_query_engine(
    auto_merging_index_0,
    similarity_top_k=12,
    rerank_top_n=6,
)

from utils import get_prebuilt_trulens_recorder

tru_recorder = get_prebuilt_trulens_recorder(
    auto_merging_engine_0,
    app_id ='app_0'
)
```

处理用来进行验证的问题

```other
eval_questions = []
with open('generated_questions.text', 'r') as file:
    for line in file:
        # Remove newline character and convert to integer
        item = line.strip()
        eval_questions.append(item)
```

推理函数

```other
def run_evals(eval_questions, tru_recorder, query_engine):
    for question in eval_questions:
        with tru_recorder as recording:
            response = query_engine.query(question)

run_evals(eval_questions, tru_recorder, auto_merging_engine_0)
```

运行推理函数时，每合并一个节点都会将它打印出来

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/47157CA3-1E46-4807-BD22-A7665A09184C_2/8HkkRp0jyqknIRFvcG2AxhvMI7W0VkW0vtNwozGxIjoz/Image.png)

推理完成之后，我们可以从本地查看得分榜

```other
from trulens_eval import Tru

Tru().get_leaderboard(app_ids=[])
```

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/289D1BF3-BCD0-4273-B7DD-C471C4AD6265_2/5vwI6Kk32An0U51NDCiNckXUxuIQEWppOxli6ThdlM0z/Image.png)

我们也可以查看它的具体评分依据，仍然使用run_dashboard()

```other
Tru().run_dashboard()
```

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/31048575-3904-47B8-9D5F-882F3C8A5854_2/xZMtCIQVLDLMrw9RTYgc0XIZGwvKxxSZMXiVQ2ZpI1wz/Image.png)

可以看到通过自动合并检索中，将大文本块直接分为小文本块，检索时如果没有别的文本块和检索语句相关性较强，这不会进行合并，这将会导致检索出来的文本块上下文不全，llm需要通过自己的知识来补全信息，上下文相关性较低。

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/3046AB67-A20B-4F32-B878-C95FDCD21E92_2/xfaQQqPcD4ZXSMWraxIjPWRjQjwPUAshejX4Ipyryiwz/Image.png)

通过点击其中一个，可以查看其具体检索出来的文本，以及它的评分、评分来由。

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/11B4B28C-4DD7-4F3D-A28C-7EA98835B378_2/SU0mnqGh5Zh5wPWejdovFgBEHAZt6QkK67BcacWsDg8z/Image.png)

然后查看3层的效果（2048 → 512 → 128）

```other
auto_merging_index_1 = build_automerging_index(
    documents,
    llm=OpenAI(model="gpt-3.5-turbo", temperature=0.1),
    embed_model="local:BAAI/bge-small-en-v1.5",
    save_dir="merging_index_1",
    chunk_sizes=[2048,512,128],
)

auto_merging_engine_1 = get_automerging_query_engine(
    auto_merging_index_1,
    similarity_top_k=12,
    rerank_top_n=6,
)

tru_recorder = get_prebuilt_trulens_recorder(
    auto_merging_engine_1,
    app_id ='app_1'
)

run_evals(eval_questions, tru_recorder, auto_merging_engine_1)

Tru().run_dashboard()
```

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/004B0B20-8679-4518-945C-6704B33F2D40_2/tFiuR4xPOjfvEy2xZ6TN0Mu6bYmL0GbThirXRSZdxVkz/Image.png)

从leaderboard上来看3层（app_1）并没有提高上下文的关联性，而是提高了答案的相关性和准确性，这是由于进行细小化分块之后，检索到的答案文本不包含或包含更少的上下文，从而减少了噪音，和真实答案更加接近。

同样，点进去看具体情况时，也能查看到相关评分来由

![Image.png](https://res.craft.do/user/full/4a73d8ac-1976-a100-aa9e-60cafa2b1f66/doc/adf609e9-4e88-473d-9094-99e10e6639e8/8D2644CA-3C1F-44F0-9AC4-D937143CEF58_2/yMVajWKfiOhTwxTNxVTHtUJxxAortMMr3uY7jedZwycz/Image.png)

