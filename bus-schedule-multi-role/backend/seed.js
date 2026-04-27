const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Schedule = require('./models/Schedule');
const User = require('./models/User');

dotenv.config();

const users = [
  { name: 'Dr. Rajesh Kumar', email: 'head@busnav.in', password: 'head@123', role: 'organisation_head', phone: '9876543210', department: 'Executive', isActive: true },
  { name: 'Priya Sundaram', email: 'priya@busnav.in', password: 'staff@123', role: 'staff', phone: '9876543211', department: 'Operations', isActive: true },
  { name: 'Arjun Muthukumar', email: 'arjun@busnav.in', password: 'staff@123', role: 'staff', phone: '9876543212', department: 'Scheduling', isActive: true },
  { name: 'Kavitha Rajan', email: 'kavitha@busnav.in', password: 'staff@123', role: 'staff', phone: '9876543213', department: 'Operations', isActive: true },
  { name: 'Senthil Murugan', email: 'senthil@gmail.com', password: 'cust@123', role: 'customer', phone: '9876501234', isActive: true },
  { name: 'Anitha Devi', email: 'anitha@gmail.com', password: 'cust@123', role: 'customer', phone: '9876501235', isActive: true },
  { name: 'Vikram Narayanan', email: 'vikram@gmail.com', password: 'cust@123', role: 'customer', phone: '9876501236', isActive: true },
  { name: 'Meena Lakshmi', email: 'meena@gmail.com', password: 'cust@123', role: 'customer', phone: '9876501237', isActive: true },
];

const buses = [
  { busNumber: 'TN01A1234', busName: 'Chennai Express', type: 'Express', capacity: 52, operator: 'TNSTC', amenities: ['AC', 'GPS', 'CCTV'], status: 'Active' },
  { busNumber: 'TN02B5678', busName: 'Coimbatore Flyer', type: 'Super Deluxe', capacity: 44, operator: 'SETC', amenities: ['AC', 'WiFi', 'Charging Port', 'GPS'], status: 'Active' },
  { busNumber: 'TN03C9012', busName: 'Madurai Rider', type: 'Ordinary', capacity: 60, operator: 'TNSTC', amenities: ['GPS'], status: 'Active' },
  { busNumber: 'TN04D3456', busName: 'Salem Sprinter', type: 'AC', capacity: 48, operator: 'SETC', amenities: ['AC', 'WiFi', 'Charging Port'], status: 'Active' },
  { busNumber: 'TN05E7890', busName: 'Trichy Navigator', type: 'Sleeper', capacity: 36, operator: 'TNSTC', amenities: ['AC', 'Charging Port', 'Water Bottle'], status: 'Active' },
  { busNumber: 'TN06F1122', busName: 'Tirunelveli Local', type: 'Ordinary', capacity: 60, operator: 'TNSTC', amenities: [], status: 'Maintenance' },
  { busNumber: 'TN07G3344', busName: 'Erode Cruiser', type: 'Non-AC', capacity: 55, operator: 'TNSTC', amenities: ['GPS'], status: 'Active' },
  { busNumber: 'TN08H5566', busName: 'Vellore Deluxe', type: 'Super Deluxe', capacity: 44, operator: 'SETC', amenities: ['AC', 'WiFi', 'GPS', 'CCTV'], status: 'Active' },
  { busNumber: 'TN09I7788', busName: 'Dindigul Runner', type: 'Express', capacity: 52, operator: 'TNSTC', amenities: ['AC', 'GPS'], status: 'Inactive' },
  { busNumber: 'TN10J9900', busName: 'Nagercoil Star', type: 'AC', capacity: 48, operator: 'SETC', amenities: ['AC', 'WiFi', 'Charging Port', 'GPS', 'CCTV'], status: 'Active' },
];

