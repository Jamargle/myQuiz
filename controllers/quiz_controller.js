var models = require("../models/models.js");


// Funcion autoload 
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId)
		.then(function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			}else{
				next(new Error('No existe quizId=' + quizId));
			}
		}).catch(function(error) { next(error); });
};

//GET /quizes
exports.index = function(req, res) {
	/*models.Quiz.findAll().then(function(quizes) {
		res.render('quizes/index', {quizes: quizes});
	}).catch(function(error) {next(error);})*/
	var m;
	if (req.query.search) {
		m = req.query.search.replace(' ','%');
	}
	models.Quiz.findAll({
		where: {
			pregunta: { $like: '%' + m +'%' }
		}
	}).then(function(quizes) {
		res.render('quizes/index', {quizes: quizes});
	}).catch(function(error) {
		next(error);});
};


// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';

	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}

	res.render('quizes/answer', 
		{quiz: req.quiz, respuesta: resultado }
	);
};

/*//GET /quizes/question
exports.question = function(req, res) {
	//res.render('quizes/question', {pregunta: 'Capital de Italia'});
	models.Quiz.findAll().then(function(quiz) {
		res.render('quizes/question', {pregunta: quiz[0].pregunta});
	});
};


//GET /quizes/answer
exports.answer = function(req,res) {
	models.Quiz.findAll().then(function(quiz) {
		if (req.query.respuesta === quiz[0].respuesta) {
			res.render('quizes/answer', {respuesta: 'Correcto'});
		}else{
			res.render('quizes/answer', {respuesta: 'Incorrecto'});
		}
	});	
};

*/