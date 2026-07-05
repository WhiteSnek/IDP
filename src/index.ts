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

app.set("trust proxy", 1);

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

export const handler = serverless(app, {
  basePath: "/v1",
});