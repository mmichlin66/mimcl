/**
 * The ScrollAxis class represents a single axis of data, which consists of items, and performs
 * calculations during scrolling back and forth along the axis. The ScrollAxis class itself doesn't
 * have any visual representation and only serves as an implementation of the algorithm that
 * helps virtualize scrolling - that is display only small subset of data items and add/remove
 * items as scrolling happens.
 * 
 * VAxis assumes the use of 3 DOM elements:
 *	- frame - the "outer" element which displays the scrollbar when necessary
 *	- wall - the "inner" element which has the size of the entire possible set of items. It is
 *		needed to make scrolling more-or-less accurate.
 *	- subset - the element that displays only items that fit the frame plus a certain number of
 *		additional items for "overscan".
 * 
 * VAxis calculates average item size by dividing the size of the data by the number of items.
 * The average value is recalculated every time items are added to or deleted from the subset thus
 * accomodating items with differen sizes. Based on the average value the wall element is sized
 * to include the entire data set, which helps to achieve more-or-less accurate scroll
 * positioning.
 *
 * VAxis uses minimum, optimal and maximum overscan number of items on both sides of the frame and
 * makes sure that the actual number of items is within these minimum and maximum values. During
 * scrolling, if the actual overscan number becomes less than the minimum, new items are added; if
 * it becomes more then the maximum, items are deleted. When items are added they are added up to
 * the optimal overscan number.
 */
export class ScrollAxis
{
	// Minimal number of additional items on each side of the port that should be maintained. When
	// during scrolling the number of overscan items falls under this number, new items are added.
	private minOverscan: number;

	// Optimal number of overscan items on each side of the port. When adding new items or removing
	// existing items we want to rich this number of items in the overscan.
	private optOverscan: number;

	// Maximum number of overscan items on each side of the port that should be maintained. When
	// during scrolling the number of overscan items exceeds this number, items are removed.
	private maxOverscan: number;



	constructor( minOverscan: number, optOverscan: number, maxOverscan: number)
	{
		this.minOverscan = minOverscan;
		this.optOverscan = optOverscan;
		this.maxOverscan = maxOverscan;
	}


