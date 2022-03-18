import * as mim from "mimbl"
import * as css from "mimcss"
import {DefaultDialogStyles, Dialog} from "./Dialog"


///////////////////////////////////////////////////////////////////////////////////////////////////
//
// Message box
//
///////////////////////////////////////////////////////////////////////////////////////////////////

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



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The MsgBoxIcon enumeration specifies values of predefined icons for message box.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export const enum MsgBoxIcon
{
	None = 0,
	Info,
	Warning,
	Error,
	Question,
}



/**
 * Default styles that will be used by the Popup if styles are not specified using options.
 */
export class MsgBoxStyles extends DefaultDialogStyles
{
    container = this.$class({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    })

    icon = this.$class({
        padding: css.rem(0.5),
        fontSize: css.em(3),
        fontWeight: 900,
    })

    text = this.$class({
        padding: 0.5,
        minWidth: css.em(15),
        maxWidth: css.em(60),
        minHeight: css.em(2),
        maxHeight: css.em(20),
        overflow: "auto",
        verticalAlign: "middle",
    })
}



/**
 * The MsgBox class is a dialog that displays a message with a set of pre-defined buttons.
 */
export class MsgBox extends Dialog<MsgBoxStyles>
{
    /**
     * Displays modal message box with the given parameters and returns a promise, which is
     * resolved when the user clicks on one of the buttons. The identifier of the button is used
     * as the promise's value.
     * @param message Content to be used in the message box's body.
     * @param title Content to display in the message box's caption.
     * @param buttons Identifier of a button ot button combination to be displayed.
     * @param icon Optional identifier of the icon to be displayed.
     * @returns Promise that is resolved with the identifier of the button clicked by the user.
     */
    public static showModal( message: string, title?: string,
                    buttons: MsgBoxButtonBar = MsgBoxButtonBar.OK,
                    icon: MsgBoxIcon = MsgBoxIcon.None,
                    defaultButton?: MsgBoxButton): Promise<MsgBoxButton>
	{
		let msgBox: MsgBox = new MsgBox( message, title, buttons, icon, defaultButton);
		return msgBox.showModal();
	}



	constructor( message: any, title?: string, buttons: MsgBoxButtonBar = MsgBoxButtonBar.OK,
					icon: MsgBoxIcon = MsgBoxIcon.None, defaultButton?: MsgBoxButton)
	{
        super( message, title, {
            styles: MsgBoxStyles,
            escapeReturnValue: buttons === MsgBoxButtonBar.None ? MsgBoxButton.Close : undefined,
            defaultButton
        });

		this.icon = icon;

		this.createButtons( buttons);
	}



	public renderBody(): any
	{
        let { char, color } = this.getIconClassAndColor();

        // we are using this.optionalStyles because we explicitly pass our styles in the options
        // parameter of the Dialog constructor.
		return <div class={this.optionalStyles.container}>
            {char && <span class={this.optionalStyles.icon} style={{color}}>{char}</span>}
            <span class={this.optionalStyles.text}>{this.content}</span>
        </div>;
	}



    /**
     * Returns the default style definition instance or class
     */
	protected getDefaultStyles(): MsgBoxStyles | css.IStyleDefinitionClass<MsgBoxStyles>
	{
        return MsgBoxStyles;
	};



    // Adds buttons according to the parameter specified in the constructor.
	private createButtons( buttons: MsgBoxButtonBar): void
	{
		switch( buttons)
		{
			case MsgBoxButtonBar.Close:
				this.createButton( "Close", MsgBoxButton.Close);
				break;

			case MsgBoxButtonBar.OK:
				this.createButton( "OK", MsgBoxButton.OK);
				break;

			case MsgBoxButtonBar.OkCancel:
				this.createButton( "OK", MsgBoxButton.OK);
				this.createButton( "Cancel", MsgBoxButton.Cancel, "Escape");
				break;

			case MsgBoxButtonBar.YesNo:
				this.createButton( "Yes", MsgBoxButton.Yes);
				this.createButton( "No", MsgBoxButton.No);
				break;

			case MsgBoxButtonBar.YesNoCancel:
				this.createButton( "Yes", MsgBoxButton.Yes);
				this.createButton( "No", MsgBoxButton.No);
				this.createButton( "Cancel", MsgBoxButton.Cancel, "Escape");
				break;
		}
	}

	// Returns symbol and color for displaying the icon.
	private getIconClassAndColor(): { char?: string, color?: css.CssColor }
	{
		switch( this.icon)
		{
			case MsgBoxIcon.Info: return { char: "i", color: "blue" };
			case MsgBoxIcon.Question: return { char: "?", color: "green" };
			case MsgBoxIcon.Warning: return { char: "!", color: "orange" };
			case MsgBoxIcon.Error: return { char: "x", color: "red" };

			default: return {};
		}
	}

	private createButton( text: string, id: MsgBoxButton, keycode?: string): void
	{
		this.addButton({ id, content: text, returnValue: id, keycode });
	}



	// Icon
	private icon: MsgBoxIcon;

}



