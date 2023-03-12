import createListComponent from '../lib/createListComponent'

const FixedSizeList = createListComponent({
  getItemSize: ({ itemSize }) => itemSize,

  getEstimatedTotalSize: ({ itemCount, itemSize }) => itemCount * itemSize,

  getStartIndexForOffset: ({ itemCount, itemSize }, offset: number) =>
    Math.max(0, Math.min(itemCount - 1, Math.floor(offset / itemSize))),

  getStopIndexForStartIndex: (
    { direction, itemCount, itemSize, width, height },
    startIndex: number,
    offset: number
  ) => {
    const size = direction === 'horizontal' ? width : height
    return Math.min(
      itemCount - 1,
      Math.max(0, startIndex + Math.floor(size + offset - startIndex * itemSize) / itemSize)
    )
  },
})

export default FixedSizeList
