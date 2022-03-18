import * as mim from "mimbl"
import * as css from "mimcss"
import {DefaultPopupStyles, IPopup, IPopupOptions, IPopupStyles, Popup} from "./Popup";


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
 * The IDialogStyles interface defines styles used by the Dialog class to create different elements
 * of the dialog. The implementations should provide class rules for the following properties:
 * - dialogCaption
 * - dialogBody
 * - dialogButtonBar
 * - dialogButton
 */
export interface IDialogStyles extends IPopupStyles
{
    /**
     * Defines what CSS class to use for the caption section.
     */
    readonly dialogCaption?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the body section.
     */
    readonly dialogBody?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the button bar section.
     */
    readonly dialogButtonBar?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the buttons.
     */
    readonly dialogButton?: css.ClassPropType;
}



/**
 * Default styles that will be used by the Popup if styles are not specified using options.
 */
export class DefaultDialogStyles extends DefaultPopupStyles implements IDialogStyles
{
    dialogCaption = this.$class({
        backgroundColor: "dodgerblue",
        color: "white",
        boxShadow: { x: 0, y: 2, blur: 2, color: "lightgrey" },
        padding: 0.4,
    })

    dialogBody = this.$class({
        padding: 0.7,
    })

    dialogButtonBar = this.$class({
        // backgroundColor: "lightgrey",
        padding: [0.7, 1.01],
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
    })

    dialogButton = this.$class({
        padding: 0.3,
        marginInlineStart: 1.01,
        minWidth: 5.5,
        border: "none",
        backgroundColor: 0xf2f2f2,
		":hover": {
			backgroundColor: 0xe2e2e2,
		},
		":focus": {
            backgroundColor: 0xe2e2e2,
            outline: [1, "solid", 0xa2a2a2],
		}
    })
}



/**
 * The IDialogOptions interface represents the options that cofigure the behavior of the Dialog
 * object. They are passed in the constructor to the [[Dialog]] class
 */
export interface IDialogOptions<TStyles extends IDialogStyles = IDialogStyles> extends IPopupOptions<TStyles>
{
    /**
     * Defines what CSS class to use for the caption section.
     */
    readonly dialogCaptionStyleClass?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the body section.
     */
    readonly dialogBodyStyleClass?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the button bar section.
     */
    readonly dialogButtonBarStyleClass?: css.ClassPropType;

    /**
     * Defines what CSS class to use for the buttons.
     */
    readonly dialogButtonStyleClass?: css.ClassPropType;

    /**
     * Identifier of the default button, which will have focus when the dialog appears.
     */
    readonly defaultButton?: any;
}



/**
 * The Dialog class is a popup that divides the popup area into three sections: caption, body and
 * button bar. The caption area can be used to move the dialog around.
 */
export class Dialog<TStyles extends IDialogStyles = IDialogStyles,
            TOptions extends IDialogOptions<TStyles> = IDialogOptions<TStyles>>
            extends Popup<TStyles,TOptions> implements IDialog
{
    constructor( bodyContent?: any, captionContent?: any, options?: TOptions, ...buttons: IDialogButton[])
    {
        // we reuse the Popup's content property for dialog's body
        super( bodyContent, options);

        this.captionContent = captionContent;

        for( let btn of buttons)
            this.addButton( btn);
    }



    /**
     * Adds a button to the button bar
     */
    public setCaption( captionContent: any): void
    {
        this.captionContent = captionContent;
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
     * Returns the default style definition instance or class
     */
	protected getDefaultStyles(): TStyles | css.IStyleDefinitionClass<TStyles>
	{
        return DefaultDialogStyles as css.IStyleDefinitionClass<TStyles>;
	};



    /**
     * If derived classes override this method, they must call super.willMount()
     */
    public willMount(): void
	{
        super.willMount();

        // obtain class names for our elements
        this.captionClassName = css.chooseClass( this.options?.dialogCaptionStyleClass,
            this.optionalStyles?.dialogCaption, this.defaultStyles.dialogCaption);
        this.bodyClassName = css.chooseClass( this.options?.dialogBodyStyleClass,
            this.optionalStyles?.dialogBody, this.defaultStyles.dialogBody);
        this.buttonBarClassName = css.chooseClass( this.options?.dialogButtonBarStyleClass,
            this.optionalStyles?.dialogButtonBar, this.defaultStyles.dialogButtonBar);
        this.buttonClassName = css.chooseClass( this.options?.dialogButtonStyleClass,
            this.optionalStyles?.dialogButton, this.defaultStyles.dialogButton);

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
        return <div keydown={this.onButtonKeyDown}>
            {this.renderCaption}
            {this.renderBody}
            {this.renderButtons}
        </div>
    }

    public renderCaption(): any
    {
        // have to specify touch-action "none" - otherwise, pointer events are canceled by the browser
        return <div class={this.captionClassName} pointerdown={this.onCaptionPointerDown} style={{touchAction: "none"}}>
            {this.captionContent}
        </div>
    }

    public renderBody(): any
    {
        return <div class={this.bodyClassName}>
            {this.content}
        </div>
    }

    public renderButtons(): any
    {
        return <div class={this.buttonBarClassName}>
            {Array.from( this.buttons.values()).map( info =>
                <button id={info.btn.id} ref={info.ref} class={this.buttonClassName} click={() => this.onButtonClicked(info)}>
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



    // Map of button IDs to button information objects
    @mim.trigger
    private captionContent: any;

    // Map of button IDs to button information objects
    @mim.trigger(3)
    private buttons = new Map<any, DialogButtonInfo>();

    // Map of keyboard key or code values to the button objects associated with them
    private buttonKeys = new Map<string, DialogButtonInfo>();

    // Tab index value to use for the next button to be added
    private nextButtonTabIndex = 1001;

    // Class name to use for the caption
    private captionClassName: string;

    // Class name to use for the body
    private bodyClassName: string;

    // Class name to use for the button bar
    private buttonBarClassName: string;

    // Class name to use for the buttons
    private buttonClassName: string;
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



