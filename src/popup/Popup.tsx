import * as mim from "mimbl"
import * as css from "mimcss"
import { IStyleset } from "mimcss";
import { IPopupStyles, PopupTheme } from "./PopupStyles"


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



// /**
//  * Promise that can be resolved from outside.
//  */
// class PromiseEx<T = void> extends Promise<T>
// {
//     constructor()
//     {
//         // the "executor" function of the base Promise class is not used
//         super(() => {});

//         // create a new promise object and remember resolve and reject functions in temp variables
//         let tempResolve: (value: T | PromiseLike<T>) => void;
//         let tempReject: (reason?: any) => void;
//         let promise = new Promise<T>( (resolve, reject) => {
//             tempResolve = resolve;
//             tempReject = reject;
//         });

//         // assign remembered resolve and reject functions to the promise object itself.
//         (promise as any).resolve = tempResolve;
//         (promise as any).reject = tempReject;

//         // return the promise object from the constructor, so that the actual object created by
//         // "new PromiseEx()" is a Promise.
//         return promise as any;
//     }

//     // The following resolve and reject methods are not actually invoked because the instance that
//     // is returned form the constuctor is not an instance of PromiseEx but rather a Promise. These
//     // methods are only needed to provide signatures.
//     resolve( value?: T | PromiseLike<T>): void {};
//     reject( reason?: any): void {};
// }



/**
 * Starts animation or transition by calling the given "start" and "end" functions, and waits
 * until it ends. Since there might be that calling the "start" function doesn't actually start
 * the animation, this function first waits for the animation to start. If it doesn't start, the
 * function returns; otherwise, it waits until the animation ends.
 * @param elm Element to perform animation or transition on
 * @param startFunc Function that causes the animation to start.
 * @param endFunc Function that cleans up after the animation ends.
 * @param isTransition Flag indicaing that this is a transition as opposed to animation.
 */
const waitAnim = async ( elm: Element, startFunc: ()=>void, endFunc: ()=>void, isTransition?: boolean): Promise<void> =>
{
    let name = isTransition ? "transition" : "animation";
    let startName = name + "start";
    let endName = name + "end";

    let started: boolean;
    let ended: boolean;
    let count: number;

    // let startPromise = new Promise<void>( resolveFunc => setTimeout( resolveFunc, 50));
    let startPromise = new Promise<void>( async resolveFunc =>
    {
        for( count = 0; count < 5; count++)
        {
            await new Promise<void>( resolveFunc1 => requestAnimationFrame( time => resolveFunc1()));
            if (started)
            {
                resolveFunc();
                console.debug( "Animation started after %d requestAnimationFrame calls", count);
                return;
            }
        }

        console.debug( "Animation didn't start after %d requestAnimationFrame calls", count);
        resolveFunc();
    });

    let endPromise = mim.createPromiseEx();
    let startHandler = () => started = true;
    let endHandler = () => {
        cleanup();
        ended = true;
        endPromise.resolve();
    };

    let cleanup = () =>
    {
        endFunc();
        elm.removeEventListener( startName, startHandler);
        elm.removeEventListener( endName, endHandler);
    }

    elm.addEventListener( startName, startHandler);
    elm.addEventListener( endName, endHandler);
    startFunc();

    await startPromise;
    if (!started)
        cleanup();
    else if (!ended)
        await endPromise;
}



/**
 * Starts animation or transition by adding the given CSS class to the given element, and waits
 * until it ends. Since there might be that adding the class to the element doesn't actually start
 * the animation, this function first waits for the animation to start. If it doesn't start, the
 * function returns; otherwise, it waits until the animation ends.
 * @param elm Element to perform animation or transition on
 * @param cls Class to add to the element to start the animation or transition. The class is
 * removed from the element after the animation or transition ends.
 * @param isTransition Flag indicaing that this is a transition as opposed to animation.
 */
const waitAnimByClass = async (elm: Element, moniker: css.ClassMoniker, isTransition?: boolean): Promise<void> =>
{
    let cls = css.className(moniker);
    return waitAnim( elm, () => elm.classList.add(cls), () => elm.classList.remove(cls), isTransition);
}



/**
 * Starts animation or transition by setting the given CSS inline style to the given element, and waits
 * until it ends. Since there might be that adding the style to the element doesn't actually start
 * the animation, this function first waits for the animation to start. If it doesn't start, the
 * function returns; otherwise, it waits until the animation ends.
 * @param elm Element to perform animation or transition on
 * @param styleset Styleset to add to the element as inline stile to start the animation or transition.
 * @param isTransition Flag indicaing that this is a transition as opposed to animation.
 */
