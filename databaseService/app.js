import express from 'express';
import cors from 'cors';
import TownsController from './towns/towns-controller';
import GamesController from './games/games-controller';
import UsersController from './users/users-controller';
import session from "express-session";
import "dotenv/config";
import mongoose from "mongoose";
import connectMongo from "connect-mongo";

// MongoDB Connection
const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;  // Moved to .env
console.log("Trying to connect to MongoDB...");
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

const app = express();

// Logging CORS
console.log('CORS is set for:', process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  })
);

const store = connectMongo.create({ mongoUrl: CONNECTION_STRING });

const sessionOptions = {
    secret: "any string",
    resave: false,
    saveUninitialized: false,
    store: store
};

if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
      sameSite: "none",
      secure: true,
    };
}

app.use(session(sessionOptions));
  
app.use(express.json());

// Logging for Debugging
app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
    next();
});

UsersController(app);
TownsController(app);
GamesController(app)

// Generic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
