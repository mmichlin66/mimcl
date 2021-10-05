import * as mim from "mimbl"
import * as api from "./DragDropApi";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragAndDropData static class deals with data of arbitrary types being transfered
// during drag & drop operations. When a drag operation starts, pieces of data are added to a map
// with types (formats) as keys (these are the same formats that are kept in the HTML5 DataTransfer
// object. Data is added using the SetObjectData method of the IDragStartEvent interface. When the
// drop occurs, the GetObjectData of the IDragTargetEvent is used to retrieve the data. The map is
// cleared when the drag operation ends - regardless whether it was successful or was canceled.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class DragAndDropData
{
	public static setObjectData( type: string, data: any): void
	{
		if (!type || data === undefined)
			return;

		DragAndDropData.dataMap.set( type, data);
	}

	public static getObjectData( type: string): any
	{
		return DragAndDropData.dataMap.get( type);
	}

	public static removeObjectData( type: string): void
	{
		DragAndDropData.dataMap.delete( type);
	}

	public static clearAllObjectData(): void
	{
		DragAndDropData.dataMap.clear();
	}



	// Determines whether the given data type is available in the given DataTransfer object.
	public static hasType( dataTransfer: DataTransfer, type: string): boolean
	{
		// Edge implemnts types via DOMStringList, which doesn't have indexOf
		if (dataTransfer.types.indexOf)
			return dataTransfer.types.indexOf( type) >= 0;
		else
			return (dataTransfer.types as any as DOMStringList).contains( type);
	}



	// Map of object formats to object values.
	private static dataMap: Map<string,any> = new Map<string,any>();
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The IEmulDataTransfer interface represents objects that emulate DataTransfer object when
// the drag source does not support HTML5 drag and drop natively.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface IEmulDataTransfer extends DataTransfer
{
	// Information about element used to derive an image to show during drag operations.
	imageElm: Element;
	imageElmX: number;
	imageElmY: number;
	isImageElmReset: boolean;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The EmulDataTransfer emulates the behavior of DataTransfer object when the drag source does not
// support HTML5 drag and drop natively.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class EmulDataTransfer extends DataTransfer implements IEmulDataTransfer
{
	constructor()
	{
		super();

		this.isImageElmReset = false;
		this.dataMap = new Map<string,string>();
		this.dataFormats = [];
	}

	// Uses the given element to update the drag feedback, replacing any previously specified
	// feedback.
	public setDragImage( image: Element, x: number, y: number): void
	{
		this.imageElm = image;
		this.imageElmX = x;
		this.imageElmY = y;

		// Edge doesn't have setDragImage method in its DataTransfer class.
		if (super.setDragImage)
			super.setDragImage( image, x, y);

		// indicate that a new image element was set, so that we will "prepare" it on the next
		// drag step
		this.isImageElmReset = true;
	}



	set effectAllowed( val: api.DragAllowedEffects)
	{
		this.effectAllowedEx = val;
		super.effectAllowed = val;
	}

	get effectAllowed(): api.DragAllowedEffects
	{
		return this.effectAllowedEx === undefined ? super.effectAllowed : this.effectAllowedEx;
	}



	set dropEffect( val: api.DragDropEffect)
	{
		this.dropEffectEx = val;
		super.dropEffect = val;
	}

	get dropEffect(): api.DragDropEffect
	{
		return this.dropEffectEx === undefined ? super.dropEffect : this.dropEffectEx;
	}



	setData( format: string, data: string): boolean
	{
		super.setData( format, data);
		this.dataMap.set( format, data);
		this.dataFormats = Array.from( this.dataMap.keys());
		return true;
	}

	getData( format: string): string
	{
		let s: string = this.dataMap.get( format);
		return s === undefined ? "" : s;
	}

	clearData( format?: string): boolean
	{
		super.clearData( format);

		if (format)
			this.dataMap.delete( format);
		else
			this.dataMap.clear();

		this.dataFormats = Array.from( this.dataMap.keys());
		return true;
	}

	get types(): string[]
	{
		return this.dataFormats;
	}



	// Information about element used to derive an image to show during drag operations.
	public imageElm: Element;
	public imageElmX: number;
	public imageElmY: number;
	public isImageElmReset: boolean;

	// Remembered allowed effect - needed because when drag and drop operation is emulated, the
	// original DragTransfer object doesn't seem to accept any allowed effect value, which always
	// stays "none".
	private effectAllowedEx: api.DragAllowedEffects;

	// Remembered drop effect - needed because when drag and drop operation is emulated, the
	// original DragTransfer object doesn't seem to accept any drop effect value, which always
	// stays "none".
	private dropEffectEx: api.DragDropEffect;

	// Map of data types (aka formats) to data items.
	private dataMap: Map<string,string>;

	// Array of data types (aka formats). This array changes every time data is set or cleared.
	private dataFormats: string[];
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The EmulLegacyDataTransfer emulates the behavior of DataTransfer object when the drag source
// does not support HTML5 drag and drop natively. This object is used under Edge, which doesn't
// implement the native DataTransfer object properly.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class EmulLegacyDataTransfer extends DataTransfer implements IEmulDataTransfer
{
	constructor()
	{
		super();

		this.dataMap = new Map<string,string>();
		this.dataFormats = [];
		this.m_items = null;
		this.m_files = null;
	}

	// Uses the given element to update the drag feedback, replacing any previously specified
	// feedback.
	public setDragImage( image: Element, x: number, y: number): void
	{
		this.imageElm = image;
		this.imageElmX = x;
		this.imageElmY = y;

		// indicate that a new image element was set, so that we will "prepare" it on the next
		// drag step
		this.isImageElmReset = true;
	}



	set effectAllowed( val: api.DragAllowedEffects)
	{
		this.effectAllowedEx = val;
	}

	get effectAllowed(): api.DragAllowedEffects
	{
		return this.effectAllowedEx;
	}



	set dropEffect( val: api.DragDropEffect)
	{
		this.dropEffectEx = val;
	}

	get dropEffect(): api.DragDropEffect
	{
		return this.dropEffectEx;
	}



	setData( format: string, data: string): boolean
	{
		this.dataMap.set( format, data);
		this.dataFormats = Array.from( this.dataMap.keys());
		return true;
	}

	getData( format: string): string
	{
		let s: string = this.dataMap.get( format);
		return s === undefined ? "" : s;
	}

	clearData( format?: string): boolean
	{
		if (format)
			this.dataMap.delete( format);
		else
			this.dataMap.clear();

		this.dataFormats = Array.from( this.dataMap.keys());
		return true;
	}

	get types(): string[]
	{
		return this.dataFormats;
	}



    get files(): FileList { return this.m_files; }
    get items(): DataTransferItemList { return this.m_items; }


	// Information about element used to derive an image to show during drag operations.
	public imageElm: Element;
	public imageElmX: number;
	public imageElmY: number;
	public isImageElmReset: boolean = false;

	// Remembered allowed effect - needed because when drag and drop operation is emulated, the
	// original DragTransfer object doesn't seem to accept any allowed effect value, which always
	// stays "none".
	private effectAllowedEx: api.DragAllowedEffects;

	// Remembered drop effect - needed because when drag and drop operation is emulated, the
	// original DragTransfer object doesn't seem to accept any drop effect value, which always
	// stays "none".
	private dropEffectEx: api.DragDropEffect;

	// Map of data types (aka formats) to data items.
	private dataMap: Map<string,string>;

	// Array of data types (aka formats). This array changes every time data is set or cleared.
	private dataFormats: string[];

    private m_files: FileList;
    private m_items: DataTransferItemList;
}



