const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  // handling bugs and expection in the code
  console.log('unhandled exception💢...shuting the server down');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

///database connection
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Db is connected');
  });

//console.log(process.env.PORT);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  // handling promise rejections, like mogoose bad auth
  console.log('unhandled Rejection💢...shuting the server down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
