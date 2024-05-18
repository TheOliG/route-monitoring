const testForm = document.getElementById("testForm");
const csvDataFile = document.getElementById("UploadFile");

testForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = csvDataFile.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const csvData = d3.csvParse(text);
    csvData.forEach(row => {
      try {
        let startLocation = row["From geo code"].replace(/ /g,'');
        let finishLocation = row["To geo code"].replace(/ /g,'');
        let routeName = row["Route Name"];
        console.log(`https://us-central1-route-monitoring-63aa5.cloudfunctions.net/addToActiveRoutes?routeName=${encodeURIComponent(routeName)}&start=${startLocation}&dest=${finishLocation}`)
        fetch(`https://us-central1-route-monitoring-63aa5.cloudfunctions.net/addToActiveRoutes?routeName=${encodeURIComponent(routeName)}&start=${startLocation}&dest=${finishLocation}`).then((response)=>{
          console.log(JSON.stringify(response));
        })
      } catch (error) {
        alert(`Cannot Add ${JSON.stringify(row)}`);
        console.log(error)
      }
      
      
    });
  };
  
  reader.readAsText(input);
});