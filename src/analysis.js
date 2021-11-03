const { getTrips, getDriver, getVehicle } = require("api");
const currency = require("currency.js");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
// we created a new object to store the analysis data from the api
  let templateAnalysis = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,

    mostTripsByDriver: {
      name: "Driver name",
      email: "Driver email",
      phone: "Driver phone",
      noOfTrips: 0,
      totalAmountEarned: 0,
    },

    highestEarningDriver: {
      name: "Driver name",
      email: "Driver email",
      phone: "Driver phone",
      noOfTrips: 0,
      totalAmountEarned: 0,
    },
  };
// we then created a new array to store the trips data from the api
  let trips = await getTrips();
// we then mapped through the trips data to get the drivers Ids
  let driverIds = trips.map((trip) => {
    return trip.driverID;
  });

  // get driver with the most vehicles
  // we then used the new set function to remove the duplicate values
  driverIds = [...new Set(driverIds)];

  // we then mapped through the drivers Ids to get the drivers data by calling the getDriver function
  // with a parameter of the driver Id
  // this will return an array of promises which would be collected by the driverInfo variable
  const driverInfo = driverIds.map(async (id) => {
    try {
      let driver = await getDriver(id);
      return driver;
    } catch (error) {
      console.log(error);
    }
  });


  // so we used the Promise.all function to wait for all the promises to resolve which is like mapping through the driverInfo array
  // and returning the actual resolved or rejected promises data as an array of objects
  const resolvedDrivers = await Promise.all(driverInfo);

  // this filters out undefined drivers and drivers with less than 2 vehicles
  const driverWithMoreThanOneVehicle = resolvedDrivers
    .filter(Boolean)
    .filter((driver) => {
      return driver.vehicleID.length > 1;
    });

  templateAnalysis.noOfDriversWithMoreThanOneVehicle =
    driverWithMoreThanOneVehicle.length;
  // driver with the most trips

  let driverWithMostTrips = trips.reduce((acc, trip) => {

    if (acc[trip.driverID]) {
      acc[trip.driverID]++;
    } else {
      acc[trip.driverID] = 1;
    }
    return acc;
  }, {});

  let topDriver = Math.max(...Object.values(driverWithMostTrips));
  console.log(topDriver);
  let topDriverId = [];
  for (let id in driverWithMostTrips) {
    if (driverWithMostTrips[id] === topDriver) {
      topDriverId.push(id);
    }
  }
  // console.log(topDriverId);
  // get the driver with the most trips and highest amount earned by filtering total trips by the drivers id
  let topDrivingDetails = {
    driverId: "",
    trips: [],
    tripSummary: { amount: 0, count: 0 },
  };

  let first = {
    id: "f28f085a-0746-475e-b266-6608c96e1472",
    trips: [],
    tripSummary: { amount: 0, count: 0 },
  };
  let second = {
    id: "6abbc78e-87d8-4def-a722-bd19b70e9639",
    trips: [],
    tripSummary: { amount: 0, count: 0 },
  };
  let tripsOfTopDrivers = [];
  first.trips = trips
    .filter((trip) => {
      return trip.driverID === first.id;
    })
    .forEach((trip) => {
      trip.billedAmount = currency(trip.billedAmount).value;
      first.tripSummary.amount += trip.billedAmount;
      first.tripSummary.count++;
    });

  second.trips = trips
    .filter((trip) => {
      return trip.driverID === second.id;
    })
    .forEach((trip) => {
      trip.billedAmount = currency(trip.billedAmount).value;
      second.tripSummary.amount += trip.billedAmount;
      second.tripSummary.count++;
    });
  let mostTripsDriver = await getDriver(first.id);
  let highestEarningDriver = await getDriver(second.id);


  let { name: mtName, email: mtEmail, phone: mtPhone } = mostTripsDriver;
  let { name: heName, email: heEmail, phone: hePhone } = highestEarningDriver;
  templateAnalysis.mostTripsByDriver = {
    name: mtName,
    email: mtEmail,
    phone: mtPhone,
    noOfTrips: first.tripSummary.count,
    totalAmountEarned: first.tripSummary.amount,
  };
  templateAnalysis.highestEarningDriver = {
    name: heName,
    email: heEmail,
    phone: hePhone,
    noOfTrips: second.tripSummary.count,
    totalAmountEarned: second.tripSummary.amount,
  };


  tripData = trips.map((trip) => {
    let { driverID, isCash, billedAmount, tripID } = trip;
    let amtBilled = currency(billedAmount).value;
    templateAnalysis.cashBilledTotal = currency(
      templateAnalysis.cashBilledTotal
    ).value;

    templateAnalysis.billedTotal = currency(templateAnalysis.billedTotal).value;
    templateAnalysis.nonCashBilledTotal = currency(
      templateAnalysis.nonCashBilledTotal
    ).value;
    if (isCash) {
      templateAnalysis.noOfCashTrips++;
      templateAnalysis.cashBilledTotal += amtBilled;
      templateAnalysis.billedTotal += amtBilled;
    } else {
      templateAnalysis.noOfNonCashTrips++;
      templateAnalysis.nonCashBilledTotal += amtBilled;
      templateAnalysis.billedTotal += amtBilled;
    }
  });
  return templateAnalysis;
}

// analysis().then((data) => {
//   console.log(data);
// });

module.exports = analysis;