	/**
	 * Measures the size occupied by the current data set relative to the size of the frame
	 * and determines whether we need to add/remvove items. This method should be called when:
	 *	- The total number of items in the data set changes.
	 *	- The size of the frame element changes.
	 *	- The frame element is scrolled.
	 * 
	 * @param totalCount Number of items in the entire data set
	 * @param firstItem Index of the first item currently in the subset
	 * @param itemCount Number of items currently in the subset
	 * @param frameSize Current size in pizels of the frame element
	 * @param wallSize Current size in pixels of the wall element
	 * @param subsetSize Current size in pixels of the subset element
	 * @param scrollPos Current or new scroll position.
	 */
	public measure( totalCount: number, oldFirst: number, oldCount: number, oldAvgItemSize: number,
		frameSize: number, wallSize: number, subsetSize: number, scrollPos: number): ScrollAxisAction
	{
		// prepare the object to be returned
		let retAction = new ScrollAxisAction();
		if (totalCount === 0)
			return retAction;
		else if (oldCount === 0)
			throw new Error( "itemCount cannot be zero");

		let oldLast = oldFirst + oldCount - 1;
		let totalLast = totalCount - 1;

		// calculate new average item size based on the number of items in the current subset
		// and the current size of the data element.
		let newAvgItemSize = subsetSize / oldCount;
		if (oldAvgItemSize)
			newAvgItemSize = (newAvgItemSize + oldAvgItemSize) / 2;

		// based on the scrolling position and the average size estimate what items would fit inside
		// the frame element.
		let fitFirst = Math.min( Math.floor( scrollPos / newAvgItemSize), totalLast);
		let fitLast = Math.min( Math.ceil( (scrollPos + frameSize) / newAvgItemSize), totalLast);

		// get new first and last  indices with minimal, optimal and maximum overscan
		let minOverscanFirst = Math.max( fitFirst - this.minOverscan, 0);
		let optOverscanFirst = Math.max( fitFirst - this.optOverscan, 0)
		let maxOverscanFirst = Math.max( fitFirst - this.maxOverscan, 0);
		let minOverscanLast = Math.min( fitLast + this.minOverscan, totalLast);
		let optOverscanLast = Math.min( fitLast + this.optOverscan, totalLast);
		let maxOverscanLast = Math.min( fitLast + this.maxOverscan, totalLast);

		// these will be indices that we will actually need after comparing the new range
		// with the old one
		let newFirst: number;
		let newLast: number;

		if (minOverscanFirst < oldFirst)
			newFirst = optOverscanFirst;
		else if (minOverscanFirst > oldFirst && minOverscanFirst < oldLast)
			newFirst = Math.max( maxOverscanFirst, oldFirst);
		else if (maxOverscanFirst > oldLast)
			newFirst = optOverscanFirst;
		else if (oldLast - maxOverscanFirst > optOverscanFirst - oldLast)
			newFirst = maxOverscanFirst;
		else
			newFirst = optOverscanFirst;

		if (minOverscanLast > oldLast)
			newLast = optOverscanLast;
		else if (minOverscanLast < oldLast && minOverscanLast > oldFirst)
			newLast = Math.min( maxOverscanLast, oldLast);
		else if (maxOverscanLast < oldFirst)
			newLast = optOverscanLast;
		else if (maxOverscanLast - oldFirst > oldFirst - optOverscanLast)
			newLast = maxOverscanLast;
		else
			newLast = optOverscanLast;

		if (newFirst > newLast)
			console.error( `Wrong ScrollAxis calculation: newFirst '${newFirst}' is greater than newLast '${newLast}'`)

		// set what we already know into the return object
		retAction.newFirst = newFirst;
		retAction.newLast = newLast;
		retAction.newAvgItemSize = newAvgItemSize;
		retAction.newWallSize = Math.ceil( totalCount * newAvgItemSize);
		retAction.newSubsetOffset = Math.ceil( newFirst * newAvgItemSize);

		// now that we have the indices of the items we want, determine what items should be
		// added/removed in the beginning and the end
		if (newFirst == oldFirst && newLast == oldLast)
		{
			// if the new dataset is the same as the old one, don't add/remove any items
			retAction.noAddRemoveNeeded = true;
		}
		else if (newFirst > oldLast || newLast < oldFirst)
		{
			// if the old and the new datasets don't intersect, remove all existing and add all
			// new items.
			retAction.neeedToRemoveAllItems = true;
		}
		else
		{
			if (newFirst < oldFirst)
			{
				// need to add some items at the beginning
				retAction.countToAddAtStart = oldFirst - newFirst;
			}
			else if (newFirst > oldFirst)
			{
				// need to remove some items at the beginning
				retAction.countToRemoveAtStart = newFirst - oldFirst;
			}

			if (newLast < oldLast)
			{
				// need to remove some items at the end
				retAction.countToRemoveAtEnd = oldLast - newLast;
			}
			else if (newLast > oldLast)
			{
				// need to add some items at the end
				retAction.countToAddAtEnd = newLast - oldLast;
			}
		}

		return retAction;
	}
}



/**
 * The ScrollAxisAction class represents the action(s) that should be done after the ScrollAxis
 * performed calculations based on the current state of the frame, wall and data. The actions
 * are instructions to add or remove items and to set wall size and data offset.
 */
export class ScrollAxisAction
{
	// New avearage item size
	newAvgItemSize: number = 0;

	// New size that should be set to the wall element
	newWallSize: number = 0;

	// New offset of the subset element from the wall element
	newSubsetOffset: number = 0;

	// Index of the first item that should be in the subset
	newFirst: number = 0;

	// Index of the last item that should be in the subset
	newLast: number = 0;

	// Flag indicating whether the caller should neither add nor remove any items.
	noAddRemoveNeeded: boolean = false;

	// Flag indicating whether the caller should remove all existing items. If this flag is set
	// to true, then the caller should remove all existing items and then add all items from
	// newFirst to newLast
	neeedToRemoveAllItems: boolean = false;

	// Number of items to remove at the beginning. If not zero, this is the items from oldFirst
	// to newFirst-1.
	countToRemoveAtStart: number = 0;

	// Number of items to remove at the end. If not zero, this is the items from newLast+1
	// to oldLast.
	countToRemoveAtEnd: number = 0;

	// Number of items to add at the beginning. If not zero, this is the items from newFirst
	// to oldFirst-1.
	countToAddAtStart: number = 0;

	// Number of items to add at the end. If not zero, this is the items from oldLast+1
	// to newLast.
	countToAddAtEnd: number = 0;
}



