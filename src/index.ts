import express, {Express} from 'express'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import router from './routes';
import helmet from "helmet";
dotenv.config({
  path: './.env'
});

const app: Express = express();
const PORT = process.env.PORT || 3000;
console.log(process.env.DATABASE_URL);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use('/auth', router);

app.get('/', (req,res) => {
    res.send('Everything working fine!');
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})