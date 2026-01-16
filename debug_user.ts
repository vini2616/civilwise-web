import mongoose from 'mongoose';
import User from './server/src/models/User';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        const user = await User.findOne({ username: 'coffin' });
        console.log("User:", user?.name);
        console.log("CompanyId:", user?.companyId);
        console.log("Companies:", user?.companies);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
