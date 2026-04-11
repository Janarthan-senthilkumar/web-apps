const sequelize = require('./config/database');
const Inventory = require('./models/Inventory');
const DamageReport = require('./models/DamageReport');
const ReplacementRecord = require('./models/ReplacementRecord');
const User = require('./models/User');

const categories = [
    { name: 'Laptops', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', 'https://images.unsplash.com/photo-1531297122564-c28507f3650c?w=800&q=80', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'] },
    { name: 'Monitors', images: ['https://images.unsplash.com/photo-1527443224155-274e0d7c35cf?w=800&q=80', 'https://images.unsplash.com/photo-1586776974066-cdca1aa20d6f?w=800&q=80', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80', 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80'] },
    { name: 'Keyboards', images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', 'https://images.unsplash.com/photo-1587829743653-8a38d16d00df?w=800&q=80', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80', 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80'] },
    { name: 'Printers', images: ['https://images.unsplash.com/photo-1612815154558-2844304e5d61?w=800&q=80', 'https://images.unsplash.com/photo-1630132338902-11332f14309e?w=800&q=80', 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80'] },
    { name: 'Network equipment', images: ['https://images.unsplash.com/photo-1558494949-ef010cbd1f46?w=800&q=80', 'https://images.unsplash.com/photo-1544197150-b99a58022645?w=800&q=80'] },
    { name: 'Warehouse tools', images: ['https://images.unsplash.com/photo-1504917595217-d4fb505eba18?w=800&q=80', 'https://images.unsplash.com/photo-1581092918017-ea1575caeb64?w=800&q=80', 'https://images.unsplash.com/photo-1600880292089-90a7e086ee6c?w=800&q=80'] },
    { name: 'Office chairs', images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', 'https://images.unsplash.com/photo-1592078615290-070d5f2a1b5c?w=800&q=80', 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80'] },
    { name: 'Storage boxes', images: ['https://images.unsplash.com/photo-1554159516-728795da1823?w=800&q=80', 'https://images.unsplash.com/photo-1580674285054-ca31d61603d1?w=800&q=80'] },
    { name: 'Cables', images: ['https://images.unsplash.com/photo-1515286566812-a7d5fb05a0de?w=800&q=80', 'https://images.unsplash.com/photo-1550005898-150cc8eb808a?w=800&q=80'] },
    { name: 'Machinery tools', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80'] }
];

const damagedImages = [
    'https://images.unsplash.com/photo-1564756855-933390c2eb7d?w=800&q=80', // broken monitor
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', // broken screen
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee6c?w=800&q=80', // messy tools
    'https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=800&q=80',
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&q=80', // burnt internals
    'https://images.unsplash.com/photo-1519781542704-9a456bb64e40?w=800&q=80', // cracked phone/glass
    'https://images.unsplash.com/photo-1606400082772-520f922ebfa8?w=800&q=80'
];

const locations = ['IT Department', 'Warehouse A', 'Main Office', 'Conference Room 1', 'Storage Room B', 'Engineering Dept', 'Customer Service Dept', 'HR Office'];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function populateData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get users
        const staff = await User.findOne({ where: { role: 'staff' } });
        const supervisor = await User.findOne({ where: { role: 'supervisor' } });

        if (!staff || !supervisor) {
            console.log('Error: Run server.js first to seed users.');
            process.exit(1);
        }

        console.log('Clearing existing data (except users)...');
        await ReplacementRecord.destroy({ where: {} });
        await DamageReport.destroy({ where: {} });
        await Inventory.destroy({ where: {} });

        console.log('Inserting 100 inventory items...');
        const inventoryItemsToCreate = [];
        for (let i = 1; i <= 100; i++) {
            const categoryObj = randomChoice(categories);
            const rDate = randomDate(new Date(2023, 0, 1), new Date());
            inventoryItemsToCreate.push({
                name: `${categoryObj.name.split(' ')[0]} Model ${randomNumber(100, 999)}`,
                category: categoryObj.name,
                quantity: randomNumber(5, 50),
                location: randomChoice(locations),
                image_path: randomChoice(categoryObj.images),
                created_at: rDate,
                updated_at: rDate
            });
        }

        const createdItems = await Inventory.bulkCreate(inventoryItemsToCreate);
        console.log(`Inserted ${createdItems.length} inventory items.`);

        console.log('Inserting 20 damage reports...');
        const damageReportsToCreate = [];
        // Shuffle and pick 20 distinct inventory items
        const shuffledItems = [...createdItems].sort(() => 0.5 - Math.random());
        const damagedItems = shuffledItems.slice(0, 20);

        // Distributions: 15 Replaced, 3 Approved, 1 Pending, 1 Rejected (total 20)
        const statuses = [
            ...Array(15).fill('Replaced'),
            ...Array(3).fill('Approved'),
            'Pending',
            'Rejected'
        ];

        for (let i = 0; i < 20; i++) {
            const item = damagedItems[i];
            const status = statuses[i];
            const dDate = new Date(item.created_at.getTime() + Math.random() * (new Date().getTime() - item.created_at.getTime()));

            damageReportsToCreate.push({
                inventory_id: item.id,
                reported_by: staff.id,
                reviewed_by: status !== 'Pending' ? supervisor.id : null,
                damage_description: `Found severe damage to the ${item.category.toLowerCase()} during routine inspection. The unit is inoperable and needs attention.`,
                damage_date: dDate,
                damage_image_path: randomChoice(damagedImages),
                review_notes: status !== 'Pending' ? 'Reviewed and confirmed.' : null,
                status: status,
                created_at: dDate,
                updated_at: status !== 'Pending' ? new Date(dDate.getTime() + 86400000) : dDate
            });
        }

        const createdReports = await DamageReport.bulkCreate(damageReportsToCreate);
        console.log(`Inserted ${createdReports.length} damage reports.`);

        console.log('Inserting 15 replacement records...');
        const replacementRecordsToCreate = [];
        const replacedReports = createdReports.filter(r => r.status === 'Replaced');

        for (const report of replacedReports) {
            const rDate = new Date(report.updated_at.getTime() + Math.random() * 86400000 * 5); // 0-5 days after update
            replacementRecordsToCreate.push({
                damage_id: report.id,
                replacement_date: rDate,
                replacement_cost: randomNumber(50, 2000) + 0.99,
                notes: 'Replaced with a new unit from the main supplier.',
                created_at: rDate,
                updated_at: rDate
            });
            // Update inventory quantity since it was replaced (simulate the replacement controller behavior)
            const item = await Inventory.findByPk(report.inventory_id);
            if (item && item.quantity > 0) {
                await item.update({ quantity: item.quantity - 1 });
            }
        }

        await ReplacementRecord.bulkCreate(replacementRecordsToCreate);
        console.log(`Inserted ${replacementRecordsToCreate.length} replacement records.`);

        console.log('✅ Database successfully populated with realistic operational data.');
        process.exit(0);

    } catch (error) {
        console.error('Error populating database:', error);
        process.exit(1);
    }
}

populateData();
