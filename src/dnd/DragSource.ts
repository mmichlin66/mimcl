import * as mim from "mimbl"
import {DragSourcePropType, IDragSource, ISimpleDragSource, IDragSourceEvent, DNDTYPE_ELEMENT} from "./DragDropApi";
import {DragAndDropData, IEmulDataTransfer, EmulDataTransfer, EmulLegacyDataTransfer} from "./DataTransfer";



type DragEventType = "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragStartEvent class represents an object that is passed to different event handlers
// on the drag source elements.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
class DragSourceEvent implements IDragSourceEvent
{
	// Reference to the original HTML5 DragEvent object.
	get dragEvent(): DragEvent { return this.m_dragEvent; }
	set dragEvent( val: DragEvent) { this.m_dragEvent = val; }



	// Sets data with the given type. For text data the type should be one of MIME types.
	setData( type: string, data: any): void
	{
		if (typeof data === "string")
			this.m_dragEvent.dataTransfer.setData( type, data);
		else
		{
			this.m_dragEvent.dataTransfer.setData( type, "");
			DragAndDropData.setObjectData( type, data);
		}
	}



	// Reference to the original HTML5 DragEvent object.
	private m_dragEvent: DragEvent;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragSourceBehavior enumeration provides values that distinguish between differen mechanisms
// setup by different types of the dragSource property.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export const enum DragSourceBehavior
{
	Regular = 1,
	Simple,
	ElmText,
	ElmHtml
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragSourceHandler class implements support for HTML5 Drag and Drop source functionality. It
// is used by HTML elements that natively support drag and drop events.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class DragSourceHandler
{
	constructor( elm: Element, dragSourceProp: DragSourcePropType)
	{
		this.elm = elm;

		if (dragSourceProp === "elm-text")
			this.behavior = DragSourceBehavior.ElmText;
		else if (dragSourceProp === "elm-html" || dragSourceProp === true)
			this.behavior = DragSourceBehavior.ElmHtml;
		else if ((dragSourceProp as ISimpleDragSource).data !== undefined)
		{
			this.behavior = DragSourceBehavior.Simple;
			this.simpleDragSource = dragSourceProp as ISimpleDragSource;
		}
		else if ((dragSourceProp as IDragSource).onDragStart !== undefined)
		{
			this.behavior = DragSourceBehavior.Regular;
			this.dragSource = dragSourceProp as IDragSource;
		}

		/// #if DEBUG
		else
			throw new Error( "Invalid value of dragSourceProp in DragSourceHandler constructor.");
		/// #endif
	}



	// Initializes the object by making the element draggable by adding drag events.
	public init()
	{
		this.dragSourceEvent = new DragSourceEvent();
		this.elm.setAttribute( "draggable", "true");

		this.elm.addEventListener( "dragstart", this.onDragStart);
		this.elm.addEventListener( "dragend", this.onDragEnd);
		this.elm.addEventListener( "drag", this.onDrag);
	}



	// Terminates the object by removing drag event handlers from the element.
	public term()
	{
		this.elm.removeEventListener( "dragstart", this.onDragStart);
		this.elm.removeEventListener( "dragend", this.onDragEnd);
		this.elm.removeEventListener( "drag", this.onDrag);

		this.elm.removeAttribute( "draggable");
		this.dragSourceEvent = undefined;
	}



	// Handler for the native dragstart event
	private onDragStart = (e: DragEvent): void =>
	{
		// clear the data map - just in case
		DragAndDropData.clearAllObjectData();

		this.dragSourceEvent.dragEvent = e;
		if (this.behavior === DragSourceBehavior.Simple)
		{
			for( let dataType in this.simpleDragSource.data)
				this.dragSourceEvent.setData( dataType, this.simpleDragSource.data[dataType]);

			if (this.simpleDragSource.allowedEffects !== undefined)
				e.dataTransfer.effectAllowed = this.simpleDragSource.allowedEffects;
			else
				e.dataTransfer.effectAllowed = "all";
		}
		else if (this.behavior === DragSourceBehavior.Regular)
		{
			try
			{
				// if onDragStart method is defined, invoke it
				if (this.dragSource.onDragStart)
					this.dragSource.onDragStart( this.dragSourceEvent);
			}
			catch(err)
			{
				DragAndDropData.clearAllObjectData();
				throw err;
			}
		}
		else
		{
			this.dragSourceEvent.setData( DNDTYPE_ELEMENT, this.elm);
			e.dataTransfer.effectAllowed = "all";

			if (this.behavior === DragSourceBehavior.ElmText)
				this.dragSourceEvent.setData( "text/plain", this.elm.textContent);
			else if (this.behavior === DragSourceBehavior.ElmHtml)
				this.dragSourceEvent.setData( "text/plain", this.elm.outerHTML);
		}
	};



	// Handler for the native dragend event
	private onDragEnd = (e: DragEvent): void =>
	{
		if (this.behavior !== DragSourceBehavior.Regular)
		{
			DragAndDropData.clearAllObjectData();
			return;
		}

		try
		{
			if (this.dragSource.onDragEnd)
			{
				this.dragSourceEvent.dragEvent = e;
				this.dragSource.onDragEnd( this.dragSourceEvent);
			}
		}
		finally
		{
			DragAndDropData.clearAllObjectData();
		}
	};



	// Handler for the native drag event
	private onDrag = (e: DragEvent): void =>
	{
		if (this.behavior === DragSourceBehavior.Regular)
		{
			if (this.dragSource.onDrag)
			{
				this.dragSourceEvent.dragEvent = e;
				this.dragSource.onDrag( this.dragSourceEvent);
			}
		}
	};



	// Instance of an Element.
	protected elm: Element;

	//// Flag indicating that we need to implement default drag source behavior; that is, we should
	//// pass the element object as data being dragged. Note that either this flag is true or
	//// the dragSource property is defined.
	//public defaultDragSourceBehaviorEnabled: boolean;

	// Type of drag source mechanism determined by the dragSource property
	protected behavior: DragSourceBehavior;

	// IDragSource interface defining element's behavior as drag source. This property can be
	// undefined if either we are implementing a default drag source behavior.
	private dragSource: IDragSource;

	// IDragSource interface defining element's behavior as drag source. This property can be
	// undefined if either we are implementing a default drag source behavior.
	private simpleDragSource: ISimpleDragSource;

	// Event object that is reused when sending events to a drag source element.
	private dragSourceEvent: DragSourceEvent;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragSourceEmulator class emulates support for Drag and Drop source functionality via mouse
// events. It is used for DOM elements that don't have native drag and drop suport - e.g. SVG.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class DragSourceEmulator extends DragSourceHandler
{
	constructor( elm: Element, dragSource: DragSourcePropType)
	{
		super( elm, dragSource);
	}



	// Initializes the object by adding a mousedown event.
	public init()
	{
		super.init();

		this.elm.addEventListener( "mousedown", this.onMouseDown);
	}



	// Terminates the object by removing a mousedown event.
	public term()
	{
		super.term();

		this.elm.removeEventListener( "mousedown", this.onMouseDown);
	}



	// Remember the coordinates of the mouse-down event and start watching mouse movement
	//(and other) events.
	private onMouseDown = (e: MouseEvent): void =>
	{
		// ignore non-primary mouse buttons
		if (e.button !== 0)
			return;

		e.preventDefault();

		// remember coordinates of the mouse down event
		this.mouseDownX = e.clientX;
		this.mouseDownY = e.clientY;

		// start listening to several DnD related events on the document.
		document.addEventListener( "mousemove", this.onMouseMove);
		document.addEventListener( "mouseup", this.onMouseUp);
		document.addEventListener( "keydown", this.onKeyDown);
		document.addEventListener( "keyup", this.onKeyUp);
	};



	// Either start or continue drag operation
	private onMouseMove = (e: MouseEvent): void =>
	{
		// primary button must be still pressed
		if ((e.buttons & 1) === 0)
			return;

		// need to prevent default action - otherwise text will be selected on the page.
		e.preventDefault();

		// if DnD operation is already in progress fire events; otherwise, check whether the
		// mouse moved enough to start the operation.
		if (this.emulDataTransfer !== undefined)
			this.handleDragStep( e);
		else
		{
			let cx = e.clientX - this.mouseDownX;
			let cy = e.clientY - this.mouseDownY;
			if (cx >= -2 && cx <= 2 && cy >= -2 && cy <= 2)
				return;

			this.initiateDragOperation( e);
		}
	};



	// Finish drag operation if the target accepts it.
	private onMouseUp = (e: MouseEvent): void =>
	{
		if (this.emulDataTransfer !== undefined)
			this.handleDrop( e);

		this.cleanupDragOperation();
	};



	// Cancels drag operation if cancel was pressed
	private onKeyDown = (e: KeyboardEvent): void =>
	{
		e.preventDefault();
		e.stopPropagation();

		if (e.keyCode === 27)
		{
			// if Escape - cancel drag and drop operation
			if (this.emulDataTransfer !== undefined)
				this.cancelDragOperation( e);

			this.cleanupDragOperation();
		}
		else if (this.emulDataTransfer !== undefined)
			this.handleKeyEvent( e);
	};



	// Handles keyup events
	private onKeyUp = (e: KeyboardEvent): void =>
	{
		e.preventDefault();
		e.stopPropagation();

		if (this.emulDataTransfer !== undefined)
			this.handleKeyEvent( e);
	};



	// Initiates drag and drop operation
	private initiateDragOperation( e: MouseEvent): void
	{
		if ("setDragImage" in DataTransfer.prototype)
			this.emulDataTransfer = new EmulDataTransfer();
		else
			this.emulDataTransfer = new EmulLegacyDataTransfer();

		// fire onDragStart event - if the default action is prevented, we cancel the operation
		let dragstartEvent = this.createDragEventFromMouseEvent( e, "dragstart");
		this.elm.dispatchEvent( dragstartEvent);
		if (dragstartEvent.defaultPrevented)
		{
			this.cleanupDragOperation();
			return;
		}

		// if the drag source didn't set an element for drag image, use the element itself.
		if (!this.emulDataTransfer.isImageElmReset)
		{
			// calculte drag image coordinates so that initially the drag image coinsides with
			// the original image
			let rc = this.elm.getBoundingClientRect();
			this.emulDataTransfer.setDragImage( this.elm, e.clientX - rc.left, e.clientY - rc.top);
		}

		// indicate that we don't know last target yet
		this.lastTarget = undefined;
		this.isLastTargetDroppable = false;
		this.isDropPossibleOnLastTarget = false;

		// perform a drag step
		this.handleDragStep( e);
	};



	// Handle one step of drag and drop operation, which occurs when the mouse moves
	private handleDragStep( e: MouseEvent): void
	{
		if (this.emulDataTransfer.isImageElmReset)
		{
			this.prepareImageElement();
			this.emulDataTransfer.isImageElmReset = false;
		}

		// before sending dragover event we set the dropEffect to none, and the dropover handler
		// could set it to something else if desired
		this.emulDataTransfer.dropEffect = "none";

		// find element under the cursor
		let newTarget: Element = null;
        let elmsUnderPoint = document.elementsFromPoint( e.clientX, e.clientY);
        if (elmsUnderPoint !== null)
        {
            // find the first element in the list after our image element
            let imageElmEncountered = false;
            for( let elmUnderPoint of elmsUnderPoint)
            {
                if (imageElmEncountered)
                {
                    newTarget = elmUnderPoint;
                    break;
                }
                else if (elmUnderPoint === this.imageElm)
                    imageElmEncountered = true;
            }
        }

		if (newTarget)
		{
			// if we are on the same target as the previous mouse move, just send dragover (if
			// the target is a valid drop zone)
			if (newTarget === this.lastTarget)
			{
				if (this.isLastTargetDroppable)
				{
					let dragoverEvent: DragEvent = this.createDragEventFromMouseEvent( e, "dragover");
					newTarget.dispatchEvent( dragoverEvent);
					this.isDropPossibleOnLastTarget = dragoverEvent.defaultPrevented;
				}
			}
			else
			{
				// send dragenter to the new target and determine whether it is a valid drop
				// zone
				let dragenterEvent: DragEvent = this.createDragEventFromMouseEvent( e, "dragenter");
				newTarget.dispatchEvent( dragenterEvent);
				let isNewTargetDroppable: boolean = dragenterEvent.defaultPrevented;

				// send the last target (if exists and is droppable) the dragleave event.
				if (this.lastTarget && this.isLastTargetDroppable)
					this.lastTarget.dispatchEvent( this.createDragEventFromMouseEvent( e, "dragleave"));

				// remember the new target and whether it is a valid drop zone
				this.lastTarget = newTarget;
				this.isLastTargetDroppable = isNewTargetDroppable;
				this.isDropPossibleOnLastTarget = isNewTargetDroppable;

				// if our new target is droppabale, send dragover to it
				if (this.isLastTargetDroppable)
				{
					let dragoverEvent: DragEvent = this.createDragEventFromMouseEvent( e, "dragover");
					newTarget.dispatchEvent( dragoverEvent);
					this.isDropPossibleOnLastTarget = dragoverEvent.defaultPrevented;
				}
			}
		}
		else if (this.lastTarget)
		{
			// if we dont have new target but have last one target, send dragleave to the last one
			// (if the last target is a valid drop zone)
			if (this.isLastTargetDroppable)
				this.lastTarget.dispatchEvent( this.createDragEventFromMouseEvent( e, "dragleave"));

			this.lastTarget = undefined;
			this.isLastTargetDroppable = false;
			this.isDropPossibleOnLastTarget = false;
		}

		// send drag event to our source
		this.elm.dispatchEvent( this.createDragEventFromMouseEvent( e, "drag"));

		// move the drag image element to the current mouse position
		if (this.imageElm)
		{
			this.imageElm.style.left = e.clientX - this.emulDataTransfer.imageElmX + "px";
			this.imageElm.style.top = e.clientY - this.emulDataTransfer.imageElmY + "px";
			// this.imageElm.setStyleset( {
            //     left: px( e.clientX - this.emulDataTransfer.imageElmX),
			//     top: px( e.clientY - this.emulDataTransfer.imageElmY)
            // });
		}

		// update image based on the latest feedback
		if (this.dropEffectElm)
		{
			let dropEffect: string = this.isDropPossibleOnLastTarget ? this.emulDataTransfer.dropEffect : "none";
			this.setDropEffectImageCue( dropEffect);
			this.dropEffectElm.style.left = this.emulDataTransfer.imageElmX + 12 + "px";
			this.dropEffectElm.style.top = this.emulDataTransfer.imageElmY + 0 + "px";
			// this.dropEffectElm.setStyleset( {
            //     left: px( this.emulDataTransfer.imageElmX + 12),
			//     top: px( this.emulDataTransfer.imageElmY)
            // });
		}

		// remember last mouse event - we may use it to create DragEvent objects if we need to
		// dispatch drag events upon keyboard events (e.g. cancel operation when Escape is pressed
		// or dragover event if Ctrl, Alt or Shift buttons are pressed).
		this.lastMouseEvent = e;
    };



	// Handles keydown and keyup events during drag operation by sending dragover event.
	private handleKeyEvent(e: KeyboardEvent): void
	{
		if (this.lastTarget && this.isLastTargetDroppable)
		{
			let dragoverEvent: DragEvent = this.createDragEventFromKeyboardEvent( e, "dragover");
			this.lastTarget.dispatchEvent( dragoverEvent);
			this.isDropPossibleOnLastTarget = dragoverEvent.defaultPrevented;

			// send drag event to our source
			this.elm.dispatchEvent( this.createDragEventFromKeyboardEvent( e, "drag"));

			// update image based on the latest feedback
			if (this.dropEffectElm)
			{
				let dropEffect: string = this.isDropPossibleOnLastTarget ? this.emulDataTransfer.dropEffect : "none";
				this.setDropEffectImageCue( dropEffect);
			}
		}
	};



	// Takes the image element (if any) specified via the call to setDragImage and clones it into
	// a special div that will be shown during the drag operation
	private prepareImageElement(): void
	{
		// if we have previous image element, remove it now
		if (this.imageElm)
		{
			this.imageElm.remove();
			this.imageElm == undefined;
		}

		let orgElm: Element = this.emulDataTransfer.imageElm;
		if (!orgElm)
			return;

		// create a div element, which will wrap the image element and will be added to the
		// document body with absolute positioning and some opacity
		let divElm: HTMLDivElement = document.createElement( "div");

		// clone the original element because we are going to move it around.
		let clonedElm: Element = orgElm.cloneNode() as Element;

		// if the image element set via setDragImage is an SVG element but not the <svg> element
		// itself, then wrap it in an <svg> element.
		if (mim.isSvg( orgElm) && !mim.isSvgSvg( orgElm))
		{
			let svgElm = document.createElementNS( "http://www.w3.org/2000/svg", "svg");
			svgElm.appendChild( clonedElm);
			divElm.appendChild( svgElm);
		}
		else
			divElm.appendChild( clonedElm);

		// style the div element with absolute positioning and some opacity
		divElm.style.opacity = "0.7";
		divElm.style.position = "absolute";

		// add a span element for displaying "dropEffect" image
		this.dropEffectElm = document.createElement( "span");
		this.dropEffectElm.style.position = "absolute";
		divElm.appendChild( this.dropEffectElm);

		document.body.appendChild( divElm);
		this.imageElm = divElm;

		// compare the bounding rectangle of the element set via setDragImage and the wrapping div
		// element. Their top-left coordinates may not coinside due to several factors (e.g.
		// absolute positioning or SVG coordinates). If this is the case, adjust the x and y
		// coordinates in the EmulDataTransfer object.
		let rcClonedElm: ClientRect = clonedElm.getBoundingClientRect();
		let rcDivElm: ClientRect = divElm.getBoundingClientRect();
		if (rcClonedElm.left != rcDivElm.left)
			this.emulDataTransfer.imageElmX += rcClonedElm.left - rcDivElm.left;
		if (rcClonedElm.top != rcDivElm.top)
			this.emulDataTransfer.imageElmY += rcClonedElm.top - rcDivElm.top;
	}



	// Display small image indicating what drop effect is expected
	private setDropEffectImageCue( dropEffect: string): void
	{
		let className: string;
		let color: string;
		switch( dropEffect)
		{
			case "none":
				className = "fa fa-fw fa-ban";
				color = "red";
				break;

			case "copy":
				className = "fa fa-fw fa-plus";
				color = "green";
				break;

			case "link":
				className = "fa fa-fw fa-link";
				color = "blue";
				break;

			default:
				className = "";
				color = "black";
				break;
		}

		this.dropEffectElm.className = className;
		this.dropEffectElm.style.color = color;
	}



	// Finish drag operation if the target accepts it.
	private handleDrop( e: MouseEvent): void
	{
		// we don't need to find element under the cursor because drop always occurs on the last
		// found target (or no target at all)
		if (this.lastTarget)
		{
			if (this.isDropPossibleOnLastTarget)
				this.lastTarget.dispatchEvent( this.createDragEventFromMouseEvent( e, "drop"));
			else if (this.isLastTargetDroppable)
				this.lastTarget.dispatchEvent( this.createDragEventFromMouseEvent( e, "dragleave"));
			else
				this.emulDataTransfer.dropEffect = "none";
		}
		else
			this.emulDataTransfer.dropEffect = "none";

		this.elm.dispatchEvent( this.createDragEventFromMouseEvent( e,  "dragend"));
	};



	// Cancel drag operation if cancel was pressed
	private cancelDragOperation( e: KeyboardEvent): void
	{
		// indicate that DnD was canceled
		this.emulDataTransfer.dropEffect = "none";

		// send the last target (if exists and is droppable) the dragleave event.
		if (this.lastTarget && this.isLastTargetDroppable)
			this.lastTarget.dispatchEvent( this.createDragEventFromKeyboardEvent( e, "dragleave"));

		// fire onDragEnd event
		this.elm.dispatchEvent( this.createDragEventFromKeyboardEvent( e, "dragend"));
	};



	// Clean up after drag operation finishes with either drop or cancelation
	private cleanupDragOperation()
	{
		// destroy the DataTransfer object
		this.emulDataTransfer = undefined;

		document.removeEventListener( "mousemove", this.onMouseMove);
		document.removeEventListener( "mouseup", this.onMouseUp);
		document.removeEventListener( "keydown", this.onKeyDown);
		document.removeEventListener( "keyup", this.onKeyUp);

		this.lastTarget = undefined;
		this.isLastTargetDroppable= false;
		this.isDropPossibleOnLastTarget = false;
		this.lastMouseEvent = undefined;

		if (this.imageElm)
		{
			this.imageElm.remove();
			this.imageElm = undefined;
		}
	};



	// creates DragEvent from the given MouseEvent and the static DataTransfer object
	private createDragEventFromMouseEvent( e: MouseEvent, type: DragEventType): DragEvent
	{
		// Edge doesn't support new DragEvent yet, while Chrome doesn't support initDragEvent
		if ("initDragEvent" in DragEvent.prototype)
		{
			let dragEvent = document.createEvent('DragEvent');
			(dragEvent as any).initDragEvent( type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY,
							e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button,
							e.relatedTarget, this.emulDataTransfer);
			return dragEvent;
		}
		else
		{
			return new DragEvent ( type,
			{
				bubbles: e.bubbles,
				cancelable: e.cancelable,
				detail: e.detail,
				view: e.view,
				altKey: e.altKey,
				button: e.button,
				buttons: e.buttons,
				clientX: e.clientX,
				clientY: e.clientY,
				ctrlKey: e.ctrlKey,
				metaKey: e.metaKey,
				relatedTarget: e.relatedTarget,
				screenX: e.screenX,
				screenY: e.screenY,
				shiftKey: e.shiftKey,
				dataTransfer: this.emulDataTransfer,
			});
		}
	}



	// Creates DragEvent from the given KeyboardEvent and the DataTransfer object. Uses last remembered
	// mouse event to fill coordinates and button information.
	private createDragEventFromKeyboardEvent( e: KeyboardEvent, type: DragEventType): DragEvent
	{
		// Edge doesn't support new DragEvent yet, while Chrome doesn't support initDragEvent
		if ("initDragEvent" in DragEvent.prototype)
		{
			let dragEvent = document.createEvent('DragEvent');
			(dragEvent as any).initDragEvent( type, e.bubbles, e.cancelable, e.view, e.detail,
							this.lastMouseEvent.screenX, this.lastMouseEvent.screenY,
							this.lastMouseEvent.clientX, this.lastMouseEvent.clientY,
							e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, this.lastMouseEvent.button,
							this.lastMouseEvent.relatedTarget, this.emulDataTransfer);
			return dragEvent;
		}
		else
		{
			return new DragEvent ( type,
			{
				bubbles: e.bubbles,
				cancelable: e.cancelable,
				detail: e.detail,
				view: e.view,
				altKey: e.altKey,
				button: this.lastMouseEvent.button,
				buttons: this.lastMouseEvent.buttons,
				clientX: this.lastMouseEvent.clientX,
				clientY: this.lastMouseEvent.clientY,
				ctrlKey: e.ctrlKey,
				metaKey: e.metaKey,
				relatedTarget: this.lastMouseEvent.relatedTarget,
				screenX: this.lastMouseEvent.screenX,
				screenY: this.lastMouseEvent.screenY,
				shiftKey: e.shiftKey,
				dataTransfer: this.emulDataTransfer,
			});
		}
	}



	// Coordinates of the mouse down event for the primary button. We will start emulating DnD if
	// the mouse moves more than two pixels in either direction while the primary button is still
	// down.
	private mouseDownX: number;
	private mouseDownY: number;

	// Static DataTransfer object that is used during a drag and drop operation. It is created
	// when DnD starts and is destroyed after it finishes. Presence of this object also indicates
	// that the DnD operstion is in progress
	private emulDataTransfer: IEmulDataTransfer;

	// Cloned element used to as an image during drag operation
	private imageElm: HTMLDivElement;

	// Sub-element of the image element that shows drop effect
	private dropEffectElm: HTMLSpanElement;

	// The last element under the cursor
	private lastTarget: Element;

	// Flag indicating whether the last target under the cursor was a valid drop zone. This is
	// needed to not send dragover and dragleave events to non-droppable targets. This flag is
	// set to true when the dragenter event sent to the target has its preventDefault method
	// called. If this flag is set to false, dragover, dragleave and drop events are not sent
	// to this target.
	private isLastTargetDroppable: boolean;

	// Flag indicating whether the drop is possible on the last target. This flag is needed because
	// even if a target is a valid drop zone, not all locations within the target might accept the
	// drop. This flag is set to true when the dragover event sent to the target has its
	// preventDefault method called. If this flag is set to false, drop event will not be sent to
	// this target.
	private isDropPossibleOnLastTarget: boolean;

	// Latest MouseEvent object, whcih we use to create DragEvent objects.
	private lastMouseEvent: MouseEvent;
}



