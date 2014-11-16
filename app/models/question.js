var mongoose = require('mongoose');
Schema = mongoose.Schema;

QuestionSchema = new Schema(
  {
    question: {
      type: String
    },
    answers: [
      {
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
    ],
    timestamp: {
      type: Number
    },
    askedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondents: [
      {
          type: Schema.Types.ObjectId,
          ref: 'User'
      }
    ],
    answerSatisfaction: {
      type: Boolean
    },
    questionAnswered: {
      type: Boolean
    }
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
