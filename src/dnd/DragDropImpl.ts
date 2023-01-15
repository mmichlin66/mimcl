import * as mim from "mimbl"
import {DragSourceHandler, DragSourceEmulator} from "./DragSource"
import {DragTargetHandler} from "./DragTarget"
import { DragSourcePropType, DragTargetPropType } from "./DragDropApi";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragSourceCustomElmPropHandler class is a handler for the dragSource custom property.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
class DragSourceCustomElmPropHandler implements mim.ICustomAttributeHandler<DragSourcePropType>
{
	constructor( elmVN: mim.IElmVN, propVal: DragSourcePropType)
	{
		this.elmVN = elmVN;
		this.currVal = propVal;
		this.add( propVal);
	}



	public terminate( isRemoval: boolean): void
	{
		this.remove();
		this.elmVN = undefined;
	}



	public update( newPropVal: DragSourcePropType): void
	{
		if (this.currVal !== newPropVal)
		{
			if (this.currVal)
				this.remove();

			if (newPropVal)
				this.add( newPropVal as DragSourcePropType);

			this.currVal = newPropVal;
		}
	}



	private add( propVal: DragSourcePropType): void
	{
		let elm = this.elmVN.elm as HTMLElement;
		this.dragSourceHandler = "ownerSVGElement" in elm
					? new DragSourceEmulator( elm, propVal)
					: new DragSourceHandler( elm, propVal);

		this.dragSourceHandler.init();
	}



	private remove(): void
	{
		if (this.dragSourceHandler)
		{
			this.dragSourceHandler.term();
			this.dragSourceHandler = undefined;
		}
	}



	// Eement node on which the property is defined.
	private elmVN: mim.IElmVN;

	// current attribute value
	currVal: DragSourcePropType;

	// Object that handles drag source opertions.
	private dragSourceHandler: DragSourceHandler;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragTargetCustomElmPropHandler class is a handler for the dragSource custom property.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
class DragTargetCustomElmPropHandler implements mim.ICustomAttributeHandler<DragTargetPropType>
{
	constructor( elmVN: mim.IElmVN, propVal: DragTargetPropType)
	{
		this.elmVN = elmVN;
		this.currVal = propVal;
		this.add( propVal);
	}



	public terminate( isRemoval: boolean): void
	{
		this.remove();
		this.elmVN = undefined;
	}



	public update( newPropVal: DragTargetPropType): void
	{
		if (this.currVal !== newPropVal)
		{
			if (this.currVal)
				this.remove();

			if (newPropVal)
				this.add( newPropVal as DragTargetPropType);

			this.currVal = newPropVal;
		}
	}



	private add( propVal: DragTargetPropType): void
	{
		let elm = this.elmVN.elm as HTMLElement;
		this.dragTargetHandler = new DragTargetHandler( elm, propVal);
		this.dragTargetHandler.init();
	}



	private remove(): void
	{
		if (this.dragTargetHandler)
		{
			this.dragTargetHandler.term();
			this.dragTargetHandler = undefined;
		}
	}



	// Eement node on which the property is defined.
	private elmVN: mim.IElmVN;

	// current attribute value
	currVal: DragTargetPropType;

	// Object that handles drag target opertions.
	private dragTargetHandler: DragTargetHandler;
}



// Register custom property factory for dragSource and dragTarget properties
export function registerDragDropCustomAttributes()
{
	mim.registerCustomAttribute( "dragSource", DragSourceCustomElmPropHandler);
	mim.registerCustomAttribute( "dragTarget", DragTargetCustomElmPropHandler);
}
