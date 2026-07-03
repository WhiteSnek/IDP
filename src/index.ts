import express, {Express} from 'express'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import applicationRouter from './routes/application.route';
import oauthRouter from './routes/oauth.route';
import userAppRouter from './routes/user.application.route'
import helmet from "helmet";
import cors from "cors";
import { requestLogger } from './utils/requestLogger';
import serverless from "serverless-http";
dotenv.config({
  path: './.env'
});

const app: Express = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.FRONTEND_URL,          
  "http://localhost:5173",           
  "http://127.0.0.1:5173",
  "http://192.168.1.200:5173",       
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
app.use(requestLogger)
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/application', applicationRouter);
app.use('/oauth', oauthRouter);
app.use('/user/application', userAppRouter)

app.get('/', (req,res) => {
    res.send('Everything working fine!');
})

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);