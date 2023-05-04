'use strict';

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const SunshineConversationsApi = require('sunshine-conversations-client');
const SmoochCore = require('smooch-core');







// Config
let defaultClient = SunshineConversationsApi.ApiClient.instance;
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'app_6453d17f6f359d7b427a3fcc';
basicAuth.password = '44qv6-2pyHBNNKCHbSk5lLC9KrBwMyxQE4WP-HQs017SPZnONIvALZIOvEziTRByybE3hgYwKGenBua4bvrP7g';
const PORT = 8000;

const apiInstance = new SunshineConversationsApi.MessagesApi()


const smooch = new SmoochCore({
  keyId: 'app_6453d17f6f359d7b427a3fcc',
  secret: '44qv6-2pyHBNNKCHbSk5lLC9KrBwMyxQE4WP-HQs017SPZnONIvALZIOvEziTRByybE3hgYwKGenBua4bvrP7g',
  scope: 'app' ,
  serviceUrl: 'https://api.smooch.io'// account or app
});

// Server https://expressjs.com/en/guide/routing.html
const app = express();

app.use(bodyParser.json());

// Expose /messages endpoint to capture webhooks https://docs.smooch.io/rest/#operation/eventWebhooks
app.post('/messages', function(req, res) {
  console.log('webhook PAYLOAD:\n', JSON.stringify(req.body, null, 4));

  const appId = req.body.app.id;
  const trigger = req.body.events[0].type;

  // Call REST API to send message https://docs.smooch.io/rest/#operation/postMessage
  if (trigger === 'conversation:message') {
    const authorType = req.body.events[0].payload.message.author.type;
    if(authorType === 'user'){
        const conversationId = req.body.events[0].payload.conversation.id;
        sendMessage(appId, conversationId);
        res.end();
    }
  }
});

//templates
smooch.templates.create({
  appId: 'app_6453d17f6f359d7b427a3fcc',
  props: {
      name: 'leads_capture',
      message: {
          type: 'form',
          role: 'appMaker',
          fields: [
              {
                  type: 'email',
                  name: 'email',
                  label: 'Email',
                  placeholder: ''
              },
              {
                  type: 'text',
                  name: 'company-website',
                  label: 'Company website',
                  placeholder: ''
              },
              {
                  type: 'select',
                  name: 'company-size',
                  label: 'Company size',
                  placeholder: 'Choose a number...',
                  options: [
                      {
                          name: '1-10',
                          label: '1-10 employees'
                      },
                      {
                          name: '11-50',
                          label: '11-50 employees'
                      },
                      {
                          name: '51-250',
                          label: '51-250 employees'
                      },
                      {
                          name: '251-1000',
                          label: '251-1000 employees'
                      },
                      {
                          name: '1001+',
                          label: '1001+ employees'
                      }
                  ]
              }
          ]
      }
  }
});

// Listen on port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

async function sendMessage(appId, conversationId){
    let messagePost = new SunshineConversationsApi.MessagePost();  
    messagePost.setAuthor({type: 'business'});
    messagePost.setContent({type: 'text', text: 'Live long and prosper %{{template: leads_capture}}%'});
    let response = await apiInstance.postMessage(appId, conversationId, messagePost);
    console.log('API RESPONSE:\n', response);
}
