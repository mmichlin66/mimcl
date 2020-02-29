import {Color_StyleType} from "mimcss" 



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ITree interface represents a tree control.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ITree extends ITreeNodeContainer
{
	// Tab index of the tree control.
	tabIndex: number;

	// List of nodes.
	readonly nodes: ITreeNode[];

	// currently selected node
	readonly selectedNode: ITreeNode;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ITreeNodeParams interface represents parameters of a tree node that can be set/changed
// externally.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ITreeNodeParams
{
	content: any;
	icon?: TreeNodeIconParams;
	textColor?: Color_StyleType;
	bgColor?: Color_StyleType;
	italic?: boolean;
	bold?: boolean;
	customClass?: string;
	data?: any;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ITreeNodeIconParams interface represents parameters of an icon of a tree node.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export type TreeNodeIconParams = {class: string} | {img: string}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ITreeNode interface represents a single node in the tree hierarchy.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ITreeNode extends ITreeNodeParams, ITreeNodeContainer
{
	// Tree to which this node belongs.
	readonly tree: ITree;

	// Parent tree node or null for top-level (root) nodes.
	readonly parent: ITreeNode;

	// 0-based level of the node in the ancestral hierarchy.
	readonly level: number;

	// 0-based index of the node in the list of its parent's sub-nodes.
	readonly index: number;

	// List of sub-nodes.
	readonly subNodes: ITreeNode[];

	// Flag indicating whether the node is expanded.
	readonly isExpanded: boolean;

	// Expands the node so that its sub-nodes become visible.
	expand(): void;

	// Colapses the node hiding its sub-nodes.
	collapse(): void;

	// Selects the node.
	select(): void;

	// Unselects the node.
	unselect(): void;
}



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The ITreeNodeContainer interface represents a collection of tree nodes.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export interface ITreeNodeContainer
{
	// Creates a new node. If the index parameter is between zero and the current number of nodes,
	// the new node is inserted at this index. If the index parameter is undefined or less than
	// zero or greater then the current number of nodes, it is appended to the end of the list.
	addNode( params: ITreeNodeParams, index?: number): ITreeNode;

	// Removes existing node at the given index in the nodes list.
	removeNode( index: number): void;

	// Removes all nodes.
	removeAllNodes(): void;

	// Expands all nodes.
	expandAll(): void;

	// Colapses all nodes.
	collapseAll(): void;
}



import {Tree} from "./Tree";



// Creates tree control instance
export function createTree(): ITree
{
	return new Tree();
}



