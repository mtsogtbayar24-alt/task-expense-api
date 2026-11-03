const items = [
  {id: 1, title: 'firstItem'},
  {id: 2, title: 'secondItem'}
];

app.get('/items', (res, resolve) => {
  res.json('items');
})
