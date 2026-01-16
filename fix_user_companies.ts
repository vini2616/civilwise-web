
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './server/src/models/User';

dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vini-app');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixUser = async () => {
    await connectDB();

    const username = 'coffin';
    const targetCompanyId = '6956f7e4f1311b51829023d2'; // "Test" company ID derived from user expectation (or I should find it)

    // Wait, I need the company ID.
    // The previous debug result for user "coffin" showed:
    // "companyId": "694cd6df0e6f6703bec365d2" (This is MARUTI PROCON likely)
    // The user wants to see "Test" company.
    // I don't have the "Test" company ID handy.
    // I should fetch ALL companies for the user to see what is available?
    // No, I will just fetch all companies and print them first.

    const companies = await mongoose.connection.db.collection('companies').find({}).toArray();
    console.log("Available Companies:", companies.map(c => ({ id: c._id, name: c.name })));

    const user = await User.findOne({ username });
    if (!user) {
        console.log("User not found");
        return;
    }

    console.log("Current User:", { id: user._id, name: user.name, companies: user.companies });

    // Find the company named "Test"
    const testCompany = companies.find(c => c.name === 'Test');
    if (testCompany) {
        console.log(`Found Test Company: ${testCompany._id}. Adding to user...`);

        // Use atomic update to be sure
        await User.updateOne(
            { _id: user._id },
            { $addToSet: { companies: testCompany._id } }
        );
        console.log("Update command sent.");

        const updatedUser = await User.findOne({ username });
        console.log("Updated User Companies:", updatedUser.companies);
    } else {
        console.log("Test Company not found in DB.");
    }

    process.exit();
};

fixUser();
