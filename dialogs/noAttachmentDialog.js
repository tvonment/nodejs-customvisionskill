// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const NO_ATTACHMENT_DIALOG = 'NO_ATTACHMENT_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class NoAttachmentDialog extends ComponentDialog {
    constructor() {
        super(NO_ATTACHMENT_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        await stepContext.context.sendActivity('No Attachment, please upload an image.');
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.NoAttachmentDialog = NoAttachmentDialog;
module.exports.NO_ATTACHMENT_DIALOG = NO_ATTACHMENT_DIALOG;