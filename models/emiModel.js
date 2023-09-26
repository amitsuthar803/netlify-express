const mongoose = require('mongoose');

//creating schema
const emiSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  date: {
    type: Number,
  },
  name: {
    type: String,
    unique: true,
  },
  emi_start_date: {
    type: String,
  },
  no_of_emi: {
    type: Number,
  },
  rate_of_intrest: {
    type: Number,
    default: 2,
  },
  total_loan_amount: {
    type: Number,
    required: [true, 'A emi must have a loan amount'],
  },
  emi: {
    type: Number,
  },
});

//creating modal - here Emi is document name in collection in atlas
const Emi = mongoose.model('Emi', emiSchema);

module.exports = Emi;
