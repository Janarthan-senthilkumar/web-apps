require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Response = require('../models/Response');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/complaint_management';

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const complaintTemplates = [
    { title: 'WiFi not working in Block A', description: 'The WiFi in Block A hostel has been down for 3 days. Students are unable to access online resources for studies.', category: 'Infrastructure' },
    { title: 'Library books not available for Computer Science', description: 'Key textbooks for Algorithms and Data Structures are not stocked in the library. Only 2 copies available for 60 students.', category: 'Library' },
    { title: 'Classroom projector malfunctioning', description: 'The projector in Room 204 has been flickering and goes off during lectures. This disrupts the entire class.', category: 'Infrastructure' },
    { title: 'Late fee challan issued incorrectly', description: 'I paid my fees on time but still got a late fee challan. The accounts office is not responding to my queries.', category: 'Administrative' },
    { title: 'Bus route 3 schedule changed without notice', description: 'The timings for bus route 3 were suddenly changed which caused many students to miss morning classes.', category: 'Transport' },
    { title: 'Hostel mess food quality is poor', description: 'The quality of food in Boys Hostel mess has deteriorated significantly. Students are falling sick regularly.', category: 'Hostel' },
    { title: 'Professor not attending classes regularly', description: 'The Advanced Mathematics professor has missed 8 out of 15 lectures this semester with no substitute arrangement.', category: 'Academic' },
    { title: 'Lab computers very slow and outdated', description: 'The computers in the programming lab run Windows 7 and cannot handle modern development tools.', category: 'Infrastructure' },
    { title: 'Attendance marked incorrectly in portal', description: 'My attendance in the ERP portal shows 60% but I have attended all classes. Professor confirmed this but no correction made.', category: 'Academic' },
    { title: 'Drinking water not clean in campus', description: 'The RO water purifiers in the main building are not cleaned regularly. Water has a bad taste and smell.', category: 'Infrastructure' },
    { title: 'No inverter backup in examination hall', description: 'During mid-term exams, power went out for 20 minutes with no backup. Exam was disrupted and many students lost progress.', category: 'Infrastructure' },
    { title: 'Scholarship form deadline not communicated', description: 'The scholarship application deadline passed without any official notification to eligible students on the portal.', category: 'Administrative' },
    { title: 'Parking space insufficient for two-wheelers', description: 'There is severe shortage of two-wheeler parking. Students park on roads causing congestion and safety hazard.', category: 'Infrastructure' },
    { title: 'Sports equipment damaged and not replaced', description: 'The cricket and badminton equipment in the sports room is damaged. Replacement requests made 2 months ago with no action.', category: 'Other' },
    { title: 'Internal marks not uploaded on time', description: 'Internal assessment marks for 5 subjects are still not uploaded on the portal. Final exams are approaching.', category: 'Academic' },
    { title: 'Hostel room leakage during rain', description: 'Room 315 in Girls Hostel Block B has severe roof leakage during rains. The entire room gets wet damaging belongings.', category: 'Hostel' },
    { title: 'Medical room doctor not available', description: 'The campus medical room doctor is only present 2 hours per day. Students with urgent needs have no help.', category: 'Administrative' },
    { title: 'Canteen prices increased without notice', description: 'Canteen prices were suddenly hiked by 30-40% without any prior notice or explanation to students.', category: 'Administrative' },
    { title: 'Slow processing of bonafide certificates', description: 'Bonafide certificate requests are taking more than 2 weeks. Most institutions need it within 3-5 days.', category: 'Administrative' },
    { title: 'No CCTV coverage in cycle parking area', description: 'Several cycles have been stolen from the cycle stand. CCTV coverage is needed to prevent further thefts.', category: 'Infrastructure' },
    { title: 'AC not working in computer lab 2', description: 'The air conditioner in computer lab 2 has been non-functional for 2 weeks. The heat affects performance during practicals.', category: 'Infrastructure' },
    { title: 'Examination results delayed by 3 weeks', description: 'First year semester 1 results are delayed by 3 weeks without any official communication from the examination cell.', category: 'Academic' },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Complaint.deleteMany({});
        await Response.deleteMany({});
        await Notification.deleteMany({});
        console.log('🗑  Cleared existing data');

        // Create Admin (let pre-save hook hash the password)
        const admin = await User.create({
            name: 'Dr. Rajesh Kumar',
            email: 'admin@college.edu',
            password: 'Admin@123',
            role: 'admin',
            department: 'Administration',
            isActive: true
        });

        // Create Staff
        const staff1 = await User.create({
            name: 'Prof. Anita Sharma',
            email: 'staff1@college.edu',
            password: 'Staff@123',
            role: 'staff',
            department: 'Computer Science',
            isActive: true
        });
        const staff2 = await User.create({
            name: 'Mr. Suresh Patel',
            email: 'staff2@college.edu',
            password: 'Staff@123',
            role: 'staff',
            department: 'Infrastructure',
            isActive: true
        });
        const staff3 = await User.create({
            name: 'Ms. Priya Nair',
            email: 'staff3@college.edu',
            password: 'Staff@123',
            role: 'staff',
            department: 'Student Affairs',
            isActive: true
        });

        // Create Regular Users one by one (to trigger password hook)
        const u1 = await User.create({ name: 'Amit Verma', email: 'user1@college.edu', password: 'User@123', role: 'user', department: 'Computer Science', isActive: true });
        const u2 = await User.create({ name: 'Sneha Gupta', email: 'user2@college.edu', password: 'User@123', role: 'user', department: 'Mechanical Engineering', isActive: true });
        const u3 = await User.create({ name: 'Rahul Singh', email: 'user3@college.edu', password: 'User@123', role: 'user', department: 'Electrical Engineering', isActive: true });
        const u4 = await User.create({ name: 'Divya Menon', email: 'user4@college.edu', password: 'User@123', role: 'user', department: 'Civil Engineering', isActive: true });
        const u5 = await User.create({ name: 'Karan Mehta', email: 'user5@college.edu', password: 'User@123', role: 'user', department: 'Electronics', isActive: true });

        const users = [u1, u2, u3, u4, u5];
        console.log('👥 Created users (1 admin, 3 staff, 5 students)');

        const staffList = [staff1, staff2, staff3];

        // Create Complaints one by one (avoids insertMany timestamp issue)
        const createdComplaints = [];
        for (let i = 0; i < complaintTemplates.length; i++) {
            const tmpl = complaintTemplates[i];
            const submitter = users[i % users.length];
            const priority = priorities[i % priorities.length];

            let status, assignedTo, resolvedAt;
            if (i < 5) {
                status = 'Pending'; assignedTo = null; resolvedAt = null;
            } else if (i < 10) {
                status = 'In Progress'; assignedTo = staffList[i % staffList.length]._id; resolvedAt = null;
            } else if (i < 17) {
                status = 'Resolved'; assignedTo = staffList[i % staffList.length]._id;
                resolvedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            } else {
                status = 'Closed'; assignedTo = staffList[i % staffList.length]._id;
                resolvedAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
            }

            const c = await Complaint.create({
                title: tmpl.title,
                description: tmpl.description,
                category: tmpl.category,
                priority,
                status,
                submittedBy: submitter._id,
                assignedTo,
                department: submitter.department,
                resolvedAt,
            });
            createdComplaints.push(c);
        }
        console.log(`📋 Created ${createdComplaints.length} complaints`);

        // Create sample responses
        const responseMessages = [
            'We have received your complaint and are looking into it. Please allow 2-3 working days.',
            'The issue has been identified. Our maintenance team will fix it by tomorrow.',
            'We have escalated this to the concerned department head.',
            'The problem has been resolved. Please check and confirm.',
            'Thank you for reporting this. We are working on a permanent fix.',
            'The concerned faculty has been informed and corrective action is being taken.',
            'This has been resolved. Please visit the office if the issue persists.',
        ];

        let responseCount = 0;
        for (let i = 5; i < createdComplaints.length; i++) {
            const c = createdComplaints[i];
            const responderId = c.assignedTo ? c.assignedTo : admin._id;

            await Response.create({
                complaint: c._id,
                respondedBy: responderId,
                message: responseMessages[i % responseMessages.length],
                isInternal: false,
            });
            responseCount++;

            if (c.status === 'Resolved' || c.status === 'Closed') {
                await Response.create({
                    complaint: c._id,
                    respondedBy: responderId,
                    message: 'This complaint has been resolved. We apologize for the inconvenience caused. Please let us know if you need further assistance.',
                    isInternal: false,
                });
                responseCount++;
            }
        }
        console.log(`💬 Created ${responseCount} responses`);

        // Create notifications
        let notifCount = 0;
        for (const user of users) {
            const userComplaints = createdComplaints.filter(c => c.submittedBy.toString() === user._id.toString());
            for (const c of userComplaints.slice(0, 2)) {
                if (c.status !== 'Pending') {
                    await Notification.create({
                        user: user._id,
                        message: `Your complaint "${c.title}" status changed to ${c.status}`,
                        type: 'status',
                        relatedComplaint: c._id,
                        isRead: false,
                    });
                    notifCount++;
                }
            }
        }

        for (const c of createdComplaints.slice(0, 3)) {
            await Notification.create({
                user: admin._id,
                message: `New complaint submitted: "${c.title}"`,
                type: 'complaint',
                relatedComplaint: c._id,
                isRead: false,
            });
            notifCount++;
        }

        console.log(`🔔 Created ${notifCount} notifications`);
        console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!\n');
        console.log('📋 Demo Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 Admin    | admin@college.edu  | Admin@123');
        console.log('👨 Staff 1  | staff1@college.edu | Staff@123');
        console.log('👨 Staff 2  | staff2@college.edu | Staff@123');
        console.log('👨 Staff 3  | staff3@college.edu | Staff@123');
        console.log('🎓 User 1   | user1@college.edu  | User@123');
        console.log('🎓 User 2   | user2@college.edu  | User@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
