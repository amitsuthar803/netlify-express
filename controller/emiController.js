const fs = require('fs');

const Emi = require('./../models/emiModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// allias middleware function
// exports.aliasTopEmi = (req, res, next) => {
//   req.query.sort = 'due_emi';

//   next();
// };

// html file
const tempOverview = fs.readFileSync(
  `${__dirname}./../templates/index.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}./../templates/card.html`,
  'utf-8'
);

const replacer = (temp, data) => {
  let output = temp.replace(/{%NAME%}/g, data.name);
  output = output.replace(/{%EMI_START%}/g, data.emi_start_date);
  output = output.replace(/{%DUE_EMI%}/g, data.due_emi);
  output = output.replace(/{%TOTAL_EMI%}/g, data.no_of_emi);
  output = output.replace(/{%MONTHLY_EMI%}/g, data.emi);
  return output;
};

const remMonth = (societyName) => {
  const currDate = new Date(); //month are 0 based so write 1 less
  const currYear = currDate.getFullYear();
  const currMonth = currDate.getMonth() + 1;

  // emi date
  const emiDate = new Date(societyName.emi_start_date);
  const emiYear = emiDate.getFullYear();
  const emiMonth = emiDate.getMonth();

  const diff = currYear * 12 + currMonth - (emiYear * 12 + emiMonth);
  const dueEmi = societyName.no_of_emi - diff;

  return dueEmi;
};
// REM EMI
const RemEmiFinder = (data) => {
  const looper = data.map((el) => {
    const remEmi = remMonth(el);
    el.due_emi = remEmi;

    return el;
  });
};

// Route handler

exports.getAllEmi = catchAsync(async (req, res, next) => {
  // 1) Filtering
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  //this loop can remove excludeFields from quarryobj and remaining store as it.
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);

  let query = Emi.find(JSON.parse(queryStr)); //{"name":"tulsi"}

  // 2) Sorting  / accending and decending order
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    //IMP query is final output
    query = query.sort(sortBy);
  } else {
    query = query.sort('date');
  }

  // 3) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    // excluding -__v in result , - means excluding
    query = query.select('-__v');
  }

  // 4) PAGINATION
  //1. first get the page and the limit from the query string and we should also define some default value
  const page = req.query.page * 1 || 1; //first we convert string to number then add default value
  const limit = req.query.limit * 1 || 100; //100 document per page
  const skip = (page - 1) * limit;

  // page=2&limit=1, 1-10, page 1  ,  11-20, page 2, 21-30 page 3

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numEmi = await Emi.countDocuments();
    // if the number of documents that we skip is greater than the number of document that actully exits.
    //then that means that the page does not exist
    if (skip >= numEmi) throw new Error('This page does not exist ');
  }

  //EXECUTE QUERY
  const emis = await query;

  // const emis = await Emi.find();

  RemEmiFinder(emis);

  const cardhtml = emis.map((el) => replacer(tempCard, el)).join('');

  const output = tempOverview.replace(`{%EMI%}`, cardhtml);

  res.end(output);

  // res.status(201).json({
  //   status: 'success',
  //   data: looper,
  // });
});

exports.getEmiByDate = catchAsync(async (req, res, next) => {
  const date = req.params.date * 1;

  const Emis = await Emi.find({ date: date });
  RemEmiFinder(Emis);
  if (Emis.length === 0) {
    throw 'There is no Emi on this date!!';
  }

  const cardhtml = Emis.map((el) => replacer(tempCard, el)).join('');

  const output = tempOverview.replace(`{%EMI%}`, cardhtml);

  if (!output) {
    return next(new AppError('No EMi found', 404));
  }

  res.end(output);

  // res.status(200).json({
  //   status: 'success',
  //   data: Emis,
  // });
});

// exports.getEmibyID = (req, res) => {
//   const id = req.params.id * 1;
//   const no = req.params.no * 1;

//   // finding society user by id
//   const societyByID = dataobj.find((el) => el.id === id);

//   if (!societyByID) {
//     return res.status(404).json({
//       status: "failed",
//       message: "invalid ID",
//     });
//   } else if (societyByID.data[no]) {
//     res.status(200).json({
//       status: "success",
//       data: {
//         society: societyByID.data[no],
//       },
//     });
//   } else {
//     res.status(200).json({
//       status: "success",
//       data: {
//         society: societyByID,
//       },
//     });
//   }
// };

// exports.getRemEmi = (req, res) => {
//   const no = req.params.no * 1;

//   console.log(dataobj[2]);

//   // // finding society user by id
//   const currObj = dataobj.find((el) => el.id === no);
//   const remEmi = remMonth(currObj, no);
//   const dueEmi = Object.assign(remEmi, currObj);

//   currObj.due_emi = dueEmi;

//   res.status(201).json({
//     status: "success",
//     data: currObj,
//   });
// };

/**
#115 catching error in async function 
now we don't need catch becoz it tranfer to catchAsync fn 

 */

exports.createEmi = catchAsync(async (req, res, next) => {
  const newEmi = await Emi.create(req.body);

  res.status(201).json({
    status: 'success',

    data: {
      newEmi,
    },
  });
  // try {
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: 'Invalid Data Sent!!',
  //   });
  // }
});

exports.updateEmi = catchAsync(async (req, res, next) => {
  const Emis = await Emi.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      Emis,
    },
  });
});

exports.deleteEmi = catchAsync(async (req, res, next) => {
  const Emis = await Emi.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
