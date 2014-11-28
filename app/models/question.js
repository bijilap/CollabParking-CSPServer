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
              type: String,
              required: true
            }
          ]
      }
    ],
    timestamp: {
      type: Number
    },
    askedBy: {
      type: String,
      required: true
    },
    respondents: [
      {
          type: String,
          required: true
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
