import * as mim from "mimbl"
import {Dialog, DialogButton} from "./Dialog"



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The MsgBox class is a dialog that displays a message with a set of pre-defined buttons.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class MsgBox extends Dialog
{
	public static showModal( message: string, title?: string, buttons: MsgBoxButtons = MsgBoxButtons.OK,
					icon: MsgBoxIcon = MsgBoxIcon.None): Promise<MsgBoxButtons>
	{
		let msgBox: MsgBox = new MsgBox( message, title, buttons, icon);
		return msgBox.showModal();
	}



	constructor( message: string, title?: string, buttons: MsgBoxButtons = MsgBoxButtons.OK,
					icon: MsgBoxIcon = MsgBoxIcon.None)
	{
		super();

		this.message = message;
		this.title = title;
		this.buttons = buttons;
		this.icon = icon;

		this.createButtons();
	}



	// Provides parameters for the caption.
	protected getCaptionAreaSlice(): mim.Slice
	{
		return { content: this.title, style: { backgroundColor: "DodgerBlue" } };
	}



	// Provides parameters for the main content area.
	protected getMainAreaSlice(): mim.Slice
	{
		let { cls, color } = this.getIconClassAndColor();
		let content: any =
			<div style={{display:"flex", alignItems:"start"}}>
				{cls && <i class={"fa fa-3x " + cls} style={{color:color}}/>}
				<div style={{marginLeft:"10px", minWidth:"15em", maxWidth:"40em", minHeight: "2em",
								maxHeight:"20em", overflow:"auto"}}>
					{this.message}
				</div>
			</div>;

		return { content };
	}



	// Adds buttons according to the parameter specified in the constructor.
	private createButtons(): void
	{
		switch( this.buttons)
		{
			case MsgBoxButtons.Close:
				this.createButton( "Close", DialogButton.Close);
				break;

			case MsgBoxButtons.OK:
				this.createButton( "OK", DialogButton.OK);
				break;

			case MsgBoxButtons.OkCancel:
				this.createButton( "OK", DialogButton.OK);
				this.createButton( "Cancel", DialogButton.Cancel);
				break;

			case MsgBoxButtons.YesNo:
				this.createButton( "Yes", DialogButton.Yes);
				this.createButton( "No", DialogButton.No);
				break;

			case MsgBoxButtons.YesNoCancel:
				this.createButton( "Yes", DialogButton.Yes);
				this.createButton( "No", DialogButton.No);
				this.createButton( "Cancel", DialogButton.Cancel);
				break;
		}
	}



	// Adds buttons according to the parameter specified in the constructor.
	private getIconClassAndColor(): { cls: string, color: string }
	{
		switch( this.icon)
		{
			case MsgBoxIcon.Info: return { cls: "fa-info-circle", color: "blue" };
			case MsgBoxIcon.Warning: return { cls: "fa-exclamation-triangle", color: "orange" };
			case MsgBoxIcon.Error: return { cls: "fa-minus-circle", color: "red" };
			case MsgBoxIcon.Question: return { cls: "fa-question-circle", color: "green" };

			default: return { cls: "", color: "" };
		}
	}



	private createButton( text: string, key: DialogButton): void
	{
		this.addButton( {content: text}, key, this.onButtonClicked);
	}



	private onButtonClicked = ( key: any): void =>
	{
		this.close( key);
	};



	// Message to be displayed in the main area
	private message: string;

	// Title to be displayed in the caption area
	private title: string;

	// Buttons
	private buttons: MsgBoxButtons;

	// Icon
	private icon: MsgBoxIcon;

}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The MsgBoxButton enumeration specifies values of predefined buttons and button combinations
// for message box.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export enum MsgBoxButtons
{
	None = 0,
	Close,
	OK,
	OkCancel,
	YesNo,
	YesNoCancel,
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The MsgBoxIcon enumeration specifies values of predefined icons for message box.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export enum MsgBoxIcon
{
	None = 0,
	Info,
	Warning,
	Error,
	Question,
}



