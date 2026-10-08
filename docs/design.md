13000 | үдийн хоол | хоол | 2026-10-08
296100 | арьс арчилгааны бүтээгдэхүүн | арьс арчилгаа | 2026-10-07
70000 | дата төлбөр | төлбөр | 2026-10-08
100000 | хоол хүнс худалдан авалт | хоол | 2026-10-08

...

End Point 

POST/expenses
  Client илгээнэ: JSON { amount, description, category, spent_at }
  Server хийнэ:  хоосон/буруу утгыг шалгана -> хүснэгтэд оруулна
  Буцаана:       үүссэн мөр (id-тай)
  Status:        201 Created, эсвэл буруу өгөгдөл бол 400

GET/expenses
  Client илгээнэ: (from, to, category)query parameter-уудыг илгээнэ
  Server хийнэ:  {spent_at, category} утгаар шалгаж шүүлтүүр хийнэ 
  Буцаана:       шүүлтүүр хийсэн утгыг cliet-рүү форматын дагуу буцаана
  Status:        200 + [].буруу query бол 400 буцаана.

GET/expenses/:id
  Client илгээнэ: Client id-г серверт илгээнэ. URL-д (/expenses/5)
  Server хийнэ:  id баганаар хайна: SELECT * FROM expenses WHERE id = $1
  Буцаана:       id-д тохирсон обьектыг буцаана. 
  Status:        200(олдсон үед). 404 хэрэглэгчийн хайсан id-тай мөр олдохгүй бол, 400 id тоо биш үед (/expenses/abc)


Багана | Төрөл | Required
id     | SERIAL PRIMARY KEY | NOT NULL
amount | NUMERIC(12,2) | NOT NULL
spent_at| DATE| NOT NULL
created_at| TIMESTAMPTZ + DEFAULT now()| NOT NULL
description| TEXT | 
category| TEXT | NOT NULL

