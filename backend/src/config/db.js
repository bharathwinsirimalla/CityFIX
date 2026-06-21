import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    const isSrvDnsError =
      err?.code === "ECONNREFUSED" ||
      err?.message?.includes("querySrv") ||
      err?.message?.includes("_mongodb._tcp");

    if (isSrvDnsError) {
      console.error(
        "MongoDB SRV/DNS resolution failed. Check Atlas host in MONGO_URI, DNS settings, or network restrictions."
      );
    }

    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

