import * as mim from "mimbl"
import {Dialog, IDialogOptions} from "./Dialog"
import {IProgressStyles} from "./PopupStyles"



/**
 * Options defining progress dialog behavior
 */
export interface IProgressOptions extends IDialogOptions<IProgressStyles>
{
    /**
     * Text to show in the progress dialog caption
     */
    title?: string;

    /**
     * Value to return when the cancel button is clicked. If this property is null or not defined,
     * there will be no cancel button.
     */
    cancelReturnValue?: any;
}



/**
 * The ProgressBox class is a dialog that displays a progress indicator, a text and an optional
 * Cancel button.
 */
export class ProgressBox extends Dialog<IProgressStyles, IProgressOptions>
{
    /**
     * Displays the modal progress dialog with the given content and title, which is displayed until
     * the given promise is settled. The delayMilliseconds parameter controls whether the progress
     * box is displayed immediately or is delayed. If the input promise is settled before the
     * delay expires, the progress box is not displayed at all.
     * @param promise Promise to monitor - the progress box is displayed until this promise is settled.
     * @param content Content to be used in the progress box's body.
     * @param title Content to display in the progress box's caption.
     * @param delayMilliseconds Delay in milliseconds until which the progress box isn't displayed.
     * The default value is 750ms. To display the progress box immediately, set it to 0.
     * @returns Promise which is resolved ot rejected with the same value as the input promise.
     */
    public static async showUntil( promise: Promise<any>, content: any, title?: string,
        delayMilliseconds: number = 750): Promise<any>
	{
        let progress = new ProgressBox( content, {title});
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



	constructor( content?: string, options?: IProgressOptions)
	{
		super( content, options?.title, { styles: options?.styles });

        if (options?.cancelReturnValue != null)
            this.addButton({ id: 1, content: "Cancel", returnValue: options.cancelReturnValue });
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
    public async close( retVal?: any): Promise<void>
    {
        if (this.delayHandle > 0)
        {
            clearTimeout( this.delayHandle);
            this.delayHandle = 0;
        }

        return super.close( retVal);
    }



	public renderBody(): any
	{
        // we are using this.optionalStyles because we explicitly pass our styles in the options
        // parameter of the Dialog constructor.
		return <div class={this.styles.progressContainer}>
            <progress class={this.styles.progressElm} />
            <div class={this.styles.progressText}>
                {this.content}
            </div>
        </div>;
	}



    private showNow()
    {
        this.delayHandle = 0;
        this.showModal();
    }



    // Handle of the setTimeout call when openeing the popup with delay.
    private delayHandle = 0;
}



