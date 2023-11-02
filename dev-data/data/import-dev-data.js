const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../model/tourModel');

const db =
  'mongodb+srv://balaji:Balaji2002@cluster0.zgkm2.mongodb.net/natour?retryWrites=true';

const tourdata = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('connected'));

const importData = async () => {
  try {
    await Tour.create(tourdata);
    console.log('successfuly created');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deletData = async () => {
  console.log('in delete');
  try {
    await Tour.deleteMany();
    console.log('all the tours are deleted');
  } catch (err) {
    console.log(`the error is ${err}`);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletData();
}

console.log(process.argv);
