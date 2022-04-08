import {DragSourcePropType, DragTargetPropType} from "../dnd/DragDropApi"
import {IPopup} from "../popup/Popup"
import {IDialog} from "../popup/Dialog"
import {IRouterService} from "../router/Router"



declare module "mimbl"
{
    interface IServiceDefinitions
	{
        Router: IRouterService;

        /**
         * The "popup" service gives components used in the content of the [[Popup]] component
         * access to the [[IPopup]] interface, through which they can close the popup.
         */
        popup: IPopup;

        /**
         * The "dialog" service gives components used in the caption or the body of the [[Dialog]]
         * component access to the [[IDialog]] interface, through which they can add buttons
         * and otherwise manipulate the dialog.
         */
        dialog: IDialog;
    }

	interface IElementProps
	{
		dragSource?: DragSourcePropType;
		dragTarget?: DragTargetPropType;
	}
}



