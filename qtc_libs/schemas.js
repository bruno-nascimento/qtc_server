var schemas = function(mongoose){
	var __mongoose = mongoose;
	return {
		usuarioSchema : function(){
			return __mongoose.Schema({ apelido: String, nome: String, email: String, senha: String, 
    			amigos: [{ type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], 
    			bloqueados: [{ type: __mongoose.Schema.Types.ObjectId, ref: 'Usuario' }] })
		}
	}
}
module.exports = schemas;