const waitAnimByStyle = async (elm: Element, styleset: IStyleset, isTransition?: boolean): Promise<void> =>
{
    let tempSD = css.activate( new class extends css.StyleDefinition
    {
        cls = this.$class(styleset);
    });

    await waitAnimByClass( elm, tempSD.cls.name, isTransition);
    css.deactivate(tempSD);
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
     * pseudo element. If this property is not defined, the popup will use styles from the current
     * popup theme. The default value is undefined.
     */
    styles?: TStyles;

    /**
     * Value that is returned when the user closes the popup by pressing the Escape key. If this
     * property is undefined, the popup cannot be closed with the Escape key. Note that null is
     * valid value that can be used to close a popup. The default value is undefined.
     *
     * For modal popups, this property also controls whether the user can dismiss the popup by
     * clicking on the backdrop - that is, the area outside of the popup itslef.
     */
    escapeValue?: any;

    /**
     * HTML element under which the `<dialog>` element is created. If this property is undefined,
     * the `<dialog>` element is created under the `<body>` element. The default value is undefined.
     */
    anchorElement?: HTMLElement;

    /**
     * X-coordinate of the top-left corner of the dialog from the anchor element. If undefined,
     * the dialog will be centered horizontally.
     */
    initialX?: css.CssLength;

    /**
     * Y-coordinate of the top-left corner of the dialog from the anchor element. If undefined,
     * the dialog will be centered vertically.
     */
    initialY?: css.CssLength;
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
    extends mim.Component
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
    public async open(): Promise<boolean>
    {
        if (this.isOpen)
            return false;

        this._returnValue = undefined;

        let createPromise = this.create();
        this.dlg.show();
        await createPromise;

        this.onOpen( false);
        return true;
    }

    /**
     * Displays the popup as a modeless dialog and returns a promise that is resolved when the
     * popup is closed. The resolved value of the promise is the value passed to the close()
     * method. The method will return a rejected promise if the popup is already open.
     */
    public async showModal(): Promise<any>
    {
        if (this.isOpen)
            return Promise.reject( new Error( "Popup already open"));

        this._returnValue = undefined;

        let createPromise = this.create();
        this.dlg.showModal();
        await createPromise;

        // must establish listener on window because otherwise, the Escape key is processed by
        // the system (closing the popup) never arriving at the dialog
        window.addEventListener( "keydown", this.onKeyDown);

        // if the escapeReturnValue is defined in the options, start listening to the keyboard and
        // click events to detect clicks outside the popup because they will act as Escape too.
        let escapeRetVal = this.options?.escapeValue;
        if (escapeRetVal !== undefined)
            this.dlg.addEventListener( "click", this.onDetectClickOutside);

        this.onOpen( true);

        this.modalPromise = mim.createPromiseEx();
        return this.modalPromise;
    }

    /**
     * Closes the popup and passes a value to be used as a return value. For the modal popups,
     * this value will be the resolved value of the promise returned by the showModal() method.
     * For modeless popups, this value will be available as the returnValue property.
     * @param returnValue Value to use a return value after the popup is closed.
     */
    public async close( returnValue?: any): Promise<void>
    {
        if (!this.isOpen)
            return;

        let modalPromise = this.modalPromise;
		if (modalPromise)
		{
            // if escapeReturnValue was defined in options, we need to remove the click handler
            // that we created in showModal
            let escapeRetVal = this.options?.escapeValue;
            if (escapeRetVal !== undefined)
                this.dlg.removeEventListener( "click", this.onDetectClickOutside);

            window.removeEventListener( "keydown", this.onKeyDown);
			this.modalPromise = undefined;
		}

        await this.destroy();

        this._returnValue = returnValue;

		modalPromise?.resolve( returnValue);

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
	public async moveTo( newX: number, newY: number): Promise<void>
	{
        let dlg = this.dlg;
        if (!dlg)
            return;

        this.move( newX, newY);
        dlg.style.margin = "0";
        let moving = this.styles?.popupMoving;
        if (moving)
            await waitAnimByClass( dlg, moving, true);
	};



    /**
     * The render method can be overridden by derived classes
     */
	public render(): any
	{
        return this.content;
	};



    // Creates the dialog element
    private async create(): Promise<void>
    {
        // obtain the anchor element
        this.anchorElement = this.options?.anchorElement ?? document.body;

        // obtain current theme and merge optional styles on top of it
        this.theme = css.getActiveTheme( PopupTheme);
        // this.styles = Object.assign( {}, this.theme, this.options?.styles);
        this.styles = css.mergeStylesheets( null, this.theme, this.options?.styles);

        // create dialog element and add it to the DOM
        let dlg = this.dlg = document.createElement( "dialog") as HTMLDialogElement;
        this.anchorElement.appendChild( dlg);
        dlg.className = this.styles.popupElm?.name;

        // assign positioning styles directly to the dialog element. If x and/or y are undefined,
        // we center the dialog horizontally and/or vertically
        let dlgElmStyle: css.Styleset = { position: "fixed" };
        if (this.options?.initialX === undefined)
            dlgElmStyle.left = dlgElmStyle.right = 0;
        else
        {
            dlgElmStyle.left = this.options.initialX;
            dlgElmStyle.marginInline = 0;
        }

        if (this.options?.initialY === undefined)
            dlgElmStyle.top = dlgElmStyle.bottom = 0;
        else
        {
            dlgElmStyle.top = this.options.initialY;
            dlgElmStyle.marginBlock = 0;
        }

        dlg.setStyleset( dlgElmStyle);
        // css.setElementStyle( this.dlg, dlgElmStyle /*, css.SchedulerType.Sync*/);

        // mount the component
        mim.mount( this, dlg);

        let entering = this.styles?.popupEntering;
        if (entering)
            await waitAnimByClass( dlg, entering);
    }

    /** Destroys the dialog element */
    private async destroy(): Promise<void>
    {
        let dlg = this.dlg;
        let exiting = this.styles?.popupExiting;
        if (exiting)
            await waitAnimByClass( dlg, exiting);

        this.cleanup();
    }

    /** Unmounts the popup content and cleans up internal stuctures */
    private cleanup(): void
    {
        // unmount the content
        mim.unmount( this.dlg);

        // remove the dialog element and clean up
        this.dlg.remove();
        this.dlg = null;
        this.anchorElement = null;

        this.styles = null;
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
            let retVal = this.options?.escapeValue;
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
            this.close( this.options?.escapeValue);
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

    // Current popup theme
    protected theme: PopupTheme;

    // Actual styles to use - may come from the default styles or from the styles defined in the
    // options
    protected styles: TStyles;

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



