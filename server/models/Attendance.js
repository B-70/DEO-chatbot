const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String },
  department: { type: String, required: true },
  section: { type: String, required: true },
  semester: { type: Number, required: true },
  batch: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  academicYear: { type: String, required: true } // e.g., "2024-25"
});

attendanceSchema.pre('save', function (next) {
  if (this.totalClasses > 0) {
    this.percentage = Math.round((this.attendedClasses / this.totalClasses) * 100);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
