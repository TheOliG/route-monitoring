Project for monitoring the time it takes between two routes 24/7, takes data every 15 minutes

The route name should be in the format XYZ-ABC eg: MEL-SYD

To add an active route use the following format (remove the square brakets):
https://us-central1-route-monitoring-63aa5.cloudfunctions.net/addToActiveRoutes?routeName=[ROUTENAME]&start=[LAT,LNG]&dest=[LAT,LNG]

To get all the historical data use the following format (remove the square brakets):
https://us-central1-route-monitoring-63aa5.cloudfunctions.net/exportData?routeName=[ROUTENAME]

If you want to download the data from browser enter the URL in the correct format and right click and save as .csv
(keep in mind that the first and last entries of this CSV file will contain html and need to be deleted)

GITHUB link: https://github.com/TheOliG/route-monitoring