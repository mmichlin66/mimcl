// Type definitions for mimcl

export * from "./dnd/DragDropApi";
export * from "./popup/Popup";
export * from "./popup/Dialog";
export * from "./popup/MsgBox";
export * from "./tree/TreeApi";
export * from "./virt/ScrollAxis";
export * from "./virt/VTable";

import {registerDragDropCustomAttributes} from "./dnd/DragDropImpl";
registerDragDropCustomAttributes();
