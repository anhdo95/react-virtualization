import createLGridComponent, { Props } from '../lib/createGridComponent'

type ItemSizeGetter = (index: number) => number
type VariableSizeListProps = Props & {
  rowHeight: ItemSizeGetter
  columnWidth: ItemSizeGetter
  estimatedColumnWidth?: number
  estimatedRowHeight?: number
}
type ItemMetadata = {
  offset: number
  size: number
}
type InstanceProps = {
  estimatedColumnWidth: number
  estimatedRowHeight: number
  lastMeasuredColumnIndex: number
  lastMeasuredRowIndex: number
  columnMetadataMap: { [key in number]: ItemMetadata }
  rowMetadataMap: { [key in number]: ItemMetadata }
}

enum ItemType {
  Row = 'Row',
  Column = 'Column',
}

const DEFAULT_ESTIMATED_ITEM_SIZE = 50

const getMetadataItem = (
  itemType: ItemType,
  props: Props,
  index: number,
  instanceProps: InstanceProps
) => {
  const { columnWidth, rowHeight } = props as VariableSizeListProps
  const itemSize = itemType === ItemType.Column ? columnWidth : rowHeight
  const { lastMeasuredColumnIndex, lastMeasuredRowIndex, columnMetadataMap, rowMetadataMap } =
    instanceProps
  const lastMeasuredIndex =
    itemType === ItemType.Column ? lastMeasuredColumnIndex : lastMeasuredRowIndex
  const itemMetadataMap = itemType === ItemType.Column ? columnMetadataMap : rowMetadataMap

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

    if (itemType === ItemType.Column) {
      instanceProps.lastMeasuredColumnIndex = index
    } else {
      instanceProps.lastMeasuredRowIndex = index
    }
  }

  return itemMetadataMap[index]
}

const findNearestItemIndex = (
  itemType: ItemType,
  props: Props,
  offset: number,
  instanceProps: InstanceProps
) => {
  const { lastMeasuredColumnIndex, lastMeasuredRowIndex } = instanceProps
  const lastMeasuredIndex =
    itemType === ItemType.Column ? lastMeasuredColumnIndex : lastMeasuredRowIndex
  const lastMeasuredOffset =
    lastMeasuredIndex > 0
      ? getMetadataItem(itemType, props, lastMeasuredIndex, instanceProps).offset
      : 0

  if (lastMeasuredOffset >= offset) {
    return findNearestItemByBinarySearch(
      itemType,
      props,
      offset,
      lastMeasuredIndex,
      0,
      instanceProps
    )
  }

  // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
  // The overall complexity for this approach is O(log n).
  return findNearestItemByExponentialSearch(
    itemType,
    props,
    Math.max(0, lastMeasuredIndex),
    offset,
    instanceProps
  )
}

const findNearestItemByBinarySearch = (
  itemType: ItemType,
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
    const currentOffset = getMetadataItem(itemType, props, middle, instanceProps).offset

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
  itemType: ItemType,
  props: Props,
  startIndex: number,
  offset: number,
  instanceProps: InstanceProps
) => {
  const itemCount = itemType === ItemType.Column ? props.columnCount : props.rowCount
  let interval = 1
  let index = startIndex

  while (
    index < itemCount &&
    getMetadataItem(itemType, props, index, instanceProps).offset < offset
  ) {
    index += interval
    interval *= 2
  }

  return findNearestItemByBinarySearch(
    itemType,
    props,
    offset,
    Math.min(index, itemCount - 1),
    Math.floor(index / 2),
    instanceProps
  )
}

