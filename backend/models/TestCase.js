const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Critical', 'High', 'Standard', 'Low'], 
    default: 'Standard' 
  },
  complex: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  steps: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastStatus: { 
    type: String, 
    enum: ['Passed', 'Failed', 'Pending', 'Not Run'], 
    default: 'Not Run' 
  }
}, { timestamps: true });

module.exports = mongoose.model('TestCase', TestCaseSchema);
