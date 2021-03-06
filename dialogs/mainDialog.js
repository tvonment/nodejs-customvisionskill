// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, EndOfConversationCodes, ConsoleTranscriptLogger, MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const { HandleAttachmentDialog, HANDLE_ATTACHMENT_DIALOG } = require('./handleAttachmentDialog');
const { NoAttachmentDialog, NO_ATTACHMENT_DIALOG } = require('./noAttachmentDialog');


const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        this.addDialog(new HandleAttachmentDialog());
        this.addDialog(new NoAttachmentDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {

        if (stepContext.context.activity.attachments && stepContext.context.activity.attachments.filter(x => x.contentType != "text/html").length > 0) {
            // The user sent an attachment and the bot should handle the incoming attachment.
            return await stepContext.beginDialog(HANDLE_ATTACHMENT_DIALOG);
        } else {
            return await stepContext.beginDialog(NO_ATTACHMENT_DIALOG);
        }
    }

    async finalStep(stepContext) {
        await stepContext.context.sendActivity(MessageFactory.text("Leave Skill"))
        await stepContext.context.sendActivity({
            type: ActivityTypes.EndOfConversation,
            code: EndOfConversationCodes.CompletedSuccessfully
        });
        return await stepContext.cancelAllDialogs();
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;