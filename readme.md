Running CSV Exporter
What you need:
* [A bot token from FireHydrant](https://app.firehydrant.io/organizations/bots/new)
* Node installed
* Yarn installed

1: Put your bot token into the AUTH constant on line 5

2: Select the date you want to pull incidents starting from on line 78

3: run `node index.js`

4: The script will create a CSV of the incident data from the date specified and place it into the folder where `index.js` is stored.