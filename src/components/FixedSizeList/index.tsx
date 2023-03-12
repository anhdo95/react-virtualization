import React, {
  createElement,
  SyntheticEvent,
  FunctionComponent,
  CSSProperties,
  useCallback,
  useState,
} from 'react'

type RenderComponentProps = {
  index: number
  style: CSSProperties
}

type Direction = 'vertical' | 'horizontal'
type ScrollDirection = 'backward' | 'forward'

export type FixedSizeListProps = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  direction?: Direction
  itemSize: number
  itemCount: number
  width: number
  height: number
}

const overscanCount = 2

const ITEM_STYLE_CACHE_DEBOUNCE_INTERVAL = 200

const FixedSizeList: React.FC<FixedSizeListProps> = ({
  children,
  className,
  style,
  direction = 'vertical',
  itemSize,
  itemCount,
  width,
  height,
}) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('forward')
  const [scrollOffset, setScrollOffset] = useState(0)
  const [itemStyleCache, setItemStyleCache] = useState<Record<number, CSSProperties>>({})
  const [itemStyleCacheTimeoutId, setItemStyleCacheTimeoutId] = useState<NodeJS.Timeout>()

  const getStartIndexForOffset = () => {
    return Math.max(0, Math.min(itemCount - 1, Math.floor(scrollOffset / itemSize)))
  }

  const getStopIndexForStartIndex = (startIndex: number) => {
    const size = direction === 'horizontal' ? width : height
    return Math.min(
      itemCount - 1,
      Math.max(0, startIndex + Math.floor(size + scrollOffset - startIndex * itemSize) / itemSize)
    )
  }

  const getRangeToRender = () => {
    const startIndex = getStartIndexForOffset()
    const stopIndex = getStopIndexForStartIndex(startIndex)

    const overscanBackward = scrollDirection === 'backward' ? Math.max(1, overscanCount) : 1
    const overscanForward = scrollDirection === 'forward' ? Math.max(1, overscanCount) : 1

    return [
      Math.max(0, startIndex - overscanBackward),
      Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)),
      startIndex,
      stopIndex,
    ]
  }

  // Lazily create and cache item styles while scrolling
  const getItemStyle = (index: number) => {
    if (itemStyleCache[index]) return itemStyleCache[index]

    const startOffset = index * itemSize
    itemStyleCache[index] = {
      position: 'absolute',
      top: direction === 'horizontal' ? 0 : startOffset,
      left: direction === 'horizontal' ? startOffset : 0,
      width: direction === 'horizontal' ? itemSize : '100%',
      height: direction === 'horizontal' ? '100%' : itemSize,
    }
    return itemStyleCache[index]
  }

  const handleScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget
    const newScrollOffset = direction === 'horizontal' ? scrollLeft : scrollTop

    setScrollDirection(newScrollOffset < scrollOffset ? 'backward' : 'forward')
    setScrollOffset(newScrollOffset)
    clearItemStyleCache()
  }

  const clearItemStyleCache = useCallback(() => {
    if (itemStyleCacheTimeoutId) clearTimeout(itemStyleCacheTimeoutId)
    setItemStyleCacheTimeoutId(
      setTimeout(() => {
        setItemStyleCache({})
      }, ITEM_STYLE_CACHE_DEBOUNCE_INTERVAL)
    )
  }, [itemStyleCacheTimeoutId])

  const [startIndex, stopIndex] = getRangeToRender()
  const items = []

  if (itemCount > 0) {
    for (let index = startIndex; index <= stopIndex; index++) {
      items.push(
        createElement(children, {
          key: index,
          index,
          style: getItemStyle(index),
        })
      )
    }
  }

  const estimatedTotalSize = itemCount * itemSize

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
        width: direction === 'horizontal' ? estimatedTotalSize : width,
        height: direction === 'horizontal' ? height : estimatedTotalSize,
      },
    })
  )
}

export default FixedSizeList
