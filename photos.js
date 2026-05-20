export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Activa',
          checkbox: { equals: true }
        },
        sorts: [{ timestamp: 'created_time', direction: 'ascending' }]
      }),
    });

    const data = await response.json();

    const photos = data.results.map(page => ({
      id: page.id,
      nombre: page.properties['Nombre']?.title?.[0]?.plain_text || '',
      url: page.properties['URL']?.url || '',
      seccion: page.properties['Sección']?.multi_select?.map(s => s.name) || [],
      lugar: page.properties['Lugar']?.rich_text?.[0]?.plain_text || '',
      fecha: page.properties['Fecha']?.rich_text?.[0]?.plain_text || '',
      descripcion: page.properties['Descripción']?.rich_text?.[0]?.plain_text || '',
    }));

    res.status(200).json({ photos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
