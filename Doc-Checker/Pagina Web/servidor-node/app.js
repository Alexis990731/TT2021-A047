// 1 - Invocamos a Express
const express = require('express');
const app = express();

//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//6 -Invocamos a bcrypt
const bcryptjs = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// 8 - Invocamos a la conexion de la DB
const connection = require('./db/db');

app.get('/', (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.send('HOLA MUNDO');
	//console.log('Cliente');
	res.end();
})

//11 - Metodo para la autenticacion
app.post('/auth', async (req, res) => {
	const user = req.body.user;
	const pass = req.body.pass;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if (user && pass) {
		connection.query('SELECT * FROM Doctor WHERE CorreoE = ?', [user], async (error, results, fields) => {
			if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].Contrasenia))) {
				//console.log(results[0]);
				//Contrasenia incorrecta
				res.send("/");
			} else {
				req.session.loggedin = true;
				req.session.name = results[0].CorreoE;
				req.session.cedula = results[0].CedulaProf;
				//console.log(req.session);
				res.send("pacientes");
			}
			res.end();
		});
	} else {
		res.send('/');
		res.end();
	}
});

app.post('/registrar', async (req, res) => {
	const Cedula = req.body.cedula;
	const Nombre = req.body.nombre;
	const ApellidoP = req.body.apellidoPaterno;
	const ApellidoM = req.body.apellidoMaterno;
	const Apellidos = ApellidoP + " " + ApellidoM;
	const CorreoE = req.body.correo;
	const Contrasenia = req.body.contrasenia;
	let ContraHaash = await bcryptjs.hash(Contrasenia, 8);
	const Sexo = req.body.sexo;
	const FechaNacimiento = req.body.fechaNacimiento;
	const Especialidad = req.body.especialidad;
	const Direccion = req.body.direccion;
	const Telefono1 = req.body.tel1;
	const Telefono2 = req.body.tel2;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);

	const sql = 'INSERT INTO Doctor(CedulaProf, Nombre, Apellidos, CorreoE, Contrasenia, Sexo, FechaNac, Especialidad, Direccion, Telefono1, Telefono2, IdAdmin) VALUES (?)';
	const valores = [
		Cedula,
		Nombre,
		Apellidos,
		CorreoE,
		ContraHaash,
		Sexo,
		FechaNacimiento,
		Especialidad,
		Direccion,
		Telefono1,
		Telefono2,
		'1'];
	//console.log(valores);
	connection.query(sql, [valores], async (error, results) => {
		//console.log(error)
		res.send("/");
		res.end();
	});
});

app.post('/agregarPaciente', async (req, res) => {
	const Id = req.body.id;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if(req.session.cedula!=null){
		//console.log("Existe");
		const sql = 'INSERT INTO Atiende(CedulaProf,CURP) VALUES (?)';
		valores = [
			req.session.cedula,
			req.body.id
		];
		//console.log(valores);
		connection.query(sql, [valores], async (error, results) => {
			//console.log(error)
			res.send("/");
			res.end();
		});
	}else{
		//console.log("No existe");
		res.send("/buscador");
		res.end();
	}
});

app.post('/obtenerPaciente', async (req, res) => {
	const CURP = req.body.curp;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if(req.session.cedula!=null && req.session.loggedin){
		//console.log("Existe");
		const sql = "SELECT Nombre, Apellidos, CURP, FechaNac, Sexo, Telefono1, Telefono2, CorreoE, Direccion, Estado, IdDCH, IdSi FROM Paciente WHERE Paciente.CURP = (?)";
		valores = [CURP]
		connection.query(sql, [valores], async (error, results) => {
			res.send(results);
			res.end();
		});
	}else{
		//console.log("No existe");
		res.send("/");
		res.end();
	}
});

