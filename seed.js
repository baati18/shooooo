import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_db')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('Connection error:', err));

// Define schemas
const generalSalesSchema = new mongoose.Schema({
  magaca: String, time: String, date: Date, lacagta: Number
});

const dailyBreakdownSchema = new mongoose.Schema({
  magaca: String, time: String, date: Date, lacagta: Number
});

const customerCreditSchema = new mongoose.Schema({
  magaca: String, time: String, date: Date, lacagta_uhartay: Number
});

const outOfStockSchema = new mongoose.Schema({
  magaca: String, nooca: String, time: String, date: Date, qaangaadh: String
});

// Create models
const GeneralSales = mongoose.model('GeneralSales', generalSalesSchema);
const DailyBreakdown = mongoose.model('DailyBreakdown', dailyBreakdownSchema);
const CustomerCredit = mongoose.model('CustomerCredit', customerCreditSchema);
const OutOfStock = mongoose.model('OutOfStock', outOfStockSchema);

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      GeneralSales.deleteMany({}),
      DailyBreakdown.deleteMany({}),
      CustomerCredit.deleteMany({}),
      OutOfStock.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Create dates for last 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    // Seed General Sales
    const generalSalesData = [
      { magaca: 'Ahmed Ali', time: '10:30', date: dates[0], lacagta: 150 },
      { magaca: 'Fatima Hassan', time: '14:45', date: dates[0], lacagta: 275 },
      { magaca: 'Omar Farah', time: '09:15', date: dates[1], lacagta: 90 },
      { magaca: 'Hawa Ahmed', time: '16:20', date: dates[1], lacagta: 450 },
      { magaca: 'Mohamed Ali', time: '11:10', date: dates[2], lacagta: 320 }
    ];
    await GeneralSales.insertMany(generalSalesData);
    console.log('✅ Seeded General Sales');

    // Seed Daily Breakdown
    const dailyBreakdownData = [
      { magaca: 'Moos', time: '11:20', date: dates[0], lacagta: 45 },
      { magaca: 'Caano', time: '16:30', date: dates[0], lacagta: 30 },
      { magaca: 'Rooti', time: '08:45', date: dates[1], lacagta: 15 },
      { magaca: 'Sonkor', time: '13:15', date: dates[1], lacagta: 60 },
      { magaca: 'Shaah', time: '09:30', date: dates[2], lacagta: 25 }
    ];
    await DailyBreakdown.insertMany(dailyBreakdownData);
    console.log('✅ Seeded Daily Breakdown');

    // Seed Customer Credit
    const customerCreditData = [
      { magaca: 'Hodan Abdi', time: '13:10', date: dates[0], lacagta_uhartay: 500 },
      { magaca: 'Ali Muse', time: '15:20', date: dates[1], lacagta_uhartay: 250 },
      { magaca: 'Safia Osman', time: '10:05', date: dates[2], lacagta_uhartay: 750 },
      { magaca: 'Khadar Ahmed', time: '12:30', date: dates[2], lacagta_uhartay: 120 },
      { magaca: 'Asha Ibrahim', time: '17:45', date: dates[3], lacagta_uhartay: 890 }
    ];
    await CustomerCredit.insertMany(customerCreditData);
    console.log('✅ Seeded Customer Credit');

    // Seed Out of Stock
    const outOfStockData = [
      { magaca: 'Bur Blue Band', nooca: 'bur', time: '09:30', date: dates[0], qaangaadh: 'Dhamaaday' },
      { magaca: 'Sokor Gacan', nooca: 'sokor', time: '14:15', date: dates[1], qaangaadh: 'Dhamaaday' },
      { magaca: 'Shampoo Head & Shoulders', nooca: 'shampoo', time: '11:45', date: dates[2], qaangaadh: 'Dhamaaday' },
      { magaca: 'Bur Jowhar', nooca: 'bur', time: '10:20', date: dates[2], qaangaadh: 'Dhamaaday' },
      { magaca: 'Shampoo Sunsilk', nooca: 'shampoo', time: '16:00', date: dates[3], qaangaadh: 'Dhamaaday' }
    ];
    await OutOfStock.insertMany(outOfStockData);
    console.log('✅ Seeded Out of Stock');

    console.log('\n🎉 All data seeded successfully!');
    
    // Get counts
    const counts = await Promise.all([
      GeneralSales.countDocuments(),
      DailyBreakdown.countDocuments(),
      CustomerCredit.countDocuments(),
      OutOfStock.countDocuments()
    ]);

    console.log('\n📊 Database summary:');
    console.log(`General Sales: ${counts[0]} items`);
    console.log(`Daily Breakdown: ${counts[1]} items`);
    console.log(`Customer Credit: ${counts[2]} items`);
    console.log(`Out of Stock: ${counts[3]} items`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();