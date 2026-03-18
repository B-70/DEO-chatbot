const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  department: { type: String, required: true },
  batch: { type: String, required: true }, // e.g., "2021-2025"
  semester: { type: Number, required: true },
  section: { type: String, required: true }, // A, B, C
  cgpa: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  backlogs: [{ subject: String, semester: Number }],
  status: { type: String, enum: ['active', 'detained', 'alumni'], default: 'active' }
});

module.exports = mongoose.model('Student', studentSchema);
