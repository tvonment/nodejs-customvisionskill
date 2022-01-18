// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const axios = require('axios');

const HANDLE_ATTACHMENT_DIALOG = 'HANDLE_ATTACHMENT_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class HandleAttachmentDialog extends ComponentDialog {
    constructor() {
        super(HANDLE_ATTACHMENT_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.sendToCustomVisionStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        await stepContext.context.sendActivity('Thank you, I will analyze your image.');
        return await stepContext.next();
    }

    async sendToCustomVisionStep(stepContext) {
        await axios({
            method: 'post',
            url: process.env.CustomVisionUrl,
            headers: {
                "Prediction-Key": process.env.CustomVisionKey,
                "Content-Type": "application/json"
            },
            data: {
                Url: stepContext.context.activity.attachments[0].content.downloadUrl
            }
        })
            .then(async (response) => {
                await stepContext.context.sendActivity(response.data.predictions[0].tagName + " with an " + response.data.predictions[0].probability + " probability");
            })
            .catch((error) => {
                console.log(error);
            });

        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.HandleAttachmentDialog = HandleAttachmentDialog;
module.exports.HANDLE_ATTACHMENT_DIALOG = HANDLE_ATTACHMENT_DIALOG;