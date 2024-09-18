import neo4j from 'neo4j-driver';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;

    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );

    const session = driver.session();

    try {
      const result = await session.run(
        'MATCH (n) WHERE n.name CONTAINS $query RETURN n LIMIT 5',
        { query }
      );

      const records = result.records.map(record => record.get('n').properties);

      res.status(200).json(records);
    } catch (error) {
      console.error('Neo4j查询错误:', error);
      res.status(500).json({ error: '数据库查询出错' });
    } finally {
      await session.close();
      await driver.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}