const VariableSizeList = createLGridComponent<VariableSizeListProps>({
  getColumnOffset: (props: Props, index: number, instanceProps: InstanceProps) =>
    getMetadataItem(ItemType.Column, props, index, instanceProps).offset,

  getRowOffset: (props: Props, index: number, instanceProps: InstanceProps) =>
    getMetadataItem(ItemType.Row, props, index, instanceProps).offset,

  getColumnSize: ({ columnWidth }: Props, index: number) => (columnWidth as ItemSizeGetter)(index),

  getRowSize: ({ rowHeight }: Props, index: number) => (rowHeight as ItemSizeGetter)(index),

  getEstimatedTotalWidth: (props: Props, instanceProps: InstanceProps) => {
    const { columnCount } = props
    const { lastMeasuredColumnIndex, estimatedColumnWidth } = instanceProps
    const { offset, size } = getMetadataItem(
      ItemType.Column,
      props,
      lastMeasuredColumnIndex,
      instanceProps
    )
    const totalSizeOfMeasuredItems = offset + size
    const totalSizeOfUnmeasuredItems =
      (columnCount - lastMeasuredColumnIndex - 1) * estimatedColumnWidth
    return totalSizeOfMeasuredItems + totalSizeOfUnmeasuredItems
  },

  getEstimatedTotalHeight: (props: Props, instanceProps: InstanceProps) => {
    const { rowCount } = props
    const { lastMeasuredRowIndex, estimatedRowHeight } = instanceProps
    const { offset, size } = getMetadataItem(
      ItemType.Row,
      props,
      lastMeasuredRowIndex,
      instanceProps
    )
    const totalSizeOfMeasuredItems = offset + size
    const totalSizeOfUnmeasuredItems = (rowCount - lastMeasuredRowIndex - 1) * estimatedRowHeight
    return totalSizeOfMeasuredItems + totalSizeOfUnmeasuredItems
  },

  getColumnStartIndexForOffset: (props: Props, offset: number, instanceProps: InstanceProps) =>
    findNearestItemIndex(ItemType.Column, props, offset, instanceProps),

  getRowStartIndexForOffset: (props: Props, offset: number, instanceProps: InstanceProps) =>
    findNearestItemIndex(ItemType.Row, props, offset, instanceProps),

  getColumnStopIndexForStartIndex: (
    props: Props,
    startIndex: number,
    scrollOffset: number,
    instanceProps: InstanceProps
  ) => {
    const { columnCount, width } = props

    const metadataItem = getMetadataItem(ItemType.Column, props, startIndex, instanceProps)
    const maxOffset = scrollOffset + width

    let offset = metadataItem.offset + metadataItem.size
    let stopIndex = startIndex

    while (stopIndex < columnCount - 1 && offset < maxOffset) {
      offset += getMetadataItem(ItemType.Column, props, ++stopIndex, instanceProps).size
    }

    return stopIndex
  },

  getRowStopIndexForStartIndex: (
    props: Props,
    startIndex: number,
    scrollOffset: number,
    instanceProps: InstanceProps
  ) => {
    const { rowCount, height } = props

    const metadataItem = getMetadataItem(ItemType.Row, props, startIndex, instanceProps)
    const maxOffset = scrollOffset + height

    let offset = metadataItem.offset + metadataItem.size
    let stopIndex = startIndex

    while (stopIndex < rowCount - 1 && offset < maxOffset) {
      offset += getMetadataItem(ItemType.Row, props, ++stopIndex, instanceProps).size
    }

    return stopIndex
  },

  initInstanceProps(props: Props): InstanceProps {
    const {
      estimatedColumnWidth = DEFAULT_ESTIMATED_ITEM_SIZE,
      estimatedRowHeight = DEFAULT_ESTIMATED_ITEM_SIZE,
    } = props as VariableSizeListProps

    return {
      estimatedColumnWidth,
      estimatedRowHeight,
      lastMeasuredColumnIndex: -1,
      lastMeasuredRowIndex: -1,
      columnMetadataMap: {},
      rowMetadataMap: {},
    }
  },

  validateProps: ({ columnWidth, rowHeight }): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof columnWidth !== 'function') {
        throw Error(
          'An invalid "columnWidth" prop has been specified. ' +
            'Value should be a function. ' +
            `"${columnWidth === null ? 'null' : typeof columnWidth}" was specified.`
        )
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      if (typeof rowHeight !== 'function') {
        throw Error(
          'An invalid "rowHeight" prop has been specified. ' +
            'Value should be a function. ' +
            `"${rowHeight === null ? 'null' : typeof rowHeight}" was specified.`
        )
      }
    }
  },
})

export default VariableSizeList
