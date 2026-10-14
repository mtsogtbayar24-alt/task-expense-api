const express = require('express')
const pool = require('./db');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({status: 'ok'}));



app.get('/expenses', async(req, res) => {
  try{
    const {rows } = await pool.query('SELECT * FROM expenses ORDER BY id');
    res.json(rows);
  } catch(error){
    console.error(error);
    res.status(500).json({error: 'Query дамжуулахад алдаа гарлаа.'})
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
    return res.status(400).json({error: 'amount (тоо > 0), category, spent_at (YYYY-MM-DD) шаардлагатай'})
  }
}
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Query дамжуулахад алдаа гарлаа.'})
  }
});

app.listen(3000, ()=> console.log('Listening on 3000'));