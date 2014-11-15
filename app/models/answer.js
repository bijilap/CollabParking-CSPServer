var mongoose = require('mongoose');
Schema = mongoose.Schema;

AnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    voters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  }
)

module.exports = mongoose.model('Answer', AnswerSchema);
