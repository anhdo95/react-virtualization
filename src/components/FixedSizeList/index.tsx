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

type ScrollDirection = 'vertical' | 'horizontal'

export type FixedSizeListProps = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  direction?: ScrollDirection
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
  const [scrollOffset, setScrollOffset] = useState(0)
  const [itemStyleCache, setItemStyleCache] = useState<Record<number, CSSProperties>>({})
  const [itemStyleCacheTimeoutId, setItemStyleCacheTimeoutId] = useState<NodeJS.Timeout>()

  const getRangeToRender = () => {
    const size = direction === 'horizontal' ? width : height
    const startIndex = Math.max(0, Math.min(itemCount - 1, Math.floor(scrollOffset / itemSize)))
    const endIndex = Math.min(
      itemCount - 1,
      Math.max(0, startIndex + Math.floor(size + scrollOffset - startIndex * itemSize) / itemSize)
    )
    const startIndexBackward = Math.max(0, startIndex - overscanCount)
    const endIndexForward = Math.min(itemCount - 1, endIndex + overscanCount)
    return [startIndexBackward, endIndexForward, startIndex, endIndex]
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
    setScrollOffset(direction === 'horizontal' ? scrollLeft : scrollTop)
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

  const [startIndex, endIndex] = getRangeToRender()
  const items = []

  if (itemCount > 0) {
    for (let index = startIndex; index <= endIndex; index++) {
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
        width: direction === 'horizontal' ? estimatedTotalSize : '100%',
        height: direction === 'horizontal' ? '100%' : estimatedTotalSize,
      },
    })
  )
}

export default FixedSizeList
