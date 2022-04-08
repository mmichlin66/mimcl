import * as mim from "mimbl"
import * as css from "mimcss"
import {Dialog, IDialogOptions} from "./Dialog"
import {IMsgBoxStyles} from "./PopupStyles"



/**
 * The MsgBoxButton enumeration defines constants to indicate standard buttons used in dialogs.
 */
export const enum MsgBoxButton
{
	None = 0x0,
	OK = 0x1,
	Cancel = 0x2,
	Yes = 0x4,
	No = 0x8,
	Close = 0x10,
}



/**
 * The MsgBoxButton enumeration specifies values of predefined buttons and button combinations for
 * message boxes.
 */
export const enum MsgBoxButtonBar
{
	/** Message box will display no buttons */
	None = MsgBoxButton.None,

	/** Message box will have a single Close button */
	Close = MsgBoxButton.Close,

	/** Message box will have a single OK button */
	OK = MsgBoxButton.OK,

	/** Message box will have OK and Cancel buttons */
	OkCancel = MsgBoxButton.OK + MsgBoxButton.Cancel,

	/** Message box will have Yes and No buttons */
	YesNo = MsgBoxButton.Yes + MsgBoxButton.No,

	/** Message box will have Yes, No and Cancel buttons */
	YesNoCancel = MsgBoxButton.Yes + MsgBoxButton.No + MsgBoxButton.Cancel,
}



/**
 * The MsgBoxIcon enumeration specifies values of predefined icons for message box.
 */
export const enum MsgBoxIcon
{
	None = 0,
	Info,
	Warning,
	Error,
    Success,
	Question,
    Stop,
}



/**
 * Type defining the icon to be displayed in the message box. The `char` property defines the
 * Unicode character and the optional `color` property defines the color in which this character
 * should be displayed.
 */
export type MsgBoxIconInfo = {char: string, color?: css.CssColor};

export type MsgBoxIconType = MsgBoxIcon | string | MsgBoxIconInfo | undefined;



/**
 * Represents options that further define message box behavior
 */
export interface IMsgBoxOptions extends IDialogOptions<IMsgBoxStyles>
{
    /**
     * What buttons to show. Default vlue is MsgBoxButtonBar.OK
     */
    buttons?: MsgBoxButtonBar;

    /**
     * Icon to show.
     */
    icon?: MsgBoxIcon | string | MsgBoxIconInfo;

    /** Button that should be used as a default one */
    defaultButton?: MsgBoxButton;
}



/**
 * The MsgBox class is a dialog that displays a message with a set of pre-defined buttons.
 */
export class MsgBox extends Dialog<IMsgBoxStyles, IMsgBoxOptions>
{
    /**
     * Displays modal message box with the given parameters and returns a promise, which is
     * resolved when the user clicks on one of the buttons. The identifier of the button is used
     * as the promise's value.
     * @param message Content to be used in the message box's body.
     * @param options Options further defining the message box behavior including title, icon and
     * styles.
     * @returns Promise that is resolved with the identifier of the button clicked by the user.
     */
    public static showModal( message: string, options?: IMsgBoxOptions): Promise<MsgBoxButton>
	{
		let msgBox: MsgBox = new MsgBox( message, options);
		return msgBox.showModal();
	}



	constructor( message: any, options?: IMsgBoxOptions)
	{
        super( message, options ?? {});
        let buttons = options?.buttons ?? MsgBoxButtonBar.OK;
        this.options.escapeValue = buttons === MsgBoxButtonBar.None ? MsgBoxButton.Close : undefined;

		this.icon = options?.icon ?? MsgBoxIcon.None;

		this.createButtons( buttons);
	}



	public renderBody(): any
	{
        let { char, color } = this.getIconClassAndColor() ?? {};

        // we are using this.optionalStyles because we explicitly pass our styles in the options
        // parameter of the Dialog constructor.
		return <div class={this.styles.msgBoxContainer}>
            {char && <span class={this.styles.msgBoxIcon} style={{color}}>{char}</span>}
            <span class={this.styles.msgBoxText}>{this.body}</span>
        </div>;
	}



    // Adds buttons according to the parameter specified in the constructor.
	private createButtons( buttons: MsgBoxButtonBar): void
	{
		switch( buttons)
		{
			case MsgBoxButtonBar.Close:
				this.createButton( "Close", MsgBoxButton.Close, "Escape");
				break;

			case MsgBoxButtonBar.OK:
				this.createButton( "OK", MsgBoxButton.OK, "Enter");
				break;

			case MsgBoxButtonBar.OkCancel:
				this.createButton( "OK", MsgBoxButton.OK, "Enter");
				this.createButton( "Cancel", MsgBoxButton.Cancel, "Escape");
				break;

			case MsgBoxButtonBar.YesNo:
				this.createButton( "Yes", MsgBoxButton.Yes, "KeyY");
				this.createButton( "No", MsgBoxButton.No, "KeyN");
				break;

			case MsgBoxButtonBar.YesNoCancel:
				this.createButton( "Yes", MsgBoxButton.Yes, "KeyY");
				this.createButton( "No", MsgBoxButton.No, "KeyN");
				this.createButton( "Cancel", MsgBoxButton.Cancel, "Escape");
				break;
		}
	}

	// Returns symbol and color for displaying the icon.
	private getIconClassAndColor(): MsgBoxIconInfo | undefined
	{
        if (typeof this.icon === "string")
            return {char: this.icon};
        else if (typeof this.icon === "object")
            return this.icon;

		switch( this.icon)
		{
			case MsgBoxIcon.Info: return { char: "\u{1F6C8}", color: "blue" };
			case MsgBoxIcon.Warning: return { char: "\u26A0", color: "orange" };
			case MsgBoxIcon.Error: return { char: "\u{1F6AB}", color: "red" };
			case MsgBoxIcon.Success: return { char: "\u2705", color: "green" };
			case MsgBoxIcon.Question: return { char: "\uFF1F", color: "green" };
			case MsgBoxIcon.Stop: return { char: "\u{1F6D1}", color: "green" };

			default: return undefined;
		}
	}

	private createButton( text: string, id: MsgBoxButton, keycode?: string): void
	{
		this.addButton({ id, content: text, returnValue: id, keycode });
	}



	/** Icon */
	private icon: MsgBoxIcon | string | MsgBoxIconInfo;

}



