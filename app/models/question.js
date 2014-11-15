var mongoose = require('mongoose');
Schema = mongoose.Schema;

QuestionSchema = new Schema(
  {
    question: {
      type: String
    },
    answers: [
      {
  			type: Schema.Types.ObjectId,
  			ref: 'Answer'
      }
    ],
    timestamp: {
      type: Number
    },
    respondents: [
      {
          type: Schema.Types.ObjectId,
          ref: 'User'
      }
    ],
    answerSatisfaction: {
      type: Boolean
    }
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
