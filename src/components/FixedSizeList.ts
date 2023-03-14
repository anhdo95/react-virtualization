import createListComponent, { Props } from '../lib/createListComponent'

const FixedSizeList = createListComponent({
  getItemOffset: ({ itemSize }: Props, index) => index * (itemSize as number),

  getItemSize: ({ itemSize }: Props) => itemSize as number,

  getEstimatedTotalSize: ({ itemCount, itemSize }: Props) => itemCount * (itemSize as number),

  getStartIndexForOffset: ({ itemCount, itemSize }: Props, offset: number) =>
    Math.max(0, Math.min(itemCount - 1, Math.floor(offset / (itemSize as number)))),

  getStopIndexForStartIndex: (
    { direction, itemCount, itemSize, width, height }: Props,
    startIndex: number,
    scrollOffset: number
  ) => {
    const size = direction === 'horizontal' ? width : height
    return Math.min(
      itemCount - 1,
      Math.max(
        0,
        startIndex +
          Math.floor(size + scrollOffset - startIndex * (itemSize as number)) / (itemSize as number)
      )
    )
  },

  initInstanceProps() {},

  validateProps: ({ itemSize }: Props): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof itemSize !== 'number') {
        throw Error(
          'An invalid "itemSize" prop has been specified. ' +
            'Value should be a number. ' +
            `"${itemSize === null ? 'null' : typeof itemSize}" was specified.`
        )
      }
    }
  },
})

export default FixedSizeList
