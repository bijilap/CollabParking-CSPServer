var mongoose = require('mongoose');
Schema = mongoose.Schema;

UserCredentialSchema = new Schema(
	{
		userId: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		saltString: {
			type: String,
			required: true
		}
	}
);
module.exports = mongoose.model('UserCredential', UserCredentialSchema);
