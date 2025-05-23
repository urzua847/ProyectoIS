import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://JuntaVecinos:bA194ktHHRgFaHrY@cluster0.hquycgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log('>>> DB is connected')
    } catch (error) {
        console.log(error);
    }
};