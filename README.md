# Description
This is a swagger API for housing the Bean-Dashboard.

This is the backbone for all features of the Dashboard.

# Requirements

## MetOffice API Keys
Use the following link to sign up to the
[MetOffice API](https://www.metoffice.gov.uk/services/data).
You will need to set up a new application, fill out all the details.
Write down the API key and Client ID.

(You will need to the longitude and latitude of your location later too)

## Google Search API Keys
Use the following link to sign up to the
[Google API](https://developers.google.com/custom-search/v1/overview).
Fill out all the details.
Write down the API key and CX.

### CREATE SSL CERTIFICATES
See the following link on how to generate all the SSL files:
[Generate SSL BASH ](https://gist.github.com/incendiarybean/69cb976b2b3400c8eea0e091f4f7adbb).

### TRUSTING CERTIFICATES FOR SSL
1. Copy CA from above steps to local PC.
2. Open Certificate Manager.
3. Open TRUSTED CA FOLDER.
4. Right click => All Tasks => Import => Select the CA and accept.
5. CA is now trusted and pages using that cert will now be VALID.

## SCRIPTS

In the project directory, you can run:

### `npm run start`

Runs the production build of swagger.yaml and begins the server.

### `npm run sd`

Runs the server API in development mode.\
This will only launch the API, and will be accessible via the PORT defined.

This uses NODEMON to hot-reload the server, this will crash with issues and relaunch when fixed.

### `npm run build`

Builds the app YAML file from API/SWAGGER/CONVERTER (using process.env for hostnames); you won't need to do this in DEV.

