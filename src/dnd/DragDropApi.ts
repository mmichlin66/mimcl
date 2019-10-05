import * as mim from "mimbl"


///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragDropEffect enumeration provides values for different drag & drop effects.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export const enum DragDropEffect
{
	None = "none",
	Copy = "copy",
	Move = "move",
	Link = "link",
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragDropEffect enumeration provides values for different drag & drop effects.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export const enum DragAllowedEffects
{
	None = "none",
	Copy = "copy",
	Move = "move",
	Link = "link",
	CopyMove = "copyMove",
	CopyLink = "copyLink",
	LinkMove = "linkMove",
	All = "all",
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The IDragSourceEvent interface represents an object that is passed to event handlers on the
// drag source elements.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface IDragSourceEvent
{
	// Reference to the original HTML5 DragEvent object.
	readonly dragEvent: DragEvent;

	// Sets data with the given type. For text data the type should be one of MIME types.
	setData( type: string, data: any): void;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The IDragTargetEvent interface represents an object that is passed to event handlers on the
// drag target elements.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface IDragTargetEvent
{
	// Reference to the original HTML5 DragEvent object.
	readonly dragEvent: DragEvent;

	// Determines whether the given data type is available.
	hasType( type: string): boolean;

	// Rerieves data for the given type. If the type is not available, returns undefined.
	getData( type: string): any;

	// Determines whether files are being dragged.
	hasFiles(): boolean;

	// Rerieves array of files. Returns undefined if files are not being dragged. The objects in
	// the returned array are of type WebKitEntry (we cannot specify it as such here because the
	// current Typescript is distributed with .d.ts libraries that don't define this type.
	getFiles(): any[];
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The IDragSource interface is used to designate an element as drag source. Implementations of
// this interface can be specified using the dragSource attribute on any DOM element. Data to be
// passed during the drag and drop operation is supplied by implementing the onDragStart callback
// and using the e.setData method.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface IDragSource
{
	// Callback that is invoked when drag & drop operation starts for the element.
	onDragStart: (e: IDragSourceEvent) => void;

	// Callback that is invoked when drag & drop operation ends.
	onDragEnd?: (e: IDragSourceEvent) => void;

	// Callback that is invoked when drag & drop operation is in progress.
	onDrag?: (e: IDragSourceEvent) => void;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ISimpleDragSource interface is used to designate an element as drag source. Implementations
// of this interface can be specified using the dragSource attribute on any DOM element. Data to
// be passed during the drag and drop operation is supplied directly via the data property. This
// interface allows simplifying drag and drop operation without the need to implement any
// callbacks.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ISimpleDragSource
{
	// Object holding data to be passed during drag operation. Each piece of data is identified by
	// a unique type (aka format) string.
	data: { [type: string]: any };

	// Allowed drop effects. If defined, this member is used only if either the onDragStart
	// callback is not defined or it doesn't set allowed drop effects.
	allowedEffects?: DragAllowedEffects;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// Drag source property (dragSource) can have one of the following shapes:
//	- IDragSource interface - drag behavior and data to be passed with it is determined
//		by implementing the relevant callbacks.
//	- ISimpleDragSource interface - data to be passed during the drag and drop operation is
//		defined by the data property.
//	- "elm-text" string - the Element object is used as object data and the element's text content
//		is used as text data.
//	- "elm-html" string - the Element object is used as object data and the element's outerHTML
//		is used as text data.
//	- true - equivalent to "elm-html" string.
//	- false - drag behavior is suppressed.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export type DragSourcePropType = IDragSource | ISimpleDragSource | boolean | "elm-text" | "elm-html";



// String used as a type (aka format) when an element object is being dragged.
export const DNDTYPE_ELEMENT = "application/DOMElement";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The IDragTarget interface is used to designate an element as drop target. Implementations of
// this interface can be specified using the dragTarget attribute on any DOM element. Receiving
// data is accomplished by implementing the onDrop callback and calling the e.getData method.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface IDragTarget
{
	// Callback that is invoked when cursor enters the element boundary during drag & drop
	// operation. Returns true if drop is possible and false otherwise. If this method is not
	// implemented, drop is considered possible. If this method returns false, the onDragOver
	// and onDragLeave methods will not be called.
	onDragEnter?: (e: IDragTargetEvent) => boolean;

	// Callback that is invoked when cursor hovers over the element during drag & drop
	// operation. Returns true if drop is possible and false otherwise. If this method is not
	// implemented, drop is considered possible. Regardless of whether this method returns true or
	// false, the onDragOver method will be continued to be called as the mouse moves. This allows
	// some parts of the element to be drop targets while others not.
	onDragOver?: (e: IDragTargetEvent) => boolean;

	// Callback that is invoked when cursor leaves the element boundary during drag & drop
	// operation.
	onDragLeave?: (e: IDragTargetEvent) => void;

	// Callback that is invoked when data was droped in this drop zone.
	onDrop: (e: IDragTargetEvent) => void;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ISimpleDragTarget interface is used to designate an element as drop target. Implementations
// of this interface can be specified using the dragTarget attribute on any DOM element. Receiving
// data is accomplished by specifying the expected types via the dataTypes property and
// implementing the onDataDropped callback.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ISimpleDragTarget
{
	// Array of data types (aka formats) that the drag target can receive.
	dataTypes: string[];

	// Style to apply for drag feedback.
	feedback?: mim.StylePropType;

	// Callback that is invoked when the data containing one or more appropriate types is dropped.
	// The data is delivered as an object where property names are data types and values are
	// data pieces of these types.
	onDataDropped: (data: {[type: string]: any}) => void;
}



// Drag target property (dragTarget) can be either IDragTarget interface or reference to an
// Element. In the latter case, the reference will be set if the data being dragged is an
// Element object.
export type DragTargetPropType = IDragTarget | ISimpleDragTarget;



declare module "mimbl/lib/api/mim"
{
	interface IElementProps<TRef,TChildren>
	{
		dragSource?: DragSourcePropType;
		dragTarget?: DragTargetPropType;
	}
}



