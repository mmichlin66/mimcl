import * as mim from "mimbl"
import {IPopupOptions, IPopup, Popup} from "./Popup";
import {IDialogStyles} from "./PopupStyles"


/**
 * The IDialogButton interface describes a single button in the dialog's button bar.
 */
export interface IDialogButton
{
    /**
     * Unique identifier for the button. This ID is passed to the callback, which is called when
     * the button is clicked.
     */
    readonly id: any;

    /**
     * Callback, which is called when the button is clicked. If the callback is not defined, the
     * returnValue property must be defined.
     */
    readonly callback?: (id: any) => void;

    /**
     * Return value with which the dialog is closed when the button is clicked. This property is used
     * (and must be defined) only if the callback property is undefined.
     */
    readonly returnValue?: any;

    /**
     * Content to display in the button.
     */
    readonly content?: any;

    /**
     * Flag indicating whether the button is initially disabled. The default value is false; that
     * is, the button is enabled.
     */
    readonly disabled?: boolean;

    /**
     * Keyboard key or code associated with the button.
     */
    readonly keycode?: string;
}



/**
 * The IPopup interface represents a popup from the point of view of the content. This interface
 * is published as a service and can be used by the content components to close the popup.
 */
export interface IDialog extends IPopup
{
    /**
     * Adds a button to the button bar
     */
    addButton( btn: IDialogButton): void;

    /**
     * Returns the number of buttons in the button bar
     */
    readonly buttonCount: number;
}



/**
 * The IDialogOptions interface represents the options that cofigure the behavior of the Dialog
 * object. They are passed in the constructor to the [[Dialog]] class
 */
export interface IDialogOptions<TStyles extends IDialogStyles = IDialogStyles> extends IPopupOptions<TStyles>
{
    /**
     * Content for the dialog's caption.
     */
    caption?: any;

    /**
     * Identifier of the default button, which will have focus when the dialog appears.
     */
    defaultButton?: any;
}



/**
 * The Dialog class is a popup that divides the popup area into three sections: caption, body and
 * button bar. The caption area can be used to move the dialog around.
 */
export class Dialog<TStyles extends IDialogStyles = IDialogStyles,
    TOptions extends IDialogOptions<TStyles> = IDialogOptions<TStyles>>
    extends Popup<TStyles, TOptions> implements IDialog
{
    constructor( bodyContent?: any, options?: TOptions, ...buttons: IDialogButton[])
    {
        // we reuse the Popup's content property for dialog's body
        super( bodyContent, options);
        this.caption = options?.caption;

        for( let btn of buttons)
            this.addButton( btn);
    }



    /**
     * Adds a button to the button bar
     */
    public setCaption( caption: any): void
    {
        this.caption = caption;
        this.updateMe( this.renderCaption);
    }

    /**
     * Adds a button to the button bar
     */
    public addButton( btn: IDialogButton): void
    {
        let info = new DialogButtonInfo( btn, this.nextButtonTabIndex++);
        this.buttons.set( btn.id, info);
        if (btn.keycode)
            this.buttonKeys.set( btn.keycode, info)
    }

    /**
     * Returns the number of buttons in the button bar
     */
    public get buttonCount(): number { return this.buttons.size; }



    /**
     * If derived classes override this method, they must call super.willMount()
     */
    public willMount(): void
	{
        super.willMount();

        this.vn.publishService( "dialog", this);

        if (this.options?.defaultButton != null)
        {
            this.callMeAfterUpdate( () =>
            {
                let info = this.buttons.get( this.options?.defaultButton);
                info && info.ref.focus();
            })
        }
	}

    /**
     * If derived classes override this method, they must call super.willUnmount()
     */
	public willUnmount(): void
	{
        this.vn.unpublishService( "dialog");
        super.willUnmount();
	}

    public render(): any
    {
        return <div keydown={this.onButtonKeyDown} tabindex={0}>
            {this.renderCaption}
            {this.renderBody}
            {this.renderButtons}
        </div>
    }

    public renderCaption(): any
    {
        // have to specify touch-action "none" - otherwise, pointer events are canceled by the browser
        return this.caption &&
            <div class={this.styles.dialogCaption} pointerdown={this.onCaptionPointerDown} style={{touchAction: "none"}}>
                {this.caption}
            </div>
    }

    public renderBody(): any
    {
        return <div class={this.styles.dialogBody}>
            {this.content}
        </div>
    }

    public renderButtons(): any
    {
        return this.buttons.size > 0 &&
            <div class={this.styles.dialogButtonBar}>
                {Array.from( this.buttons.values()).map( info =>
                    <button id={info.btn.id} ref={info.ref} class={this.styles.dialogButton} click={() => this.onButtonClicked(info)}>
                        {info.btn.content}
                    </button>
                )}
            </div>
    }



    private onCaptionPointerDown( e: PointerEvent): void
    {
        // initiate move only on primary button down
        if (!e.isPrimary)
            return;

        e.preventDefault();
        this.startMove( e.clientX, e.clientY);
    }

    private onButtonClicked( info: DialogButtonInfo): void
    {
        if (info.btn.callback)
            info.btn.callback( info.btn.id);
        else
            this.close( info.btn.returnValue);
    }

    private onButtonKeyDown( e: KeyboardEvent): void
    {
        // check whether any button is associated with either the key or the code
        let info = this.buttonKeys.get( e.key);
        if (!info)
            info = this.buttonKeys.get( e.code);

        if (info)
        {
            e.preventDefault();
            this.onButtonClicked( info);
        }
    }



    // Content for the dialog's caption
    private caption: any;

    // Map of button IDs to button information objects
    @mim.trigger(3)
    private buttons = new Map<any, DialogButtonInfo>();

    // Map of keyboard key or code values to the button objects associated with them
    private buttonKeys = new Map<string, DialogButtonInfo>();

    // Tab index value to use for the next button to be added
    private nextButtonTabIndex = 1001;
}



/**
 * The DialogButtonInfo class contains current informtaion about a single button in the dialog's
 * button bar.
 */
class DialogButtonInfo
{
    constructor( btn: IDialogButton, tabIndex: number)
    {
        this.btn = btn;
        this.disabled = btn.disabled;
        this.tabIndex = tabIndex;
    }

    /** Input information about the button. */
    btn: IDialogButton;

    /** Refernce to the button element. */
    @mim.ref ref: HTMLButtonElement;

    /** Tab index to use for the button the button. */
    tabIndex: number;

    /** Flag indicating whether the button is currently disabled. */
    disabled: boolean;
}



