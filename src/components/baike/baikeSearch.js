import { useState } from 'react';
import axios from 'axios';

export default function BaikeSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.post('/api/search', { query });
      setResult(response.data);
    } catch (error) {
      console.error('搜索出错:', error);
      setResult({ error: '搜索过程中发生错误' });
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入搜索关键词"
      />
      <button onClick={handleSearch}>搜索</button>
      {result && (
        <div>
          <h2>搜索结果:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}