import React, {
  createElement,
  SyntheticEvent,
  FunctionComponent,
  CSSProperties,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react'

type RenderComponentProps = {
  columnIndex: number
  rowIndex: number
  style: CSSProperties
}

type ScrollDirection = 'backward' | 'forward'

type Funcs = {
  getColumnOffset: (props: Props, index: number, instanceProps: any) => number
  getRowOffset: (props: Props, index: number, instanceProps: any) => number
  getColumnSize: (props: Props, index: number, instanceProps: any) => number
  getRowSize: (props: Props, index: number, instanceProps: any) => number
  getEstimatedTotalWidth: (props: Props, instanceProps: any) => number
  getEstimatedTotalHeight: (props: Props, instanceProps: any) => number
  getColumnStartIndexForOffset: (props: Props, offset: number, instanceProps: any) => number
  getColumnStopIndexForStartIndex: (
    props: Props,
    startIndex: number,
    scrollOffset: number,
    instanceProps: any
  ) => number
  getRowStartIndexForOffset: (props: Props, offset: number, instanceProps: any) => number
  getRowStopIndexForStartIndex: (
    props: Props,
    startIndex: number,
    scrollOffset: number,
    instanceProps: any
  ) => number
  initInstanceProps: (props: Props) => any
  validateProps: (props: Props) => void
}

type FuncsWithoutProps = Omit<
  {
    [K in keyof Funcs]: Funcs[K] extends (props: Props, ...args: infer P) => infer R
      ? P extends [any, ...any[]]
        ? (...args: ExcludeFirstParameter<P>) => R
        : (...args: P) => R
      : never
  },
  'initInstanceProps'
>

export type Props = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  rowCount: number
  rowHeight: number | ((index: number) => number)
  columnCount: number
  columnWidth: number | ((index: number) => number)
  width: number
  height: number
}

const OVERSCAN_COUNT = 2
const ITEM_STYLE_CACHE_DEBOUNCE_INTERVAL = 200

