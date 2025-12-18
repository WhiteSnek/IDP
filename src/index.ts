import express, {Express} from 'express'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import helmet from "helmet";
import cors from "cors";

dotenv.config({
  path: './.env'
});

const app: Express = express();
const PORT = process.env.PORT || 3000;
console.log(process.env.DATABASE_URL);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use('/auth', authRouter);

app.get('/', (req,res) => {
    res.send('Everything working fine!');
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})