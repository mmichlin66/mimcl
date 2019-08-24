import * as mim from "mimbl"



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The Popup class is a base class for modeless and modal popups. It provides the basic mechanics
// for showing and closing the popups including moving it with the mouse. The content of the
// popup is either specified in the constuctor or is provided by derived classes.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class Popup extends mim.Component
{
	// The constructor accepts the object describing the styles and content that should be
	// displayed within the popup. It can be left undefined if a derived class overrides the
	// getDlgSlice method.
	constructor( dlgSlice?: mim.Slice)
	{
		super();
		this.dlgSlice = dlgSlice ? dlgSlice : {};

		// create default parameters if this is the first time a Popup is created
		if (!Popup.DefaultDlgSlice)
			Popup.DefaultDlgSlice = { style: { borderStyle: "solid", borderWidth: "1px", padding: "0"} };
	}



	// Opens the dialog as a modeless popup. It should be closed with the Close method.
	public open( x?: number, y?: number): boolean
	{
		if (this.isOpen())
			return false;

		this.create( x, y);
		(this.dlg as any).show();
	}



	// Closes the dialog opened as a modeless popup. This method cannot be used to close a modal
	// dialog.
	public close( retVal?: any): void
	{
		(this.dlg as any).close();
		this.destroy();
	
		if (this.modalPromiseResolveFunc)
		{
			this.modalPromiseResolveFunc( retVal);
			this.modalPromiseResolveFunc = undefined;
		}
	}



	// Opens a modal dialog. The dialog is closed with the CloseModal method and the parameter
	// passed to the CloseModal method is returned as a resolved promise.
	public showModal( x?: number, y?: number): Promise<any>
	{
		if (this.isOpen())
			return Promise.reject( "Dialog is already open");

		let promise: Promise<any> = new Promise<any>( (resolve) => {this.modalPromiseResolveFunc = resolve});
		this.create( x, y);
		(this.dlg as any).showModal();
		return promise;
	}



	// Determines whether the dialog is currently open.
	public isOpen(): boolean
	{
		return this.dlg !== undefined;
	}



	// Determines whether the dialog is currently open as modeless.
	public isModeless(): boolean
	{
		return this.isOpen() && this.modalPromiseResolveFunc === undefined;
	}



	// Determines whether the dialog is currently open as modal.
	public isModal(): boolean
	{
		return this.isOpen() && this.modalPromiseResolveFunc !== undefined;
	}



	// Starts monitoring mouse movements and moves the dialog with the mouse. This method is
	// intented to be called from a mousedown event somewhere within the popup.
	public startMove( e: MouseEvent)
	{
		// we prevent default action and propagation so that mouse movements don't cause
		// test in the popup and on the page to be selected.
		e.preventDefault();
		e.stopPropagation();

		let rect = this.dlg.getBoundingClientRect();
		this.dragPointOffsetX = e.clientX - rect.left;
		this.dragPointOffsetY = e.clientY - rect.top;

		// set the new coordinate and also remember them in our Slice so that they can be specified
		// as properties if the component is rerendered
		this.dlg.style.margin = this.currDlgSlice.style.margin = "0";
		this.dlg.style.top = this.currDlgSlice.style.top = rect.top + "px";
		this.dlg.style.left = this.currDlgSlice.style.left = rect.left + "px";

		window.addEventListener( "mousemove", this.onMove);
		window.addEventListener( "mouseup", this.onStopMove);
	};



	// Moves the dialog to the given coordinates. The coordinates are adjusted so that at least
	// some part of the dialog at the top-left corner remains visible in order to the user to be
	// able to continue moving it.
	public move( newX: number, newY: number)
	{
		if (newX < 0)
			newX = 0;
		else if (newX + 30 > window.innerWidth)
			newX = window.innerWidth - 30;

		if (newY < 0)
			newY = 0;
		else if (newY + 30 > window.innerHeight)
			newY = window.innerHeight - 30;

		// set the new coordinate and also remember them in our Slice so that they can be specified
		// as properties if the component is rerendered
		this.dlg.style.left = this.currDlgSlice.style.left = newX + "px";
		this.dlg.style.top = this.currDlgSlice.style.top = newY + "px";
	};



	public render(): any
	{
		return <dialog ref={ref => this.dlg = ref} style={this.currDlgSlice.style}
						class={this.currDlgSlice.className} {...this.currDlgSlice.props}>
			{this.currDlgSlice.content}
		</dialog>;
	}



	// Returns parameters for the <dialog> element provided either externally or by derived classes.
	protected getDlgSlice(): mim.Slice
	{
		return this.dlgSlice;
	}



	// Creates and renders the popup.
	private create( x: number, y: number): void
	{
		// define positioning styles. If x and/or y are undefined, we center the dialog horizontally
		// and/or vertically
		let style: mim.StylePropType = { position: "fixed" }
		if (x === undefined)
		{
			style.left = "0px";
			style.right = "0px";
		}
		else
		{
			style.left = x + "px";
			style.marginLeft = "0";
			style.marginRight = "0";
		}

		if (y === undefined)
		{
			style.top = "0px";
			style.bottom = "0px";
		}
		else
		{
			style.top = y + "px";
			style.marginTop = "0";
			style.marginBottom = "0";
		}

		this.currDlgSlice = mim.Slices.MergeSlices( Popup.DefaultDlgSlice, this.getDlgSlice(), {style});

		// create a <div> element and append it to the end of <body>. Then render our component's
		// content under it.
		this.anchorDiv = document.createElement( "div");
		document.body.appendChild( this.anchorDiv);
		mim.mountSync( this, this.anchorDiv);

		window.addEventListener( "keydown", this.onKeyDown);
	}



	// Unrenders and destroys the dialog.
	private destroy(): void
	{
		window.removeEventListener( "keydown", this.onKeyDown);

		mim.unmountSync( this.anchorDiv);
		this.anchorDiv.remove();
	}



	// Handles keydown event to prevent closing the dialog by Esc key.
	private onKeyDown = ( e: KeyboardEvent): void =>
	{
		if (e.keyCode === 27) // Esc
			e.preventDefault();
	};



	private onMove = (e: MouseEvent) =>
	{
		this.move( e.clientX - this.dragPointOffsetX, e.clientY - this.dragPointOffsetY);
	};



	private onStopMove = (e: MouseEvent) =>
	{
		window.removeEventListener( "mousemove", this.onMove);
		window.removeEventListener( "mouseup", this.onStopMove);
	};



	// Parameters for the <dialog> element provided either externaly or by derived classes.
	private dlgSlice: mim.Slice;
	public get DlgSlice(): any { return this.DlgSlice; }

	// Current parameters for the <dialog> element that combine our defaults plus those provided
	// either externaly or by derived classes plus those reflecting the dialog positioning.
	private currDlgSlice: mim.Slice;

	// Element under which the dialog is rendered. This element is created and appended to the
	// <body> when dialog is created and is removed when the dialog is closed.
	private anchorDiv: HTMLElement;

	//// Reference to the <dialog> element added to the end of the <body> when dialog is created.
	//private dlgRef = new mim.Ref<HTMLDialogElement>( ref => this.dlg = ref);

	// Reference to the <dialog> element added to the end of the <body> when dialog is created.
	private dlg: HTMLDialogElement;

	// Promise which is created for modal dialog and which is resolved when the modal dialog
	// is closed. The promise is returned from ShowModal.
	private modalPromiseResolveFunc: (any) => void;

	// Reference to the <div> element containing the caption.
	private caption = new mim.Ref<HTMLElement>();

	// Offsets of the point where the move started from the dialog top-left corner. We use them
	// to calculate the dialog top-left position based on the mouse coordinates while move is
	// in progress.
	private dragPointOffsetX: number;
	private dragPointOffsetY: number;

	// Default parameters for <dialog> element
	public static DefaultDlgSlice: mim.Slice;

}



