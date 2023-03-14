import createListComponent, { Props } from '../lib/createListComponent'

type ItemSizeGetter = (index: number) => number
type VariableSizeListProps = Props & {
  itemSize: ItemSizeGetter
  estimatedItemSize?: number
}
type ItemMetadata = {
  offset: number
  size: number
}
type InstanceProps = {
  estimatedItemSize: number
  lastMeasuredIndex: number
  itemMetadataMap: { [key in number]: ItemMetadata }
}

const DEFAULT_ESTIMATED_ITEM_SIZE = 50

const getMetadataItem = (props: Props, index: number, instanceProps: InstanceProps) => {
  const { itemSize } = props as VariableSizeListProps
  const { lastMeasuredIndex, itemMetadataMap } = instanceProps

  if (index > lastMeasuredIndex) {
    let offset = 0
    if (lastMeasuredIndex >= 0) {
      offset = itemMetadataMap[lastMeasuredIndex].offset + itemMetadataMap[lastMeasuredIndex].size
    }

    for (let i = lastMeasuredIndex + 1; i <= index; i++) {
      const size = itemSize(i)

      itemMetadataMap[i] = {
        offset,
        size,
      }

      offset += size
    }

    instanceProps.lastMeasuredIndex = index
  }

  return itemMetadataMap[index]
}

const findNearestItemIndex = (props: Props, offset: number, instanceProps: InstanceProps) => {
  const { lastMeasuredIndex } = instanceProps
  const lastMeasuredOffset =
    lastMeasuredIndex > 0 ? getMetadataItem(props, lastMeasuredIndex, instanceProps).offset : 0

  if (lastMeasuredOffset >= offset) {
    return findNearestItemByBinarySearch(props, offset, lastMeasuredIndex, 0, instanceProps)
  }

  // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
  // The overall complexity for this approach is O(log n).
  return findNearestItemByExponentialSearch(
    props,
    Math.max(0, lastMeasuredIndex),
    offset,
    instanceProps
  )
}

const findNearestItemByBinarySearch = (
  props: Props,
  offset: number,
  high: number,
  low: number,
  instanceProps: InstanceProps
) => {
  let left = low
  let right = high

  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2)
    const currentOffset = getMetadataItem(props, middle, instanceProps).offset

    if (currentOffset < offset) {
      left = middle + 1
    } else if (currentOffset > offset) {
      right = middle - 1
    } else {
      return middle
    }
  }

  return left > 0 ? left - 1 : 0
}

const findNearestItemByExponentialSearch = (
  props: Props,
  startIndex: number,
  offset: number,
  instanceProps: InstanceProps
) => {
  const { itemCount } = props
  let interval = 1
  let index = startIndex

  while (index < props.itemCount && getMetadataItem(props, index, instanceProps).offset < offset) {
    index += interval
    interval *= 2
  }

  return findNearestItemByBinarySearch(
    props,
    offset,
    Math.min(index, itemCount - 1),
    Math.floor(index / 2),
    instanceProps
  )
}

const VariableSizeList = createListComponent<VariableSizeListProps>({
  getItemOffset: (props: Props, index: number, instanceProps: InstanceProps) =>
    getMetadataItem(props, index, instanceProps).offset,

  getItemSize: ({ itemSize }: Props, index: number) => (itemSize as ItemSizeGetter)(index),

  getEstimatedTotalSize: (props: Props, instanceProps: InstanceProps) => {
    const { itemCount } = props
    const { lastMeasuredIndex, estimatedItemSize } = instanceProps
    const { offset, size } = getMetadataItem(props, lastMeasuredIndex, instanceProps)
    const totalSizeOfMeasuredItems = offset + size
    const totalSizeOfUnmeasuredItems = (itemCount - lastMeasuredIndex - 1) * estimatedItemSize
    return totalSizeOfMeasuredItems + totalSizeOfUnmeasuredItems
  },

  getStartIndexForOffset: (props: Props, offset: number, instanceProps: InstanceProps) =>
    findNearestItemIndex(props, offset, instanceProps),

  getStopIndexForStartIndex: (
    props: Props,
    startIndex: number,
    scrollOffset: number,
    instanceProps: InstanceProps
  ) => {
    const { direction, itemCount, width, height } = props
    const size = direction === 'horizontal' ? width : height

    const metadataItem = getMetadataItem(props, startIndex, instanceProps)
    const maxOffset = scrollOffset + size

    let offset = metadataItem.offset + metadataItem.size
    let stopIndex = startIndex

    while (stopIndex < itemCount - 1 && offset < maxOffset) {
      offset += getMetadataItem(props, ++stopIndex, instanceProps).size
    }

    return stopIndex
  },

  initInstanceProps(props: Props): InstanceProps {
    const { estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE } = props as VariableSizeListProps

    return {
      estimatedItemSize,
      lastMeasuredIndex: -1,
      itemMetadataMap: {},
    }
  },

  validateProps: ({ itemSize }): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof itemSize !== 'function') {
        throw Error(
          'An invalid "itemSize" prop has been specified. ' +
            'Value should be a function. ' +
            `"${itemSize === null ? 'null' : typeof itemSize}" was specified.`
        )
      }
    }
  },
})

export default VariableSizeList
