import * as mim from "mimbl"
import {DragDropEffect, DragAllowedEffects, DragTargetPropType, IDragTarget, ISimpleDragTarget, IDragTargetEvent} from "./DragDropApi";
import {DragAndDropData} from "./DataTransfer";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragTargetEvent class represents an object that is passed to different event handlers
// on the drag target elements.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
class DragTargetEvent implements IDragTargetEvent
{
	// Reference to the original HTML5 DragEvent object.
	get dragEvent(): DragEvent { return this.m_dragEvent; }
	set dragEvent( val: DragEvent) { this.m_dragEvent = val; }



	// Determines whether the given data type is available.
	hasType( type: string): boolean
	{
		return DragAndDropData.hasType( this.dragEvent.dataTransfer, type);
	}



	// Rerieves data for the given type. If the type is not available, returns undefined.
	getData( type: string): any
	{
		let data: any = DragAndDropData.getObjectData( type);
		return data !== undefined ? data : this.m_dragEvent.dataTransfer.getData( type);
	}



	// Determines whether files are being dragged.
	hasFiles(): boolean
	{
		let files = this.m_dragEvent.dataTransfer.files;
		return files && files.length > 0;
	}



	// Rerieves array of files. Returns undefined if files are not being dragged. The objects in
	// the returned array are of type WebKitEntry (we cannot specify it as such here because the
	// current Typescript is distributed with .d.ts libraries that don't define this type.
	getFiles(): any[]
	{
		let items = this.m_dragEvent.dataTransfer.items;
		if (!items || items.length === 0)
			return undefined;

		let entries: any[] = [];
		if (items)
		{
			for( let i: number = 0; i < items.length; i++)
				entries.push( items[i].webkitGetAsEntry());
		}

		return entries;
	}



