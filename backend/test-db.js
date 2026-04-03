import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

console.log("Testing connection to:", MONGO_URI.replace(/:([^@]+)@/, ":****@"));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connection successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed!");
    console.error(err);
    process.exit(1);
  });
