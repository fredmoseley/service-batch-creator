# Service Batch Creator

This is a Node.js script for the bulk creation of PagerDuty services using CSV data.

## CSV File Requirements
Create a CSV file with the following columns:
* `name`: The name of the service
* `description`: A short description of the service
* `auto_resolve_timeout`: The auto resolve timeout for the service (in miliseconds)
* `escalation_policy`: The ID of the escalation policy to associate with the service
  
For an example, please refer to the services.csv file.

## Steps to find the Escalation Policy ID in the PagerDuty Application
1. Login in to your [PagerDuty](https://www.pagerduty.com/) account.
2. Hover over the 'People' menu and select 'Escalation Policies'
3. Find the escalation policy you want to assign to your service.
4. Click on the name of the escalation policy to open its details page.
5. The policy_id is located at the end of the URL in the address bar.
Example url: https://<your-subdomain>.pagerduty.com/escalation_policies#<policy_id>

## Setup
Navigate to the root folder of the project, then:
1. Generate a .env file: `cp .env.example .env`
2. Add your PagerDuty API key to the .env file: 
   ```
    PAGERDUTY_API_KEY=
    PAGERDUTY_BASE_API_URL=https://api.pagerduty.com
   ```
3. Install the required dependencies: `npm install`

## Run the script
1. Run the script: `npm start <csv file path> <escalation policy ID>`


