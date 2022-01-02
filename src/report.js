const { getTrips, getDriver, getVehicle } = require("api");

const currency = require("currency.js");
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  // Your code goes here

  let templateHolder = [];

  // get all trips using getTrips function
  let trips = await getTrips();

  // console.log(trips);
  // get all drivers using getDriver function by getting all the drivers ids from the trips
  let driverIDs = trips.map((trip) => trip.driverID);
  // use the new set function to remove duplicate ids
  driverIDs = Array.from(new Set(driverIDs));
  // now to get all the drivers we need to use the getDriver function to get the drivers by mapping the ids to the getDriver function
  let allDriverInfo = driverIDs.map(async (driverId) => {
    try {
      return await getDriver(driverId);
    } catch (err) {
      console.log(err);
    }
  });
  allDriverInfo = await Promise.all(allDriverInfo);

  // console.log(allDriverInfo);
  // filter out falsy or undefined values from the driverInfo array
  allDriverInfo = allDriverInfo.filter(Boolean);

  // get all vehicles using getVehicle function by getting all the vehicle ids from the drivers
  // create a getDriver vehicle function to get the vehicles of a particular driver to the from the driverInfo array
  async function getDriverVehicles(oneDriverInfo) {
    let vehicleIds = oneDriverInfo.vehicleID;

    vehicleIds = Array.from(new Set(vehicleIds));
    let vehicleInfo = vehicleIds.map(async (vehicleId) => {
      try {
        return await getVehicle(vehicleId);
      } catch (err) {
        console.log(err);
      }
    });
    vehicleInfo = await Promise.all(vehicleInfo);
    vehicleInfo = vehicleInfo.filter(Boolean);
    console.log(vehicleInfo);
    return vehicleInfo;
  }
  let driversInfoWithId = [];
  for (let i = 0; i < driverIDs.length; i++) {
    try {
      let driver = await getDriver(driverIDs[i]);
      driver = allDriverInfo.filter((oneDriver) => {
        if (oneDriver === driver) {
          driver["id"] = driverIDs[i];
          driversInfoWithId.push(driver);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  driversInfoWithId.forEach(async (driver) => {
    let templateAnalysis = {};
    let driverVehicleInfo = await getDriverVehicles(driver);
    console.log(driverVehicleInfo);
    let vehicleDetails = driverVehicleInfo.map((data) => {
      let { plate, manufacturer } = data;
      return { plate, manufacturer };
    });
    templateAnalysis.fullName = driver.name;
    templateAnalysis.id = driver.id;
    templateAnalysis.phone = driver.phone;

    // let noOfTrips = 0;
    // let noOfCashTrips = 0;

    // trips.forEach((trip) => {
    //   if (trip.driverID === driver.id) {
    //     noOfTrips++;
    //     if (trip.paymentMethod === "Cash") {
    //       noOfCashTrips++;
    //     }
    //   }
    // }

    templateAnalysis.noOfTrips = trips.filter(
      (trip) => trip.driverID === driver.id
    ).length;
    templateAnalysis.noOfVehicles = driver.vehicleID.length;
    templateAnalysis.vehicle = vehicleDetails;
    templateAnalysis.noOfCashTrips = trips.filter(
      (trip) => trip.driverID === driver.id && trip.isCash === true
    ).length;
    templateAnalysis.noOfNonCashTrips = trips.filter(
      (trip) => trip.driverID === driver.id && trip.isCash === false
    ).length;
    templateAnalysis.totalAmountEarned = trips
      .filter((trip) => trip.driverID === driver.id)
      .reduce((acc, trip) => {
        trip.billedAmount = currency(trip.billedAmount).value;
        return currency(acc).value + currency(trip.billedAmount).value;
      }, 0);
    templateAnalysis.totalCashAmount = trips
      .filter((trip) => trip.driverID === driver.id && trip.isCash === true)
      .reduce((acc, trip) => {
        return acc + currency(trip.billedAmount).value;
      }, 0);
    templateAnalysis.totalNonCashAmount = trips
      .filter((trip) => trip.driverID === driver.id && trip.isCash === false)
      .reduce((acc, trip) => {
        return acc + currency(trip.billedAmount).value;
      }, 0);
    templateHolder.push(templateAnalysis);
  });

  console.log(templateHolder);

  return templateHolder;
}

driverReport().then((data) => {
  console.log(data);
});

module.exports = driverReport;
