var config = {
	mongo : {
		ip : process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
		port : process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
		db : 'server',
		user : 'admin',
		pass : '28jvPKgkTb7f', //TODO: obvio que isso esta no lugar errado ... refatorar!
		getConnectionUrl : function(){ return "mongodb://"+this.user+":"+this.pass+"@"+this.ip+":"+this.port+"/"+this.db} //TODO: string template do es6 não funcionou no projeto
	},
	server : {
		ip : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
		port : process.env.OPENSHIFT_NODEJS_PORT || 8080
	},
	files : {
		dir : process.env.OPENSHIFT_DATA_DIR || 'dev_dir'
	}
}

module.exports = config;