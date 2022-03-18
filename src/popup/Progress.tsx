/**
 * This module contains definitions of [[Popup]], [[Dialog]] and [[MsgBox]] components.
 *
 * The [[Popup]] component is a base component that displays a popup usig the `<dialog>` HTML
 * element. The [[Dialog]] component derives from [[Popup]] and divides the popup area into
 * secontions for caption, body and button bar. Dialogs support moving around by clicking on the
 * caption area. The [[MsgBox]] component derives from [[Dialog]] and displays a message
 * optionally accompannied with an icon and a pre-defined set of buttons.
 */

import * as mim from "mimbl"
import * as css from "mimcss"
import {DefaultDialogStyles, Dialog} from "./Dialog"


/**
 * Default styles that will be used by the Popup if styles are not specified using options.
 */
export class ProgressBoxStyles extends DefaultDialogStyles
{
    container = this.$class({
        width: css.rem(30),
        height: css.rem(5),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around"
    })

    progress = this.$class({
        width: css.rem(20),
        height: css.rem(1),
        margin: css.rem(1)
    })

    text = this.$class({
        textAlign: "center",
    })

    constructor( parent?: css.StyleDefinition)
    {
        super(parent);
        this.dialogButtonBar.setProp( "justifyContent", "center")
    }
}



/**
 * The ProgressBox class is a dialog that displays a progress indicator, a text and an optional
 * Cancel button.
 */
export class ProgressBox extends Dialog<ProgressBoxStyles>
{
    /**
     * Displays the modal progress box with the given content and title, which is displayed until
     * the given promise is settled. The delayMilliseconds parameter controls whether the progress
     * box is displayed immediately or is delayed. If the input promise is settled before the
     * delay expires, the progress box is not displayed at all.
     * @param promise Promise to monitor - the progress box is displayed until this promis is settled.
     * @param content Content to be used in the progress box's body.
     * @param title Content to display in the progress box's caption.
     * @param delayMilliseconds Delay in milliseconds until which the progress box isn't displayed.
     * The default value is 750ms. To display the progress box immediately, set it to 0.
     * @returns Promise which is resolved ot rejected with the same value as the input promise.
     */
    public static async showUntil( promise: Promise<any>, content: any, title?: string,
        delayMilliseconds: number = 750): Promise<any>
	{
        let progress = new ProgressBox( content, title);
        progress.showModalWithDelay( delayMilliseconds);
        try
        {
            return await promise;
        }
        finally
        {
            progress.close();
        }
	}



	constructor( content?: string, title?: string, cancelReturnValue?: any)
	{
		super( content, title, { styles: ProgressBoxStyles });

        if (cancelReturnValue != null)
            this.addButton({ id: 1, content: "Cancel", returnValue: cancelReturnValue });
	}



    /**
     * Initiates displaying a progress box but doesn't really create it until the given timeout
     * expires. If the [[close]] method is called before the timeout expires, the popup isn't
     * created at all. This can be useful if you want the progress to reflect multiple operations
     * but don't show it if the operations finish quickly enough, for example:
     *
     * ```typescript
     * let progress = new Progress();
     * progress.showModalWithDelay( 1000);
     * progress.setContent( "First operation is in progress...")
     * performFirstOperation();
     * progress.setContent( "Second operation is in progress...")
     * performSecondOperation();
     * progress.close();
     * ```
     */
    public showModalWithDelay( delayMilliseconds: number): void
    {
        this.delayHandle = setTimeout( () => this.showNow(), delayMilliseconds);
    }

    /**
     * Closes the popup and passes a value to be used as a return value. For the modal popups,
     * this value will be the resolved value of the promise returned by the showModal() method.
     * For modeless popups, this value will be available as the returnValue property.
     * @param retVal
     */
    public close( retVal?: any): void
    {
        if (this.delayHandle > 0)
        {
            clearTimeout( this.delayHandle);
            this.delayHandle = 0;
        }

        super.close( retVal);
    }



	public renderBody(): any
	{
        // we are using this.optionalStyles because we explicitly pass our styles in the options
        // parameter of the Dialog constructor.
		return <div class={this.optionalStyles.container}>
            <progress class={this.optionalStyles.progress} />
            <div class={this.optionalStyles.text}>
                {this.content}
            </div>
        </div>;
	}



    /**
     * Returns the default style definition instance or class
     */
	protected getDefaultStyles(): ProgressBoxStyles | css.IStyleDefinitionClass<ProgressBoxStyles>
	{
        return ProgressBoxStyles;
	};



    private showNow()
    {
        this.delayHandle = 0;
        this.showModal();
    }



    // Handle of the setTimeout call when openeing the popup with delay.
    private delayHandle = 0;
}



