import * as mim from "mimbl"
import * as css from "mimcss"


// Had to augment the HTMLDialogElement interface because TypeScript's 4.4 lib.dom.d.ts not only
// deprecated it but also removed properties and methods from it.
interface HTMLDialogElement extends HTMLElement
{
    open: boolean;
    returnValue: string;
    close(returnValue?: string): void;
    show(): void;
    showModal(): void;
}


/**
 * The IPopup interface represents a popup from the point of view of the content. This interface
 * is published as a service and can be used by the content components to close the popup.
 */
export interface IPopup
{
    /**
     * Closes the popup and passes a value to be used as a return value. For the modal popups,
     * this value will be the resolved value of the promise returned by the showModal() method.
     * For modeless popups, this value will be available as the returnValue property.
     * @param returnValue
     */
    close( returnValue?: any): void;
}



/**
 * The IPopupStyles interface defines styles used by the Popup class to create the `<dialog>`
 * element. The implementations should provide the class rule for the dialog property and can
 * also define the ::backdrop pseudo element styles, which is used when the popup is shown as a
 * modal dialog.
 */
export interface IPopupStyles extends css.StyleDefinition
{
    /**
     * Defines what CSS class to use for the `<dialog>` element.
     */
    readonly dialog?: css.ClassPropType;
}



/**
 * Default styles that will be used by the Popup if styles are not specified using options.
 */
export class DefaultPopupStyles extends css.StyleDefinition implements IPopupStyles
{
    /** Styles for the `<dialog>` element. */
    dialog = this.$class({
        border: [1, "solid", "grey"],
        boxShadow: { x: 4, y: 4, blur: 4, color: "lightgrey" },
        padding: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        // transform: css.scale(0.1),
        // transition: { property: "transform", duration: 200 },
        "::backdrop": { backgroundColor: "grey", opacity: 0.3 }
    })
}



/**
 * The IPopupOptions interface represents the options that cofigure the behavior of the Popup
 * object. They are passed in the constructor to the [[Popup]] class
 * @typeParam TStyles Type for the styles property. Options for derived components will have to
 * derive from the IPopupOptions interface and to implement the [[IPopupStyles]] interface for
 * the styles property.
 */
export interface IPopupOptions<TStyles extends IPopupStyles = IPopupStyles>
{
    /**
     * Defines what styles to use for the `<dialog>` element and optionally for the ::backdrop
     * pseudo element. The value can be either a style definition class implementing the
     * [[IPopupStyles]] interface or an instance of such class. The popup activates the styles
     * when it opens and deactivates them when it closes. If this property is not defined, the
     * popup will use the default styles. The default value is undefined.
     */
    readonly styles?: TStyles | css.IStyleDefinitionClass<TStyles>;

    /**
     * Defines what CSS class to use for the `<dialog>` element. If this property is defined,
     * the [[style]] property is ignored
     */
    readonly dialogStyleClass?: css.ClassPropType;

    /**
     * Value that is returned when the user closes the popup by pressing the Escape key. If this
     * property is undefined, the popup cannot be closed with the Escape key. Note that null is
     * valid value that can be used to close a popup. The default value is undefined.
     *
     * For modal popups, this property also controls whether the user can dismiss the popup by
     * clicking on the backdrop - that is, the area outside of the popup itslef.
     */
    readonly escapeReturnValue?: any;

    /**
     * HTML element under which the `<dialog>` element is created. If this property is undefined,
     * the `<dialog>` element is created under the `<body>` element. The default value is undefined.
     */
    readonly anchorElement?: HTMLElement;

    /**
     * X-coordinate of the top-left corner of the dialog from the anchor element. If undefined,
     * the dialog will be centered horizontally.
     */
    readonly initialX?: css.CssLength;

    /**
     * Y-coordinate of the top-left corner of the dialog from the anchor element. If undefined,
     * the dialog will be centered vertically.
     */
    readonly initialY?: css.CssLength;
}



/**
 * The IPopupEvents interface represents events that the Popup component can fire
 */
