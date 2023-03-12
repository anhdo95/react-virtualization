import React, {
  createElement,
  SyntheticEvent,
  FunctionComponent,
  CSSProperties,
  useCallback,
  useState,
  useEffect,
} from 'react'
import { unary, curry } from 'lodash-es'

type RenderComponentProps = {
  index: number
  style: CSSProperties
}

type Direction = 'vertical' | 'horizontal'
type ScrollDirection = 'backward' | 'forward'

type Funcs = {
  getItemSize: (props: Props, index: number) => number
  getEstimatedTotalSize: (props: Props) => number
  getStartIndexForOffset: (props: Props, offset: number) => number
  getStopIndexForStartIndex: (props: Props, startIndex: number, offset: number) => number
}

type FuncsWithoutProps = {
  [K in keyof Funcs]: Funcs[K] extends (props: Props, ...args: infer P) => infer R
    ? (...args: P) => R
    : never
}

export type Props = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  direction?: Direction
  itemSize: number
  itemCount: number
  width: number
  height: number
}

const OVERSCAN_COUNT = 2
const ITEM_STYLE_CACHE_DEBOUNCE_INTERVAL = 200

const createListComponent = (funcs: Funcs) => {
  const bindPropsToFuncs = (props: Props): FuncsWithoutProps => {
    const funcsWithoutProps = {} as FuncsWithoutProps
    for (const key in funcs) {
      const typedKey = key as keyof Funcs
      funcsWithoutProps[typedKey] = (funcs[typedKey] as Function).bind(this, props)
    }
    return funcsWithoutProps
  }

  const List: React.FC<Props> = (props) => {
    const { children, className, style, direction = 'vertical', itemCount, width, height } = props
    const {
      getItemSize,
      getEstimatedTotalSize,
      getStartIndexForOffset,
      getStopIndexForStartIndex,
    } = bindPropsToFuncs(props)

    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('forward')
    const [scrollOffset, setScrollOffset] = useState(0)
    const [itemStyleCache, setItemStyleCache] = useState<Record<number, CSSProperties>>({})
    const [itemStyleCacheTimeoutId, setItemStyleCacheTimeoutId] = useState<NodeJS.Timeout | null>(
      null
    )

    useEffect(() => {
      return () => {
        if (itemStyleCacheTimeoutId !== null) {
          clearTimeout(itemStyleCacheTimeoutId)
        }
      }
    }, [itemStyleCacheTimeoutId])

    const getRangeToRender = () => {
      const startIndex = getStartIndexForOffset(scrollOffset)
      const stopIndex = getStopIndexForStartIndex(startIndex, scrollOffset)

      const overscanBackward = scrollDirection === 'backward' ? Math.max(1, OVERSCAN_COUNT) : 1
      const overscanForward = scrollDirection === 'forward' ? Math.max(1, OVERSCAN_COUNT) : 1

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

      const startOffset = index * getItemSize(index)
      itemStyleCache[index] = {
        position: 'absolute',
        top: direction === 'horizontal' ? 0 : startOffset,
        left: direction === 'horizontal' ? startOffset : 0,
        width: direction === 'horizontal' ? getItemSize(index) : '100%',
        height: direction === 'horizontal' ? '100%' : getItemSize(index),
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

    const estimatedTotalSize = getEstimatedTotalSize()

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

  return List
}

export default createListComponent
