var schemas = function(mongoose){
	var __mongoose = mongoose;
	return {
		usuarioSchema : function(){
			return __mongoose.Schema({ apelido: String, nome: String, email: String, senha: String, 
    			amigos: [{ type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], 
    			bloqueados: [{ type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario' }] })
		},
		salaSchema : function(){
			return __mongoose.Schema({nome: String, dono: {type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
									  descricao: String, imagem: {data: String, contentType: String}, publica: Boolean,
									  usuarios: [{type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario'}],
									  banidos: [{type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario'}],
									  votacoes : [{ banir : Boolean, 
									                usuario : {type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
									                votos : Number}]})
		}
	}
}
module.exports = schemas;