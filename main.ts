import express from 'express';
import Database from 'better-sqlite3';
const app = express();
const db = new Database ('wadsongs.db');
app.get('/', (req,res) => {
	res.send('Hello World from Express!');
});

const PORT = 3000;
app.listen (PORT, () =>{
	console.log(`Server listening on port ${PORT}.`);
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
app.post('/song', (req,res) =>{
	try{
		const stmt = db.prepare("INSERT INTO wadsongs(id,title,artist,year,downloads,price,quantity) VALUES(?,?,?,?,?,?,?)");
		const info = stmt.run(req.body.id,req.body.title,req.body.artist,req.body.year,req.body.downloads,req.body.price,req.body.quantity);
		res.json({id:info.lastInsertRowid});
	} catch (error) {
		res.status(500).json({ error : error});
	}
});