app.post('/registrarPaciente', async (req, res) => {
	const Nombre = req.body.nombre;
	const ApellidoP = req.body.apellidoPaterno;
	const ApellidoM = req.body.apellidoMaterno;
	const Apellidos = ApellidoP + " " + ApellidoM;
	const FechaNacimiento = req.body.fechaNacimiento;
	const Sexo = req.body.sexo;
	const CURP = req.body.curp;
	const CorreoE = req.body.correo;
	const Telefono1 = req.body.tel1;
	const Telefono2 = req.body.tel2;
	const Direccion = req.body.direccion;
	const Estado = req.body.estado;
	const Placa = req.body.numPlaca;
	let IdSi = "";
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);
	//let passwordHash = await bcrypt.hash(pass, 8);
	connection.query("INSERT INTO SignosVitales(IdSi) VALUES (NULL)", async (error, results) => {
		//console.log(error)
		IdSi = results.insertId;
		let sql = 'INSERT INTO Paciente(Nombre,Apellidos,CURP,FechaNac,Sexo,Telefono1,Telefono2,CorreoE,Direccion,Estado,IdDCH,IdSi) VALUES (?)';
		let valores = [
			Nombre,
			Apellidos,
			CURP,
			FechaNacimiento,
			Sexo,
			Telefono1,
			Telefono2,
			CorreoE,
			Direccion,
			Estado,
			Placa,
			IdSi
		];
		//console.log(req.session);
		//console.log(valores);
		connection.query(sql, [valores], async (error, results) => {
			//console.log(error)
			sql = 'INSERT INTO Atiende(CedulaProf,CURP) VALUES (?)';
			valores = [
				req.session.cedula,
				CURP
			];
			//console.log(req.session);
			//console.log(valores);
			connection.query(sql, [valores], async (error, results) => {
				//console.log(error)
				res.send("registrarpacientes2");
				res.end();
			});
		});
	});
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/validar', (req, res) => {
	//console.log(req.session);
	var dirigir = req.query.ruta.toLowerCase();
	//console.log(dirigir);
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if (req.session.loggedin) {
		if (dirigir == 'undefined')
			res.send('/');
		else
			res.send(dirigir);
	} else {
		res.send("/");
	}
	res.end();
});

app.get('/solicitarPacientes', (req, res) => {
	//console.log(req.session);
	//console.log(dirigir);
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if (req.session.loggedin) {
		let sql = "SELECT Paciente.Nombre, Paciente.Apellidos, Paciente.CURP FROM Doctor INNER JOIN Atiende ON Doctor.CedulaProf=Atiende.CedulaProf INNER JOIN Paciente on Atiende.CURP=Paciente.CURP WHERE Doctor.CorreoE = ?";
		//console.log(sql)
		connection.query(sql, [req.session.name], async (error, results) => {
			res.send(results);
			res.end();
		});
	} else {
		res.send("/");
		res.end();
	}
});

//función para limpiar la caché luego del logout
app.use(function (req, res, next) {
	if (!req.user)
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	next();
});

//Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
		res.setHeader('Access-Control-Allow-Credentials', true);
		//res.setHeader('credentials', 'include');
		//res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		res.send('/');
		res.end();
	})
});

app.get('/buscarPacientes', (req, res) => {
	//console.log(req.session);
	//console.log(dirigir);
	var cadena = req.query.cad;
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if (req.session.loggedin) {
		req.session.cedula
		let sql = "SELECT Paciente.Nombre, Paciente.Apellidos, Paciente.CURP FROM Tiene INNER JOIN DocCheckerH ON Tiene.Clave=DocCheckerH.Clave INNER JOIN Paciente on DocCheckerH.IdDCH=Paciente.IdDCH WHERE Tiene.CedulaProf=" + req.session.cedula + " AND (Paciente.Nombre LIKE '%"+cadena+"%' OR Paciente.Apellidos LIKE '%"+cadena+"%');";
		//console.log(sql)
		//SELECT Paciente.Nombre, Paciente.Apellidos, Paciente.CURP FROM Tiene INNER JOIN DocCheckerH ON Tiene.Clave=DocCheckerH.Clave INNER JOIN Paciente on DocCheckerH.IdDCH=Paciente.IdDCH WHERE Paciente.Nombre LIKE '%R%';
		//SELECT Paciente.Nombre, Paciente.Apellidos, Paciente.CURP FROM Tiene INNER JOIN DocCheckerH ON Tiene.Clave=DocCheckerH.Clave INNER JOIN Paciente on DocCheckerH.IdDCH=Paciente.IdDCH WHERE Tiene.CedulaProf=18345 AND (Paciente.Nombre LIKE '%a%' OR Paciente.Apellidos LIKE '%a%');
		connection.query(sql, [req.session.cedula], async (error, results) => {
			//console.log(results)
			res.send(results);
			res.end();
		});
	} else {
		res.send("/");
		res.end();
	}
});


app.listen(8081, (req, res) => {
	console.log('SERVER RUNNING IN http://localhost:8081');
})
