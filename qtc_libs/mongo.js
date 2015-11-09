var mongoose = require('mongoose');
var config = require('./config.js');

var __mongoose;
var __schemas;
var __models = {};

var mongo = {
	getConnection : function(){
		if(!__mongoose){
			__mongoose = mongoose.connect(config.mongo.getConnectionUrl());
		}
		return __mongoose;
	},
	schemas : function(){
		if(!__schemas){
			__schemas = require('./schemas.js')(mongo.getConnection());
		}
		return __schemas;
	},
	models : {
		Usuario : function(){
			if(!__models.Usuario){
				__models.Usuario = mongo.getConnection().model('Usuario', mongo.schemas().usuarioSchema());
			}
			return __models.Usuario;
		},
		Sala : function(){
			if(!__models.Sala){
				__models.Sala = mongo.getConnection().model('Sala', mongo.schemas().salaSchema());
			}
			return __models.Sala;
		}
	}
}

module.exports = mongo;