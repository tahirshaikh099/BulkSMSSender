require('dotenv').config();
const fs = require('fs').promises;
const axios = require('axios');

const apiKey = process.env.API_KEY;


async function sendSms(message) {
  try {
    const response = await axios.post('https://z11x66.api.infobip.com/sms/2/text/advanced', message, {
      headers: {
        'Authorization': `App ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}


async function processCsv() {
  try {
    const fileData = await fs.readFile('messages.csv', 'utf8');
    const rows = fileData.trim().split('\n');
    let updatedCsv = 'SenderId,MSISDN,messageId,description\n';

    // Skip the header row (first row) and start processing from the second row.
    for (let i = 1; i < rows.length; i++) {
      
      const [SenderId, MSISDN] = rows[i].split(',');
      
      const messageId = Math.floor(Math.random() * 1000000).toString();

      const msisdns = rows.slice(1).map((line) => line.split(',')[1]);
      // Create a batch of SMS messages with the MSISDNs
      const messages = msisdns.map((MSISDN) => {
        return {
          destinations: [{ to: MSISDN }],
          from: 'InfoSMS',
          text: 'This is a sample SMS message sent to you by Infobip',
        };
      });
      const batchData = { messages: messages };

      const response = await sendSms(batchData);
      // console.log("responseeee :-",JSON.stringify(response.messages[0].status.description))

      updatedCsv += `${SenderId},${MSISDN},${messageId},${response.messages[0].status.description}\n`;
    }

    await fs.writeFile('messages.csv', updatedCsv, 'utf8');
    console.log('CSV file processing complete.');
  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
}

processCsv();