const routes = [
  { routeNumber: 'RT001', routeName: 'Chennai - Coimbatore Express', source: 'Chennai', destination: 'Coimbatore', stops: [{ name: 'Vellore', arrivalOffset: 90, distanceFromSource: 140 }, { name: 'Salem', arrivalOffset: 200, distanceFromSource: 340 }, { name: 'Erode', arrivalOffset: 270, distanceFromSource: 400 }], totalDistance: 500, estimatedDuration: 360, routeType: 'Interstate', status: 'Active' },
  { routeNumber: 'RT002', routeName: 'Chennai - Madurai Highway', source: 'Chennai', destination: 'Madurai', stops: [{ name: 'Villupuram', arrivalOffset: 120, distanceFromSource: 160 }, { name: 'Trichy', arrivalOffset: 270, distanceFromSource: 320 }], totalDistance: 460, estimatedDuration: 420, routeType: 'Interstate', status: 'Active' },
  { routeNumber: 'RT003', routeName: 'Trichy - Coimbatore Route', source: 'Trichy', destination: 'Coimbatore', stops: [{ name: 'Karur', arrivalOffset: 60, distanceFromSource: 75 }, { name: 'Namakkal', arrivalOffset: 100, distanceFromSource: 120 }], totalDistance: 210, estimatedDuration: 210, routeType: 'Express Highway', status: 'Active' },
  { routeNumber: 'RT004', routeName: 'Madurai - Tirunelveli Local', source: 'Madurai', destination: 'Tirunelveli', stops: [{ name: 'Kovilpatti', arrivalOffset: 60, distanceFromSource: 60 }], totalDistance: 130, estimatedDuration: 150, routeType: 'City', status: 'Active' },
  { routeNumber: 'RT005', routeName: 'Salem - Chennai Express', source: 'Salem', destination: 'Chennai', stops: [{ name: 'Vellore', arrivalOffset: 90, distanceFromSource: 110 }], totalDistance: 340, estimatedDuration: 300, routeType: 'Express Highway', status: 'Active' },
  { routeNumber: 'RT006', routeName: 'Coimbatore - Nagercoil Coastal', source: 'Coimbatore', destination: 'Nagercoil', stops: [{ name: 'Madurai', arrivalOffset: 150, distanceFromSource: 210 }, { name: 'Tirunelveli', arrivalOffset: 220, distanceFromSource: 300 }], totalDistance: 370, estimatedDuration: 300, routeType: 'Interstate', status: 'Active' },
  { routeNumber: 'RT007', routeName: 'Vellore - Trichy via Villupuram', source: 'Vellore', destination: 'Trichy', stops: [{ name: 'Villupuram', arrivalOffset: 75, distanceFromSource: 100 }, { name: 'Cuddalore', arrivalOffset: 100, distanceFromSource: 140 }], totalDistance: 280, estimatedDuration: 270, routeType: 'City', status: 'Active' },
  { routeNumber: 'RT008', routeName: 'Erode - Ooty Hill Express', source: 'Erode', destination: 'Ooty', stops: [{ name: 'Mettupalayam', arrivalOffset: 120, distanceFromSource: 100 }], totalDistance: 135, estimatedDuration: 180, routeType: 'Local', status: 'Under Review' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Cleared existing data');
    const createdUsers = await User.create(users);
    console.log('Created ' + createdUsers.length + ' users');
    const createdBuses = await Bus.insertMany(buses);
    const createdRoutes = await Route.insertMany(routes);
    console.log('Created ' + createdBuses.length + ' buses and ' + createdRoutes.length + ' routes');
    const schedules = [
      { bus: createdBuses[0]._id, route: createdRoutes[0]._id, departureTime: '06:00', arrivalTime: '12:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fare: 450, platform: 'P1', status: 'On Time' },
      { bus: createdBuses[1]._id, route: createdRoutes[0]._id, departureTime: '09:30', arrivalTime: '15:30', daysOfOperation: ['Mon','Wed','Fri','Sun'], fare: 600, platform: 'P3', status: 'On Time' },
      { bus: createdBuses[2]._id, route: createdRoutes[1]._id, departureTime: '07:00', arrivalTime: '14:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fare: 380, platform: 'P2', status: 'On Time' },
      { bus: createdBuses[3]._id, route: createdRoutes[1]._id, departureTime: '22:00', arrivalTime: '05:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fare: 550, platform: 'P4', status: 'On Time' },
      { bus: createdBuses[4]._id, route: createdRoutes[2]._id, departureTime: '08:00', arrivalTime: '11:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri'], fare: 220, platform: 'P1', status: 'On Time' },
      { bus: createdBuses[0]._id, route: createdRoutes[3]._id, departureTime: '10:00', arrivalTime: '12:30', daysOfOperation: ['Mon','Wed','Fri','Sat','Sun'], fare: 180, platform: 'P2', status: 'On Time' },
      { bus: createdBuses[1]._id, route: createdRoutes[4]._id, departureTime: '14:00', arrivalTime: '19:00', daysOfOperation: ['Mon','Tue','Thu','Sat'], fare: 320, platform: 'P5', status: 'Delayed' },
      { bus: createdBuses[2]._id, route: createdRoutes[0]._id, departureTime: '20:00', arrivalTime: '02:00', daysOfOperation: ['Fri','Sat','Sun'], fare: 500, platform: 'P3', status: 'On Time' },
      { bus: createdBuses[6]._id, route: createdRoutes[5]._id, departureTime: '05:30', arrivalTime: '10:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fare: 310, platform: 'P6', status: 'On Time' },
      { bus: createdBuses[7]._id, route: createdRoutes[6]._id, departureTime: '11:00', arrivalTime: '15:30', daysOfOperation: ['Tue','Thu','Sat'], fare: 240, platform: 'P2', status: 'On Time' },
      { bus: createdBuses[9]._id, route: createdRoutes[5]._id, departureTime: '18:30', arrivalTime: '23:30', daysOfOperation: ['Mon','Wed','Fri'], fare: 420, platform: 'P7', status: 'Delayed' },
      { bus: createdBuses[3]._id, route: createdRoutes[2]._id, departureTime: '13:00', arrivalTime: '16:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fare: 260, platform: 'P4', status: 'On Time' },
    ];
    await Schedule.insertMany(schedules);
    console.log('Created ' + schedules.length + ' schedules');
    console.log('\nDone! Login credentials:');
    console.log('  Head:     head@busnav.in / head@123');
    console.log('  Staff:    priya@busnav.in / staff@123');
    console.log('  Customer: senthil@gmail.com / cust@123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
