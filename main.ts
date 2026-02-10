import express from 'express';
import Database from 'better-sqlite3';
const app = express();
app.use(express.json());
const db = new Database ('wadsongs.db');
app.get('/', (req,res) => {
	res.send('Hello World from Express!');
});


app.get('/artist/:artist', (req,res) =>{
	try{
		const stmt = db.prepare("SELECT * FROM wadsongs WHERE artist = ?");
		const results = stmt.all(req.params.artist);
		res.json(results);
	} catch(error){
		res.status(500).json({ error : error });
	}
});

app.get('/title/:title', (req,res) =>{
	try{
		const stmt = db.prepare("SELECT * FROM wadsongs WHERE title = ?");
		const results = stmt.all(req.params.title);
		res.json(results);
	} catch (error){
		res.status(500).json ({ error : error });
	}
});
app.get('/artistandtitle/:title/:artist', (req,res) => {
	try{
		const stmt = db.prepare("SELECT * FROM wadsongs WHERE title = ? AND artist = ? ");
		const results = stmt.all(req.params.title,req.params.artist);
		res.json(results);
	} catch (error){
		res.status(500).json ({ error : error });
	}
});
app.get('/id/:id', (req,res) => {
	try{
		const stmt = db.prepare("SELECT * FROM wadsongs WHERE id = ?");
		const results = stmt.get(req.params.id);
		res.json(results);
	} catch (error){
		res.status(500).json ({error : error});
	}
});
app.post('/song/create', (req,res) =>{
	try{
		const stmt = db.prepare("INSERT INTO wadsongs(title, artist, year, downloads, price, quantity) VALUES(?, ?, ?, ?, ?, ?)");
		const info = stmt.run(req.body.title, req.body.artist, req.body.year, req.body.downloads, req.body.price, req.body.quantity);
		res.json({id:info.lastInsertRowid}); 

	} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  } else {
    console.error(error);
    res.status(500).json({ error: 'Unknown error occurred' });
  }
}
});


// PUT:: change the price and quantity in stock of a song with a given ID
app.put('/song/:id' , (req,res) =>{
	try{
		const stmt = db.prepare('UPDATE wadsongs SET price = ?, quantity = ? WHERE id = ?');
		const info = stmt.run(req.body.price, req.body.quantity, req.params.id );
		if (info.changes == 1 ){
			res.status(200).json({success : true});
		}else{
			res.status(404).json({error: "Could not find song with that ID."});
		}
	}catch(error){
		res.status(500).json({error : error });
	}
});

// DELETE: delete a song with a give ID

app.delete('/deletesong/:id' , (req,res) =>{
	try{
		const stmt = db.prepare('DELETE FROM wadsongs WHERE id = ?');
		const info = stmt.run (req.params.id );
		if (info.changes == 1 ){
			res.status(200).json({success : 1});
		}else{
			res.status(404).json({error: "Could not find song with that ID."});
		}
	}catch(error){
		res.status(500).json({error : error });
	}
});


// POST: buy a physical copy of a song with a give ID by reducing the quantity in stock by 1, creating an order. You will need to create an orders table in the datbase to hold in the song ID and user's desired quantity.
// In your route, buy the song and create an order; set the quantity to 1 for now.

app.post('/order/create', (req, res) => {
  const { id } = req.body;
  const ordered_quantity = 1;

  try {
    const transaction = db.transaction(() => {
      const song = db.prepare(
        'SELECT quantity FROM wadsongs WHERE id = ?'
      ).get(id) as { quantity: number } | undefined;

      if (!song) {
        throw new Error('Song not found');
      }

      if (song.quantity < 1) {
        throw new Error('Out of stock');
      }

      // Reduce stock
      db.prepare(
        'UPDATE wadsongs SET quantity = quantity - 1 WHERE id = ?'
      ).run(id);

      // Create order
      const info = db.prepare(
        'INSERT INTO orders(id, ordered_quantity) VALUES (?, ?)'
      ).run(id, ordered_quantity);

      return info.lastInsertRowid;
    });

    const orderId = transaction();
    res.status(201).json({ orderId });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
const PORT = 3000;
app.listen (PORT, () =>{
	console.log(`Server listening on port ${PORT}.`);
});