import createListComponent, { Props } from '../lib/createGridComponent'

const FixedSizeGrid = createListComponent({
  getColumnOffset: ({ columnWidth }: Props, index) => index * (columnWidth as number),

  getRowOffset: ({ rowHeight }: Props, index) => index * (rowHeight as number),

  getColumnSize: ({ columnWidth }: Props) => columnWidth as number,

  getRowSize: ({ rowHeight }: Props) => rowHeight as number,

  getEstimatedTotalWidth: ({ columnCount, columnWidth }: Props) =>
    columnCount * (columnWidth as number),

  getEstimatedTotalHeight: ({ rowCount, rowHeight }: Props) => rowCount * (rowHeight as number),

  getColumnStartIndexForOffset: ({ columnCount, columnWidth }: Props, offset: number) =>
    Math.max(0, Math.min(columnCount - 1, Math.floor(offset / (columnWidth as number)))),

  getColumnStopIndexForStartIndex: (
    { columnCount, columnWidth, width }: Props,
    startIndex: number,
    scrollOffset: number
  ) => {
    return Math.min(
      columnCount - 1,
      Math.max(
        0,
        startIndex +
          Math.floor(width + scrollOffset - startIndex * (columnWidth as number)) /
            (columnWidth as number)
      )
    )
  },

  getRowStartIndexForOffset: ({ rowCount, rowHeight }: Props, offset: number) =>
    Math.max(0, Math.min(rowCount - 1, Math.floor(offset / (rowHeight as number)))),

  getRowStopIndexForStartIndex: (
    { rowCount, rowHeight, height }: Props,
    startIndex: number,
    scrollOffset: number
  ) => {
    return Math.min(
      rowCount - 1,
      Math.max(
        0,
        startIndex +
          Math.floor(height + scrollOffset - startIndex * (rowHeight as number)) /
            (rowHeight as number)
      )
    )
  },

  initInstanceProps() {},

  validateProps: ({ columnWidth, rowHeight }: Props): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof columnWidth !== 'number') {
        throw Error(
          'An invalid "columnWidth" prop has been specified. ' +
            'Value should be a number. ' +
            `"${columnWidth === null ? 'null' : typeof columnWidth}" was specified.`
        )
      }

      if (typeof rowHeight !== 'number') {
        throw Error(
          'An invalid "rowHeight" prop has been specified. ' +
            'Value should be a number. ' +
            `"${rowHeight === null ? 'null' : typeof rowHeight}" was specified.`
        )
      }
    }
  },
})

export default FixedSizeGrid
