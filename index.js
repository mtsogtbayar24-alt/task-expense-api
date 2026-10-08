const express = require('express')
const pool = require('./db');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({status: 'ok'}));
app.listen(3000, ()=> console.log('Listening on 3000'));

// const  { rows } = async () => {
//   try{
//   await pool.query('SELECT * FROM expenses ORDER BY id');
//    }
//   catch(error){
//     console.log(500)
//   }
//   return  res.json(rows);
// } 

app.get('/expenses', async(req, res) => {
  try{
    const {rows } = await pool.query('SELECT * FROM expenses ORDER BY id');
    res.json(rows);
  } catch(error){
    console.error(error);
    res.status(500).json({error: 'Query дамжуулахад алдаа гарлаа.'})
  }
});