export interface IPopupEvents
{
    /**
     * The open event is fired when the popup opens.
     * @param isModal Flag indicating whether the popup opens as modal or modeless
     */
	open( isModal: boolean): void;

    /**
     * The close event is fired when the popup closes.
     * @param retVal Value passed to the close() method.
     */
    close( retVal: any): void;
}



/**
 * The Popup class allows displaying modal and modeless popups. This is the base class for
 * dialogs and message boxes. After the Popup instance is created it can be shown either as modal
 * or modeless popup. Both types of the popup can be closed using the close() method. In order for
 * the popup to be closed "from inside" - that is, by the component, which is used as the popup
 * content - the popup object should be passed to this component.
 *
 * The Popup class itself doesn't provide any means for the user to start moving it around;
 * however, it allows initiating the move action using the startMove() method. Once this method
 * is called, the Popup will start monitoring mouse (pointer) activity and move the dialog
 * accordingly.
 *
 * The content of the popup can be replaced while it is being displayed using the setContent()
 * method.
 *
 * @typeParam TStyles Type of the style definition class used to specify CSS styles for the
 * component. Must implement the IPopupStyles interface.
 * @typeParam TOptions Type of the object used to specify options for the component. Must
 * implement the IPopupOptions interface.
 */
export class Popup<TStyles extends IPopupStyles = IPopupStyles,
            TOptions extends IPopupOptions<TStyles> = IPopupOptions<TStyles>>
            extends mim.Component implements IPopup
{
    /**
     * Popup is constructed by specifying the initial content it should display and the options
     * @param content
     * @param options
     */
    public constructor( content?: any, options?: TOptions)
    {
        super();
        this.content = content;
        this.options = options;
    }

    /**
     * Displays the popup as a modeless dialog. The method will return false if the popup
     * is already open.
     */
    public open(): boolean
    {
        if (this.isOpen)
            return false;

        this._returnValue = undefined;

        this.create();
        this.dlg.show();

        this.onOpen( false);
    }

    /**
     * Displays the popup as a modeless dialog and returns a promise that is resolved when the
     * popup is closed. The resolved value of the promise is the value passed to the close()
     * method. The method will return a rejected promise if the popup is already open.
     */
    public showModal(): Promise<any>
    {
        if (this.isOpen)
            return Promise.reject( new Error( "Popup already open"));

        this._returnValue = undefined;

        this.create();
        this.dlg.showModal();

        // must establish listener on window because otherwise, the Escape key is processed by
        // the system (closing the popup) never arriving at the dialog
        window.addEventListener( "keydown", this.onKeyDown);

        // if the escapeReturnValue is defined in the options, start listening to the keyboard and
        // click events to detect clicks outside the popup because they will act as Escape too.
        let escapeRetVal = this.options?.escapeReturnValue;
        if (escapeRetVal !== undefined)
            this.dlg.addEventListener( "click", this.onDetectClickOutside);

        this.modalPromise = mim.createPromiseEx();

        return this.modalPromise;
    }

    /**
     * Closes the popup and passes a value to be used as a return value. For the modal popups,
     * this value will be the resolved value of the promise returned by the showModal() method.
     * For modeless popups, this value will be available as the returnValue property.
     * @param retVal
     */
    public close( returnValue?: any): void
    {
        if (!this.isOpen)
            return;

		if (this.modalPromise)
		{
            // if escapeReturnValue was defined in options, we need to remove the click handler
            // that we created in showModal
            let escapeRetVal = this.options?.escapeReturnValue;
            if (escapeRetVal !== undefined)
                this.dlg.removeEventListener( "click", this.onDetectClickOutside);

            window.removeEventListener( "keydown", this.onKeyDown);

			this.modalPromise.resolve( returnValue);
			this.modalPromise = undefined;
		}

        this.dlg.close();
        this.destroy();

        this._returnValue = returnValue;

        this.onClose( returnValue);
    }

    /**
     * Determines whether the popup is currently open.
     */
    public get isOpen(): boolean { return this.dlg != null; }

	/**
     * Determines whether the dialog is currently open as modeless.
     */
	public isModeless(): boolean { return this.isOpen && !this.modalPromise; }

	/**
     * Determines whether the dialog is currently open as modal.
     */
	public isModal(): boolean { return this.isOpen && this.modalPromise != null; }

    /**
     * Returns the value set by the close() method. If the popup is open, the value is undefined.
     */
    public get returnValue(): any { return this._returnValue; }

    /**
     * Replaces the current content of the popup with the given one.
     * @param content
     */
    public setContent( content: any): void
    {
        this.content = content;
    }

	/**
     * Starts monitoring mouse movements and moves the popup with the mouse. This method is
     * intented to be called from a mousedown event handled either by a derived class or by
     * the popup caller.
     */
    public startMove( clientX: number, clientY: number): void
    {
        if (!this.dlg)
            return;

        // // we prevent default action and propagation so that mouse movements don't cause
		// // text in the popup and on the page to be selected.
		// e.preventDefault();
		// e.stopPropagation();

		let rect = this.dlg.getBoundingClientRect();
		this.movePointOffsetX = clientX - rect.left;
		this.movePointOffsetY = clientY - rect.top;

		// set the new coordinates
		this.dlg.style.margin = "0";
		this.dlg.style.top = rect.top + "px";
		this.dlg.style.left = rect.left + "px";

		window.addEventListener( "pointermove", this.onPointerMove);
        window.addEventListener( "pointerup", this.onPointerUp);
    }

	/**
     * Stops monitoring mouse movements. This method allows programmatically interrupt
     * dialog moving operations.
     */
    public stopMove()
	{
		window.removeEventListener( "pointermove", this.onPointerMove);
        window.removeEventListener( "pointerup", this.onPointerUp);

        this.movePointOffsetX = this.movePointOffsetY = 0;
	};

    /**
     * Moves the dialog to the given coordinates. The coordinates are adjusted so that at least
     * some part of the dialog at the top-left corner remains visible in order to the user to be
     * able to continue moving it.
     */
	public moveTo( newX: number, newY: number)
	{
        if (!this.dlg)
            return;

        this.move( newX, newY);
        this.dlg.style.margin = "0";
	};



    /**
     * If derived classes override this method, they must call super.willMount()
     */
    public willMount(): void
	{
        this.vn.publishService( "popup", this);
	};

    /**
     * If derived classes override this method, they must call super.willUnmount()
     */
	public willUnmount(): void
	{
        this.vn.unpublishService( "popup");

        // deactivate styles
        css.deactivate( this.defaultStyles);
        this.defaultStyles = null;
        if (this.optionalStyles)
        {
            css.deactivate( this.optionalStyles);
            this.optionalStyles = null;
        }

        // clean up
        this.dlg = null;
        this.anchorElement = null;
    };

    /**
     * The render method simply returns the current content but it can be overridden by derived classes
     */
	public render(): any
	{
        return this.content;
	};



    // Creates the dialog element
    private create(): void
    {
        // obtain the anchor element
        this.anchorElement = this.options && this.options.anchorElement ? this.options.anchorElement : document.body;

        // activate our default styles and if styles are specified in the options, then activate
        // them too.
        this.defaultStyles = css.activate( this.getDefaultStyles()) as TStyles;
        if (this.options && this.options.styles)
            this.optionalStyles = css.activate( this.options.styles) as TStyles;

        // create dialog element and add it to the DOM
        this.dlg = document.createElement( "dialog") as HTMLDialogElement;
        this.dlg.className = css.chooseClass( this.options?.dialogStyleClass,
                        this.optionalStyles?.dialog, this.defaultStyles.dialog);
        this.anchorElement.appendChild( this.dlg);

        // assign positioning styles dirctly to the dialog element. If x and/or y are undefined,
        // we center the dialog horizontally and/or vertically
        let style: css.Styleset = { position: "fixed" };
        if (!this.options || this.options.initialX === undefined)
            style.left = style.right = 0;
        else
            style.left = this.options.initialX;

        if (!this.options || this.options.initialY === undefined)
            style.top = style.bottom = 0;
        else
            style.top = this.options.initialY;

        css.setElementStyle( this.dlg, style, css.SchedulerType.Sync);

        // mount the component
        mim.mount( this, this.dlg)
    }

    // Destroys the dialog element
    private destroy(): void
    {
        // unmount the content
        mim.unmount( this.dlg);

        // remove the dialog element
        this.dlg.remove();
        this.dlg = null;
    }

	/**
     * Moves the dialog to the given coordinates. The coordinates are adjusted so that at least
     * some part of the dialog at the top-left corner remains visible in order to the user to be
     * able to continue moving it.
     */
	private move( newX: number, newY: number)
	{
		if (newX < 0)
			newX = 0;
		else if (newX + 30 > window.innerWidth)
			newX = window.innerWidth - 30;

		if (newY < 0)
			newY = 0;
		else if (newY + 30 > window.innerHeight)
			newY = window.innerHeight - 30;

		// set the new coordinates
		this.dlg.style.left = newX + "px";
		this.dlg.style.top = newY + "px";
	};



    // Handles keydown event to prevent closing the dialog by Esc key.
	private onKeyDown = (e: KeyboardEvent): void =>
	{
        if (e.key === "Escape")
        {
            e.preventDefault();

            // we ignore the Escape key if the escapeReturnValue option is undefined; otherwise,
            // we close the dialog with its value
            let retVal = this.options?.escapeReturnValue;
            if (retVal !== undefined)
                this.close( retVal);
        }
	};

    // Detects whether a click occurred outside of the popup area. This handler is invoked only for
    // modal popups and only if the escapeReturnValue is defined in the options.
    private onDetectClickOutside = (e: MouseEvent) =>
    {
        // clicking on the backdrop of the modal popup has the target property of the event
        // pointing to the `<dialog>` element itself. If it is not this element, then the click
        // was on some element within the popup.
        if (e.target !== this.dlg)
            return;

        // just in case the click happend on the `<dialog>` element itself but within the bounds
        // of the popup (e.g. if popup is styleed with paddings), check that coordinates are
        // outside of the popup area.
        let rc = this.dlg.getBoundingClientRect();
        if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom)
            this.close( this.options?.escapeReturnValue);
    }

	private onPointerMove = (e: PointerEvent) =>
	{
        e.preventDefault();

        // we only move on the primary button
        if (!this.dlg || !e.isPrimary)
        {
            this.stopMove();
            return;
        }

		this.move( e.clientX - this.movePointOffsetX, e.clientY - this.movePointOffsetY);
	};

	private onPointerUp = (e: PointerEvent) =>
	{
        e.preventDefault();
        this.stopMove();
	};



    /**
     * Returns the default style definition instance or class
     */
	protected getDefaultStyles(): TStyles | css.IStyleDefinitionClass<TStyles>
	{
        return DefaultPopupStyles as css.IStyleDefinitionClass<TStyles>;
	};

    /**
     * This method is called when the popup opens. If derived classes override it they
     * must call super.onOpen().
     */
	protected onOpen( isModal: boolean): void
	{
        // notify any listeners
        this.events.open.fire( isModal);
    };

    /**
     * This method is called when the popup is being closed. If derived classes override it they
     * must call super.onClose().
     */
	protected onClose( retVal: any): void
	{
        // notify any listeners
        this.events.close.fire( retVal);
    };



    // Events that can be fired by the Popup objects.
    public readonly events = mim.createMultiEventSlot<IPopupEvents>();



    // Content to display
    @mim.trigger(0)
    protected content: any;

    // Options
    protected options: TOptions;

    // Activated default styles
    protected defaultStyles: TStyles;

    // Activated optional styles
    protected optionalStyles: TStyles;

    // Anchor element under which to create the dialog element
    private anchorElement: HTMLElement;

    // Dialog element
    private dlg: HTMLDialogElement;

    // Promise that is created for modal dialogs and which is resolved when the dialog closes.
    private modalPromise: mim.PromiseEx<any>;

    // Value passed to the close method.
    private _returnValue: any;

	// Offsets of the point where the move started from the dialog top-left corner. We use them
	// to calculate the dialog top-left position based on the mouse coordinates while move is
	// in progress.
	private movePointOffsetX: number;
	private movePointOffsetY: number;
}



