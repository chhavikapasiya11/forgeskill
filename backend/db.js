
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb://chhavikapasiya39:chhavi39@undefined/?replicaSet=atlas-g6vhh9-shard-0&ssl=true&authSource=admin";
const connectToMongo = () => {
    mongoose
        .connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, 
        })
        .then(() => console.log("Connected to MongoDB successfully"))
        .catch((err) => console.error("Failed to connect to MongoDB:", err));
};
module.exports = connectToMongo;