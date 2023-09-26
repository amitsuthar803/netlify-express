const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Emi = require('./../models/emiModel');

dotenv.config({ path: `./../config.env` });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB connection successful!`));

const emis = JSON.parse(fs.readFileSync(`${__dirname}/data1.json`, 'utf-8'));

const importData = async () => {
  // create method can accept an array of Objects,so then it will then
  //  simply create a new Document for each of the object in the array
  try {
    await Emi.create(emis);
    console.log('Data successfully loaded!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Deleting all the old data same time when data loaded!
// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Emi.deleteMany();
    console.log('Data successfully deleted!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
