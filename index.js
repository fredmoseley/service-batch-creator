import { parse } from "csv-parse";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


/*
* Reads the CSV file and creates a PagerDuty service based on each row in the file.
* The escalation policy for each service is set to the ID provided in the
* escalationPolicyId argument that is passed in from the command line arguments.
* @param {string} csvPath - The path to the CSV file to read from.
* @param {string} escalationPolicyId - The ID of the escalation policy to use for each service.
*/
function readCsvFile(csvPath, escalationPolicyId) {
    const services = [];
    console.log(`Creating services from file ${csvPath}. \nUsing escalation policy id ${escalationPolicyId}\n`);
  
    fs.createReadStream(csvPath )
    .on("error", (error) => {
        console.error(error);
    })
    .pipe(parse({ columns: true, group_columns_by_name: true }))
    .on("data", (data) => services.push(data))
    .on("end", () => {
        const createServicesRepsonses = [];

        for (const service of services) {
            service.escalation_policy = {
                id: escalationPolicyId,
                type: "escalation_policy_reference"
            };
            createServicesRepsonses.push( createService(service)); 
        }

         Promise.allSettled(createServicesRepsonses).then(() => {
             console.log('Script complete!');
            });
    });
}

/**
* Posts a request to the PagerDuty /services API to create a new service.
* If the request fails, logs the error to the console.
* @param {Object} service - The service to be created
* @property {string} type - The type of the service
* @property {string} name - The name of the service
* @property {string} description - A short description of the service
* @property {number} auto_resolve_timeout - The auto resolve timeout for the service
* @returns {Promise<Response>} The response from the PagerDuty API
*/
async function createService(service) {
    const url = `${process.env.PAGERDUTY_BASE_API_URL}/services`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Token token=${process.env.PAGERDUTY_API_KEY}`
    };
        
    try {
        const body = JSON.stringify(service);
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        if (response.ok) {
            console.log(`Service created: ${service.name}`, {status: response.status, statusText: response.statusText})   
        } else {
            const responseText = await response.text();
            try {
                var responseObject = JSON.parse(responseText);
            } catch (error) {
                //The error is responseText is not JSON and can't be parsed. Print the responseText if it exists.
                responseText && console.error('responseText: ',responseText);
            }
            console.error(`Failed to create service. \nName: ${service.name} \nDescription: ${service.description} \nStatus: ${response.status} \nStatus Text: ${response.statusText} \nErrors: ${responseObject.error?.errors} \n`);
        }

        return response
    } catch (error) {
        console.error(error);
    }
}

if (process.argv.length < 4) {
    console.log("Arguments missing.");
    console.log("Usage: npm run start <csv path> <escalation policy ID>");
    process.exit(1);
}

readCsvFile(process.argv[2], process.argv[3]);