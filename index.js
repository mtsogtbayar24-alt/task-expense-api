const express = require('express')
const pool = require('./db');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({status: 'ok'}));



app.get('/expenses', async (req, res) => {
  const { from, to, category } = req.query;
  const conditions = [];
  const params = [];

  if (from !== undefined) {
    if (typeof from !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res.status(400).json({ error: 'from must be a date in YYYY-MM-DD format' });
    }
    conditions.push(`spent_at >= $${params.length + 1}`);
    params.push(from);
  }
  if (to !== undefined) {
    if (typeof to !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'to must be a date in YYYY-MM-DD format' });
    }
    conditions.push(`spent_at <= $${params.length + 1}`);
    params.push(to);
  }
  if (category !== undefined) {
    if (typeof category !== 'string') {
      return res.status(400).json({ error: 'category must be a single value' });
    }
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await pool.query(`SELECT * FROM expenses ${whereClause} ORDER BY id`, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the query.' });
  }
});


app.post('/expenses', async(req, res) => {
  try{
    const { amount, description, category, spent_at} = req.body; 

    if(typeof amount === 'number' && amount > 0 && 
      typeof category === 'string' && category.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(spent_at)){
        const { rows } = await pool.query( 'INSERT INTO expenses (amount, description, category, spent_at) VALUES ($1,$2,$3,$4) RETURNING *', 
          [amount, description, category, spent_at])
          res.status(201).json(rows[0]);
        
  } else {
    return res.status(400).json({error: 'amount (number > 0), category, and spent_at (YYYY-MM-DD) are required'})
  }
}
  catch(error){
    console.error(error);
    res.status(500).json({error: 'An error occurred while processing the query.'})
  }
});

app.get('/expenses/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
       if(!Number.isInteger(id) || id <= 0) { 
     return res.status(400).json({error: 'id must be a number greater than 0'})
      }
    const {rows } = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if(rows.length === 0){
      return res.status(404).json({error: 'No expense found with the specified id.'})
    }
    res.status(200).json(rows[0]);
  } catch(error){
    console.error(error);
    res.status(500).json({error: 'An error occurred while processing the query.'})
  }
})

app.listen(process.env.PORT || 3000, ()=> console.log('Listening on 3000'));
