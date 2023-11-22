const axios = require('axios').default;
const functions = require('firebase-functions'); 
const admin = require('firebase-admin');
admin.initializeApp();


exports.monitorAllRoutes = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const bulkWriter = db.bulkWriter()

  // We get all of the active routes stored in the database 
  const activeRoutesSnapshot = await db.collection(`activeRoutes`).get();
  const activeRoutesArray = [];
  const queryArray = [];

  try {
    // We itterate through all the active routes
    activeRoutesSnapshot.forEach(doc =>{

      const reqBody = {
        "origin":{
          "location":{
            "latLng":{
              "latitude": doc.data().startLat,
              "longitude": doc.data().startLng
            }
          }
        },
        "destination":{
          "location":{
            "latLng":{
              "latitude": doc.data().finishLat,
              "longitude": doc.data().finishLng
            }
          }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL",
        "computeAlternativeRoutes": false,
        "routeModifiers": {
          "avoidTolls": false,
          "avoidHighways": false,
          "avoidFerries": true
        },
        "languageCode": "en-US"
      };
  
      const reqHeader = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': '', // YOUR API KEY HERE
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      };
  
      activeRoutesArray.push(doc.ref.path);
      // We make the API call to the google routes server and store the unresolved promise
      queryArray.push(axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        reqBody,
        { headers: reqHeader }
      ));

    });
  

    for(let i = 0; i<queryArray.length; i++){
      const queryResponse = await queryArray[i];
      const queryData = queryResponse.data.routes[0];

      // We set the new document to be called the current time and include all of the data
      bulkWriter.set(db.doc(`${activeRoutesArray[i]}/historicalData/${Date.now().toString()}`),{
        distanceMeters: queryData.distanceMeters, 
        durationSeconds: parseInt(queryData.duration.slice(0,-1)),
        encodedPolyline: queryData.polyline.encodedPolyline,
        time: Date.now()
      })
    }
    
    await bulkWriter.flush();

  } catch (error) {

    console.log(error);

  }

  return null;
});

exports.exportData = functions.https.onRequest(async (req, res) => {

  const db = admin.firestore();
  let returnString = '';

  if(!('routeName' in req.query)){
    res.status(400).send('Improperly Formatted Query');
  }

  try{
    const activeRoutesSnapshot = await db.collection(`activeRoutes/${req.query.routeName}/historicalData`).get();

    activeRoutesSnapshot.forEach((doc)=>{
      returnString+=`${doc.data().time.toString()},`;
      returnString+=`${doc.data().durationSeconds.toString()}\n`;
    })

    res.status(200).send(returnString);
  }
  catch (error) {
    console.log(error);
    res.status(500).send('Server Error, Firestore or Google API may be down');
  }
  return;

});


exports.addToActiveRoutes = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  let setData = {};

  try {
    const startArr = req.query.start.split(',');
    const finishArray = req.query.dest.split(',');
    setData = {
      active: true,
      startLat: parseFloat(startArr[0]),
      startLng: parseFloat(startArr[1]),
      finishLat: parseFloat(finishArray[0]),
      finishLng: parseFloat(finishArray[1])
    }
  } catch (error) {
    res.status(400).send('Improperly Formatted Query');
    return;
  }
  
  if(!('routeName' in req.query)){
    res.status(400).send('Improperly Formatted Query');
    return;
  }
  
  await db.doc(`activeRoutes/${req.query.routeName}`).set(setData).catch((error)=>{
    res.status(500).send('Could Not Update Database');
    return;
  });
  
  res.status(200).send('Success');
  return;
});