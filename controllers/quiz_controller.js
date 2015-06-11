var models = require('../models/models.js');


// Funcion autoload 
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
    where: {
      id: Number(quizId)
    },
    include: [{
      model: models.Comment
    }]
  }).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else{
      next(new Error('No existe quizId=' + quizId));
    }
  }).catch(function(error){
    next(error);
  });
};


//GET /quizes
exports.index = function(req, res) {
	//Si no hay búsqueda se asigna vacío
	var search = req.query.search || "";
	//Se modifica el string para que tenga los comodines %
	search = '%' + search.replace(" ","%") + '%';

  //Si no se selecciona tema, se muestran todas las preguntas
  if ((req.query.filtro_tema === undefined) || (req.query.filtro_tema === 'ninguno')) {
    models.Quiz.findAll({
      where: ['pregunta like ?', search],
      order: 'pregunta'
    }).then(function(quizes) {
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error) {
      next(error);
    });
  }else{
    models.Quiz.findAll({
      where: ['pregunta like ? AND tema = ?', search, req.query.filtro_tema],
      order: 'pregunta'
    }).then(function(quizes) {
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error) {
      next(error);
    });
  }

	

};


// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};    

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build({ // crea objeto quiz 
      pregunta: "Pregunta", 
      respuesta: "Respuesta",
      tema:"Otro"
    }
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  var err = quiz.validate();
  if (err){
    res.render('quizes/new', {quiz: quiz, errors: err.errors});
  }else{
    quiz // save: guarda en DB campos pregunta y respuesta de quiz
    .save({fields: ["pregunta", "respuesta", "tema"]})
    .then( function(){ res.redirect('/quizes')}) 
  }
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};


// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  var err = req.quiz.validate();
  
  if (err) {
    res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
  } else {
    req.quiz     // save: guarda campos pregunta y respuesta en DB
    .save( {fields: ["pregunta", "respuesta", "tema"]})
    .then( function(){ res.redirect('/quizes');});
  }     // Redirección HTTP a lista de preguntas (URL relativo)
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};