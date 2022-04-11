import {DragSourcePropType, DragTargetPropType} from "../dnd/DragDropApi"
import {IRouterService} from "../router/Router"



declare module "mimbl"
{
    interface IServiceDefinitions
	{
        Router: IRouterService;
    }

	interface IElementProps
	{
		dragSource?: DragSourcePropType;
		dragTarget?: DragTargetPropType;
	}
}



