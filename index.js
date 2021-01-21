"use strict"
const fs = require('fs');
const fetch = require('node-fetch');
let converter = require('json-2-csv');
const AUTH = ''

const getMilestoneTime = (incident, milestoneType) => {
  const found = incident.milestones.filter(milestone => milestone.type === milestoneType)[0]
  if (found) {
    return found.occurred_at
  }
  return null;
}

const getRole = (incident, roleName) => {
  const found = incident.role_assignments.find(role => role.incident_role.name === 'Commander')
  if (found) {
    return found.user.name;
  }
  return null
}

let json2csvCallback = function (err, csv) {
  if (err) throw err;
  fs.writeFile('incidents.csv', csv, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
      console.log('It\'s saved!');
    }
  });
};

const getFireHydrantIncidentCount = (startDate = '2021-01-01') => {
  fetch(`https://api.firehydrant.io/v1/incidents?start_date=${startDate}`, {
    headers: {
      Authorization: AUTH,
    }
  }).then(res => res.json()).then(json => {
    return json.pagination.count;
  })
}

const getFireHydrantIncidents = (count = 100) => {
  fetch(`https://api.firehydrant.io/v1/incidents?per_page=${count}`, {
    headers: {
      Authorization: AUTH,
    }
  }).then(res => res.json())
  .then(json => {
    const parsed = json.data.map(incident => {
      return {
        number: incident.number,
        name: incident.name,
        severity: incident.severity,
        environment: incident.environments.map(environment => environment.name),
        functionality: incident.functionalities.map(functionality => functionality.name),
        service: incident.services.map(service => service.name),
        started: getMilestoneTime(incident, 'started'),
        detected: getMilestoneTime(incident, 'detected'),
        acknowledged: getMilestoneTime(incident, 'acknowledged'),
        first_action: getMilestoneTime(incident, 'first_action'),
        mitigated: getMilestoneTime(incident, 'mitigated'),
        resolved: getMilestoneTime(incident, 'resolved'),
        opened_at: incident.created_at,
        started_by: incident.created_by.name,
        elapsed_time: 123,
        customers_impacted: incident.customers_impacted,
        incident_commander: getRole(incident, 'Commander'),
        tickets: incident.incident_tickets.length > 0 ? incident.incident_tickets[0].attachments[0].display_text : 'none',
        slack: incident.channel_name
      }
    })
    converter.json2csv(parsed, json2csvCallback);
  });
}

const count = getFireHydrantIncidentCount('01-01-2021');
getFireHydrantIncidents(count)