	// Reference to the original HTML5 DragEvent object.
	private m_dragEvent: DragEvent;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragTargetHandler class implements support for HTML5 Drag and Drop target functionality.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class DragTargetHandler
{
	constructor( elm: Element, dragTarget: DragTargetPropType)
	{
		this.elm = elm;

		if ((dragTarget as IDragTarget).onDrop !== undefined)
			this.dragTarget = dragTarget as IDragTarget;
		else if ((dragTarget as ISimpleDragTarget).onDataDropped !== undefined)
			this.simpleDragTarget = dragTarget as ISimpleDragTarget;
	}



	public init()
	{
		this.dragTargetEvent = new DragTargetEvent();
		this.dragTargetEnterCounter = 0;

		this.elm.addEventListener( "dragenter", this.onDragEnter);
		this.elm.addEventListener( "dragleave", this.onDragLeave);
		this.elm.addEventListener( "dragover", this.onDragOver);
		this.elm.addEventListener( "drop", this.onDrop);
	}



	public term()
	{
		this.elm.removeEventListener( "dragenter", this.onDragEnter);
		this.elm.removeEventListener( "dragleave", this.onDragLeave);
		this.elm.removeEventListener( "dragover", this.onDragOver);
		this.elm.removeEventListener( "drop", this.onDrop);

		this.dragTargetEvent = undefined;
	}



	private onDragEnter = (e: DragEvent): void =>
	{
		e.stopPropagation();

		// we will call the onDragEnter callback only if this is the first time the dragenter
		// event is fired on our element or on one of child non-drag-target elements.
		if (this.dragTargetEnterCounter++ > 0)
		{
			if (this.isDropPossible)
				e.preventDefault();

			return;
		}

		this.isDropPossible = false;

		// if IDragTarget.types property is defined and is not empty, drag will be possible
		// only if the data being dragged has at least on type from the types array.
		if (this.simpleDragTarget!== undefined)
		{
			for( let type of this.simpleDragTarget.dataTypes)
			{
				if (DragAndDropData.hasType( e.dataTransfer, type))
				{
					this.isDropPossible = true;
					break;
				}
			}

			// if no suitable type found, we don't call e.preventDefault, which disallows drop
			if (!this.isDropPossible)
				return;
		}
		else if (this.dragTarget !== undefined)
		{
			// if the onDragEnter method is not implemented on the drag target, we consider drop possible
			if (this.dragTarget.onDragEnter === undefined)
				this.isDropPossible = true;
			else
			{
				this.dragTargetEvent.dragEvent = e;
				this.isDropPossible = this.dragTarget.onDragEnter( this.dragTargetEvent);
			}
		}

		if (this.isDropPossible)
		{
			e.preventDefault();

			if (this.simpleDragTarget !== undefined)
			{
				// apply visual feedback if specified
				if (this.simpleDragTarget.feedback !== undefined)
				{
					// although style property exists in both HTMLElement and SVGElement, it is defined on a
					// separate type - ElementCSSInlineStyle
					let elmStyle: CSSStyleDeclaration = (this.elm as any as ElementCSSInlineStyle).style;

					// save current values of style properties specified in feedback and set the style from
					// the feedback
					this.savedStyle = {};
					for( let prop in this.simpleDragTarget.feedback)
					{
						this.savedStyle[prop] = elmStyle[prop];
						elmStyle[prop] = this.simpleDragTarget.feedback[prop];
					}
				}
			}
			else if (this.dragTarget !== undefined)
			{
				// if the callback is not defined we need to set drop effect
				if (this.dragTarget.onDragEnter === undefined)
					e.dataTransfer.dropEffect = this.getDefaultDropEffect( e);
			}
		}
	};



	private onDragOver = (e: DragEvent): void =>
	{
		e.stopPropagation();

		let isDropPossible = false;

		if (this.simpleDragTarget !== undefined)
			isDropPossible = true;
		else if (this.dragTarget !== undefined)
		{
			// if the onDragOver method is not implemented on the drag target, we consider drop possible
			if (this.dragTarget.onDragOver === undefined)
				isDropPossible = true;
			else
			{
				// call the onDragOver method and consider drop possible only if it returns true
				this.dragTargetEvent.dragEvent = e;
				isDropPossible = this.dragTarget.onDragOver( this.dragTargetEvent);
			}
		}

		if (isDropPossible)
		{
			e.preventDefault();

			if (this.simpleDragTarget !== undefined)
				e.dataTransfer.dropEffect = this.getDefaultDropEffect( e);
			else if (this.dragTarget !== undefined)
			{
				// if the callback is not defined we need to set drop effect
				if (this.dragTarget.onDragOver === undefined)
					e.dataTransfer.dropEffect = this.getDefaultDropEffect( e);
			}
		}
	};



	private onDragLeave = (e: DragEvent): void =>
	{
		e.preventDefault();
		e.stopPropagation();

		// we will call the onDragLeave callback only if the mouse completely leaves our element,
		// which means our counter reaches 0.
		if (--this.dragTargetEnterCounter > 0)
			return;

		if (this.simpleDragTarget !== undefined)
		{
			// revert visual feedback (if was specified)
			if (this.savedStyle !== undefined)
			{
				// although style property exists in both HTMLElement and SVGElement, it is defined on a
				// separate type - ElementCSSInlineStyle
				let elmStyle: CSSStyleDeclaration = (this.elm as any as ElementCSSInlineStyle).style;

				for( let prop in this.savedStyle)
					elmStyle[prop] = this.savedStyle[prop];

				this.savedStyle = undefined;
			}
		}
		else if (this.dragTarget !== undefined)
		{
			if (this.dragTarget.onDragLeave !== undefined)
			{
				this.dragTargetEvent.dragEvent = e;
				this.dragTarget.onDragLeave( this.dragTargetEvent);
			}
		}
	};



	private onDrop = (e: DragEvent): void =>
	{
		e.preventDefault();
		e.stopPropagation();

		if (this.simpleDragTarget !== undefined)
		{
			let expectedTypes: string[] = this.simpleDragTarget.dataTypes;
			let dataObj = {};
			for( let type of e.dataTransfer.types)
			{
				// if we have some expected types defined skip the current type if it is no one
				// of the expected
				if (expectedTypes && expectedTypes.length > 0 && expectedTypes.indexOf( type) < 0)
					continue;

				let data = DragAndDropData.getObjectData( type);
				if (data !== undefined)
					dataObj[type] = data;
				else
				{
					data = e.dataTransfer.getData( type);
					if (data !== undefined)
						dataObj[type] = data;
				}
			}

			this.simpleDragTarget.onDataDropped( dataObj);
		}
		else if (this.dragTarget !== undefined)
		{
			this.dragTargetEvent.dragEvent = e;
			this.dragTarget.onDrop( this.dragTargetEvent);
		}

		//// if the target implements onDragLeave, call it now to allow it to cleanup
		//if (this.dragTarget.onDragLeave !== undefined)
		//{
		//	this.dragTargetEvent.dragEvent = e;
		//	this.dragTarget.onDragLeave( this.dragTargetEvent);
		//}

		// clear our dragEnterCounter
		this.dragTargetEnterCounter = 0;
	};



	// Returns default drop effect according to the allowed effects and keys pressed
	private getDefaultDropEffect(e: DragEvent): DragDropEffect
	{
		let allowedEffects = e.dataTransfer.effectAllowed as DragAllowedEffects;
		switch( allowedEffects)
		{
			case DragAllowedEffects.Copy:
				return DragDropEffect.Copy;
			case DragAllowedEffects.Move:
				return DragDropEffect.Move;
			case DragAllowedEffects.Link:
				return DragDropEffect.Link;
			case DragAllowedEffects.CopyMove:
				return e.ctrlKey ? DragDropEffect.Copy : DragDropEffect.Move;
			case DragAllowedEffects.CopyLink:
				return e.altKey ? DragDropEffect.Link : DragDropEffect.Copy;
			case DragAllowedEffects.LinkMove:
				return e.altKey ? DragDropEffect.Link : DragDropEffect.Move;

			case DragAllowedEffects.All:
				return e.altKey ? DragDropEffect.Link : e.ctrlKey ? DragDropEffect.Copy : DragDropEffect.Move;

			default: DragDropEffect.None;
		}
	}



	// Determines whether the given drop effect is among the allowed effects
	private isDropEffectAllowed( dropEffect: DragDropEffect, allowedEffects: DragAllowedEffects): boolean
	{
		switch( allowedEffects)
		{
			case DragAllowedEffects.Copy:
				return dropEffect === DragDropEffect.Copy;
			case DragAllowedEffects.Move:
				return dropEffect === DragDropEffect.Move;
			case DragAllowedEffects.Link:
				return dropEffect === DragDropEffect.Link;
			case DragAllowedEffects.CopyMove:
				return dropEffect === DragDropEffect.Copy || dropEffect === DragDropEffect.Move;
			case DragAllowedEffects.CopyLink:
				return dropEffect === DragDropEffect.Copy || dropEffect === DragDropEffect.Link;
			case DragAllowedEffects.LinkMove:
				return dropEffect === DragDropEffect.Link || dropEffect === DragDropEffect.Move;
			case DragAllowedEffects.All:
				return dropEffect !== DragDropEffect.None;

			default: return false;
		}
	}



	// Instance of an Element.
	public elm: Element;

	// IDragTarget interface defining element's behavior as drag target.
	public dragTarget: IDragTarget;

	// IDragTarget interface defining element's behavior as drag target.
	public simpleDragTarget: ISimpleDragTarget;

	// Event object that is reused when sending events to a drag target element.
	private dragTargetEvent: DragTargetEvent;

	// A drag target element can have children who are not drag targets by themselves. In this
	// case, when the mouse goes from our element to a child element, we will receive dragenter
	// event on the child element and dragleave on ours. We don't want to report this through
	// our custom events because from the cller's point of view the muse is still within the
	// bounds of our element. Therefore, we keep the counter variable, which is set to 1
	// when the first dragenter event (from our element or from a child) is reported. On each
	// subsequent dragenter and dragleave it will be incremented and decremented respectively.
	// When this counter reaches zero, we call the onDragLeave handler.
	private dragTargetEnterCounter: number;

	// Flag indicating whether in the first call to the onDragEnter we determined that drop
	// was possible.
	private isDropPossible: boolean;

	// Set of styles saved before applying feedback styles during dragenter event. We will use
	// these styles to restore the element to the original state during the dragleave event.
	private savedStyle: mim.StylePropType;
}



