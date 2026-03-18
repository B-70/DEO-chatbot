const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL'];
const SECTIONS = ['A', 'B'];
const BATCHES = ['2021-2025', '2022-2026'];
const ACADEMIC_YEAR = '2024-25';
const SUBJECTS = {
  CSE: ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
  ECE: ['Digital Electronics', 'Signals & Systems', 'Embedded Systems', 'VLSI Design', 'Communication Systems'],
  MECH: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing Processes', 'Machine Design', 'Heat Transfer'],
  CIVIL: ['Structural Analysis', 'Soil Mechanics', 'Environmental Engineering', 'Transportation Engineering', 'Hydraulics']
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }

async function seedData() {
  // Clear all collections
  await Promise.all([User.deleteMany(), Student.deleteMany(), Attendance.deleteMany(), Marks.deleteMany()]);

  // Create users
  const users = [
    { username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', department: 'CSE', email: 'admin@university.edu', isVerified: true },
    { username: 'deo_cse', password: 'deo123', name: 'Alice Johnson', role: 'deo', department: 'CSE', email: 'alice@university.edu', isVerified: true },
    { username: 'deo_ece', password: 'deo123', name: 'Bob Kumar', role: 'deo', department: 'ECE', email: 'bob@university.edu', isVerified: true },
    { username: 'hod_cse', password: 'hod123', name: 'Dr. Priya Sharma', role: 'hod', department: 'CSE', email: 'priya@university.edu', isVerified: true },
    { username: 'faculty_cse', password: 'faculty123', name: 'Prof. Raj Verma', role: 'faculty', department: 'CSE', email: 'raj@university.edu', isVerified: true }
  ];
  for (const u of users) { await User.create(u); }

  // Create students
  let studentCount = 0;
  for (const dept of DEPARTMENTS) {
    for (const batch of BATCHES) {
      for (const section of SECTIONS) {
        const semester = batch === '2022-2026' ? rand(1, 4) : rand(5, 8);
        const count = rand(20, 30);
        for (let i = 1; i <= count; i++) {
          const year = batch.split('-')[0].slice(2);
          const rollNo = `${dept}${year}${section}${String(i).padStart(3, '0')}`;
          const cgpa = randFloat(4.5, 9.8);
          const backlogs = cgpa < 6 && Math.random() > 0.5 ? [{ subject: SUBJECTS[dept][0], semester: rand(1, Math.max(1, semester - 1)) }] : [];
          if (cgpa < 5.5 && Math.random() > 0.6) backlogs.push({ subject: SUBJECTS[dept][1], semester: rand(1, Math.max(1, semester - 1)) });

          const student = await Student.create({ rollNo, name: `${['Arjun','Priya','Ravi','Neha','Kiran','Deepa','Arun','Sita','Mohan','Lata'][i % 10]} ${dept}${i}`, email: `${rollNo.toLowerCase()}@student.edu`, department: dept, batch, semester, section, cgpa, backlogs, status: 'active' });

          for (const subject of SUBJECTS[dept]) {
            const total = rand(60, 90);
            // Generate a realistic spread: ~15% very low (45-59%), ~25% low (60-74%), ~60% good (75-100%)
            const attRoll = Math.random();
            let minAtt, maxAtt;
            if (attRoll < 0.15) { minAtt = Math.floor(total * 0.45); maxAtt = Math.floor(total * 0.59); }        // very low
            else if (attRoll < 0.40) { minAtt = Math.floor(total * 0.60); maxAtt = Math.floor(total * 0.74); }   // low
            else { minAtt = Math.floor(total * 0.75); maxAtt = total; }                                           // good
            const attended = rand(minAtt, maxAtt);
            await Attendance.create({ student: student._id, rollNo, subject, subjectCode: subject.slice(0, 6).toUpperCase(), department: dept, section, semester, batch, totalClasses: total, attendedClasses: attended, percentage: Math.round((attended / total) * 100), academicYear: ACADEMIC_YEAR });

            const internal = rand(10, 30);
            const external = rand(20, 70);
            await Marks.create({ student: student._id, rollNo, subject, subjectCode: subject.slice(0, 6).toUpperCase(), department: dept, section, semester, batch, academicYear: ACADEMIC_YEAR, internalMarks: internal, externalMarks: external, credits: rand(3, 4) });
          }
          studentCount++;
        }
      }
    }
  }
  console.log(`✅ Seeded: 5 users + ${studentCount} students with marks/attendance`);
}

// If run directly (node seed.js), connect to DB first
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dept_chatbot')
    .then(async () => {
      console.log('Connected'); await seedData();
      console.log('\n📋 Demo Credentials:\n  admin/admin123  |  deo_cse/deo123  |  hod_cse/hod123\n');
    })
    .catch(console.error)
    .finally(() => mongoose.disconnect());
} else {
  module.exports = seedData;
}
