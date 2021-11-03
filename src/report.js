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
  let template = [
    {
      fullName: "",
      id: "driver-id",
      phone: "driver phone",
      noOfTrips: 20,
      noOfVehicles: 2,
      vehicles: [
        {
          plate: "vehicle plate no",
          manufacturer: "vehicle manufacturer",
        },
      ],
      noOfCashTrips: 5,
      noOfNonCashTrips: 6,
      totalAmountEarned: 1000,
      totalCashAmount: 100,
      totalNonCashAmount: 500,
      trips: [
        {
          user: "User name",
          created: "Date Created",
          pickup: "Pickup address",
          destination: "Destination address",
          billed: 1000,
          isCash: true,
        },
        // ,... {}, {}
      ],
    },
    // ,...{}, {}
  ];
  let templateAnalysis = [];

  // get all trips using getTrips function
  let trips = await getTrips();
  console.log(trips);
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

  console.log(allDriverInfo);
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
    return vehicleInfo;
  }
  let driversInfoWithId = [];
  for (let i = 0; i < driverIDs.length; i++) {
    try {
      let driver = await getDriver(driverIDs[i]);
      driver = allDriverInfo.filter((oneDriver) => {
        if (oneDriver === driver) {
          // console.log(driver);
          // driver.id = driverIDs[i];
          driver["id"] = driverIDs[i];
          driversInfoWithId.push(driver);
          // driversInfoWithId.push(driver, { id: driverIDs[i] });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  console.log(driversInfoWithId);
  driversInfoWithId.forEach(async (driver) => {
    console.log(driver);
    let vehicleInfo = await getDriverVehicles(driver);
    console.log(vehicleInfo);
    driver.vehicles = vehicleInfo;
    templateAnalysis.fullName = driver.name;
    templateAnalysis.id = driver.id;
    templateAnalysis.phone = driver.phone;
    templateAnalysis.noOfTrips = trips.filter(
      (trip) => trip.driverID === driver.id
    ).length;
    templateAnalysis.noOfVehicles = driver.vehicleID.length;
    templateAnalysis.vehicles = vehicleInfo;
    templateAnalysis.noOfCashTrips = trips.filter(
      (trip) => trip.driverID === driver.id && trip.isCash === true
    ).length;
    templateAnalysis.noOfNonCashTrips = trips.filter(
      (trip) => trip.driverID === driver.id && trip.isCash === false
    ).length;
    templateAnalysis.totalAmountEarned = trips
      .filter((trip) => trip.driverID === driver.id)
      .reduce((acc, trip) => {
        return acc + currency(trip.billedAmount).value;
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
    templateAnalysis.trips = trips.filter(
      (trip) => trip.driverID === driver.id
    );
  });

  console.log(allDriverInfo.length);
  // allDriverInfo.forEach((oneDriverInfo) => {
  // let vehicleInfo = await getDriverVehicles(oneDriverInfo);
  // console.log(vehicleInfo);
  // let driverTemplate = {
  //   name: oneDriverInfo.name,
  //   id: oneDriverInfo.id,
  //   phone: oneDriverInfo.phone,
  //   // noOfTrips: oneDriverInfo.trips.length,
  //   noOfVehicles: vehicleID.length,
  //   vehicles: vehicleInfo,
  //   noOfCashTrips: oneDriverInfo.trips.filter((trip) => trip.isCash).length,
  //   noOfNonCashTrips: oneDriverInfo.trips.filter((trip) => !trip.isCash)
  //     .length,
  //   totalAmountEarned: oneDriverInfo.trips.reduce((acc, trip) => {
  //     return acc + trip.billed;
  //   }, 0),
  //   totalCashAmount: oneDriverInfo.trips
  //     .filter((trip) => trip.isCash)
  //     .reduce((acc, trip) => {
  //       return acc + trip.billed;
  //     }, 0),
  //   totalNonCashAmount: oneDriverInfo.trips
  //     .filter((trip) => !trip.isCash)
  //     .reduce((acc, trip) => {
  //       return acc + trip.billed;
  //     }, 0),
  //   trips: oneDriverInfo.trips,
  // };
  // templateAnalysis.push(driverTemplate);
  // });
  console.log(templateAnalysis);

  // for (let i = 0; i < allDriverInfo.length; i++) {
  // let driverVehicleInfo = getDriverVehicles(allDriverInfo[i]);

  // template[i].name = allDriverInfo[i].name;
  // templateAnalysis[i].id = allDriverInfo[i].id;
  // templateAnalysis[i].phone = allDriverInfo[i].phone;
  // templateAnalysis[i].noOfTrips = trips.filter(
  //   (trip) => trip.driverID === allDriverInfo[i].id
  // ).length;
  // templateAnalysis[i].noOfVehicles = allDriverInfo[i].vehicleID.length;
  // templateAnalysis[i].vehicles = await driverVehicleInfo;
  // templateAnalysis[i].noOfCashTrips = trips.filter(
  //   (trip) => trip.driverID === allDriverInfo[i].id && trip.isCash === true
  // ).length;
  // templateAnalysis[i].noOfNonCashTrips = trips.filter(
  //   (trip) => trip.driverID === allDriverInfo[i].id && trip.isCash === false
  // ).length;
  // templateAnalysis[i].totalAmountEarned = trips
  //   .filter((trip) => trip.driverID === allDriverInfo[i].id)
  //   .reduce((acc, curr) => acc + curr.billed, 0);
  // templateAnalysis[i].totalCashAmount = trips
  //   .filter(
  //     (trip) => trip.driverID === allDriverInfo[i].id && trip.isCash === true
  //   )
  //   .reduce((acc, curr) => acc + curr.billed, 0);
  // templateAnalysis[i].totalNonCashAmount = trips
  //   .filter(
  //     (trip) => trip.driverID === allDriverInfo[i].id && trip.isCash === false
  //   )
  //   .reduce((acc, curr) => acc + curr.billed, 0);
  // templateAnalysis[i].trips = trips.filter(
  //   (trip) => trip.driverID === allDriverInfo[i].id
  // );
  // }

  // let vehicleInfo = [];
  // allDriverInfo.forEach(async (driver) => {
  //   console.log(driver);
  //   let vehicleIDs = driver.vehicleID;
  //   // use the new set function to remove duplicate ids
  //   vehicleIDs = Array.from(new Set(vehicleIDs));
  //   // now to get all the vehicles we need to use the getVehicle function to get the vehicles by mapping the ids to the getVehicle function
  //   vehicleInfo = vehicleIDs.map(async (vehicleId) => {
  //     try {
  //       return await getVehicle(vehicleId);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });
  //   vehicleInfo = await Promise.all(vehicleInfo);
  //   console.log(vehicleInfo);
  // });
  console.log(templateAnalysis);
}

driverReport().then((data) => {
  console.log(data);
});

module.exports = driverReport;
