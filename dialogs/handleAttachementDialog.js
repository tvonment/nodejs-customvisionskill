// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const axios = require('axios');

const HANDLE_ATTACHEMENT_DIALOG = 'HANDLE_ATTACHEMENT_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class HandleAttachementDialog extends ComponentDialog {
    constructor() {
        super(HANDLE_ATTACHEMENT_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.sendToCustomVisionStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        await stepContext.context.sendActivity('Attachement Dialog fired.');
        return await stepContext.next();
    }

    async sendToCustomVisionStep(stepContext) {
        console.log(stepContext.context.activity.attachments[0].content)

        await axios({
            method: 'post',
            url: 'https://tobomedcustomvision-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/e489f41e-bfd4-41aa-b2b8-addf90b8789a/classify/iterations/Iteration1/url',
            headers: {
                "Prediction-Key": process.env.CustomVisionKey,
                "Content-Type": "application/json"
            },
            data: {
                Url: stepContext.context.activity.attachments[0].content.downloadUrl
            }
        })
            .then(async (response) => {
                console.log(response);
                await stepContext.context.sendActivity(response);
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

module.exports.HandleAttachementDialog = HandleAttachementDialog;
module.exports.HANDLE_ATTACHEMENT_DIALOG = HANDLE_ATTACHEMENT_DIALOG;