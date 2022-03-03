import { DragSourcePropType, DragTargetPropType } from "../dnd/DragDropApi";
import { IDialog, IPopup } from "../popup/Popups";
import { IRouterService } from "../router/Router";
import { ILocalStyleService } from "./LocalStyles"



declare module "mimbl"
{
    interface IServiceDefinitions
	{
        LocalStyles: ILocalStyleService;
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



declare module "mimbl"
{
}



