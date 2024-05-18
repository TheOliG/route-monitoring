A Cloud Based Solution For Monitoring The Travel Time Between Two Points (API Key Not Included)

The route name should be in the format XYZ-ABC eg: MEL-SYD

To add an active route use this link in the following format (remove the square brackets):
https://us-central1-route-monitoring-63aa5.cloudfunctions.net/addToActiveRoutes?routeName=[ROUTENAME]&start=[LAT,LNG]&dest=[LAT,LNG]

To get all the historical data use this link in the following format (remove the square brackets):
https://us-central1-route-monitoring-63aa5.cloudfunctions.net/exportData?routeName=[ROUTENAME]

If you want to download the data from the browser enter the URL in the correct format and right click and save as a .csv file.
Keep in mind that the first and last entries of this CSV file will contain html and need to be deleted.
Additionally the times are stored in Unix time https://en.wikipedia.org/wiki/Unix_time

GITHUB link: https://github.com/TheOliG/route-monitoring
