const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String },
  department: { type: String, required: true },
  section: { type: String, required: true },
  semester: { type: Number, required: true },
  batch: { type: String, required: true },
  academicYear: { type: String, required: true },
  internalMarks: { type: Number, default: 0 },     // out of 30
  externalMarks: { type: Number, default: 0 },     // out of 70
  totalMarks: { type: Number, default: 0 },        // out of 100
  grade: { type: String },                          // O, A+, A, B+, B, C, F
  gradePoints: { type: Number, default: 0 },
  credits: { type: Number, default: 3 },
  result: { type: String, enum: ['Pass', 'Fail', 'Absent', 'Withheld'], default: 'Pass' }
});

marksSchema.pre('save', function (next) {
  this.totalMarks = this.internalMarks + this.externalMarks;
  if (this.totalMarks >= 90) { this.grade = 'O'; this.gradePoints = 10; }
  else if (this.totalMarks >= 80) { this.grade = 'A+'; this.gradePoints = 9; }
  else if (this.totalMarks >= 70) { this.grade = 'A'; this.gradePoints = 8; }
  else if (this.totalMarks >= 60) { this.grade = 'B+'; this.gradePoints = 7; }
  else if (this.totalMarks >= 50) { this.grade = 'B'; this.gradePoints = 6; }
  else if (this.totalMarks >= 40) { this.grade = 'C'; this.gradePoints = 5; }
  else { this.grade = 'F'; this.gradePoints = 0; }
  this.result = this.totalMarks >= 40 && this.externalMarks >= 28 ? 'Pass' : 'Fail';
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