const createGridComponent = <P extends Props>(funcs: Funcs) => {
  const bindPropsToFuncs = (props: Props) => {
    const { initInstanceProps, ...remainingFuncs } = funcs
    const instanceProps = initInstanceProps(props)

    const funcsWithoutProps = {} as FuncsWithoutProps
    for (const key in remainingFuncs) {
      const typedKey = key as keyof FuncsWithoutProps
      funcsWithoutProps[typedKey] = (...args) =>
        (funcs[typedKey] as Function).call(this, props, ...args, instanceProps)
    }
    return funcsWithoutProps
  }

  const Grid: React.FC<P> = (props) => {
    const { children, className, style, columnCount, rowCount, width, height } = props
    const {
      getColumnOffset,
      getColumnSize,
      getRowOffset,
      getRowSize,
      getEstimatedTotalWidth,
      getEstimatedTotalHeight,
      getColumnStartIndexForOffset,
      getColumnStopIndexForStartIndex,
      getRowStartIndexForOffset,
      getRowStopIndexForStartIndex,
      validateProps,
    } = useMemo(() => bindPropsToFuncs(props), [props])

    const [horizontalScrollDirection, setHorizontalScrollDirection] =
      useState<ScrollDirection>('forward')
    const [verticalScrollDirection, setVerticalScrollDirection] =
      useState<ScrollDirection>('forward')
    const [scrollLeft, setScrollLeft] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const [itemStyleCache, setItemStyleCache] = useState<Record<string, CSSProperties>>({})
    const [itemStyleCacheTimeoutId, setItemStyleCacheTimeoutId] = useState<NodeJS.Timeout | null>(
      null
    )

    useEffect(() => validateProps(), [validateProps])

    useEffect(() => {
      return () => {
        if (itemStyleCacheTimeoutId !== null) {
          clearTimeout(itemStyleCacheTimeoutId)
        }
      }
    }, [itemStyleCacheTimeoutId])

    const getHorizontalRangeToRender = () => {
      const startIndex = getColumnStartIndexForOffset(scrollLeft)
      const stopIndex = getColumnStopIndexForStartIndex(startIndex, scrollLeft)

      const overscanBackward =
        horizontalScrollDirection === 'backward' ? Math.max(1, OVERSCAN_COUNT) : 1
      const overscanForward =
        horizontalScrollDirection === 'forward' ? Math.max(1, OVERSCAN_COUNT) : 1

      return [
        Math.max(0, startIndex - overscanBackward),
        Math.max(0, Math.min(columnCount - 1, stopIndex + overscanForward)),
        startIndex,
        stopIndex,
      ]
    }

    const getVerticalRangeToRender = () => {
      const startIndex = getRowStartIndexForOffset(scrollTop)
      const stopIndex = getRowStopIndexForStartIndex(startIndex, scrollTop)

      const overscanBackward =
        verticalScrollDirection === 'backward' ? Math.max(1, OVERSCAN_COUNT) : 1
      const overscanForward =
        verticalScrollDirection === 'forward' ? Math.max(1, OVERSCAN_COUNT) : 1

      return [
        Math.max(0, startIndex - overscanBackward),
        Math.max(0, Math.min(rowCount - 1, stopIndex + overscanForward)),
        startIndex,
        stopIndex,
      ]
    }

    // Lazily create and cache item styles while scrolling
    const getItemStyle = (columnIndex: number, rowIndex: number) => {
      const key = `${columnIndex}:${rowIndex}`
      if (itemStyleCache[key]) return itemStyleCache[key]

      itemStyleCache[key] = {
        position: 'absolute',
        top: getRowOffset(rowIndex),
        left: getColumnOffset(columnIndex),
        width: getColumnSize(columnIndex),
        height: getRowSize(rowIndex),
      }
      return itemStyleCache[key]
    }

    const handleScroll = (e: SyntheticEvent<HTMLDivElement>) => {
      const { scrollTop: newScrollTop, scrollLeft: newScrollLeft } = e.currentTarget

      setHorizontalScrollDirection(newScrollLeft ? 'backward' : 'forward')
      setVerticalScrollDirection(newScrollTop ? 'backward' : 'forward')
      setScrollLeft(newScrollLeft)
      setScrollTop(newScrollTop)
      clearItemStyleCache()
    }

    const clearItemStyleCache = useCallback(() => {
      if (itemStyleCacheTimeoutId) {
        clearTimeout(itemStyleCacheTimeoutId)
      }

      setItemStyleCacheTimeoutId(
        setTimeout(() => {
          setItemStyleCacheTimeoutId(null)
          setItemStyleCache({})
        }, ITEM_STYLE_CACHE_DEBOUNCE_INTERVAL)
      )
    }, [itemStyleCacheTimeoutId])

    const [columnStartIndex, columnStopIndex] = getHorizontalRangeToRender()
    const [rowStartIndex, rowStopIndex] = getVerticalRangeToRender()
    const items = []

    if (columnCount > 0 && rowCount > 0) {
      for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
        for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
          items.push(
            createElement(children, {
              key: `${columnIndex}${rowIndex}`,
              columnIndex,
              rowIndex,
              style: getItemStyle(columnIndex, rowIndex),
            })
          )
        }
      }
    }

    const estimatedTotalWidth = getEstimatedTotalWidth()
    const estimatedTotalHeight = getEstimatedTotalHeight()

    return createElement(
      'div',
      {
        onScroll: handleScroll,
        className,
        style: {
          position: 'relative',
          overflow: 'auto',
          width,
          height,
          willChange: 'transform',
          ...style,
        },
      },
      createElement('div', {
        children: items,
        style: {
          overflow: 'hidden',
          width: estimatedTotalWidth,
          height: estimatedTotalHeight,
        },
      })
    )
  }

  return Grid
}

export default createGridComponent
