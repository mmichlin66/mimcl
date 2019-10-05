import * as mim from "mimbl"
import {Popup} from "./Popup"



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The Dialog class is a popup with three distinct areas: caption, main content and buttons.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class Dialog extends Popup
{
	// The constructor accepts Slice for the three dialog areas: caption, main content and buttons.
	// They can be left undefined if a derived class overrides the appropriate render methods.
	constructor( captionAreaSlice?: mim.Slice, mainAreaSlice?: mim.Slice, buttonAreaSlice?: mim.Slice, dlgSlice?: mim.Slice)
	{
		super(dlgSlice);

		this.captionAreaSlice = captionAreaSlice ? captionAreaSlice : {};
		this.mainAreaSlice = mainAreaSlice ? mainAreaSlice : {};
		this.buttonAreaSlice = buttonAreaSlice ? buttonAreaSlice : {};

		// create default parameters if this is the first time a Dialog is created
		if (!Dialog.DefaultCaptionAreaSlice)
			Dialog.DefaultCaptionAreaSlice = { style: {background:"pink", padding:"0.5em 1em", cursor:"default"} };
		if (!Dialog.DefaultMainAreaSlice)
			Dialog.DefaultMainAreaSlice = { style: {padding:"0.5em 1em"} };
		if (!Dialog.DefaultButtonAreaSlice)
			Dialog.DefaultButtonAreaSlice = { style: {display:"flex", justifyContent:"flex-end", padding:"0.5em 1em"} };
		if (!Dialog.DefaultButtonSlice)
			Dialog.DefaultButtonSlice = { style: {marginLeft:"0.5em", minWidth:"5em"} };
	}



	// Adds button with the given characteristics. The key parameter indicates the value that is
	// passed to the callback when the button is clicked. The optional index parameter specifies
	// the index at which the button should be added.
	public addButton( slice: mim.Slice, key?: any, callback?: (key: any) => void, index?: number): void
	{
		let info: DlgBtnInfo = { slice, key, callback, ref: new mim.Ref<HTMLButtonElement>() };
		if (index === undefined)
			this.buttonInfos.push( info);
		else if (index === 0)
			this.buttonInfos.unshift( info);
		else
			this.buttonInfos.splice( index - 1, 0, info);

		if (this.buttonAreaProxy)
			this.buttonAreaProxy.update();
	}



	// Removes the button at the given index.
	public removeButton( index: number): void
	{
		this.buttonInfos.splice( index, 1);

		if (this.buttonAreaProxy)
			this.buttonAreaProxy.update();
	}



	// Provides parameters for the <dialog> element.
	protected getDlgSlice(): mim.Slice
	{
		this.captionAreaProxy = new mim.FuncProxy( () =>
		{
			let captionAreaSlice: mim.Slice = mim.mergeSlices( Dialog.DefaultCaptionAreaSlice, this.getCaptionAreaSlice());
			return <div id="dlgCaption" mousedown={this.onStartMove} style={captionAreaSlice.style}
							class={captionAreaSlice.className} {...captionAreaSlice.props}>
				{captionAreaSlice.content}
			</div>
		});

		this.mainAreaProxy = new mim.FuncProxy( () =>
		{
			let mainAreaSlice: mim.Slice = mim.mergeSlices( Dialog.DefaultMainAreaSlice, this.getMainAreaSlice());
			return <div id="dlgMainContent" style={mainAreaSlice.style} class={mainAreaSlice.className} {...mainAreaSlice.props}>
				{mainAreaSlice.content}
			</div>
		});

		this.buttonAreaProxy = new mim.FuncProxy( () =>
		{
			let buttonAreaSlice: mim.Slice = mim.mergeSlices( Dialog.DefaultButtonAreaSlice, this.getButtonAreaSlice());
			return <div id="dlgButtons" style={buttonAreaSlice.style} class={buttonAreaSlice.className} {...buttonAreaSlice.props}>
				{buttonAreaSlice.content}
				{this.buttonInfos.map( (info) =>
					{
						let btnSlice: mim.Slice = mim.mergeSlices( Dialog.DefaultButtonSlice, info.slice);
						return <button key={info.key} click={info.callback && (() => info.callback(info.key))}
								style={btnSlice.style} class={btnSlice.className} {...btnSlice.props}>
							{btnSlice.content}
						</button>
					})
				}
			</div>
		});

		let content: any =
			<mim.Fragment>
				{this.captionAreaProxy}
				{this.mainAreaProxy}
				{this.buttonAreaProxy}
			</mim.Fragment>;

		return { content };
	}



	// Provides parameters for the caption.
	protected getCaptionAreaSlice(): mim.Slice
	{
		return this.captionAreaSlice;
	}



	// Provides parameters for the main content area.
	protected getMainAreaSlice(): mim.Slice
	{
		return this.mainAreaSlice;
	}



	// Provides parameters for the button area.
	protected getButtonAreaSlice(): mim.Slice
	{
		return this.buttonAreaSlice;
	}



	// Called when the user puts mouse down in the caption area
	private onStartMove = (e: MouseEvent) =>
	{
		this.startMove( e);
	};



	// Parameters for caption area
	private captionAreaSlice: mim.Slice;
	public get CaptionAreaSlice(): mim.Slice { return this.captionAreaSlice; }
	public set CaptionAreaSlice( val: mim.Slice) { this.captionAreaSlice = val; }

	// Parameters for main area
	private mainAreaSlice: mim.Slice;
	public get MainAreaSlice(): mim.Slice { return this.mainAreaSlice; }
	public set MainAreaSlice( val: mim.Slice) { this.mainAreaSlice = val; }

	// Parameters for buttons area
	private buttonAreaSlice: mim.Slice;
	public get ButtonAreaSlice(): mim.Slice { return this.buttonAreaSlice; }
	public set ButtonAreaSlice( val: mim.Slice) { this.buttonAreaSlice = val; }

	// Array of buttons added to the dialog
	private buttonInfos: DlgBtnInfo[] = [];

	// Proxy component responsible for updating the caption area
	private captionAreaProxy: mim.FuncProxy;

	// Proxy component responsible for updating the main area
	private mainAreaProxy: mim.FuncProxy;

	// Proxy component responsible for updating the button area
	private buttonAreaProxy: mim.FuncProxy;

	// Default parameters for caption area
	public static DefaultCaptionAreaSlice: mim.Slice;

	// Default parameters for main area
	public static DefaultMainAreaSlice: mim.Slice;

	// Default parameters for buttons area
	public static DefaultButtonAreaSlice: mim.Slice;

	// Default parameters for a button element
	public static DefaultButtonSlice: mim.Slice;

}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DlgBtnInfo class is a helper class that keeps information about a button added to the dialog.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
type DlgBtnInfo =
{
	slice: mim.Slice,
	key: any,
	callback: (key: any) => void,
	ref: mim.Ref<HTMLButtonElement>,
};



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DialogButton enumeration defines constants to indicate standard buttons used in dialogs.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export enum DialogButton
{
	None = 0x0,
	OK = 0x1,
	Cancel = 0x2,
	Yes = 0x4,
	No = 0x8,
	Close = 0x10,
}



