var mongoose = require('mongoose');
Schema = mongoose.Schema;

UserSchema = new Schema(
	{
		userId: {
			type: String,
			required: true
		},
    deviceList: [String],
    rating: {
      points: {
        type: Number
      },
      stars:{
        type: Number,
				min: 0,
				max: 5
      }
    },
    preference: {
      price:{
        type: Boolean
      },
      distance:{
        type: Boolean
      }
    }
	}
);

module.exports = mongoose.model('User', UserSchema);
