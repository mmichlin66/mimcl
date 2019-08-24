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
	public initialize( elmVN: mim.IElmVN, propName: string, propVal: DragSourcePropType): void
	{
		this.elmVN = elmVN;
		this.add( propVal);
	}



	public terminate(): void
	{
		this.remove();
		this.elmVN = undefined;
	}



	public update( oldPropVal: DragSourcePropType, newPropVal: DragSourcePropType): boolean
	{
		if (oldPropVal === newPropVal)
			return false;
		else
		{
			if (oldPropVal)
				this.remove();

			if (newPropVal)
				this.add( newPropVal as DragSourcePropType);

			return true;
		}
	}



	private add( propVal: DragSourcePropType): void
	{
		let elm = this.elmVN.Elm as HTMLElement;
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
	public initialize( elmVN: mim.IElmVN, propName: string, propVal: DragTargetPropType): void
	{
		this.elmVN = elmVN;
		this.add( propVal);
	}



	public terminate(): void
	{
		this.remove();
		this.elmVN = undefined;
	}



	public update( oldPropVal: DragTargetPropType, newPropVal: DragTargetPropType): boolean
	{
		if (oldPropVal === newPropVal)
			return false;
		else
		{
			if (oldPropVal)
				this.remove();

			if (newPropVal)
				this.add( newPropVal as DragTargetPropType);

			return true;
		}
	}



	private add( propVal: DragTargetPropType): void
	{
		let elm = this.elmVN.Elm as HTMLElement;
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

	// Object that handles drag target opertions.
	private dragTargetHandler: DragTargetHandler;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The DragDropCustomElmPropFactory class is a factory for the dragSource and dragTarget custom
// properties.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
class DragDropCustomElmPropFactory implements mim.ICustomAttributeFactory<DragSourcePropType | DragTargetPropType>
{
	public createHandler( propName: string): mim.ICustomAttributeHandler<DragSourcePropType | DragTargetPropType>
	{
		return propName === "dragSource"
			? new DragSourceCustomElmPropHandler()
			: new DragTargetCustomElmPropHandler;
	}
}



// Register custom property factory for dragSource and dragTarget properties
export function registerDragDropCustomAttributes()
{
	mim.registerCustomAttribute( "dragSource", new DragDropCustomElmPropFactory());
	mim.registerCustomAttribute( "dragTarget", new DragDropCustomElmPropFactory());
}
